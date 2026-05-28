/**
 * sessionStore.ts — Server-side DigiLocker OAuth session management.
 *
 * Each OAuth flow creates an ephemeral Firestore document that holds:
 *   - The PKCE code_verifier (never sent to the client)
 *   - The OAuth state parameter (CSRF protection)
 *   - The session status (pending → success | error)
 *   - The sanitised demographic payload on success
 *
 * Security model:
 *   - Sessions expire after DIGILOCKER_SESSION_TTL_SECONDS (300s = 5 min)
 *   - Expired sessions are rejected and deleted
 *   - The code_verifier is deleted from the store immediately after token exchange
 *   - Raw tokens (access_token, refresh_token) are NEVER stored
 *   - Full Aadhaar numbers are masked before writing to the success payload
 *
 * Collection: `digilocker_sessions` (server-side Admin SDK only)
 */

import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'
import type { DigiLockerDemographics } from './types'

const COLLECTION = 'digilocker_sessions'

/** Session TTL in seconds (5 minutes — well within DigiLocker's auth window) */
export const DIGILOCKER_SESSION_TTL_SECONDS = 300

// ── Document shape ─────────────────────────────────────────────────────────────

export type SessionStatus = 'pending' | 'success' | 'error'

export interface SessionDocument {
  status: SessionStatus
  /** PKCE code_verifier — present only while status === 'pending' */
  codeVerifier?: string
  /** OAuth state token — used to validate the callback request */
  state: string
  /** ISO timestamp for TTL enforcement */
  expiresAt: unknown // Firestore Timestamp
  createdAt: unknown // FieldValue.serverTimestamp()
  /** Sanitised demographic payload — present only when status === 'success' */
  demographics?: DigiLockerDemographics
  /** Error message — present only when status === 'error' */
  error?: string
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Creates a new pending session document.
 * Returns the Firestore document ID (= the session ID passed to the client).
 */
export async function createSession(params: {
  codeVerifier: string
  state: string
}): Promise<string> {
  const db = getAdminDb()
  const now = Date.now()

  const docRef = await db.collection(COLLECTION).add({
    status: 'pending' satisfies SessionStatus,
    codeVerifier: params.codeVerifier,
    state: params.state,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(now + DIGILOCKER_SESSION_TTL_SECONDS * 1_000),
  } satisfies Omit<SessionDocument, 'expiresAt' | 'createdAt'> & {
    expiresAt: ReturnType<typeof Timestamp.fromMillis>
    createdAt: ReturnType<typeof FieldValue.serverTimestamp>
  })

  return docRef.id
}

/**
 * Retrieves a session document and validates it hasn't expired.
 * Returns null if the session doesn't exist or has expired.
 */
export async function getSession(sessionId: string): Promise<SessionDocument | null> {
  const db = getAdminDb()
  const snap = await db.collection(COLLECTION).doc(sessionId).get()

  if (!snap.exists) return null

  const data = snap.data() as SessionDocument
  const expiresAt = (data.expiresAt as Timestamp).toMillis()

  if (Date.now() > expiresAt) {
    // Lazily clean up expired sessions
    void snap.ref.delete()
    return null
  }

  return data
}

/**
 * Marks a session as successful, stores the sanitised demographics,
 * and DELETES the code_verifier immediately (single-use guarantee).
 */
export async function markSessionSuccess(
  sessionId: string,
  demographics: DigiLockerDemographics,
): Promise<void> {
  const db = getAdminDb()
  await db.collection(COLLECTION).doc(sessionId).update({
    status: 'success' satisfies SessionStatus,
    demographics,
    // Delete the verifier — it is single-use and must not persist
    codeVerifier: FieldValue.delete(),
  })
}

/**
 * Marks a session as failed with an error message.
 * Clears the code_verifier for safety.
 */
export async function markSessionError(sessionId: string, error: string): Promise<void> {
  const db = getAdminDb()
  await db.collection(COLLECTION).doc(sessionId).update({
    status: 'error' satisfies SessionStatus,
    error,
    codeVerifier: FieldValue.delete(),
  })
}

/**
 * Deletes a session document.
 * Call after the frontend has successfully consumed the demographics payload.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const db = getAdminDb()
  await db.collection(COLLECTION).doc(sessionId).delete()
}
