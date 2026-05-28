/**
 * pkce.ts — Server-side PKCE (Proof Key for Code Exchange) utilities.
 *
 * DigiLocker mandates PKCE with S256 for all OAuth 2.0 flows.
 * ALL PKCE operations happen server-side only — the code_verifier MUST
 * NEVER be sent to the browser.
 *
 * Security model:
 *   - code_verifier: 32 cryptographically random bytes → base64url (no padding)
 *   - code_challenge: SHA-256(code_verifier) → base64url (no padding)
 *   - Both values are tied to a short-lived Firestore session document.
 *   - The verifier is deleted from the store immediately after the token exchange.
 *
 * References:
 *   RFC 7636  – Proof Key for Code Exchange
 *   DigiLocker API Specification v2 – Section 4.2 (OAuth 2.0 with PKCE)
 */

import { createHash, randomBytes } from 'crypto'

// ── PKCE core ──────────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure code_verifier.
 * Output: 43–128 characters, base64url-encoded (RFC 7636 §4.1).
 */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * Derives the code_challenge from a code_verifier using S256 method.
 * code_challenge = BASE64URL(SHA256(ASCII(code_verifier)))
 */
export function deriveCodeChallenge(codeVerifier: string): string {
  return createHash('sha256')
    .update(codeVerifier, 'ascii')
    .digest('base64url')
}

// ── State parameter ────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure OAuth state parameter (16 bytes → hex).
 * Used to prevent CSRF attacks during the OAuth callback.
 */
export function generateOAuthState(): string {
  return randomBytes(16).toString('hex')
}

// ── PKCE pair ─────────────────────────────────────────────────────────────────

export interface PkcePair {
  codeVerifier: string
  codeChallenge: string
  state: string
}

/**
 * Generates a complete PKCE pair (verifier + challenge) and a state token.
 * Call this once per OAuth initiation; store `codeVerifier` and `state`
 * server-side, then discard them immediately after the token exchange.
 */
export function generatePkcePair(): PkcePair {
  const codeVerifier = generateCodeVerifier()
  return {
    codeVerifier,
    codeChallenge: deriveCodeChallenge(codeVerifier),
    state: generateOAuthState(),
  }
}
