import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import {
  SYSTEM_INSTRUCTION, GEMINI_RESPONSE_SCHEMA, ClinicalNoteSchema,
  FEW_SHOTS, MODEL_ID, PROMPT_VERSION,
} from '@/lib/ai/clinical-note-prompt';
import { requireRole, assertRateLimit } from '@/app/api/auth'

const InputZ = z.object({
  text: z.string().min(3).max(4000),
  language: z.enum(['en-IN','ta-IN','te-IN','tanglish','telugish']).default('tanglish'),
  source: z.enum(['voice','typed']),
});

let _ai: GoogleGenAI | null = null;
function getAI() {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return _ai;
}

export async function POST(req: Request) {
  let user
  try {
    user = await requireRole(req, ['asha', 'nurse', 'doctor'])
  } catch (response) {
      if (response instanceof Response) return response
      throw response
  }

  try {
    await assertRateLimit(user.uid, 'normalize-note', 30, 60_000)
  } catch (response) {
      if (response instanceof Response) return response
      throw response
  }

  const parsed = InputZ.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { text, language, source } = parsed.data

  try {
    const response = await getAI().models.generateContent({
      model: MODEL_ID,
      contents: [
        ...FEW_SHOTS,
        { role: 'user', parts: [{ text: `Language hint: ${language}. Input source: ${source}.\n\nField note:\n${text}` }] },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,        // medical → keep deterministic
        topP: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        responseJsonSchema: GEMINI_RESPONSE_SCHEMA,
      },
    });

    const raw = response.text;
    if (!raw) throw new Error('empty_response');

    const json = JSON.parse(raw);
    const validated = ClinicalNoteSchema.parse(json);

    return NextResponse.json({
      normalized: validated,
      model: MODEL_ID,
      promptVersion: PROMPT_VERSION,
    });
  } catch (err) {
    console.error('[normalize-note] gemini error', err);
    return NextResponse.json(
      { error: 'normalization_failed', message: err instanceof Error ? err.message : 'unknown' },
      { status: 502 },
    );
  }
}