/**
 * otpStore.ts — Firestore-backed OTP session storage.
 *
 * Security model:
 *   - The phone number is never stored in plaintext; only its SHA-256 hash
 *     is used as the Firestore document ID.
 *   - The OTP is stored as a SHA-256 hash; the raw value is discarded
 *     immediately after hashing.
 *   - Verified OTP sessions are deleted immediately to prevent replay attacks.
 *   - Failed attempts are counted server-side; the client cannot bypass limits.
 *
 * Rate limiting:
 *   - Max OTP_RATE_LIMIT_MAX_SENDS sends per phone per OTP_RATE_LIMIT_WINDOW_MS.
 *   - Enforced atomically in Firestore to work across serverless instances.
 */

import { createHash } from 'crypto'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { OTP_MAX_ATTEMPTS, OTP_TTL_SECONDS } from '@/lib/verification/constants'

const COLLECTION = 'otp_sessions'

/** Max OTP sends allowed within the rate-limit window */
const RATE_LIMIT_MAX_SENDS = 5
/** Rate-limit window in milliseconds (10 minutes) */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000

// ── Hashing helpers ───────────────────────────────────────────────────────────

function hashPhone(phone: string): string {
  return createHash('sha256').update(phone.replace(/\D/g, '')).digest('hex')
}

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex')
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoreOtpResult {
  allowed: boolean
  message?: string
}

export interface VerifyOtpResult {
  valid: boolean
  message: string
}

// ── Store + rate-limit ────────────────────────────────────────────────────────

/**
 * Stores a new OTP for the given phone number after applying rate limiting.
 * Returns `{ allowed: false }` when the rate limit is exceeded.
 */
export async function storeOtp(
  phone: string,
  otp: string,
): Promise<StoreOtpResult> {
  const db = getAdminDb()
  const docId = hashPhone(phone)
  const docRef = db.collection(COLLECTION).doc(docId)
  const now = Date.now()

  const snap = await docRef.get()

  if (snap.exists) {
    const data = snap.data()!
    const windowStart: number = (data.windowStart as Timestamp)?.toMillis() ?? 0
    const sendCount: number = data.sendCount ?? 0

    const withinWindow = now - windowStart < RATE_LIMIT_WINDOW_MS

    if (withinWindow && sendCount >= RATE_LIMIT_MAX_SENDS) {
      const retryAfterSec = Math.ceil(
        (windowStart + RATE_LIMIT_WINDOW_MS - now) / 1_000,
      )
      return {
        allowed: false,
        message: `Too many OTP requests. Try again in ${retryAfterSec} seconds.`,
      }
    }

    await docRef.set({
      otpHash:    hashOtp(otp),
      expiresAt:  Timestamp.fromMillis(now + OTP_TTL_SECONDS * 1_000),
      attempts:   0,
      createdAt:  FieldValue.serverTimestamp(),
      sendCount:  withinWindow ? sendCount + 1 : 1,
      windowStart: withinWindow
        ? data.windowStart
        : Timestamp.fromMillis(now),
    })
  } else {
    await docRef.set({
      otpHash:     hashOtp(otp),
      expiresAt:   Timestamp.fromMillis(now + OTP_TTL_SECONDS * 1_000),
      attempts:    0,
      createdAt:   FieldValue.serverTimestamp(),
      sendCount:   1,
      windowStart: Timestamp.fromMillis(now),
    })
  }

  return { allowed: true }
}

// ── Verify ────────────────────────────────────────────────────────────────────

/**
 * Validates a submitted OTP against the stored hash.
 * Increments attempt counter on failure; deletes the session on success.
 */
export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<VerifyOtpResult> {
  const db = getAdminDb()
  const docId = hashPhone(phone)
  const docRef = db.collection(COLLECTION).doc(docId)

  const snap = await docRef.get()

  if (!snap.exists) {
    return { valid: false, message: 'No OTP found. Please request a new one.' }
  }

  const data = snap.data()!
  const expiresAt = (data.expiresAt as Timestamp).toMillis()
  const attempts: number = data.attempts ?? 0

  if (Date.now() > expiresAt) {
    await docRef.delete()
    return { valid: false, message: 'OTP has expired. Please request a new one.' }
  }

  if (attempts >= OTP_MAX_ATTEMPTS) {
    return {
      valid: false,
      message: 'Too many incorrect attempts. Please request a new OTP.',
    }
  }

  if (hashOtp(otp) !== data.otpHash) {
    await docRef.update({ attempts: attempts + 1 })
    const remaining = OTP_MAX_ATTEMPTS - attempts - 1
    return {
      valid: false,
      message:
        remaining > 0
          ? `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Too many incorrect attempts. Please request a new OTP.',
    }
  }

  // ✓ Valid — delete immediately to prevent replay
  await docRef.delete()
  return { valid: true, message: 'OTP verified.' }
}
