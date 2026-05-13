// types/web-speech.d.ts
// Fills in Web Speech API types missing from lib.dom.d.ts.
// lib.dom already provides (as of TS 5.4+):
//   SpeechRecognitionEvent, SpeechRecognitionErrorEvent,
//   SpeechRecognitionResult, SpeechRecognitionResultList,
//   SpeechRecognitionAlternative
// We only declare what's still missing: SpeechRecognition + its constructor.

declare global {
  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    start(): void
    stop(): void
    abort(): void
    onresult: ((ev: SpeechRecognitionEvent) => void) | null
    onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null
    onend: ((ev: Event) => void) | null
    onstart: ((ev: Event) => void) | null
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition
    prototype: SpeechRecognition
  }

  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export {}