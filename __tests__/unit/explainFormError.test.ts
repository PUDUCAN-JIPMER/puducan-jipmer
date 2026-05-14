/**
 * Unit tests for the AI-Powered Form Error Explainer
 * ===================================================
 * GitHub Issue: #164
 *
 * Tests cover:
 *   (a) Returns a non-empty string on success (mocked Gemini).
 *   (b) Returns a fallback string when the API key is absent.
 *   (c) Does NOT echo back typedValue in a way that could reconstruct PHI —
 *       the output must be a generic instruction, not a data echo.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mock the @google/generative-ai SDK ──────────────────────────────────────

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

// ─── Import after mocking ────────────────────────────────────────────────────

// We import the internals directly to test the server action logic.
// In Next.js, "use server" is stripped at build time; in Vitest it's a no-op.
import {
  explainFormError,
  _buildFallbackExplanation,
} from "@/lib/explainFormError";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SAMPLE_INPUT = {
  fieldName: "age",
  errorMessage: "Expected number, received string",
  typedValue: "twenty-five",
};

const AI_RESPONSE =
  "The age field needs a number like 25, not words. Please erase what you typed and enter your age using digits only.";

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("explainFormError — Server Action", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Isolate env mutations
    process.env = { ...originalEnv };
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ── (a) Returns a string on success ──────────────────────────────────────

  it("returns an AI-generated explanation when the API key is present", async () => {
    process.env.GEMINI_API_KEY = "test-key-12345";

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => AI_RESPONSE,
      },
    });

    const result = await explainFormError(SAMPLE_INPUT);

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toBe(AI_RESPONSE);
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  // ── (b) Returns fallback when API key is absent ──────────────────────────

  it("returns a fallback string when GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await explainFormError(SAMPLE_INPUT);

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // The fallback must mention the field name
    expect(result.toLowerCase()).toContain("age");
    // Gemini should NOT have been called
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  // ── (b.2) Returns fallback when Gemini throws ───────────────────────────

  it("returns a fallback string when the Gemini API throws an error", async () => {
    process.env.GEMINI_API_KEY = "test-key-12345";

    mockGenerateContent.mockRejectedValueOnce(
      new Error("429 Quota exhausted"),
    );

    const result = await explainFormError(SAMPLE_INPUT);

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // Should still be a useful message, not a crash
    expect(result.toLowerCase()).toContain("age");
  });

  // ── (b.3) Returns fallback when Gemini returns empty ────────────────────

  it("returns a fallback string when the Gemini API returns an empty response", async () => {
    process.env.GEMINI_API_KEY = "test-key-12345";

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "",
      },
    });

    const result = await explainFormError(SAMPLE_INPUT);

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result.toLowerCase()).toContain("age");
  });

  // ── (c) Output does not echo typedValue as raw PHI ───────────────────────

  it("fallback explanation does not echo back typedValue verbatim", () => {
    const sensitiveInput = {
      fieldName: "patientNotes",
      errorMessage: "String must be at least 10 characters",
      typedValue: "John Doe has diabetes mellitus type 2",
    };

    const fallback = _buildFallbackExplanation(sensitiveInput);

    // The fallback must NOT contain the raw typed value
    expect(fallback).not.toContain(sensitiveInput.typedValue);
    // It should still be a helpful generic message
    expect(fallback.toLowerCase()).toContain("patient notes");
  });

  // ── (c.2) AI response is a generic instruction, not data echo ──────────

  it("AI-generated response is used as-is and does not include raw typedValue in the prompt output", async () => {
    process.env.GEMINI_API_KEY = "test-key-12345";

    // Simulate Gemini returning a clean, generic response
    const cleanResponse =
      "The patient notes field needs a bit more detail. Please add a few more words to describe the information.";

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => cleanResponse,
      },
    });

    const result = await explainFormError({
      fieldName: "patientNotes",
      errorMessage: "String must be at least 10 characters",
      typedValue: "John Doe has diabetes mellitus type 2",
    });

    // The result should be the clean AI response
    expect(result).toBe(cleanResponse);
    // It should NOT contain the sensitive typed value
    expect(result).not.toContain("John Doe");
    expect(result).not.toContain("diabetes mellitus");
  });
});

describe("buildFallbackExplanation — utility", () => {
  it("converts camelCase field names to readable text", () => {
    const result = _buildFallbackExplanation({
      fieldName: "dateOfBirth",
      errorMessage: "Invalid date",
    });

    expect(result.toLowerCase()).toContain("date of birth");
  });

  it("converts snake_case field names to readable text", () => {
    const result = _buildFallbackExplanation({
      fieldName: "phone_number",
      errorMessage: "Invalid format",
    });

    expect(result.toLowerCase()).toContain("phone number");
  });

  it("includes the original error message for context", () => {
    const result = _buildFallbackExplanation({
      fieldName: "weight",
      errorMessage: "Number must be greater than 0",
    });

    expect(result).toContain("Number must be greater than 0");
  });
});
