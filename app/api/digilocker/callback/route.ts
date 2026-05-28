/**
 * GET /api/digilocker/callback
 *
 * DigiLocker OAuth 2.0 callback handler. DigiLocker redirects the user here
 * after they authenticate in the popup/redirect window.
 *
 * This route:
 *   1. Validates the `state` parameter against the stored session (CSRF protection)
 *   2. Retrieves the PKCE code_verifier from the session store
 *   3. Exchanges the `code` for an access token
 *   4. Fetches the Aadhaar eKYC XML document using the access token
 *   5. Sanitises the raw KYC data (masks Aadhaar, encrypts it, normalises fields)
 *   6. Stores only the sanitised payload in the session document
 *   7. Closes the popup window and signals the parent via window.opener.postMessage
 *
 * Security:
 *   - Validates `state` before performing the token exchange (CSRF protection)
 *   - The code_verifier is deleted from Firestore immediately after use
 *   - Access tokens are NEVER stored — used in-memory for the KYC fetch only
 *   - Raw Aadhaar UID is sanitised by sanitiseKycData() before any storage
 *   - Error messages never leak PII or internal server details
 *
 * Query params: code, state (from DigiLocker redirect)
 * Response: HTML page that closes the popup + signals the parent window
 */

import { type NextRequest, NextResponse } from 'next/server'
import { getSession, markSessionSuccess, markSessionError } from '@/lib/digilocker/sessionStore'
import { exchangeCodeForToken, fetchAadhaarKyc, fetchAbhaNumber } from '@/lib/digilocker/client'
import { sanitiseKycData } from '@/lib/digilocker/sanitiser'

// ── Callback HTML templates ───────────────────────────────────────────────────

/**
 * Generates the HTML page returned to the DigiLocker popup.
 * Uses window.opener.postMessage to signal the parent tab without exposing
 * any data in the URL (no tokens, no PII).
 */
function buildCallbackPage(
  status: 'success' | 'error',
  sessionId: string,
  errorMessage?: string,
): string {
  const payload = status === 'success'
    ? JSON.stringify({ type: 'DIGILOCKER_SUCCESS', sessionId })
    : JSON.stringify({ type: 'DIGILOCKER_ERROR', sessionId, error: errorMessage ?? 'Verification failed' })

  // The targetOrigin is set to the app URL for security — only our origin receives the message
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DigiLocker Verification</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; font-family: system-ui, sans-serif;
      background: ${status === 'success' ? '#f0fdf4' : '#fff1f2'};
      color: ${status === 'success' ? '#15803d' : '#be123c'};
    }
    .card {
      text-align: center; padding: 2rem; max-width: 380px;
      background: white; border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
    p { font-size: 0.875rem; color: #6b7280; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${status === 'success' ? '✅' : '❌'}</div>
    <h1>${status === 'success' ? 'Identity Verified' : 'Verification Failed'}</h1>
    <p>${status === 'success'
      ? 'Your DigiLocker identity has been verified. This window will close automatically.'
      : errorMessage ?? 'An error occurred. Please close this window and try again.'
    }</p>
  </div>
  <script>
    // Signal the parent tab and close the popup
    (function () {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(${payload}, ${JSON.stringify(appOrigin)});
        }
      } catch (e) {
        // opener may be cross-origin in some edge cases — fail silently
      }
      // Close popup after a short delay so the user sees the result
      setTimeout(function () { window.close(); }, 2000);
    })();
  </script>
</body>
</html>`
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams
  const code         = searchParams.get('code')
  const returnedState = searchParams.get('state')
  const errorParam   = searchParams.get('error')

  // ── DigiLocker returned an error (user denied, etc.) ─────────────────────
  if (errorParam) {
    const description = searchParams.get('error_description') ?? errorParam

    // We don't know the sessionId at this point — the state param identifies it
    // Try to find and mark the session as failed
    if (returnedState) {
      await tryMarkErrorByState(returnedState, description)
    }

    return new NextResponse(
      buildCallbackPage('error', '', 'You declined the DigiLocker verification. Please try again.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  // ── Missing required parameters ────────────────────────────────────────────
  if (!code || !returnedState) {
    return new NextResponse(
      buildCallbackPage('error', '', 'Invalid callback parameters. Please try again.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  // ── Find the session by state ─────────────────────────────────────────────
  const sessionId = await findSessionIdByState(returnedState)

  if (!sessionId) {
    return new NextResponse(
      buildCallbackPage('error', '', 'Verification session not found or expired. Please start over.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const session = await getSession(sessionId)

  if (!session) {
    return new NextResponse(
      buildCallbackPage('error', sessionId, 'Verification session expired. Please start over.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  // ── Validate state (CSRF protection) ─────────────────────────────────────
  if (session.state !== returnedState) {
    await markSessionError(sessionId, 'State mismatch — possible CSRF attack')
    return new NextResponse(
      buildCallbackPage('error', sessionId, 'Security validation failed. Please start over.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  if (session.status !== 'pending') {
    // Session already processed (e.g. double-click on redirect)
    return new NextResponse(
      buildCallbackPage(session.status, sessionId),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  if (!session.codeVerifier) {
    await markSessionError(sessionId, 'PKCE code_verifier missing from session')
    return new NextResponse(
      buildCallbackPage('error', sessionId, 'Internal security error. Please start over.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  // ── Token exchange + KYC + ABHA fetch ────────────────────────────────────
  try {
    const tokenResponse = await exchangeCodeForToken({
      code,
      codeVerifier: session.codeVerifier,
    })

    // Run Aadhaar eKYC and ABHA lookup in parallel.
    // ABHA failure (Promise.allSettled) must NOT block the eKYC result.
    const [kycResult, abhaResult] = await Promise.allSettled([
      fetchAadhaarKyc(tokenResponse.access_token),
      fetchAbhaNumber(tokenResponse.access_token),
    ])

    if (kycResult.status === 'rejected') {
      throw kycResult.reason as Error
    }

    const rawKyc    = kycResult.value
    const abhaNumber = abhaResult.status === 'fulfilled' ? abhaResult.value : undefined

    // Sanitise: mask Aadhaar, encrypt UID, normalise fields, attach ABHA if available
    const demographics = sanitiseKycData(rawKyc, abhaNumber)

    // Store sanitised result; deletes code_verifier atomically
    await markSessionSuccess(sessionId, demographics)

    return new NextResponse(
      buildCallbackPage('success', sessionId),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[digilocker/callback] Processing failed:', message)

    await markSessionError(sessionId, 'Identity verification processing failed')

    return new NextResponse(
      buildCallbackPage('error', sessionId, 'Failed to retrieve identity details. Please try again.'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Finds a session document ID by its state parameter.
 * Required because DigiLocker sends state but not the session ID in the callback.
 *
 * This performs a Firestore query — in production with high throughput,
 * consider a separate index or Redis for O(1) state-to-session lookups.
 */
async function findSessionIdByState(state: string): Promise<string | null> {
  try {
    const { getAdminDb } = await import('@/lib/firebaseAdmin')
    const db = getAdminDb()
    const snap = await db
      .collection('digilocker_sessions')
      .where('state', '==', state)
      .limit(1)
      .get()

    if (snap.empty) return null
    return snap.docs[0].id
  } catch {
    return null
  }
}

/** Attempts to mark the error on a session found by state. Non-throwing. */
async function tryMarkErrorByState(state: string, error: string): Promise<void> {
  try {
    const sessionId = await findSessionIdByState(state)
    if (sessionId) await markSessionError(sessionId, error)
  } catch {
    // Best-effort
  }
}
