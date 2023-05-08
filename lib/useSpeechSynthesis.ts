import { useEffect, useState } from 'react'

interface SpeechSynthesisArgs {
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
  voice?: SpeechSynthesisVoice | null
  text?: string
  rate?: number
  pitch?: number
  volume?: number
}

export const useSpeechSynthesis = ({ onEnd = Function.prototype }: SpeechSynthesisArgs = {}) => {
  const [voicesState, setVoicesState] = useState<VoicesState>({ voices: [], supported: false, cancel: () => {} })
  const [speakState, setSpeakState] = useState<SpeakState>({ speaking: false, cancel: () => {} })

  const processVoices = (voiceOptions: SpeechSynthesisVoice[]) => {
    setVoicesState((prevState) => ({ ...prevState, voices: voiceOptions }))
  }

  const getVoices = () => {
    // Firefox seems to have voices upfront and never calls the voiceschanged event
    let voiceOptions = window.speechSynthesis.getVoices()
    if (voiceOptions.length > 0) {
      processVoices(voiceOptions)
      setVoicesState((prevState) => ({ ...prevState, supported: true }))
      return
    }

    // why not use .addEventListener voicechanged instead?
    window.speechSynthesis.onvoiceschanged = (event) => {
      voiceOptions = event?.target?.getVoices() as SpeechSynthesisVoice[]
      processVoices(voiceOptions)
      setVoicesState((prevState) => ({ ...prevState, supported: true }))
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

  const speak = (args: SpeakArgs = {}) => {
    const { voice = null, text = '', rate = 1, pitch = 1, volume = 1 } = args
    if (!voicesState.supported) return
    setSpeakState({ speaking: true, cancel })
    // Firefox won't repeat an utterance that has been
    // spoken, so we need to create a new instance each time
    const utterance = new SpeechSynthesisUtterance()
    utterance.text = text
    utterance.voice = voice
    utterance.onend = handleEnd
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume
    window.speechSynthesis.speak(utterance)
    const cancel = () => {
      setSpeakState((prevState) => ({ ...prevState, speaking: false }))
      window.speechSynthesis.cancel()
    }
  }

  return {
    ...voicesState,
    ...speakState,
    speak,
  }
}
