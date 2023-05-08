import { create } from 'zustand'
import { Message } from './Message'
import { persist } from 'zustand/middleware'
import { Chat } from './Chat'

export type APIState = 'idle' | 'loading' | 'error'

export const excludeFromState = [
  "currentAbortController",
  "textInputValue",
  "apiState",
  "activeChatId",
]

interface SettingsForm {
  model: string;
  voice?: string; // !!! fixme: this is currently voice.voiceURI (string) and not of type SpeechSynthesisVoice
  voiceRate?: number;
  voicePitch?: number;
  voiceVolume?: number;
  temperature: number;
  top_p: number;
  n: number;
  stop: string;
  max_tokens: number;
  presence_penalty: number;
  frequency_penalty: number;
  logit_bias: string;
  auto_title: boolean;
  submit_debounce_ms: number;
}

export const defaultSettings = {
  model: 'gpt-3.5-turbo',
  voice: '', // !!! fixme: this is currently voice.voiceURI (string) and not of type SpeechSynthesisVoice
  voiceRate: 1,
  voicePitch: 1,
  voiceVolume: 1,
  temperature: 1,
  top_p: 1,
  n: 1,
  stop: "",
  max_tokens: 0,
  presence_penalty: 0,
  frequency_penalty: 0,
  logit_bias: "",
  auto_title: true,
  submit_debounce_ms: 0,
};

export interface ChatState {
  apiState: APIState;
  apiKey: string | undefined;
  chats: Chat[];
  activeChatId: string | undefined;
  colorScheme: "light" | "dark";
  currentAbortController: AbortController | undefined;
  settingsForm: SettingsForm;
  defaultSettings: SettingsForm;
  navOpened: boolean;
  editingMessage: Message | undefined;
  modelChoicesChat: string[] | undefined;
  textInputValue: string;
}

export const initialState = {
  apiState: "idle" as APIState,
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || undefined,
  chats: [],
  activeChatId: undefined,
  colorScheme: "light" as "light" | "dark",
  currentAbortController: undefined,
  settingsForm: defaultSettings,
  defaultSettings: defaultSettings,
  navOpened: false,
  editingMessage: undefined,
  modelChoicesChat: undefined,
  modelChoiceChat: undefined,
  textInputValue: "",
};

const store = () => ({ ...initialState } as ChatState);

export const useChatStore = create<ChatState>()(
  persist(store, {
    name: "chat-store-v23",
    partialize: (state) =>
      Object.fromEntries(
        Object.entries(state).filter(([key]) => !excludeFromState.includes(key))
      ),
  })
);
