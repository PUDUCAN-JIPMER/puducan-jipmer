// types/web-speech.d.ts
// lib.dom.d.ts (TS 5.9) provides:
//   SpeechRecognitionResult, SpeechRecognitionResultList, SpeechRecognitionAlternative
// We declare the rest.

declare global {
    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number
        readonly results: SpeechRecognitionResultList
    }

    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: string
        readonly message: string
    }

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
        onend: (() => void) | null
        onstart: (() => void) | null
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