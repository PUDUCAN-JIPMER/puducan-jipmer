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
import {
  buildFallbackExplanation,
  type ExplainFormErrorInput,
} from "@/lib/explainFormErrorUtils";

// Re-export the input type for consumers
export type { ExplainFormErrorInput };

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
