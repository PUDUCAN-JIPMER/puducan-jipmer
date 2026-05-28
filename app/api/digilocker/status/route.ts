/**
 * GET /api/digilocker/status?sessionId=<id>
 *
 * Polls the status of a DigiLocker OAuth session.
 *
 * The frontend calls this endpoint repeatedly after opening the DigiLocker
 * popup, waiting for the callback to complete. Once the status is 'success',
 * the demographics payload is returned (one-time only — the session is deleted
 * immediately after to prevent replay).
 *
 * Polling model:
 *   - Frontend polls every 2 seconds with exponential backoff on error
 *   - Maximum polling window: DIGILOCKER_SESSION_TTL_SECONDS (300s)
 *   - On 'success': demographics are returned and session is DELETED
 *   - On 'error': error message is returned and session is DELETED
 *   - On 'pending': { status: 'pending' } is returned with no side effects
 *
 * Security:
 *   - The sessionId is an opaque Firestore document ID (random, unguessable)
 *   - Demographics returned here are already sanitised (no raw Aadhaar)
 *   - The session is deleted immediately on first consumption (replay-safe)
 *   - No authentication is required here because the sessionId IS the secret;
 *     however, this endpoint should be behind the same Firebase Auth middleware
 *     as all other API routes in production.
 *
 * Query: sessionId (required)
 * Response 200: DigiLockerStatusResponse
 * Response 400: { error: 'sessionId is required' }
 * Response 404: { error: 'Session not found or expired' }
 * Response 500: { error: string }
 */

import { type NextRequest, NextResponse } from 'next/server'
import { getSession, deleteSession } from '@/lib/digilocker/sessionStore'
import type { DigiLockerStatusResponse } from '@/lib/digilocker/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.nextUrl.searchParams.get('sessionId')

  if (!sessionId?.trim()) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  try {
    const session = await getSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 })
    }

    // ── Still processing ─────────────────────────────────────────────────────
    if (session.status === 'pending') {
      const response: DigiLockerStatusResponse = { status: 'pending' }
      return NextResponse.json(response)
    }

    // ── Success — return demographics and DELETE the session ─────────────────
    if (session.status === 'success') {
      // Delete immediately — one-time consumption prevents replay attacks
      void deleteSession(sessionId)

      const response: DigiLockerStatusResponse = {
        status: 'success',
        demographics: session.demographics,
      }
      return NextResponse.json(response)
    }

    // ── Error — surface the error and DELETE the session ─────────────────────
    if (session.status === 'error') {
      void deleteSession(sessionId)

      const response: DigiLockerStatusResponse = {
        status: 'error',
        error: session.error ?? 'An unknown error occurred during verification.',
      }
      return NextResponse.json(response)
    }

    // Should never reach here
    return NextResponse.json({ error: 'Invalid session state' }, { status: 500 })
  } catch (err) {
    console.error('[digilocker/status]', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Failed to retrieve session status. Please try again.' },
      { status: 500 },
    )
  }
}
