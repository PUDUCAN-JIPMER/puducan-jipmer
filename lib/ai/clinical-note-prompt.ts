// lib/ai/clinical-note-prompt.ts
import { Type } from '@google/genai';
import { z } from 'zod';

export const PROMPT_VERSION = 1;
export const MODEL_ID = 'gemini-3-flash';

// ─── System instruction ────────────────────────────────────────────────
export const SYSTEM_INSTRUCTION = `
You are a clinical documentation assistant for PuduCan, a cancer patient management platform used by ASHA (Accredited Social Health Activist) workers, nurses, and doctors at JIPMER, Puducherry, India.

Your sole task is to convert phonetic Tamil-English (Tanglish) or Telugu-English (Telugish) field notes — written or spoken by an ASHA worker — into a structured English clinical note that a physician can review.

NON-NEGOTIABLE RULES:

1. FAITHFULNESS. Translate and structure only what is in the input. Do NOT add diagnoses, medications, vital signs, or clinical findings that the worker did not mention. Do NOT "improve" or "complete" the clinical picture.

2. EMPTY IS CORRECT. If a field has no information in the input, return null or an empty array. Empty fields are the right answer when data is absent.

3. UNCERTAINTY IS SURFACED, NEVER HIDDEN. When a phonetic word, abbreviation, or local term is ambiguous, OR you cannot confidently translate it, add an entry to "uncertainPhrases" with: the original text, your best-guess interpretation, and the reason for uncertainty. Do NOT silently pick a guess and bury it in the structured fields.

4. NUMBERS ARE SACRED. Preserve every quantity exactly as given: BP (e.g., "160/100"), temperatures ("101°F"), doses ("500 mg"), durations ("3 days"), ages, and counts. Convert units only if the input explicitly states a conversion.

5. NAMES ARE PRESERVED VERBATIM. If a patient name appears, echo it back exactly. Do not infer gender, age, or demographics from a name.

6. CANCER-CARE CONTEXT. Common platform vocabulary includes chemotherapy, radiation, palliative care, biopsy, oncology follow-up, port-site, neutropenia. However, ASHA workers often encounter general symptoms first — translate general medical content with equal care.

7. URGENCY CALIBRATION. Use "emergency" only for clear red flags (severe bleeding, unconsciousness, severe respiratory distress, suspected stroke/MI, anaphylaxis). Use "urgent" for symptoms needing same-day attention (high fever post-chemo, persistent vomiting, new severe pain). Default to "routine".

8. OUTPUT LANGUAGE. English only in structured fields. Preserve patient names in original form if originally written in Latin script.

9. NO PROSE, NO MARKDOWN. Output ONLY the JSON object matching the provided schema.

VOCABULARY HINTS (non-exhaustive — use context for everything else):
  Tamil:   vaandhi=vomiting, vayithu vali=abdominal pain, thalai vali=headache, kaaichal=fever,
           moochu thinaral=dyspnea, rattam=blood, veekam=swelling, vali/noppi=pain,
           mathirai=tablet, ooshi=injection, ratha pariksha=blood test
  Telugu:  vamithulu=vomiting, kadupu noppi=abdominal pain, thala noppi=headache, jwaram=fever,
           ooopiri=breath, raktham=blood, vapu=swelling
  Mixed:   "sugar"=diabetes (in self-report), BP=blood pressure, chemo=chemotherapy

DEGENERATE INPUT. If the input is gibberish, contains no clinical content, or appears to be a test message, return the schema with empty fields plus an "uncertainPhrases" entry explaining what you observed. Do NOT fabricate a clinical note.
`.trim();

// ─── Gemini response schema ────────────────────────────────────────────
export const GEMINI_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    chiefComplaint: {
      type: Type.STRING,
      description: 'One-sentence summary of the primary reason for visit.',
    },
    history: {
      type: Type.STRING,
      description: 'Relevant history mentioned: age, known conditions, recent treatments. Empty string if none.',
    },
    observations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Discrete clinical observations mentioned by the worker.',
    },
    vitals: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        bp:               { type: Type.STRING, nullable: true },
        temperature:      { type: Type.STRING, nullable: true },
        pulse:            { type: Type.STRING, nullable: true },
        respiratoryRate:  { type: Type.STRING, nullable: true },
        spo2:             { type: Type.STRING, nullable: true },
        weight:           { type: Type.STRING, nullable: true },
        fastingGlucose:   { type: Type.STRING, nullable: true },
        randomGlucose:    { type: Type.STRING, nullable: true },
      },
      propertyOrdering: ['bp','temperature','pulse','respiratoryRate','spo2','weight','fastingGlucose','randomGlucose'],
    },
    medications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name:      { type: Type.STRING },
          dose:      { type: Type.STRING, nullable: true },
          frequency: { type: Type.STRING, nullable: true },
          notes:     { type: Type.STRING, nullable: true },
        },
        propertyOrdering: ['name','dose','frequency','notes'],
        required: ['name'],
      },
    },
    suggestedFollowUp: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Concrete next steps mentioned or directly implied. Do not invent.',
    },
    urgencyFlag: {
      type: Type.STRING,
      enum: ['routine', 'urgent', 'emergency'],
    },
    uncertainPhrases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original:       { type: Type.STRING },
          interpretation: { type: Type.STRING },
          reason:         { type: Type.STRING },
        },
        propertyOrdering: ['original','interpretation','reason'],
        required: ['original','interpretation','reason'],
      },
    },
  },
  propertyOrdering: [
    'chiefComplaint','history','observations','vitals',
    'medications','suggestedFollowUp','urgencyFlag','uncertainPhrases'
  ],
  required: ['chiefComplaint','history','observations', 'medications','suggestedFollowUp','urgencyFlag','uncertainPhrases'],
};

// ─── Zod mirror for runtime validation ─────────────────────────────────
// Gemini occasionally drifts from the schema — re-validate before persisting.
export const ClinicalNoteSchema = z.object({
  chiefComplaint: z.string(),
  history: z.string(),
  observations: z.array(z.string()),
  vitals: z.object({
    bp: z.string().nullable().optional(),
    temperature: z.string().nullable().optional(),
    pulse: z.string().nullable().optional(),
    respiratoryRate: z.string().nullable().optional(),
    spo2: z.string().nullable().optional(),
    weight: z.string().nullable().optional(),
    fastingGlucose: z.string().nullable().optional(),
    randomGlucose: z.string().nullable().optional(),
  }).nullable().optional(),
  medications: z.array(z.object({
    name: z.string(),
    dose: z.string().nullable().optional(),
    frequency: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })).optional().default([]),
  suggestedFollowUp: z.array(z.string()),
  urgencyFlag: z.enum(['routine','urgent','emergency']),
  uncertainPhrases: z.array(z.object({
    original: z.string(),
    interpretation: z.string(),
    reason: z.string(),
  })),
});

export type ClinicalNote = z.infer<typeof ClinicalNoteSchema>;

// ─── Few-shot examples (sent in contents, not systemInstruction) ───────
// Few-shot for Tanglish/Telugish drastically improves output quality.
// Send them as model/user turns so Gemini learns the I/O style.
export const FEW_SHOTS = [
  {
    role: 'user' as const,
    parts: [{ text:
      'Patient Lakshmi 45 years vandhutaanga. Nethu vandhi 3 times vandhirukku. Thalai vali heavy ah irukku. Fever 101 irukku. Sugar patient. Chemo last week panninanga. Doctor ah paakanum.'
    }],
  },
  {
    role: 'model' as const,
    parts: [{ text: JSON.stringify({
      chiefComplaint: 'Vomiting 3 times yesterday with severe headache and fever.',
      history: 'Lakshmi, 45 years old. Known diabetic. Received chemotherapy one week ago.',
      observations: ['Vomiting — 3 episodes yesterday','Severe headache','Fever 101°F'],
      vitals: { temperature: '101°F' },
      medications: z.array(
        z.object({
          name: z.string(),
          dose: z.string().nullable().optional(),
          frequency: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
        })
      ),
      suggestedFollowUp: ['Doctor review requested by ASHA worker'],
      urgencyFlag: 'urgent',
      uncertainPhrases: [],
    })}],
  },
  {
    role: 'user' as const,
    parts: [{ text:
      'Periyaiya konjam suvasam katta vidhu. BP 160/100. Sugar 250 fasting. Tablet eduthukaraanga but porumadhuga. Kaal la veekam irukku.'
    }],
  },
  {
    role: 'model' as const,
    parts: [{ text: JSON.stringify({
      chiefComplaint: 'Mild shortness of breath with pedal edema in elderly patient with elevated BP and fasting glucose.',
      history: 'Elderly patient. Currently on unspecified tablet medication, reports inadequate effect.',
      observations: ['Mild dyspnea','Pedal edema','Patient reports current medication is insufficient'],
      vitals: { bp: '160/100', fastingGlucose: '250' },
      medications: [{ name: 'Unspecified tablet', notes: 'Patient reports inadequate effect' }],
      suggestedFollowUp: ['Review current medication regimen','Cardiology and diabetic evaluation'],
      urgencyFlag: 'urgent',
      uncertainPhrases: [
        {
          original: 'porumadhuga',
          interpretation: 'medication is insufficient / not enough',
          reason: 'colloquial Tamil — could mean "not enough" or "not effective"; clarify with patient',
        },
      ],
    })}],
  },
];