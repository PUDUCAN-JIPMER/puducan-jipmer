/**
 * verification.types.ts — Canonical re-export hub for all verification types.
 *
 * Import from here in new code. Existing imports from lib/verification/types
 * continue to work (that file is the source of truth).
 *
 * Additional hook-layer types that do not belong in lib/ are defined here.
 */

export type {
  VerificationSource,
  VerificationStep,
  RegistrationMethod,
  VerifiedPatientData,
  DuplicatePatientSummary,
  DuplicateCheckResult,
  OTPState,
  VerificationMetadata,
  AuditLogEntry,
  VerificationError,
  ConsentRecord,
  DuplicateOverride,
  VerificationSession,
  VerificationState,
} from '@/lib/verification/types'

// ── Hook return types ─────────────────────────────────────────────────────────

import type {
  VerificationStep,
  RegistrationMethod,
  VerifiedPatientData,
  DuplicateCheckResult,
  DuplicatePatientSummary,
} from '@/lib/verification/types'

export interface UsePatientVerificationReturn {
  step: VerificationStep
  phone: string
  otp: string
  /** In-memory OTP code — displayed inline in mock mode ONLY. Never stored. */
  generatedOtp: string
  /** Seconds remaining until OTP expires (starts at OTP_TTL_SECONDS = 90) */
  otpSecondsLeft: number
  /** True once countdown reaches 0 — enables Resend OTP button */
  otpExpired: boolean
  /** Written reason when overriding a high-confidence duplicate block. */
  overrideReason: string
  error: string | null
  isLoading: boolean
  verifiedData: VerifiedPatientData | null
  duplicate: DuplicateCheckResult | null
  /** Human-readable progress message during DigiLocker OAuth (e.g. "Waiting for approval…") */
  statusMessage: string
  /** True when DigiLocker is configured for production — hides OTP steps in the UI */
  isDigiLockerProduction: boolean
  setPhone: (v: string) => void
  setOtp: (v: string) => void
  setOverrideReason: (v: string) => void
  /** Step 0 action: choose 'digilocker' to proceed, 'manual' handled by modal callback. */
  selectMethod: (method: 'digilocker' | 'manual') => void
  proceedToPhone: () => void
  sendOtp: () => Promise<void>
  resendOtp: () => Promise<void>
  verifyOtp: () => Promise<void>
  /** Step 5 action: resolve duplicate step → proceed to preview (logs override if needed). */
  confirmDuplicate: () => Promise<void>
  resetFlow: () => void
}

export interface UseDuplicateDetectionReturn {
  matches: DuplicatePatientSummary[]
  isChecking: boolean
  /** First match with confidenceScore >= DUPLICATE_CONFIDENCE_HIGH */
  highConfidenceMatch: DuplicatePatientSummary | null
  /** Matches with score >= DUPLICATE_CONFIDENCE_SOFT but < HIGH */
  softMatches: DuplicatePatientSummary[]
  check: (data: VerifiedPatientData) => Promise<DuplicateCheckResult>
  reset: () => void
}

export interface UseConsentTrackingReturn {
  consentGranted: boolean
  consentVersion: string
  setConsent: (granted: boolean) => void
  reset: () => void
}

export interface MethodSelectorProps {
  onSelectDigiLocker: () => void
  onSelectManual: () => void
  className?: string
}

export interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  hasError?: boolean
  autoFocus?: boolean
  className?: string
}

export interface OTPCountdownTimerProps {
  secondsLeft: number
  className?: string
}
