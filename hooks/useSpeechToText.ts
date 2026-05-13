// hooks/useSpeechToText.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type RecognitionLanguage = 'en-IN' | 'ta-IN' | 'te-IN' | 'hi-IN';

export interface UseSpeechToTextOptions {
  /**
   * BCP-47 code. For Tanglish, 'en-IN' usually produces better transcription
   * than 'ta-IN' because most ASHA workers code-switch heavily.
   */
  language?: RecognitionLanguage;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface UseSpeechToTextReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;          // finalized text only
  interimTranscript: string;   // currently-being-spoken phrase
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechToText(
  options: UseSpeechToTextOptions = {},
): UseSpeechToTextReturn {
  const { language = 'en-IN', continuous = true, interimResults = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // User INTENT to be listening, separate from the recognizer's actual state.
  // Lets us auto-restart when Chrome ends a session after ~60s of silence.
  const wantsListeningRef = useRef(false);
  const finalRef = useRef('');

  // SSR-safe support check
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition!;
    const recognition = new Ctor();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        setIsListening(true)
        setError(null)
    }

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const text = r[0]?.transcript ?? '';
        if (r.isFinal) {
          finalRef.current = (finalRef.current + ' ' + text).replace(/\s+/g, ' ').trim();
        } else {
          interim += text;
        }
      }
      setTranscript(finalRef.current);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return

        const friendly: Record<string, string> = {
            'not-allowed': 'Microphone permission denied. Please allow microphone access in your browser.',
            'service-not-allowed': 'Speech recognition is unavailable on this device.',
            'network': 'Speech recognition needs an internet connection.',
            'audio-capture': 'No microphone detected.',
            'language-not-supported': `Language "${language}" is not supported on this device.`,
        }
        setError(friendly[event.error] ?? `Speech recognition error: ${event.error}`)
        wantsListeningRef.current = false
        setIsListening(false)
    }

    recognition.onend = () => {
        if (wantsListeningRef.current) {
            try {
                recognition.start()
            } catch {
                wantsListeningRef.current = false
                setIsListening(false)
            }
        } else {
            setIsListening(false)
        }
    }

    recognitionRef.current = recognition;

    return () => {
      wantsListeningRef.current = false;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onstart = null;
      try { recognition.abort(); } catch { /* noop */ }
      recognitionRef.current = null;
    };
  }, [isSupported, language, continuous, interimResults]);

  const start = useCallback(() => {
    const r = recognitionRef.current;
    if (!r || wantsListeningRef.current) return;
    wantsListeningRef.current = true;
    setError(null);
    try {
      r.start();
    } catch {
      // start() throws synchronously if already running — safe to ignore
      wantsListeningRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    wantsListeningRef.current = false;
    try { r.stop(); } catch { /* noop */ }
  }, []);

  const reset = useCallback(() => {
    finalRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return { isSupported, isListening, transcript, interimTranscript, error, start, stop, reset };
}