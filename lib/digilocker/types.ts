/**
 * types.ts — Shared types for the DigiLocker OAuth integration layer.
 *
 * These types are server-side only. They model the raw DigiLocker API
 * response shapes and the sanitised demographic payload that is safe to
 * store and pass to the frontend.
 *
 * Security constraints:
 *   - Raw Aadhaar numbers MUST be masked before leaving this layer.
 *   - OAuth access_token and refresh_token MUST NEVER be stored or logged.
 *   - Only DigiLockerDemographics (sanitised) may be passed to the client.
 */

// ── DigiLocker OAuth token response ──────────────────────────────────────────

/** Raw token response from DigiLocker's /token endpoint. */
export interface DigiLockerTokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token?: string
  /** DigiLocker-specific: the DigiLocker ID of the authenticated user */
  digilocker_id?: string
  /** Name as stored in DigiLocker (may differ from Aadhaar name) */
  name?: string
}

// ── Aadhaar eKYC XML shape (simplified) ─────────────────────────────────────

/** Attributes from the <UidData> → <Poi> element (Personally Identifiable Object) */
export interface AadhaarPoi {
  name: string
  dob: string          // DD-MM-YYYY or YYYY-MM-DD depending on API version
  gender: 'M' | 'F' | 'T'
  phone?: string
  email?: string
}

/** Attributes from the <UidData> → <Poa> element (Proof of Address) */
export interface AadhaarPoa {
  co?: string   // care of
  house?: string
  street?: string
  lm?: string   // landmark
  loc?: string  // location
  vtc?: string  // village/town/city
  dist?: string // district
  state?: string
  country?: string
  pc?: string   // postal code
}

/** Parsed DigiLocker eKYC document (before sanitisation) */
export interface RawAadhaarKyc {
  uid: string          // 12-digit Aadhaar number — MUST be masked before storage
  poi: AadhaarPoi
  poa: AadhaarPoa
}

// ── DigiLocker issued document listing ───────────────────────────────────────

export interface DigiLockerDocument {
  name: string
  type: string
  size: string
  date: string
  parent: string
  mime: string
  uri: string
  issuer: string
  issuerid: string
  issuerName?: string
  doctype?: string
  description?: string
}

export interface DigiLockerDocumentsResponse {
  items: DigiLockerDocument[]
}

// ── Sanitised demographic payload ─────────────────────────────────────────────

/**
 * The only data structure that is safe to pass from the server to the client.
 *
 * Security guarantees enforced by sanitiseKycData():
 *   - `maskedAadhaar` contains only the last 4 digits (XXXX-XXXX-NNNN format)
 *   - The raw 12-digit UID is NEVER included
 *   - DOB is normalised to YYYY-MM-DD
 *   - Gender is normalised to Male | Female | Other
 */
export interface DigiLockerDemographics {
  fullName: string
  dob: string                  // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other'
  address: string              // Human-readable composite address
  phoneNumber?: string         // E.164 format, if provided
  /** XXXX-XXXX-NNNN — last 4 digits only; safe for display and audit logs */
  maskedAadhaar: string
  /** Full 12-digit Aadhaar — stored encrypted in the patient record, NEVER in logs */
  encryptedAadhaar: string     // AES-256-GCM encrypted with DIGILOCKER_AADHAAR_KEY
  /** 14-digit ABHA number if linked, undefined otherwise */
  abhaNumber?: string
  /** ISO timestamp of the DigiLocker verification */
  verifiedAt: string
}

// ── API error shape ────────────────────────────────────────────────────────────

export interface DigiLockerApiError {
  error: string
  error_description?: string
}

// ── OAuth initiation response (safe to send to client) ───────────────────────

export interface DigiLockerInitResponse {
  /** The Firestore session ID — opaque to the client */
  sessionId: string
  /** The full DigiLocker authorization URL to open in the popup/redirect */
  authorizationUrl: string
}

// ── Session status poll response (safe to send to client) ────────────────────

export interface DigiLockerStatusResponse {
  status: 'pending' | 'success' | 'error'
  /** Present only when status === 'success' */
  demographics?: DigiLockerDemographics
  /** Present only when status === 'error' */
  error?: string
}
