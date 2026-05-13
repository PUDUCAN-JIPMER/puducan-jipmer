// __tests__/hooks/useSpeechToText.test.tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpeechToText } from '@/hooks/useSpeechToText';

// Minimal mock that lets us drive the recognition lifecycle from tests.
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  maxAlternatives = 1;
  onstart:  ((e?: Event) => void) | null = null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null = null;
  onerror:  ((e: SpeechRecognitionErrorEvent) => void) | null = null;
  onend:    (() => void) | null = null;

  start = vi.fn(() => queueMicrotask(() => this.onstart?.()));
  stop  = vi.fn(() => queueMicrotask(() => this.onend?.()));
  abort = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn(() => true);

  emit(text: string, isFinal: boolean) {
    const event = {
      resultIndex: 0,
      results: { length: 1, 0: { isFinal, length: 1, 0: { transcript: text, confidence: 0.9 } } },
    } as unknown as SpeechRecognitionEvent;
    this.onresult?.(event);
  }
  emitError(error: SpeechRecognitionErrorEvent['error']) {
    this.onerror?.({ error, message: '' } as SpeechRecognitionErrorEvent);
  }
}

let instances: MockSpeechRecognition[] = [];
const getLatest = () => instances[instances.length - 1];

beforeEach(() => {
    instances = []
    const Ctor = vi.fn(() => {
        const inst = new MockSpeechRecognition()
        instances.push(inst)
        return inst
    })
    Object.defineProperty(window, 'SpeechRecognition', {
        value: Ctor,
        writable: true,
        configurable: true,
    })
})

afterEach(() => {
    delete window.SpeechRecognition
    delete window.webkitSpeechRecognition
})

describe('useSpeechToText', () => {
  it('reports unsupported when neither global is present', () => {
    delete window.SpeechRecognition;
    const { result } = renderHook(() => useSpeechToText());
    expect(result.current.isSupported).toBe(false);
  });

  it('accumulates only finalized chunks into transcript', async () => {
    const { result } = renderHook(() => useSpeechToText());

    act(() => result.current.start());
    await waitFor(() => expect(result.current.isListening).toBe(true));

    act(() => getLatest().emit('vandhi 3 times', false));
    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('vandhi 3 times');

    act(() => getLatest().emit('vandhi 3 times nethu', true));
    expect(result.current.transcript).toBe('vandhi 3 times nethu');
  });

  it('joins multiple final chunks with single spaces', async () => {
    const { result } = renderHook(() => useSpeechToText());
    act(() => result.current.start());
    await waitFor(() => expect(result.current.isListening).toBe(true));

    act(() => getLatest().emit('thalai vali', true));
    act(() => getLatest().emit('fever 101', true));
    expect(result.current.transcript).toBe('thalai vali fever 101');
  });

  it('surfaces friendly message for permission denied', async () => {
    const { result } = renderHook(() => useSpeechToText());
    act(() => result.current.start());
    await waitFor(() => expect(result.current.isListening).toBe(true));

    act(() => getLatest().emitError('not-allowed'));
    expect(result.current.error).toMatch(/permission denied/i);
    expect(result.current.isListening).toBe(false);
  });

  it('swallows "no-speech" and "aborted" — these are normal events', async () => {
    const { result } = renderHook(() => useSpeechToText());
    act(() => result.current.start());
    await waitFor(() => expect(result.current.isListening).toBe(true));

    act(() => getLatest().emitError('no-speech'));
    expect(result.current.error).toBeNull();

    act(() => getLatest().emitError('aborted'));
    expect(result.current.error).toBeNull();
  });

  it('auto-restarts on onend while user still intends to listen', async () => {
    const { result } = renderHook(() => useSpeechToText())
    act(() => result.current.start())
    await waitFor(() => expect(result.current.isListening).toBe(true))
    const first = getLatest()
    expect(first.start).toHaveBeenCalledTimes(1)

    act(() => first.onend?.())  // ← was first.onend?.()
    expect(first.start).toHaveBeenCalledTimes(2)
  })

  it('does NOT auto-restart after explicit stop()', async () => {
    const { result } = renderHook(() => useSpeechToText());
    act(() => result.current.start());
    await waitFor(() => expect(result.current.isListening).toBe(true));
    const inst = getLatest();

    act(() => result.current.stop());
    await waitFor(() => expect(result.current.isListening).toBe(false));
    expect(inst.start).toHaveBeenCalledTimes(1);
  });

  it('reset() clears transcript without affecting listening state', async () => {
    const { result } = renderHook(() => useSpeechToText());
    act(() => result.current.start());
    await waitFor(() => expect(result.current.isListening).toBe(true));
    act(() => getLatest().emit('hello', true));
    expect(result.current.transcript).toBe('hello');

    act(() => result.current.reset());
    expect(result.current.transcript).toBe('');
    expect(result.current.isListening).toBe(true);
  });

  it('aborts and detaches handlers on unmount', async () => {
    const { result, unmount } = renderHook(() => useSpeechToText());
    act(() => result.current.start());
    await waitFor(() => expect(result.current.isListening).toBe(true));
    const inst = getLatest();
    unmount();
    expect(inst.abort).toHaveBeenCalled();
    expect(inst.onresult).toBeNull();
    expect(inst.onend).toBeNull();
  });

  it('uses webkit prefix when only that is present', () => {
    delete window.SpeechRecognition;
    const Ctor = vi.fn(() => new MockSpeechRecognition());
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: Ctor, writable: true, configurable: true,
    });
    const { result } = renderHook(() => useSpeechToText());
    expect(result.current.isSupported).toBe(true);
    act(() => result.current.start());
    expect(Ctor).toHaveBeenCalled();
  });
});