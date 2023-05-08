import { useChatStore } from '@/stores/ChatStore'
import { TextInput, Box, Text, Slider, Select, Tabs, Switch, px, Accordion, Group, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconSettings, IconSpeakerphone } from '@tabler/icons-react'
import { useEffect } from 'react'
import { refreshModels, updateSettingsForm } from '@/stores/ChatActions'

import { useSpeechSynthesis } from '../../lib/useSpeechSynthesis'

export default function SettingsModal ({ close = () => {} } = {}) {
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
          if (value === '') return null
          const parsed = JSON.parse(value)
          if (typeof parsed !== 'object' || Array.isArray(parsed)) { throw new Error() }
          for (const key in parsed) {
            const num = parsed[key]
            if (!Number.isFinite(num) || num < -100 || num > 100) { throw new Error() }
          }
          return null
        } catch {
          return 'Logit bias must be a valid JSON object with keys representing token IDs and values between -100 and 100'
        }
      }
    }
  })

  return (
    <Box mx='auto'>
      <form onSubmit={form.onSubmit((values) => { updateSettingsForm(values); close() })}>
        <Tabs defaultValue='openai'>
          <Tabs.List>
            <Tabs.Tab value='openai' icon={<IconSettings size={px('0.8rem')} />}>OpenAI</Tabs.Tab>
            <Tabs.Tab value='speech' icon={<IconSpeakerphone size={px('0.8rem')} />}>Web Speech API</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='openai' pt='xs'>
            <Accordion defaultValue='general'>
              <Accordion.Item value='general'>
                <Accordion.Control>GPT - General</Accordion.Control>
                <Accordion.Panel>
                  <Select
                    required
                    label='Model'
                    placeholder='Select a model'
                    value={ form.values.model }
                    onChange={ (value) => form.setFieldValue('model', value || defaultSettings.model) }
                    data={ modelChoicesChat.map((model) => ({label: model,value: model})) }
                  />
                  <Text mt='lg' size='sm'>
                    Sampling temperature ({form.values.temperature})
                  </Text>
                  <Slider
                    value={form.values.temperature}
                    min={0}
                    max={2}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue('temperature', value)}
                  />
                  <Switch
                    mt='xl'
                    checked={form.values.auto_title}
                    label='Automatically use model to find chat title'
                    onChange={(event) =>
                      form.setFieldValue(
                        'auto_title',
                        event.currentTarget.checked
                      )}
                  />
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value='advanced'>
                <Accordion.Control>GPT - Advanced</Accordion.Control>
                <Accordion.Panel>
                  <Text mt='lg' size='sm'>
                    Top P ({form.values.top_p})
                  </Text>
                  <Slider
                    value={form.values.top_p}
                    min={0}
                    max={1}
                    step={0.01}
                    precision={2}
                    onChange={(value) => form.setFieldValue('top_p', value)}
                  />

                  <Text mt='lg' size='sm'>
                    N ({form.values.n})
                  </Text>
                  <Slider
                    value={form.values.n}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(value) => form.setFieldValue('n', value)}
                  />
                  <TextInput
                    mt='lg'
                    label='Stop'
                    placeholder='Up to 4 sequences where the API will stop generating further tokens'
                    {...form.getInputProps('stop')}
                  />

                  <Text mt='lg' size='sm'>
                    Max Tokens (
                    {form.values.max_tokens === 0
                      ? 'Unlimited'
                      : form.values.max_tokens}
                    )
                  </Text>
                  <Slider
                    value={form.values.max_tokens}
                    min={0}
                    max={4000}
                    step={1}
                    onChange={(value) =>
                      form.setFieldValue('max_tokens', value)}
                  />

                  <Text mt='lg' size='sm'>
                    Presence Penalty ({form.values.presence_penalty})
                  </Text>
                  <Slider
                    value={form.values.presence_penalty}
                    min={-2}
                    max={2}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue('presence_penalty', value)}
                  />

                  <Text mt='lg' size='sm'>
                    Frequency Penalty ({form.values.frequency_penalty})
                  </Text>
                  <Slider
                    value={form.values.frequency_penalty}
                    min={-2}
                    max={2}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue('frequency_penalty', value)}
                  />

                  <TextInput
                    mt='lg'
                    label='Logit Bias'
                    placeholder='{"token_id": 0.5, "token_id_2": -0.5}'
                    {...form.getInputProps('logit_bias')}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Tabs.Panel>
          <Tabs.Panel value='speech' pt='xs'>
            <Accordion defaultValue='synthesis'>
              <Accordion.Item value='synthesis'>
                <Accordion.Control>Synthesis</Accordion.Control>
                <Accordion.Panel>
                  <Select
                    searchable
                    label={`Voice (${form.values.voice || defaultSettings.voice || 'system'})`}
                    placeholder='Select a voice'
                    value={form.values.voice || defaultSettings.voice}
                    onChange={(value) => form.setFieldValue('voice', value || defaultSettings.voice)}
                    data={ voices.map((voice:SpeechSynthesisVoice) => ({label: voice.name, value: voice.voiceURI})) }
                  />
                  <Text mt='lg' size='sm'>
                    Volume ({form.values.voiceVolume || defaultSettings.voiceVolume})
                  </Text>
                  <Slider
                    value={form.values.voiceVolume || defaultSettings.voiceVolume}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                    onChange={value => form.setFieldValue('voiceVolume', value)}
                  />
                  <Text mt='lg' size='sm'>
                    Pitch ({form.values.voicePitch || defaultSettings.voicePitch})
                  </Text>
                  <Slider
                    value={form.values.voicePitch || defaultSettings.voicePitch}
                    min={0}
                    max={10}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue('voicePitch', value)}
                  />
                  <Text mt='lg' size='sm'>
                    Rate ({form.values.voiceRate || defaultSettings.voiceRate})
                  </Text>
                  <Slider
                    value={form.values.voiceRate || defaultSettings.voiceRate}
                    min={0}
                    max={2}
                    step={0.1}
                    precision={1}
                    onChange={(value) =>
                      form.setFieldValue('voiceRate', value)}
                  />
                  {/* some settings goes here (ie. a switch) to enable/disable highlighting of what is being said */}
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value='recognition'>
                <Accordion.Control>Recognition</Accordion.Control>
                <Accordion.Panel>
                  {/* wip */}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Tabs.Panel>
          <Group position='apart' mt='lg'>
            <Button
              variant='light'
              onClick={() => {
                form.setValues(defaultSettings)
              }}
            >
              Reset
            </Button>
            <Button type='submit'>Save</Button>
          </Group>
        </Tabs>
      </form>
    </Box>
  )
}
