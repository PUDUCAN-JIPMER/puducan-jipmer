/**
 * constants.ts — All magic numbers and configuration for the verification system.
 *
 * Centralising these here means a single change propagates everywhere.
 * Do not inline these values in components or hooks.
 */

// ── OTP ─────────────────────────────────────────────────────────────────────

export const OTP_LENGTH = 6 as const
export const OTP_TTL_SECONDS = 90 as const
export const OTP_TTL_MS = OTP_TTL_SECONDS * 1_000
export const OTP_MAX_ATTEMPTS = 5 as const
/** Lockout duration after exceeding max OTP attempts */
export const OTP_LOCKOUT_SECONDS = 600 as const

// ── Verification ─────────────────────────────────────────────────────────────

/** Hard timeout for the provider verify() call */
export const VERIFICATION_TIMEOUT_MS = 15_000 as const

// ── Duplicate detection thresholds ────────────────────────────────────────────

/** Confidence >= this → hard block; override requires written reason */
export const DUPLICATE_CONFIDENCE_HIGH = 0.95 as const
/** Confidence >= this (and < HIGH) → soft collapsible warning */
export const DUPLICATE_CONFIDENCE_SOFT = 0.70 as const
/** Levenshtein similarity threshold for name fuzzy matching */
export const FUZZY_NAME_THRESHOLD = 0.85 as const

// ── Consent ───────────────────────────────────────────────────────────────────

/** Bump this when consent text changes — stored in audit logs */
export const CONSENT_VERSION = '1.0' as const

// ── Firestore collections ─────────────────────────────────────────────────────

export const AUDIT_COLLECTION = 'verification_logs' as const
export const CONSENT_COLLECTION = 'consent_logs' as const

// ── Mock provider test personas ────────────────────────────────────────────────

export const MOCK_PHONE_PERSONAS: Record<
  string,
  {
    name: string
    aadhaarNumber: string
    maskedId: string
    dob: string
    gender: 'Male' | 'Female' | 'Other'
    address: string
    /** 14-digit ABHA number — present only when the persona has a linked ABHA account */
    abhaNumber?: string
  }
> = {
  '9876543210': {
    name: 'Demo Patient (Female)',
    aadhaarNumber: '234567891234',
    maskedId: 'XXXX-XXXX-1234',
    dob: '1990-03-15',
    gender: 'Female',
    address: 'Anna Nagar, Chennai, Tamil Nadu - 600040',
    abhaNumber: '91-1234-5678-9012',  // linked ABHA account
  },
  '9123456789': {
    name: 'Demo Patient (Male)',
    aadhaarNumber: '345678901234',
    maskedId: 'XXXX-XXXX-5678',
    dob: '1975-08-22',
    gender: 'Male',
    address: 'Lawspet, Puducherry - 605008',
  },
  '9000000001': {
    name: 'Duplicate Test Patient',
    aadhaarNumber: '123456789012',
    maskedId: 'XXXX-XXXX-9012',
    dob: '1970-05-15',
    gender: 'Male',
    address: '123 MG Road, Puducherry - 605001',
  },
}
