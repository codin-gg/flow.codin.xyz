import { useEffect, useState } from 'react'

interface SpeakArgs {
  text?: string
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
}

export const useSpeechSynthesis = ({ onEnd = () => {}} = {}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
  const [highlight, setHighlight] = useState<SpeechSynthesisEvent|undefined>()

  const getVoices = () => {
    // Firefox seems to have voices upfront and never calls the voiceschanged event
    window.speechSynthesis.addEventListener('voiceschanged', (event:Event) => {
      setVoices((event.target as SpeechSynthesis).getVoices())
    })
    setVoices(window.speechSynthesis.getVoices())
  }

  const handleEnd = () => {
    setSpeaking(false)
    setHighlight(undefined)
    onEnd()
  }

  useEffect(() => {
    if (window.speechSynthesis) {
      setSupported(true)
      getVoices()
    }
  }, [])

  const speak = ({ text = '', voice = voices[0], rate = 1, pitch = 1, volume = 1}: SpeakArgs) => {
    if (!supported) return
    setSpeaking(true)
    console.log('----------------------- started speaking -----------------------')
    // Firefox won't repeat an utterance that has been
    // spoken, so we need to create a new instance each time
    const utterance = new window.SpeechSynthesisUtterance()
    utterance.text = text
    utterance.voice = voice
    utterance.onend = handleEnd
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    utterance.addEventListener('boundary', (event: SpeechSynthesisEvent) => {
      console.log('boundary', event)
      setHighlight(event)
    })
    utterance.addEventListener('end', (event: SpeechSynthesisEvent) => {
      console.log('end', event)
      // !!! fixme: there could be something else to play
    })
    utterance.addEventListener('error', (event: SpeechSynthesisErrorEvent) => { console.log('error', event)})
    utterance.addEventListener('mark', (event: SpeechSynthesisEvent) => { console.log('mark', event)})
    utterance.addEventListener('pause', (event: SpeechSynthesisEvent) => { console.log('pause', event)})
    utterance.addEventListener('resume', (event: SpeechSynthesisEvent) => { console.log('resume', event)})
    utterance.addEventListener('start', (event: SpeechSynthesisEvent) => { console.log('start', event)})

    window.speechSynthesis.speak(utterance)
    console.log('----------------------- called speak -----------------------')
  }

  const cancel = () => {
    if (!supported) return
    setSpeaking(false)
    setHighlight(undefined)
    window.speechSynthesis.cancel()
  }

  return {
    supported,
    speak,
    speaking,
    highlight,
    cancel,
    voices
  }
}
