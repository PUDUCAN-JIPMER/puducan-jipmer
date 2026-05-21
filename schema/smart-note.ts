// schema/smart-note.ts
import { z } from 'zod'
import { ClinicalNoteSchema, PROMPT_VERSION, MODEL_ID } from '@/lib/ai/clinical-note-prompt'

export const SMART_NOTE_SCHEMA_VERSION = 1 as const

export const RecognitionLanguageSchema = z.enum(['en-IN', 'ta-IN', 'te-IN', 'hi-IN'])
export const InputSourceSchema = z.enum(['typed', 'voice', 'mixed'])
export const NormalizationStatusSchema = z.enum(['pending', 'success', 'failed', 'skipped'])

/**
 * AI-normalized variant of a clinical note.
 * Embedded as an optional field on a FollowUp entry.
 */
export const SmartNoteSchema = z.object({
    schemaVersion: z.literal(SMART_NOTE_SCHEMA_VERSION),

    originalText: z.string().min(1).max(4000),
    originalLanguage: RecognitionLanguageSchema,
    inputSource: InputSourceSchema,

    normalized: ClinicalNoteSchema.nullable(),
    normalizationStatus: NormalizationStatusSchema,
    normalizationError: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    promptVersion: z.number().int().nullable().optional(),

    reviewed: z.boolean(),
    reviewedBy: z.string().nullable().optional(),
    reviewedAt: z.any().nullable().optional(),
})

export type SmartNote = z.infer<typeof SmartNoteSchema>

export function toSmartNote(input: {
    originalText: string
    originalLanguage: z.infer<typeof RecognitionLanguageSchema>
    inputSource: z.infer<typeof InputSourceSchema>
    normalized: z.infer<typeof ClinicalNoteSchema> | null
    model?: string
    promptVersion?: number
    normalizationError?: string
}): SmartNote {
    const status: SmartNote['normalizationStatus'] = input.normalized
        ? 'success'
        : input.normalizationError
          ? 'failed'
          : 'skipped'

    return SmartNoteSchema.parse({
        schemaVersion: SMART_NOTE_SCHEMA_VERSION,
        originalText: input.originalText.trim(),
        originalLanguage: input.originalLanguage,
        inputSource: input.inputSource,
        normalized: input.normalized,
        normalizationStatus: status,
        normalizationError: input.normalizationError ?? null,
        model: input.model ?? (status === 'success' ? MODEL_ID : null),
        promptVersion: input.promptVersion ?? (status === 'success' ? PROMPT_VERSION : null),
        reviewed: false,
        reviewedBy: null,
        reviewedAt: null,
    })
}