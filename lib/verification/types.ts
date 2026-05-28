/**
 * types.ts — Shared types for the patient identity-verification feature.
 *
 * Security constraints (enforced throughout):
 *   - Full Aadhaar numbers MUST NOT be stored or transmitted.
 *   - OTP values MUST NOT be stored or logged.
 *   - Only masked identifiers, consent status, and metadata are persisted.
 */

// ── Verification source ─────────────────────────────────────────────────────

export type VerificationSource = 'digilocker' | 'abha' | 'mock'

// ── Verified demographic payload (returned by a provider) ──────────────────

export interface VerifiedPatientData {
  fullName: string
  dob: string
  gender: 'Male' | 'Female' | 'Other'
  address?: string
  phoneNumber?: string
  /** Full 12-digit Aadhaar number returned by the identity provider.
   *  Written to the patient record so staff do not have to re-enter it.
   *  MUST NOT appear in audit logs — use maskedId for logging only. */
  aadhaarNumber?: string
  /** 14-digit ABHA (Ayushman Bharat Health Account) number, if the identity
   *  provider was able to resolve it from the linked Aadhaar.  Optional —
   *  not all Aadhaar holders have an ABHA account yet.
   *  Format: XX-XXXX-XXXX-XXXX (hyphens stripped before storage). */
  abhaNumber?: string
  /** Masked identifier e.g. "XXXX-XXXX-1234". Used in audit logs only. */
  maskedId?: string
  verificationSource: VerificationSource
  verifiedAt: string
}

// ── Modal step state machine ───────────────────────────────────────────────

export type VerificationStep =
  | 'method'    // Step 0 – select DigiLocker or manual entry
  | 'consent'   // Step 1 – explicit patient consent checkbox
  | 'phone'     // Step 2 – enter patient's mobile number
  | 'otp'       // Step 3 – enter simulated OTP
  | 'loading'   // Step 4 – provider call in flight
  | 'duplicate' // Step 5 – one or more duplicates require resolution
  | 'preview'   // Step 6 – review + confirm autofill
  | 'success'   // Step 7 – autofill confirmed, flow complete
  | 'error'     // Terminal – unrecoverable provider / network error

// ── Registration method ────────────────────────────────────────────────────

export type RegistrationMethod = 'digilocker' | 'manual'

// ── Duplicate detection result ─────────────────────────────────────────────

export interface DuplicatePatientSummary {
  id: string
  name: string
  dob?: string
  hospitalRegistrationDate?: string
  assignedHospitalName?: string
  /** Which field triggered the match */
  matchedBy: 'maskedId' | 'phone' | 'name+dob'
  /** Normalised confidence score 0.0–1.0 */
  confidenceScore: number
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  patient?: DuplicatePatientSummary
  /** All matches sorted by confidenceScore descending */
  allMatches?: DuplicatePatientSummary[]
}

// ── In-memory OTP state (never persisted) ─────────────────────────────────

/** Held only in hook closure — never written to Firestore, localStorage, or logs. */
export interface OTPState {
  code: string
  expiresAt: number       // Date.now() + TTL_MS
  attempts: number
}

// ── Verification metadata stored on the patient record ────────────────────

export interface VerificationMetadata {
  verified: boolean
  source: VerificationSource
  maskedId?: string
  verifiedAt?: string
  /** Names of form fields the healthcare worker changed after autofill. */
  editedFields?: string[]
}

// ── Structured verification error ────────────────────────────────────────

export interface VerificationError {
  code:
    | 'provider_failure'
    | 'validation_error'
    | 'otp_expired'
    | 'otp_max_attempts'
    | 'timeout'
    | 'unknown'
  message: string
  /** Whether the user can retry from the OTP step without resetting. */
  retryable: boolean
}

// ── Explicit consent record ────────────────────────────────────────────────

export interface ConsentRecord {
  granted: boolean
  version: string
  grantedAt: string
  grantedBy: string | null
}

// ── Duplicate override (logged when high-confidence match is bypassed) ─────

export interface DuplicateOverride {
  reason: string
  overriddenBy: string | null
  overrideAt: string
  confidenceScore: number
  matchedBy: 'maskedId' | 'phone' | 'name+dob'
}

// ── Full session snapshot (used for serialisation / debugging) ────────────

export interface VerificationSession {
  sessionId: string
  startedAt: string
  step: VerificationStep
  consent: ConsentRecord | null
  verifiedData: VerifiedPatientData | null
  duplicate: DuplicateCheckResult | null
  override: DuplicateOverride | null
  error: VerificationError | null
}

// ── Discriminated union for verification state ────────────────────────────

export type VerificationState =
  | { status: 'idle' }
  | { status: 'in_progress'; step: VerificationStep }
  | { status: 'completed'; data: VerifiedPatientData }
  | { status: 'error'; error: VerificationError }

// ── Audit log entry (written to Firestore `verification_logs`) ────────────

export interface AuditLogEntry {
  verifierId: string | null
  verifierRole: string | null
  /** Firestore server timestamp (use serverTimestamp() when writing). */
  timestamp: unknown
  provider: VerificationSource
  success: boolean
  /** Masked identifier only – full ID is NEVER logged. */
  maskedId: string | null
  /** Populated after the patient record is saved; null at verification time. */
  patientId: string | null
  error: string | null
}
