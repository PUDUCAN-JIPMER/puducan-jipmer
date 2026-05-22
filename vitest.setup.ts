// vitest.setup.ts
process.env.FIREBASE_PROJECT_ID ??= 'test-project'
process.env.FIREBASE_CLIENT_EMAIL ??= 'test@example.com'
process.env.FIREBASE_PRIVATE_KEY ??= 'test-key'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('firebase-admin/app', () => ({
    cert: vi.fn(),
    getApps: vi.fn(() => []),
    initializeApp: vi.fn(() => ({})),
}))

vi.mock('firebase-admin/auth', () => ({
    getAuth: vi.fn(() => ({
        verifySessionCookie: vi.fn(),
        verifyIdToken: vi.fn(),
        createSessionCookie: vi.fn(),
    })),
}))

vi.mock('firebase-admin/firestore', () => ({
    getFirestore: vi.fn(() => ({
        collection: vi.fn(),
        runTransaction: vi.fn(),
    })),
    FieldValue: {
        serverTimestamp: vi.fn(() => 'mock-timestamp'),
    },
}))

// ---- Polyfills for Radix/Shadcn (if needed) ----
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserver)

class MockSpeechRecognition implements SpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  maxAlternatives = 1;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null = null
  onerror:  SpeechRecognition['onerror']  = null;
  onend:    SpeechRecognition['onend']    = null;
  onstart:  SpeechRecognition['onstart']  = null;

  start = vi.fn(() => queueMicrotask(() => this.onstart?.()))
  stop = vi.fn(() => queueMicrotask(() => this.onend?.()))
  abort = vi.fn();

  addEventListener  = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn(() => true);

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
