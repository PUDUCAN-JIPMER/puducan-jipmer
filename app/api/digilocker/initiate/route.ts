/**
 * POST /api/digilocker/initiate
 *
 * Initiates a DigiLocker OAuth 2.0 + PKCE flow.
 *
 * This route:
 *   1. Generates a PKCE pair (code_verifier + code_challenge) and OAuth state
 *   2. Stores the code_verifier and state in a short-lived Firestore session
 *   3. Returns the session ID and the authorization URL to the client
 *
 * The client opens the authorization URL in a popup or redirect.
 * After the user authenticates, DigiLocker redirects to /api/digilocker/callback.
 *
 * Security:
 *   - The code_verifier is NEVER returned to the client
 *   - The state parameter is validated in the callback to prevent CSRF
 *   - Sessions expire after DIGILOCKER_SESSION_TTL_SECONDS (300s)
 *
 * Request:  POST (no body required)
 * Response 200: DigiLockerInitResponse { sessionId, authorizationUrl }
 * Response 500: { error: string }
 */

import { NextResponse } from 'next/server'
import { generatePkcePair } from '@/lib/digilocker/pkce'
import { createSession } from '@/lib/digilocker/sessionStore'
import { buildAuthorizationUrl } from '@/lib/digilocker/client'
import type { DigiLockerInitResponse } from '@/lib/digilocker/types'

export async function POST(): Promise<NextResponse> {
  try {
    const { codeVerifier, codeChallenge, state } = generatePkcePair()

    const sessionId = await createSession({ codeVerifier, state })

    const authorizationUrl = buildAuthorizationUrl({ codeChallenge, state })

    const response: DigiLockerInitResponse = { sessionId, authorizationUrl }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[digilocker/initiate]', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Failed to initiate DigiLocker verification. Please try again.' },
      { status: 500 },
    )
  }
}
