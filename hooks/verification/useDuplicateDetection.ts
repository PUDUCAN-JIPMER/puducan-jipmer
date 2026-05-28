'use client'

import { useCallback, useState } from 'react'
import { detectDuplicates } from '@/lib/duplicate/detector'
import { DUPLICATE_CONFIDENCE_HIGH, DUPLICATE_CONFIDENCE_SOFT } from '@/lib/verification/constants'
import type {
  DuplicateCheckResult,
  DuplicatePatientSummary,
  VerifiedPatientData,
} from '@/lib/verification/types'
import type { UseDuplicateDetectionReturn } from '@/types/verification/verification.types'

/**
 * useDuplicateDetection — React wrapper around the three-tier duplicate detector.
 *
 * Responsibilities:
 *   - Runs Aadhaar → Phone → Name+DOB detection in Firestore
 *   - Classifies matches by confidence (high vs soft)
 *   - Exposes loading state so the UI can show a spinner
 *
 * Inputs:  VerifiedPatientData (from the identity provider)
 * Outputs: classified match lists + async check() trigger
 */
export function useDuplicateDetection(): UseDuplicateDetectionReturn {
  const [matches, setMatches] = useState<DuplicatePatientSummary[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const check = useCallback(
    async (data: VerifiedPatientData): Promise<DuplicateCheckResult> => {
      setIsChecking(true)
      try {
        const result = await detectDuplicates(data)
        setMatches(result.allMatches ?? [])
        return result
      } finally {
        setIsChecking(false)
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setMatches([])
  }, [])

  const highConfidenceMatch =
    matches.find((m) => m.confidenceScore >= DUPLICATE_CONFIDENCE_HIGH) ?? null

  const softMatches = matches.filter(
    (m) =>
      m.confidenceScore >= DUPLICATE_CONFIDENCE_SOFT &&
      m.confidenceScore < DUPLICATE_CONFIDENCE_HIGH,
  )

  return { matches, isChecking, highConfidenceMatch, softMatches, check, reset }
}
