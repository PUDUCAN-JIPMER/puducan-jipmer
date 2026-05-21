// vitest.setup.ts
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// ---- Polyfills for Radix/Shadcn (if needed) ----
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserver as any)

class MockSpeechRecognition implements SpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  maxAlternatives = 1;
  onresult: SpeechRecognition['onresult'] = null;
  onerror:  SpeechRecognition['onerror']  = null;
  onend:    SpeechRecognition['onend']    = null;
  onstart:  SpeechRecognition['onstart']  = null;

  start = vi.fn(() => queueMicrotask(() => this.onstart?.()))
  stop = vi.fn(() => queueMicrotask(() => this.onend?.()))
  abort = vi.fn();

  addEventListener  = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent     = vi.fn(() => true);

  // Test helpers
  __emitResult(text: string, isFinal: boolean) {
    const event = {
      resultIndex: 0,
      results: { length: 1, 0: { isFinal, length: 1, 0: { transcript: text, confidence: 0.9 } } },
    } as unknown as SpeechRecognitionEvent;
    this.onresult?.(event);
  }
  __emitError(error: SpeechRecognitionErrorEvent['error']) {
    this.onerror?.({ error, message: '' } as SpeechRecognitionErrorEvent);
  }
}

Object.defineProperty(window, 'SpeechRecognition', {
  value: MockSpeechRecognition,
  writable: true,
  configurable: true,
});
