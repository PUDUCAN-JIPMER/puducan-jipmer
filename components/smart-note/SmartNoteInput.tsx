// components/smart-note/SmartNoteInput.tsx
'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mic, MicOff, Sparkles, Loader2, AlertCircle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useSpeechToText, type RecognitionLanguage } from '@/hooks/useSpeechToText';
import type { ClinicalNote } from '@/lib/ai/clinical-note-prompt';
import { cn } from '@/lib/utils';
import { NormalizedNotePreview } from './NormalizedNotePreview';

export interface SmartNoteValue {
  originalText: string;
  language: RecognitionLanguage;
  inputSource: 'voice' | 'typed' | 'mixed';
  normalized: ClinicalNote | null;
  promptVersion?: number;
  model?: string;
}

export interface SmartNoteInputProps {
  value: SmartNoteValue;
  onChange: (value: SmartNoteValue) => void;
  disabled?: boolean;
  className?: string;
  /** Maximum input length. Server also enforces 4000. */
  maxLength?: number;
}

export const EMPTY_SMART_NOTE: SmartNoteValue = {
  originalText: '',
  language: 'en-IN',
  inputSource: 'typed',
  normalized: null,
};

interface NormalizeResponse {
  normalized: ClinicalNote;
  model: string;
  promptVersion: number;
}

async function normalizeNote(input: {
  text: string;
  language: RecognitionLanguage;
  source: 'voice' | 'typed' | 'mixed';
}): Promise<NormalizeResponse> {
  const apiLanguage =
    input.language === 'en-IN' ? 'tanglish' :
    input.language === 'ta-IN' ? 'ta-IN' :
    input.language === 'te-IN' ? 'te-IN' :
    'tanglish';

  const res = await fetch('/api/notes/normalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: input.text,
      language: apiLanguage,
      source: input.source === 'mixed' ? 'voice' : input.source,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Normalization failed (HTTP ${res.status})`);
  }
  return res.json();
}

export function SmartNoteInput({
  value, onChange, disabled, className, maxLength = 4000,
}: SmartNoteInputProps) {
  const [hasUsedMic, setHasUsedMic] = useState(false);
  const stt = useSpeechToText({ language: value.language });

  // Drain finalized speech chunks into the textarea, then reset the hook
  // so the next utterance starts fresh.
  useEffect(() => {
    if (!stt.transcript) return;
    const merged = value.originalText
      ? `${value.originalText} ${stt.transcript}`.replace(/\s+/g, ' ').trim()
      : stt.transcript;
    onChange({
      ...value,
      originalText: merged.slice(0, maxLength),
      inputSource: hasUsedMic && value.originalText ? 'mixed' : 'voice',
      // text changed → previous normalization is stale
      normalized: null,
    });
    stt.reset();
    // Only depend on transcript — re-running on value would infinite-loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stt.transcript]);

  const mutation = useMutation({
    mutationFn: normalizeNote,
    onSuccess: (data) =>
      onChange({
        ...value,
        normalized: data.normalized,
        model: data.model,
        promptVersion: data.promptVersion,
      }),
  });

  const handleMicClick = () => {
    if (stt.isListening) {
      stt.stop();
    } else {
      setHasUsedMic(true);
      stt.start();
    }
  };

  const handleTextChange = (text: string) => {
    onChange({
      ...value,
      originalText: text,
      inputSource: hasUsedMic ? 'mixed' : 'typed',
      // Invalidate stale normalization whenever the source text changes.
      normalized: text === value.originalText ? value.normalized : null,
    });
  };

  const handleLanguageChange = (lang: RecognitionLanguage) => {
    if (stt.isListening) stt.stop();
    onChange({ ...value, language: lang });
  };

  const handleNormalize = () => {
    if (stt.isListening) stt.stop();
    mutation.mutate({
      text: value.originalText.trim(),
      language: value.language,
      source: value.inputSource,
    });
  };

  const handleReset = () => {
    if (stt.isListening) stt.stop();
    stt.reset();
    setHasUsedMic(false);
    mutation.reset();
    onChange(EMPTY_SMART_NOTE);
  };

  const trimmedLength = value.originalText.trim().length;
  const canNormalize = trimmedLength >= 3 && !mutation.isPending && !disabled;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={value.language}
          onValueChange={(v) => handleLanguageChange(v as RecognitionLanguage)}
          disabled={disabled || stt.isListening}
        >
          <SelectTrigger className="w-[170px]" aria-label="Input language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-IN">Tanglish / English</SelectItem>
            <SelectItem value="ta-IN">Tamil</SelectItem>
            <SelectItem value="te-IN">Telugu</SelectItem>
            <SelectItem value="hi-IN">Hindi</SelectItem>
          </SelectContent>
        </Select>

        {stt.isSupported && (
          <Button
            type="button"
            variant={stt.isListening ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleMicClick}
            disabled={disabled}
            aria-label={stt.isListening ? 'Stop recording' : 'Start voice input'}
            aria-pressed={stt.isListening}
            className="gap-2"
          >
            {stt.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {stt.isListening ? 'Stop' : 'Record'}
          </Button>
        )}

        {stt.isListening && (
          <span
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            aria-live="polite"
            role="status"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Listening…
          </span>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={disabled || (!value.originalText && !value.normalized)}
          aria-label="Clear note"
          className="ml-auto"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {!stt.isSupported && (
        <Alert>
          <AlertDescription className="text-xs">
            Voice input isn't available on this browser. You can still type your note phonetically below.
          </AlertDescription>
        </Alert>
      )}

      {/* Textarea + interim transcript */}
      <div className="space-y-1">
        <Textarea
          value={value.originalText}
          onChange={(e) => handleTextChange(e.target.value.slice(0, maxLength))}
          placeholder="Type phonetically or press Record. Example: 'Patient Lakshmi 45 years, vandhi 3 times nethu, fever 101…'"
          disabled={disabled}
          rows={5}
          className="resize-y font-mono text-sm"
          aria-label="Field note input"
          aria-describedby="smart-note-help"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span id="smart-note-help">
            {trimmedLength < 3
              ? 'Add at least a few words to normalize.'
              : 'Speak or type the note as you would say it.'}
          </span>
          <span>{value.originalText.length}/{maxLength}</span>
        </div>
        {stt.interimTranscript && (
          <div
            className="rounded-md bg-muted/50 px-3 py-2 text-sm italic text-muted-foreground"
            aria-live="polite"
          >
            {stt.interimTranscript}…
          </div>
        )}
      </div>

      {stt.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{stt.error}</AlertDescription>
        </Alert>
      )}

      {/* Normalize action */}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={handleNormalize} disabled={!canNormalize} className="gap-2">
          {mutation.isPending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Sparkles className="h-4 w-4" />}
          {mutation.isPending
            ? 'Normalizing…'
            : value.normalized
              ? 'Re-normalize'
              : 'Normalize to clinical note'}
        </Button>
        {value.normalized && (
          <span className="text-xs text-muted-foreground">
            Edit the text above and re-normalize if needed.
          </span>
        )}
      </div>

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <span>
              {mutation.error instanceof Error ? mutation.error.message : 'Normalization failed.'}
            </span>
            <Button variant="link" size="sm" onClick={handleNormalize} className="h-auto p-0">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {value.normalized && (
        <NormalizedNotePreview note={value.normalized} originalText={value.originalText} />
      )}
    </div>
  );
}