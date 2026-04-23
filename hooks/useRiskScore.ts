/**
 * React hook that wraps the ML inference engine for patient risk scoring.
 *
 * Usage:
 *   const risk = useRiskScore(patient)
 *   // risk is null when data is insufficient or patient is deceased
 *   // risk = { score: 0.72, tier: 'High', factors: ['Cancer stage severity ↑', ...] }
 *
 * The computation is memoized — it only re-runs when the patient reference
 * changes. Since the inference is pure arithmetic (no async, no side effects),
 * it runs synchronously in microseconds.
 */

import { useMemo } from 'react'
import type { Patient } from '@/schema/patient'
import type { RiskResult } from '@/lib/ml/types'
import { computeRiskScore } from '@/lib/ml/riskScoreEngine'

/**
 * Computes a follow-up adherence risk score for the given patient.
 *
 * @param patient - The patient record to score, or null if none is selected
 * @returns A RiskResult object, or null if the patient data is insufficient
 */
export function useRiskScore(patient: Patient | null): RiskResult | null {
  return useMemo(() => {
    if (!patient) return null
    return computeRiskScore(patient)
  }, [patient])
}
