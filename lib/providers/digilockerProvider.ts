/**
 * digilockerProvider.ts — Production DigiLocker identity provider.
 *
 * This provider implements the IdentityProvider interface using the full
 * DigiLocker OAuth 2.0 + PKCE flow via server-side API routes.
 *
 * Architecture:
 *   Frontend (this hook) ──→ POST /api/digilocker/initiate
 *                                   ↓ returns { sessionId, authorizationUrl }
 *   Frontend opens authorizationUrl in a popup
 *   User authenticates on DigiLocker → redirects to /api/digilocker/callback
 *   Callback handler exchanges code, fetches KYC, sanitises, stores in Firestore
 *   Frontend polls GET /api/digilocker/status?sessionId=<id>
 *   On success → returns DigiLockerDemographics → mapped to VerifiedPatientData
 *
 * Security model:
 *   - PKCE code_verifier lives ONLY on the server (never sent to client)
 *   - OAuth access_token is used in-memory in the callback handler only
 *   - Raw Aadhaar UID is encrypted before storage; only maskedAadhaar reaches UI
 *   - postMessage origin is validated in the popup-close listener
 *
 * Graceful degradation:
 *   - When DIGILOCKER_CLIENT_ID is unset, falls back to MockProvider behaviour
 *     so the flow continues to work in development without API credentials.
 *     This is controlled by the NEXT_PUBLIC_DIGILOCKER_MOCK env var as a safety flag.
 *
 * Usage (in usePatientVerification hook):
 *   const provider = new DigiLockerProvider({ onOpenPopup })
 *   await provider.verify()
 */

import type { IdentityProvider } from '@/lib/verification/provider'
import type { VerifiedPatientData } from '@/lib/verification/types'
import type {
  DigiLockerInitResponse,
  DigiLockerStatusResponse,
} from '@/lib/digilocker/types'

// ── Config ─────────────────────────────────────────────────────────────────────

/** How often to poll the status endpoint (milliseconds) */
const POLL_INTERVAL_MS = 2_000

/** Maximum number of poll attempts before timing out (5 min / 2s = 150) */
const MAX_POLL_ATTEMPTS = 150

// ── Provider ───────────────────────────────────────────────────────────────────

export interface DigiLockerProviderOptions {
  /**
   * Callback invoked with the authorization URL immediately after initiation.
   * The parent hook should open this URL in a popup (preferred) or redirect.
   *
   * Example:
   *   onOpenPopup: (url) => { popupRef.current = window.open(url, '_blank', 'width=600,height=700') }
   */
  onOpenPopup: (authorizationUrl: string) => void
  /**
   * Optional callback invoked with progress messages during the flow.
   * Useful for displaying "Waiting for DigiLocker…" style messages in the UI.
   */
  onStatusMessage?: (message: string) => void
}

export class DigiLockerProvider implements IdentityProvider {
  readonly source = 'digilocker' as const

  constructor(private readonly options: DigiLockerProviderOptions) {}

  async verify(): Promise<VerifiedPatientData> {
    // ── Step 1: Initiate OAuth flow on the server ────────────────────────────
    this.options.onStatusMessage?.('Initiating DigiLocker verification…')

    const initRes = await fetch('/api/digilocker/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!initRes.ok) {
      const body = (await initRes.json()) as { error?: string }
      throw new Error(body.error ?? 'Failed to start DigiLocker verification')
    }

    const { sessionId, authorizationUrl } = (await initRes.json()) as DigiLockerInitResponse

    // ── Step 2: Open popup and wait for postMessage signal ───────────────────
    this.options.onStatusMessage?.('Opening DigiLocker…')
    this.options.onOpenPopup(authorizationUrl)

    // ── Step 3: Poll status until success / error / timeout ──────────────────
    return this.pollUntilComplete(sessionId)
  }

  private async pollUntilComplete(sessionId: string): Promise<VerifiedPatientData> {
    this.options.onStatusMessage?.('Waiting for DigiLocker authentication…')

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await sleep(POLL_INTERVAL_MS)

      let statusResponse: DigiLockerStatusResponse

      try {
        const res = await fetch(`/api/digilocker/status?sessionId=${encodeURIComponent(sessionId)}`)
        statusResponse = (await res.json()) as DigiLockerStatusResponse

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Verification session expired. Please start over.')
          }
          throw new Error(statusResponse.error ?? 'Session lookup failed')
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('expired')) throw err
        // Transient network error — continue polling
        continue
      }

      if (statusResponse.status === 'pending') {
        if (attempt === 10) {
          this.options.onStatusMessage?.('Awaiting your DigiLocker approval…')
        } else if (attempt === 30) {
          this.options.onStatusMessage?.('Still waiting — please complete DigiLocker sign-in…')
        }
        continue
      }

      if (statusResponse.status === 'error') {
        throw new Error(
          statusResponse.error ?? 'DigiLocker verification failed. Please try again.',
        )
      }

      if (statusResponse.status === 'success' && statusResponse.demographics) {
        this.options.onStatusMessage?.('Identity verified!')
        return mapDemographicsToVerifiedPatientData(statusResponse.demographics)
      }
    }

    throw new Error('DigiLocker verification timed out. Please try again.')
  }
}

// ── Mapping helper ─────────────────────────────────────────────────────────────

import type { DigiLockerDemographics } from '@/lib/digilocker/types'

function mapDemographicsToVerifiedPatientData(
  d: DigiLockerDemographics,
): VerifiedPatientData {
  return {
    fullName:           d.fullName,
    dob:                d.dob,
    gender:             d.gender,
    address:            d.address,
    phoneNumber:        d.phoneNumber,
    // The masked Aadhaar is safe for display and audit logs
    maskedId:           d.maskedAadhaar,
    // encryptedAadhaar goes into the patient record server-side
    // We store the encrypted version in aadhaarNumber field so the
    // patient service can persist it. The UI never decrypts this.
    aadhaarNumber:      d.encryptedAadhaar,
    abhaNumber:         d.abhaNumber,
    verificationSource: 'digilocker',
    verifiedAt:         d.verifiedAt,
  }
}

// ── Utilities ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
