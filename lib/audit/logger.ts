/**
 * logger.ts — Structured audit log writer for the verification system.
 *
 * Security constraints enforced here:
 *   - Full Aadhaar numbers are NEVER written to logs
 *   - OTP codes are NEVER written to logs
 *   - Only maskedId (e.g. "XXXX-XXXX-1234") is accepted
 *
 * All writes are fire-and-forget with silent error catching.
 * Audit log failures MUST NEVER interrupt the patient registration flow.
 */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import type { VerificationSource } from '@/lib/verification/types'
import { AUDIT_COLLECTION } from '@/lib/verification/constants'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuditLogParams {
  verifierId: string | null
  verifierRole: string | null
  provider: VerificationSource
  success: boolean
  /** Masked identifier only — NEVER the full 12-digit Aadhaar */
  maskedId?: string | null
  /** Populated after the patient record is saved; null at verification time */
  patientId?: string | null
  error?: string | null
  sessionId?: string
}

// ── Core writer ───────────────────────────────────────────────────────────────

/**
 * Writes a single audit entry to the `verification_logs` Firestore collection.
 *
 * Non-blocking: errors are caught and surfaced to the console only.
 * The caller should not await this on any critical path.
 */
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await addDoc(collection(db, AUDIT_COLLECTION), {
      verifierId:   params.verifierId,
      verifierRole: params.verifierRole,
      timestamp:    serverTimestamp(),
      provider:     params.provider,
      success:      params.success,
      maskedId:     params.maskedId   ?? null,
      patientId:    params.patientId  ?? null,
      error:        params.error      ?? null,
      sessionId:    params.sessionId  ?? null,
    })
  } catch (err) {
    console.error('[AuditLogger] Write failed (non-blocking):', err)
  }
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

/** Log a successful verification event. */
export function logVerificationSuccess(
  params: Omit<AuditLogParams, 'success'>,
): Promise<void> {
  return writeAuditLog({ ...params, success: true, error: null })
}

/** Log a failed verification event. */
export function logVerificationFailure(
  params: Omit<AuditLogParams, 'success'> & { error: string },
): Promise<void> {
  return writeAuditLog({ ...params, success: false })
}

// ── Duplicate-override logging ────────────────────────────────────────────

export interface DuplicateOverrideParams {
  verifierId: string | null
  verifierRole: string | null
  /** Masked identifier of the newly-verified patient. */
  maskedId: string | null
  /** Confidence score of the match that was overridden. */
  confidenceScore: number
  /** Which field triggered the match. */
  matchedBy: 'maskedId' | 'phone' | 'name+dob'
  /** Written reason provided by the healthcare worker (min 20 chars). */
  overrideReason: string
}

/**
 * Logs a duplicate-override event.  Called when a high-confidence (≥ 0.95)
 * duplicate match is bypassed after the user provides a written reason.
 *
 * Non-blocking: failures are caught and console-only, same as writeAuditLog.
 */
export async function logDuplicateOverride(
  params: DuplicateOverrideParams,
): Promise<void> {
  try {
    await addDoc(collection(db, AUDIT_COLLECTION), {
      type:             'duplicate_override',
      verifierId:       params.verifierId,
      verifierRole:     params.verifierRole,
      maskedId:         params.maskedId,
      confidenceScore:  params.confidenceScore,
      matchedBy:        params.matchedBy,
      overrideReason:   params.overrideReason,
      timestamp:        serverTimestamp(),
    })
  } catch (err) {
    console.error('[AuditLogger] Duplicate override log failed (non-blocking):', err)
  }
}

/** Update an existing audit entry with the saved patient ID (call after patient is created). */
export async function patchAuditPatientId(
  logDocId: string,
  patientId: string,
): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, AUDIT_COLLECTION, logDocId), { patientId })
  } catch (err) {
    console.error('[AuditLogger] Patch patientId failed (non-blocking):', err)
  }
}
