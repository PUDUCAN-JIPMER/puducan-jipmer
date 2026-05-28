import type { VerifiedPatientData } from './types'

const VALID_SOURCES = ['digilocker', 'abha', 'mock'] as const

// ── Individual validators (reusable in forms and the service layer) ──────────

/**
 * Returns true when `dob` is a well-formed YYYY-MM-DD calendar date that:
 *  - is not in the future
 *  - implies an age of 0–130 years
 */
export function validateDob(dob: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false
  const parsed = new Date(dob)
  if (isNaN(parsed.getTime())) return false
  const now = new Date()
  if (parsed > now) return false
  const ageYears = (now.getTime() - parsed.getTime()) / (365.25 * 24 * 60 * 60 * 1_000)
  return ageYears <= 130
}

/**
 * Returns true for exactly 12 decimal digits (raw Aadhaar format) OR
 * a valid AES-256-GCM encrypted Aadhaar token / DEV placeholder.
 *
 * This ensures that both unencrypted (mock/sandbox) and securely
 * encrypted (production DigiLocker) Aadhaar fields pass validation.
 */
export function validateAadhaarNumber(aadhaar: string): boolean {
  // 1. Raw 12-digit Aadhaar number
  if (/^\d{12}$/.test(aadhaar)) return true

  // 2. DEV-mode encrypted placeholder (base64)
  if (/^dev:[A-Za-z0-9+/=]+$/.test(aadhaar)) return true

  // 3. AES-256-GCM encrypted format (iv_hex:authTag_hex:ciphertext_hex)
  const parts = aadhaar.split(':')
  if (parts.length === 3) {
    const [iv, authTag, ciphertext] = parts
    return (
      /^[0-9a-f]{24}$/.test(iv) &&
      /^[0-9a-f]{32}$/.test(authTag) &&
      /^[0-9a-f]+$/.test(ciphertext)
    )
  }

  return false
}

/**
 * Returns true for a valid ABHA (Ayushman Bharat Health Account) number.
 * Accepts both the raw 14-digit form and the XX-XXXX-XXXX-XXXX hyphenated
 * form returned by the NHA API. Hyphens are stripped before the digit check.
 */
export function validateAbhaNumber(abha: string): boolean {
  return /^\d{14}$/.test(abha.replace(/-/g, ''))
}

/**
 * Returns true for a 10-digit Indian mobile number starting with 6–9.
 * Strips all non-digit characters before checking.
 */
export function validatePhoneNumber(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))
}

// ── Provider response guard ────────────────────────────────────────────────

/**
 * Runtime type-guard that validates the raw value returned by any
 * IdentityProvider before it is trusted or mapped to patient fields.
 *
 * Rejects:
 *  - null / non-object values
 *  - missing or empty required string fields
 *  - unknown verificationSource values
 *  - malformed DOB strings
 */
export function validateProviderResponse(data: unknown): data is VerifiedPatientData {
  if (!data || typeof data !== 'object') return false

  const d = data as Record<string, unknown>

  if (
    typeof d.fullName !== 'string' ||
    d.fullName.trim().length === 0
  ) return false

  if (
    typeof d.dob !== 'string' ||
    !validateDob(d.dob)
  ) return false

  if (
    typeof d.gender !== 'string' ||
    d.gender.trim().length === 0
  ) return false

  if (
    typeof d.verificationSource !== 'string' ||
    !(VALID_SOURCES as readonly string[]).includes(d.verificationSource)
  ) return false

  if (
    typeof d.verifiedAt !== 'string' ||
    d.verifiedAt.length === 0
  ) return false

  if (d.aadhaarNumber !== undefined && !validateAadhaarNumber(String(d.aadhaarNumber))) {
    return false
  }

  if (d.abhaNumber !== undefined && !validateAbhaNumber(String(d.abhaNumber))) {
    return false
  }

  if (d.phoneNumber !== undefined && !validatePhoneNumber(String(d.phoneNumber))) {
    return false
  }

  return true
}
