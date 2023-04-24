import { useChatStore } from "@/stores/ChatStore";
import {
  TextInput,
  Button,
  Group,
  Box,
  Text,
  Slider,
  Select,
  Tabs,
  Autocomplete,
  Switch,
  NumberInput,
  px,
  Accordion,
  Title,
} from "@mantine/core";
import ISO6391 from "iso-639-1";
import { useForm } from "@mantine/form";
import { IconBraces, IconMicrophone, IconSettings } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { refreshModels, updateSettingsForm } from "@/stores/ChatActions";

function getLanguages() {
  const languageCodes = ISO6391.getAllCodes();
  return languageCodes.map((code) => ({
    label: `${ISO6391.getName(code)} (${code})`,
    value: code,
  }));
}

export default function SettingsModal({ close }: { close: () => void }) {
  const modelChoicesChat = useChatStore((state) => state.modelChoicesChat) || [];
  const settingsForm = useChatStore((state) => state.settingsForm);
  const defaultSettings = useChatStore((state) => state.defaultSettings);

  useEffect(() => {
    refreshModels();
  }, []);

  const form = useForm({
    initialValues: settingsForm,
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
  });


  const languages = getLanguages();
  const langDisplayToCode = languages.reduce((acc, cur) => {
    acc[cur.label] = cur.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <Box mx="auto">
      <form
        onSubmit={form.onSubmit((values) => {
          updateSettingsForm(values);
          close();
        })}
      >
        <Tabs defaultValue="openai">
          <Tabs.List>
            <Tabs.Tab
              value="openai"
              icon={<IconSettings size={px("0.8rem")} />}
            >
              OpenAI
            </Tabs.Tab>
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
