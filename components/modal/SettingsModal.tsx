import { useChatStore } from '@/stores/ChatStore'
import { TextInput, Button, Group, Box, Text, Slider, Select, Tabs, Switch, px, Accordion, Title, Avatar } from '@mantine/core'
import ISO6391 from 'iso-639-1'
import { useForm } from '@mantine/form'
import { IconSettings, IconSpeakerphone } from '@tabler/icons-react'
import { useEffect, forwardRef } from 'react'
import { refreshModels, updateSettingsForm } from '@/stores/ChatActions'

import { useSpeechSynthesis } from '../../lib/useSpeechSynthesis'

function getLanguages() {
  const languageCodes = ISO6391.getAllCodes()
  return languageCodes.map((code) => ({ label: `${ISO6391.getName(code)} (${code})`, value: code }))
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string,
  value: string,
  lang: string,
  default: boolean,
  localService: boolean,
  name: string,
  voiceURI: string
}

export const toFlagEmoji = (lang) => {
  const OFFSET = 127397

  if (!/^[a-z]{2}$/i.test(lang)) {
    return null
    // throw new Error('Invalid country code [' + lang + ']')
  }

  lang = lang.toUpperCase()
  let flagEmoji = ''

  for (let i = 0; i < 2; i++) {
    const letter = lang.charAt(i)
    const ord = letter.charCodeAt(0)

    if (isNaN(ord)) {
      throw new Error('Unable to process character ' + letter + ' in [' + lang + ']')
    }

    const unicode = ord + OFFSET
    flagEmoji += String.fromCodePoint(unicode)
  }

  return flagEmoji
}


export const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ lang, name, voiceURI }: ItemProps, ref) => (
    <div ref={ref}>
      <Group noWrap>

        <Title>
          {

          }
        </Title>
        <div>
          <Text size="sm">{voiceURI}</Text>
          <Text size="xs" opacity={0.65}>
            {lang}
          </Text>
        </div>
      </Group>
    </div>
  )
)

function emojiFlagToBase64(emoji) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillText(emoji, 64, 64);
  return canvas.toDataURL();
}

export default function SettingsModal({ close = () => null } = {}) {

  const modelChoicesChat = useChatStore((state) => state.modelChoicesChat) || []
  const settings = useChatStore((state) => state.settingsForm)
  const defaultSettings = useChatStore((state) => state.defaultSettings)

  const { voices } = useSpeechSynthesis()

  useEffect(() => { refreshModels() }, [])

  const form = useForm({
    initialValues: settings,
    validate: {
      logit_bias: (value) => {
        try {
          if (value === "") return null;
          const parsed = JSON.parse(value);
          if (typeof parsed !== "object" || Array.isArray(parsed))
            throw new Error();
          for (const key in parsed) {
            const num = parsed[key];
            if (!Number.isFinite(num) || num < -100 || num > 100)
              throw new Error();
          }
          return null;
        } catch {
          return "Logit bias must be a valid JSON object with keys representing token IDs and values between -100 and 100";
        }
      },
    },
  })

  const languages = getLanguages()
  const langDisplayToCode = languages.reduce((acc, cur) => { acc[cur.label] = cur.value; return acc }, {} as Record<string, string>);
  return (
    <Box mx="auto">
      <form onSubmit={form.onSubmit((values) => { updateSettingsForm(values); close() })}>
        <Tabs defaultValue="openai">
          <Tabs.List>
            <Tabs.Tab value="openai" icon={<IconSettings size={px("0.8rem")} />}>OpenAI</Tabs.Tab>
            <Tabs.Tab value="speech" icon={<IconSpeakerphone size={px("0.8rem")} />}>Web Speech API</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="openai" pt="xs">
            <Accordion defaultValue="general">
              <Accordion.Item value="general">
                <Accordion.Control>GPT - General</Accordion.Control>
                <Accordion.Panel>
                  <Select
                    required
                    label="Model"
                    placeholder="Select a model"
                    value={form.values.model}
                    onChange={(value) => form.setFieldValue("model", value!)}
                    data={modelChoicesChat.map((model) => ({
                      label: model,
                      value: model,
                    }))}
                  ></Select>
                  <Text mt="lg" size="sm">
                    Sampling temperature ({form.values.temperature})
                  </Text>
                  <Slider
                    value={form.values.temperature}
                    min={0}
                    max={2}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue("temperature", value)
                    }
                  />
                  <Switch
                    mt="xl"
                    checked={form.values.auto_title}
                    label="Automatically use model to find chat title"
                    onChange={(event) =>
                      form.setFieldValue(
                        "auto_title",
                        event.currentTarget.checked
                      )
                    }
                  />
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="advanced">
                <Accordion.Control>GPT - Advanced</Accordion.Control>
                <Accordion.Panel>
                  <Text mt="lg" size="sm">
                    Top P ({form.values.top_p})
                  </Text>
                  <Slider
                    value={form.values.top_p}
                    min={0}
                    max={1}
                    step={0.01}
                    precision={2}
                    onChange={(value) => form.setFieldValue("top_p", value)}
                  />

                  <Text mt="lg" size="sm">
                    N ({form.values.n})
                  </Text>
                  <Slider
                    value={form.values.n}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(value) => form.setFieldValue("n", value)}
                  />
                  <TextInput
                    mt="lg"
                    label="Stop"
                    placeholder="Up to 4 sequences where the API will stop generating further tokens"
                    {...form.getInputProps("stop")}
                  />

                  <Text mt="lg" size="sm">
                    Max Tokens (
                    {form.values.max_tokens === 0
                      ? "Unlimited"
                      : form.values.max_tokens}
                    )
                  </Text>
                  <Slider
                    value={form.values.max_tokens}
                    min={0}
                    max={4000}
                    step={1}
                    onChange={(value) =>
                      form.setFieldValue("max_tokens", value)
                    }
                  />

                  <Text mt="lg" size="sm">
                    Presence Penalty ({form.values.presence_penalty})
                  </Text>
                  <Slider
                    value={form.values.presence_penalty}
                    min={-2}
                    max={2}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue("presence_penalty", value)
                    }
                  />

                  <Text mt="lg" size="sm">
                    Frequency Penalty ({form.values.frequency_penalty})
                  </Text>
                  <Slider
                    value={form.values.frequency_penalty}
                    min={-2}
                    max={2}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue("frequency_penalty", value)
                    }
                  />

                  <TextInput
                    mt="lg"
                    label="Logit Bias"
                    placeholder='{"token_id": 0.5, "token_id_2": -0.5}'
                    {...form.getInputProps("logit_bias")}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Tabs.Panel>
          <Tabs.Panel value="speech" pt="xs">
            <Accordion defaultValue="synthesis">
              <Accordion.Item value="synthesis">
                <Accordion.Control>Synthesis</Accordion.Control>
                <Accordion.Panel>
                  <Select
                    searchable
                    label={ `Voice (${form.values.voice || defaultSettings.voice || 'system' })` }
                    placeholder="Select a voice"
                    value={form.values.voice || defaultSettings.voice }
                    onChange={(value) => form.setFieldValue("voice", value!)}
                    // itemComponent={SelectItem}
                    data={
                      voices.map((voice: SpeechSynthesisVoice) => ({
                        label: voice.default ? 'system' : ` ${voice.lang} | ${voice.name} | ${
                          [
                            ...new Set(
                              voice.lang
                                .split('-')
                                .filter(lang => !/en|he|ja|hi|uk|zh|el|nb|da|ko|cs/i.test(lang))
                                .map(toFlagEmoji)
                            )
                          ].join(' ')
                        }`,
                        value: voice.voiceURI,
                        lang: voice.lang,
                        default: voice.default,
                        localService: voice.localService,
                        name: voice.name,
                        voiceURI: voice.voiceURI
                      })
                    )}
                  ></Select>
                  <Text mt="lg" size="sm">
                    Volume ({ form.values.voiceVolume || defaultSettings.voiceVolume })
                  </Text>
                  <Slider
                    value={ form.values.voiceVolume || defaultSettings.voiceVolume }
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                    onChange={value => form.setFieldValue('voiceVolume', value)}
                  />
                  <Text mt="lg" size="sm">
                    Pitch ({form.values.voicePitch || defaultSettings.voicePitch })
                  </Text>
                  <Slider
                    value={form.values.voicePitch || defaultSettings.voicePitch}
                    min={0}
                    max={10}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue('voicePitch', value)
                    }
                  />
                  <Text mt="lg" size="sm">
                    Rate ({form.values.voiceRate || defaultSettings.voiceRate})
                  </Text>
                  <Slider
                    value={form.values.voiceRate|| defaultSettings.voiceRate}
                    min={0}
                    max={2}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue('voiceRate', value)
                    }
                  />
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="recognition">
                <Accordion.Control>Recognition</Accordion.Control>
                <Accordion.Panel>
                  {/* wip */}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Tabs.Panel>
          <Group position="apart" mt="lg">
            <Button
              variant="light"
              onClick={() => {
                form.setValues(defaultSettings);
              }}
            >
              Reset
            </Button>
            <Button type="submit">Save</Button>
          </Group>
        </Tabs>
      </form>
    </Box>
  );
}
