/**
 * sanitiser.ts — Demographic data sanitisation for DigiLocker eKYC responses.
 *
 * This module is the security boundary between the raw DigiLocker API response
 * and the rest of the system. Nothing in the raw response may leave this module
 * without being sanitised.
 *
 * Key responsibilities:
 *   1. Mask the raw 12-digit Aadhaar UID (XXXX-XXXX-NNNN format)
 *   2. Encrypt the raw Aadhaar UID with AES-256-GCM before storage
 *   3. Normalise DOB from DD-MM-YYYY to YYYY-MM-DD
 *   4. Normalise gender codes (M/F/T → Male/Female/Other)
 *   5. Compose a human-readable address from the POA elements
 *   6. Pass through ABHA number when provided by the documents API
 *   7. Validate all required fields before returning
 *
 * Security:
 *   - The raw `uid` field NEVER appears in return values, logs, or error messages
 *   - AES-256-GCM encryption uses a key from the DIGILOCKER_AADHAAR_KEY env var
 *   - In dev/test (key absent), a deterministic base64 encoding is used instead
 *     — this is clearly marked as non-production in the result
 */

import { createCipheriv, randomBytes } from 'crypto'
import type { DigiLockerDemographics, RawAadhaarKyc } from './types'

// ── Aadhaar masking ───────────────────────────────────────────────────────────

/**
 * Returns the masked representation of a 12-digit Aadhaar number.
 * Format: XXXX-XXXX-NNNN  (last 4 digits visible)
 */
export function maskAadhaar(uid: string): string {
  const digits = uid.replace(/\D/g, '')
  if (digits.length !== 12) {
    throw new Error('Invalid Aadhaar UID length — must be exactly 12 digits')
  }
  return `XXXX-XXXX-${digits.slice(-4)}`
}

// ── Aadhaar encryption ────────────────────────────────────────────────────────

/**
 * Encrypts the raw 12-digit Aadhaar UID using AES-256-GCM.
 *
 * Output format: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 *
 * In production: DIGILOCKER_AADHAAR_KEY must be a 32-byte hex string (64 hex chars).
 * In development: falls back to a base64 placeholder clearly tagged as DEV-ONLY.
 *
 * The encrypted value is safe to store in Firestore on the patient record.
 * It can only be decrypted by the server using the same key.
 */
export function encryptAadhaar(uid: string): string {
  const rawKey = process.env.DIGILOCKER_AADHAAR_KEY

  if (!rawKey || rawKey.length < 64) {
    // Development mode — NOT cryptographically secure; for local testing only
    const placeholder = Buffer.from(`DEV:${uid}`).toString('base64')
    return `dev:${placeholder}`
  }

  const key = Buffer.from(rawKey.slice(0, 64), 'hex') // 32 bytes
  const iv = randomBytes(12)                           // GCM standard: 12-byte IV
  const cipher = createCipheriv('aes-256-gcm', key, iv)

  const ciphertext = Buffer.concat([
    cipher.update(uid, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [iv.toString('hex'), authTag.toString('hex'), ciphertext.toString('hex')].join(':')
}

// ── Date normalisation ────────────────────────────────────────────────────────

/**
 * Normalises DigiLocker's DOB format to YYYY-MM-DD.
 * DigiLocker may return DD-MM-YYYY or DD/MM/YYYY.
 */
export function normaliseDob(rawDob: string): string {
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDob)) return rawDob

  // DD-MM-YYYY or DD/MM/YYYY
  const parts = rawDob.split(/[-/]/)
  if (parts.length === 3 && parts[0].length <= 2) {
    const [dd, mm, yyyy] = parts
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  }

  throw new Error(`Unrecognised DOB format: ${rawDob}`)
}

// ── Gender normalisation ──────────────────────────────────────────────────────

export function normaliseGender(code: string): 'Male' | 'Female' | 'Other' {
  switch (code.toUpperCase()) {
    case 'M': return 'Male'
    case 'F': return 'Female'
    default:  return 'Other'   // T (transgender) and unknown values
  }
}

// ── Address composition ───────────────────────────────────────────────────────

/**
 * Composes a human-readable address string from the DigiLocker POA fields.
 * Omits empty or undefined values; joins non-empty parts with ', '.
 */
export function composeAddress(poa: RawAadhaarKyc['poa']): string {
  return [
    poa.co    ? `C/O ${poa.co}` : '',
    poa.house,
    poa.street,
    poa.lm,
    poa.loc,
    poa.vtc,
    poa.dist,
    poa.state,
    poa.country !== 'India' ? poa.country : '',
    poa.pc    ? `- ${poa.pc}` : '',
  ]
    .filter(Boolean)
    .join(', ')
}

// ── ABHA validation helper ───────────────────────────────────────────────────

/**
 * Returns the ABHA number as a clean 14-digit string if valid, or undefined.
 * Accepts both the raw "XXXXXXXXXXXXXX" form and the "XX-XXXX-XXXX-XXXX"
 * hyphenated form returned by the NHA / DigiLocker documents API.
 *
 * Silently returns undefined for malformed input rather than throwing —
 * a missing ABHA must not block the Aadhaar verification flow.
 */
export function normaliseAbhaNumber(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const digits = raw.replace(/-/g, '').trim()
  // ABHA numbers are exactly 14 digits
  if (!/^\d{14}$/.test(digits)) return undefined
  return digits
}

// ── Main sanitiser ────────────────────────────────────────────────────────────

/**
 * Transforms a raw DigiLocker eKYC response into a sanitised, client-safe
 * DigiLockerDemographics payload.
 *
 * @param raw       The raw Aadhaar eKYC data parsed from the DigiLocker XML.
 * @param abhaNumber Optional ABHA number extracted from the DigiLocker issued-
 *                   documents API. Silently omitted if malformed or absent.
 *
 * Throws a descriptive error (without leaking PII) if required fields are missing.
 */
export function sanitiseKycData(
  raw: RawAadhaarKyc,
  abhaNumber?: string,
): DigiLockerDemographics {
  // ── Required field validation ─────────────────────────────────────────────
  if (!raw.uid || raw.uid.replace(/\D/g, '').length !== 12) {
    throw new Error('DigiLocker KYC response missing valid Aadhaar UID')
  }
  if (!raw.poi.name?.trim()) {
    throw new Error('DigiLocker KYC response missing name')
  }
  if (!raw.poi.dob?.trim()) {
    throw new Error('DigiLocker KYC response missing DOB')
  }

  const maskedAadhaar    = maskAadhaar(raw.uid)
  const encryptedAadhaar = encryptAadhaar(raw.uid)

  let normalisedDob: string
  try {
    normalisedDob = normaliseDob(raw.poi.dob)
  } catch {
    throw new Error('DigiLocker KYC response contains an unrecognised DOB format')
  }

  // Validate and normalise the ABHA number — drop silently if malformed
  const normalisedAbha = normaliseAbhaNumber(abhaNumber)

  return {
    fullName:         raw.poi.name.trim(),
    dob:              normalisedDob,
    gender:           normaliseGender(raw.poi.gender ?? 'U'),
    address:          composeAddress(raw.poa),
    phoneNumber:      raw.poi.phone ? `+91${raw.poi.phone.replace(/\D/g, '').slice(-10)}` : undefined,
    maskedAadhaar,
    encryptedAadhaar,
    // Only set when the documents API returned a valid ABHA number
    ...(normalisedAbha ? { abhaNumber: normalisedAbha } : {}),
    verifiedAt:       new Date().toISOString(),
  }
}
