"use server";

/**
 * AI-Powered Form Error Explainer — Server Action
 * ================================================
 * GitHub Issue: #164
 *
 * Accepts a Zod validation error and returns a warm, plain-English explanation
 * using the Gemini free tier (gemini-1.5-flash).
 *
 * PRIVACY GUARANTEE:
 *   Only `fieldName`, `errorMessage`, and an optional `typedValue` are sent
 *   to the Gemini API.  No patient name, ID, diagnosis, or any PHI/PII is
 *   ever transmitted.  The API key stays server-side because this is a
 *   Next.js Server Action.
 *
 * GRACEFUL FALLBACK:
 *   If the API key is missing, the quota is exhausted, or any error occurs,
 *   the function silently returns a generic plain-English rewrite of the
 *   original Zod error — no crash, no visible error to the user.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExplainFormErrorInput {
  /** The name of the form field that failed validation (e.g. "age") */
  fieldName: string;
  /** The raw Zod / validation error message */
  errorMessage: string;
  /** The value the user actually typed (optional — never contains PHI) */
  typedValue?: string;
}

// ─── Fallback (no AI) ────────────────────────────────────────────────────────

/**
 * Produces a best-effort, human-friendly rewrite of the raw Zod error
 * without calling any external API.
 */
function buildFallbackExplanation(input: ExplainFormErrorInput): string {
  const friendly = input.fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .toLowerCase();

  return (
    `It looks like the "${friendly}" field has a problem: ${input.errorMessage}. ` +
    `Please check the value you entered and try again.`
  );
}

// ─── Gemini Prompt ───────────────────────────────────────────────────────────

function buildPrompt(input: ExplainFormErrorInput): string {
  return `You are a helpful assistant for rural healthcare workers with low tech literacy in India.
A form validation error occurred. Explain it in one warm, simple sentence in plain English.
Then give one concrete fix suggestion in a second sentence.
Do not use technical jargon. Do not repeat the error code. Be encouraging.

Field: ${input.fieldName}
Error: ${input.errorMessage}
${input.typedValue ? `User typed: ${input.typedValue}` : ""}

Respond in 2 sentences maximum.`;
}

// ─── Server Action ───────────────────────────────────────────────────────────

/**
 * Calls Gemini free tier to explain a form validation error in plain English.
 * Falls back to a generic rewrite if the API is unavailable for any reason.
 *
 * @example
 * const explanation = await explainFormError({
 *   fieldName: "age",
 *   errorMessage: "Expected number, received string",
 *   typedValue: "twenty",
 * });
 */
export async function explainFormError(
  input: ExplainFormErrorInput,
): Promise<string> {
  // ── Guard: API key must exist ──────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildFallbackExplanation(input);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(buildPrompt(input));
    const response = result.response;
    const text = response.text();

    // If Gemini returns an empty response, fall back
    if (!text || text.trim().length === 0) {
      return buildFallbackExplanation(input);
    }

    return text.trim();
  } catch {
    // Quota exhausted, network error, invalid key, or any other failure —
    // degrade gracefully with no visible error to the user.
    return buildFallbackExplanation(input);
  }
}

// ─── Exported for testing only ───────────────────────────────────────────────
export { buildFallbackExplanation as _buildFallbackExplanation };
