// __tests__/ai/clinical-note.eval.ts
// Run with: GEMINI_API_KEY=... pnpm vitest --run __tests__/ai/clinical-note.eval.ts
// Skipped by default — flip RUN_EVALS=1 to execute.
import { describe, it, expect } from 'vitest';
import { ClinicalNoteSchema } from '@/lib/ai/clinical-note-prompt';

const cases = [
  {
    input: 'Patient Lakshmi 45 vandhi 3 times nethu thalai vali heavy fever 101 sugar chemo last week',
    expect: { urgencyFlag: 'urgent', mentionsVomiting: true, vitalsHasTemp: true },
  },
  {
    input: 'Periyaiya konjam suvasam katta vidhu BP 160/100 sugar 250 fasting kaal la veekam',
    expect: { urgencyFlag: 'urgent', vitalsHasBP: true, mentionsEdema: true },
  },
  {
    input: 'asdfgh qwerty no clinical content here',
    expect: { hasUncertainty: true },
  },
];

(process.env.RUN_EVALS === '1' ? describe : describe.skip)('Gemini prompt evals', () => {
  for (const tc of cases) {
    it(`handles: ${tc.input.slice(0, 40)}…`, async () => {
      const res = await fetch('http://localhost:3000/api/notes/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tc.input, language: 'tanglish', source: 'typed' }),
      });
      const { normalized } = await res.json();
      const parsed = ClinicalNoteSchema.parse(normalized);

      if (tc.expect.urgencyFlag) expect(parsed.urgencyFlag).toBe(tc.expect.urgencyFlag);
      if (tc.expect.mentionsVomiting) {
        expect(JSON.stringify(parsed).toLowerCase()).toMatch(/vomit/);
      }
      if (tc.expect.vitalsHasTemp) expect(parsed.vitals?.temperature).toBeTruthy();
      if (tc.expect.vitalsHasBP) expect(parsed.vitals?.bp).toBeTruthy();
      if (tc.expect.mentionsEdema) {
        expect(JSON.stringify(parsed).toLowerCase()).toMatch(/edema|swelling/);
      }
      if (tc.expect.hasUncertainty) expect(parsed.uncertainPhrases.length).toBeGreaterThan(0);
    }, 30_000);
  }
});