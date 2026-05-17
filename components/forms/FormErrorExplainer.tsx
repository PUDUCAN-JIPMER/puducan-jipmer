"use client";

/**
 * AI-Powered Form Error Explainer — Client Component
 * ===================================================
 * GitHub Issue: #164
 *
 * A drop-in, opt-in component that renders a warm, AI-generated explanation
 * of a Zod validation error.  Calls the `explainFormError` server action
 * so the Gemini API key never leaves the server.
 *
 * USAGE (do NOT modify existing forms — add this alongside existing errors):
 * ```tsx
 * {errors.age && (
 *   <FormErrorExplainer
 *     fieldName="age"
 *     errorMessage={errors.age.message}
 *     typedValue={watch("age")}
 *   />
 * )}
 * ```
 *
 * This component is purely additive and non-breaking.
 */

import { useEffect, useState } from "react";
import { explainFormError } from "@/lib/explainFormError";

// ─── Props ───────────────────────────────────────────────────────────────────

interface FormErrorExplainerProps {
  /** The name of the form field that failed validation */
  fieldName: string;
  /** The raw Zod / validation error message */
  errorMessage: string;
  /** The value the user actually typed (optional) */
  typedValue?: string;
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function ExplainerSkeleton() {
  return (
    <div
      className="animate-pulse rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950"
      aria-busy="true"
      aria-label="Loading error explanation"
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-yellow-200 dark:bg-yellow-800" />
        <div className="h-3 w-24 rounded bg-yellow-200 dark:bg-yellow-800" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-yellow-100 dark:bg-yellow-900" />
        <div className="h-3 w-4/5 rounded bg-yellow-100 dark:bg-yellow-900" />
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FormErrorExplainer({
  fieldName,
  errorMessage,
  typedValue,
}: FormErrorExplainerProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchExplanation() {
      setIsLoading(true);
      setExplanation(null);

      try {
        const result = await explainFormError({
          fieldName,
          errorMessage,
          typedValue,
        });

        if (!cancelled) {
          setExplanation(result);
        }
      } catch {
        // Server action failed entirely — show nothing rather than crash
        if (!cancelled) {
          setExplanation(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchExplanation();

    return () => {
      cancelled = true;
    };
  }, [fieldName, errorMessage, typedValue]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return <ExplainerSkeleton />;
  }

  // ── Nothing to show ──────────────────────────────────────────────────────
  if (!explanation) {
    return null;
  }

  // ── Explanation card ─────────────────────────────────────────────────────
  return (
    <div
      role="alert"
      className="mt-1.5 w-full rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900 shadow-sm dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"
    >
      <div className="mb-1 flex items-center gap-1.5">
        {/* Lightbulb icon — inline SVG to avoid extra dependencies */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400"
          aria-hidden="true"
        >
          <path d="M10 1a6 6 0 0 0-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0 0 10 1ZM8.5 17a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3Z" />
        </svg>
        <span className="font-medium text-yellow-700 dark:text-yellow-300">
          Helpful Tip
        </span>
      </div>
      <p className="leading-relaxed">{explanation}</p>
    </div>
  );
}
