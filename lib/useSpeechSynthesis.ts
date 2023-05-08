import { useEffect, useState } from 'react'

interface SpeechSynthesisProps {
  onEnd?: () => void
}

interface VoicesState {
  voices: SpeechSynthesisVoice[]
  supported: boolean
  cancel: () => void
}

interface SpeakState {
  speaking: boolean
  cancel: () => void
}

interface SpeakArgs {
  voice?: SpeechSynthesisVoice
  text?: string
  rate?: number
  pitch?: number
  volume?: number
}

export const useSpeechSynthesis = ({ onEnd = () => {} }: SpeechSynthesisProps = {}) => {
  const [voicesState, setVoicesState] = useState<VoicesState>({ voices: [], supported: false, cancel: () => {} })
  const [speakState, setSpeakState] = useState<SpeakState>({ speaking: false, cancel: () => {} })

  const addVoices = (voiceOptions: SpeechSynthesisVoice[]) => {
    setVoicesState((prevState) => ({ ...prevState, voices: voiceOptions }))
  }

  const getVoices = () => {
    const voices = window.speechSynthesis.getVoices()

    window.speechSynthesis.addEventListener('voiceschanged', (event: Event) => {
      addVoices((event.target as SpeechSynthesis).getVoices())
    })

    if (voices.length > 0) {
      addVoices(voices)
      return
    }
  }

  const handleEnd = () => {
    setSpeakState((prevState) => ({ ...prevState, speaking: false }))
    onEnd()
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      getVoices()
    }
    return () => {
      window.speechSynthesis.cancel()
      setSpeakState({ speaking: false, cancel: () => {} })
    }
  }, [])

  const speak = ({ text = '', voice, rate = 1, pitch = 1, volume = 1 }: SpeakArgs = {}) => {
    if (!voicesState.supported) return

    // Firefox won't repeat an utterance that has been
    // spoken, so we need to create a new instance each time
    const utterance = new SpeechSynthesisUtterance()
    utterance.text = text
    utterance.voice = voice ?? voicesState.voices[0]
    utterance.onend = handleEnd
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume
    window.speechSynthesis.speak(utterance)
    setSpeakState({
      speaking: true,
      cancel(){
        setSpeakState((prevState) => ({ ...prevState, speaking: false }))
        window.speechSynthesis.cancel()
      }
    })
  }

  return {
    ...voicesState,
    ...speakState,
    speak,
  }
}
