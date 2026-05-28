'use client'

import { useCallback, useState } from 'react'
import { CONSENT_VERSION } from '@/lib/verification/constants'
import type { UseConsentTrackingReturn } from '@/types/verification/verification.types'

/**
 * useConsentTracking — manages the explicit patient consent gate.
 *
 * Responsibilities:
 *   - Tracks whether the healthcare worker has confirmed patient consent
 *   - Exposes the current consent text version for audit log embedding
 *   - Provides a reset function for modal close / start-over flows
 *
 * The consent state is intentionally kept separate from the main verification
 * hook so it can be injected into ConsentCheckbox without coupling that
 * component to the full verification state machine.
 */
export function useConsentTracking(): UseConsentTrackingReturn {
  const [consentGranted, setConsentGranted] = useState(false)

  const setConsent = useCallback((granted: boolean) => {
    setConsentGranted(granted)
  }, [])

  const reset = useCallback(() => {
    setConsentGranted(false)
  }, [])

  return {
    consentGranted,
    consentVersion: CONSENT_VERSION,
    setConsent,
    reset,
  }
}
