import { request } from 'https'
import { IncomingMessage } from 'http'

import { Message, truncateMessages, countTokens } from './Message'
import { getModelInfo } from './Model'

export function assertIsError(e: any): asserts e is Error {
  if (!(e instanceof Error)) {
    throw new Error('Not an error');
  }
}

export async function testKey(key: string): Promise<boolean> {
  try {
    const { status = 401 } = await window?.fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` }})
    return status === 200
  } catch (error) {
    return false
  }
}

export async function fetchModels(key: string): Promise<string[]> {
  try {
    const { data } = await (await window?.fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` }}))?.json()
    return data.map((model: any) => model.id)
  } catch (error) {
    return []
  }
}

export async function _streamCompletion(payload: string, apiKey: string, abortController?: AbortController, callback?: ((res: IncomingMessage) => void) | undefined, errorCallback?: ((res: IncomingMessage, body: string) => void) | undefined) {
  const req = request({
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    signal: abortController?.signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, /*'Content-Length': payload.length*/ }
  }, (res) => {
    if (res.statusCode !== 200) {
      let errorBody = ''
      res.on('data', (chunk) => { errorBody += chunk })
      res.on('end', () => { errorCallback?.(res, errorBody) })
      return
    }
    callback?.(res)
  })
  req.write(payload)
  req.end()
}

interface ChatCompletionParams {
  model: string;
  temperature: number;
  top_p: number;
  n: number;
  stop: string;
  max_tokens: number;
  presence_penalty: number;
  frequency_penalty: number;
  logit_bias: string;
}

const paramKeys = [
  'model',
  'temperature',
  'top_p',
  'n',
  'stop',
  'max_tokens',
  'presence_penalty',
  'frequency_penalty',
  'logit_bias',
];

export async function streamCompletion(messages: Message[], params: ChatCompletionParams, apiKey: string, abortController?: AbortController, callback?: ((res: IncomingMessage) => void) | undefined, endCallback?: ((tokensUsed: number) => void) | undefined, errorCallback?: ((res: IncomingMessage, body: string) => void) | undefined) {
  const modelInfo = getModelInfo(params.model)
  const submitMessages = truncateMessages(messages, modelInfo.maxTokens, params.max_tokens)
  const submitParams = Object.fromEntries(Object.entries(params).filter(([key]) => paramKeys.includes(key)))

  const payload = JSON.stringify({messages: submitMessages.map(({ role, content }) => ({ role, content })), stream: true, ...{...submitParams, logit_bias: JSON.parse(params.logit_bias || "{}"), max_tokens: params.max_tokens || undefined }})
  let buffer = ""

  const successCallback = (res: IncomingMessage) => {
    res.on("data", (chunk) => {
      if (abortController?.signal.aborted) {
        res.destroy();
        endCallback?.(0);
        return;
      }

      // Split response into individual messages
      const allMessages = chunk.toString().split("\n\n");
      for (const message of allMessages) {
        // Remove first 5 characters ("data:") of response
        const cleaned = message.toString().slice(5);

        if (!cleaned || cleaned === " [DONE]") {
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch (e) {
          console.error(e);
          return;
        }

        const content = parsed.choices[0]?.delta?.content;
        if (content === undefined) {
          continue;
        }
        buffer += content;

        callback?.(content);
      }
    });

    res.on("end", () => {
      const tokensUsed = countTokens(submitMessages.map((m) => m.content).join("\n")) + countTokens(buffer)
      endCallback?.(tokensUsed)
    })
  }

  return _streamCompletion(payload, apiKey, abortController, successCallback, errorCallback) // this could be an stream/event-emitter or a generator 🤔
}
