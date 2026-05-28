/**
 * client.ts — DigiLocker API client (server-side only).
 *
 * Wraps all HTTP calls to the DigiLocker OAuth 2.0 and document APIs.
 * This module MUST ONLY be used in API route handlers and server actions.
 * NEVER import from client components.
 *
 * DigiLocker API base URLs:
 *   Production:  https://api.digitallocker.gov.in
 *   Sandbox:     https://sandbox.digitallocker.gov.in  (NIC-provided test env)
 *
 * Security:
 *   - DIGILOCKER_CLIENT_SECRET is read from env; it NEVER appears in logs
 *   - OAuth tokens are used in-memory for the duration of the request only
 *   - No tokens are stored beyond what's needed to fetch the KYC document
 *
 * References:
 *   DigiLocker Partner API Documentation (restricted):
 *     https://partners.digilocker.gov.in/portal/docs
 */

import type {
  DigiLockerTokenResponse,
  RawAadhaarKyc,
  DigiLockerDocument,
  DigiLockerDocumentsResponse,
} from './types'

// ── Config ─────────────────────────────────────────────────────────────────────

interface DigiLockerConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  baseUrl: string
}

function getConfig(): DigiLockerConfig {
  const clientId     = process.env.DIGILOCKER_CLIENT_ID
  const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET
  const redirectUri  = process.env.DIGILOCKER_REDIRECT_URI
  const baseUrl      = process.env.DIGILOCKER_BASE_URL ?? 'https://api.digitallocker.gov.in'

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'DigiLocker configuration incomplete. Ensure DIGILOCKER_CLIENT_ID, ' +
      'DIGILOCKER_CLIENT_SECRET, and DIGILOCKER_REDIRECT_URI are set.',
    )
  }

  return { clientId, clientSecret, redirectUri, baseUrl }
}

// ── Authorization URL builder ──────────────────────────────────────────────────

/**
 * Builds the DigiLocker authorization URL for the OAuth 2.0 + PKCE flow.
 *
 * The returned URL is safe to expose to the client (it contains only public
 * parameters: client_id, redirect_uri, scope, state, code_challenge).
 */
export function buildAuthorizationUrl(params: {
  codeChallenge: string
  state: string
}): string {
  const { clientId, redirectUri, baseUrl } = getConfig()

  const url = new URL(`${baseUrl}/public/oauth2/1/authorize`)
  url.searchParams.set('response_type',           'code')
  url.searchParams.set('client_id',               clientId)
  url.searchParams.set('redirect_uri',            redirectUri)
  url.searchParams.set('scope',                   'openid')
  url.searchParams.set('state',                   params.state)
  url.searchParams.set('code_challenge',          params.codeChallenge)
  url.searchParams.set('code_challenge_method',   'S256')

  return url.toString()
}

// ── Token exchange ────────────────────────────────────────────────────────────

/**
 * Exchanges an authorization code for access and refresh tokens.
 *
 * Called exclusively from the /api/digilocker/callback route handler.
 * The returned tokens are used in-memory to fetch KYC data and then discarded.
 *
 * @throws on HTTP error or missing access_token
 */
export async function exchangeCodeForToken(params: {
  code: string
  codeVerifier: string
}): Promise<DigiLockerTokenResponse> {
  const { clientId, clientSecret, redirectUri, baseUrl } = getConfig()

  const body = new URLSearchParams({
    grant_type:    'authorization_code',
    code:          params.code,
    client_id:     clientId,
    client_secret: clientSecret,
    redirect_uri:  redirectUri,
    code_verifier: params.codeVerifier,
  })

  const res = await fetch(`${baseUrl}/public/oauth2/1/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    // Deliberately omit client_secret from the error — it may appear in raw body
    throw new Error(`DigiLocker token exchange failed [${res.status}]: ${text.slice(0, 200)}`)
  }

  const data = (await res.json()) as DigiLockerTokenResponse

  if (!data.access_token) {
    throw new Error('DigiLocker token response missing access_token')
  }

  return data
}

// ── Aadhaar eKYC fetch ────────────────────────────────────────────────────────

/**
 * Fetches the Aadhaar eKYC XML document from the DigiLocker API using the
 * access token. Parses and returns the raw KYC data.
 *
 * The access_token is used here and then discarded — never stored.
 *
 * @throws on HTTP error or malformed response
 */
export async function fetchAadhaarKyc(accessToken: string): Promise<RawAadhaarKyc> {
  const { baseUrl } = getConfig()

  // DigiLocker eKYC v3 endpoint — returns XML with eKYC data
  const res = await fetch(`${baseUrl}/public/oauth2/3/xml/eaadhaar`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept':        'application/xml',
    },
  })

  if (!res.ok) {
    throw new Error(`DigiLocker eKYC fetch failed [${res.status}]`)
  }

  const xmlText = await res.text()
  return parseAadhaarKycXml(xmlText)
}

/**
 * Parses the DigiLocker eKYC XML response into a structured RawAadhaarKyc object.
 *
 * DigiLocker eKYC XML structure (simplified):
 * <KycRes>
 *   <UidData uid="XXXXXXXXXXXX">
 *     <Poi name="..." dob="..." gender="..." phone="..." email="..." />
 *     <Poa co="..." house="..." street="..." lm="..." loc="..." vtc="..." dist="..." state="..." country="..." pc="..." />
 *   </UidData>
 * </KycRes>
 *
 * Uses regex-based parsing to avoid importing an XML library. This is
 * intentional — Next.js serverless environments have constrained budgets.
 */
function parseAadhaarKycXml(xml: string): RawAadhaarKyc {
  /**
   * Extracts all attributes from an XML element tag.
   * Returns a Record<string, string>.
   */
  function extractAttrs(xml: string, tag: string): Record<string, string> {
    const match = xml.match(new RegExp(`<${tag}([^>]*)`, 'i'))
    if (!match) return {}

    const attrs: Record<string, string> = {}
    const attrRegex = /(\w+)="([^"]*)"/g
    let m: RegExpExecArray | null

    while ((m = attrRegex.exec(match[1])) !== null) {
      attrs[m[1]] = m[2]
    }

    return attrs
  }

  const uidData = extractAttrs(xml, 'UidData')
  const poi     = extractAttrs(xml, 'Poi')
  const poa     = extractAttrs(xml, 'Poa')

  const uid = uidData.uid ?? ''

  if (!uid || uid.replace(/\D/g, '').length !== 12) {
    throw new Error('DigiLocker eKYC XML missing or invalid uid attribute')
  }

  if (!poi.name || !poi.dob) {
    throw new Error('DigiLocker eKYC XML missing required POI fields (name, dob)')
  }

  return {
    uid,
    poi: {
      name:   poi.name,
      dob:    poi.dob,
      gender: (poi.gender as 'M' | 'F' | 'T') ?? 'M',
      phone:  poi.phone,
      email:  poi.email,
    },
    poa: {
      co:      poa.co,
      house:   poa.house,
      street:  poa.street,
      lm:      poa.lm,
      loc:     poa.loc,
      vtc:     poa.vtc,
      dist:    poa.dist,
      state:   poa.state,
      country: poa.country,
      pc:      poa.pc,
    },
  }
}

// ── Issued documents listing ──────────────────────────────────────────────────

/**
 * Fetches the list of documents issued to the authenticated DigiLocker user.
 * The access_token is used here and then discarded.
 *
 * @returns Empty array on any error — document listing is best-effort.
 */
export async function fetchIssuedDocuments(
  accessToken: string,
): Promise<DigiLockerDocument[]> {
  try {
    const { baseUrl } = getConfig()

    const res = await fetch(`${baseUrl}/public/oauth2/1/files/issued`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept':        'application/json',
      },
    })

    if (!res.ok) {
      console.warn(`[DigiLocker] Document listing returned ${res.status} — skipping ABHA lookup`)
      return []
    }

    const data = (await res.json()) as DigiLockerDocumentsResponse
    return data.items ?? []
  } catch (err) {
    console.warn('[DigiLocker] fetchIssuedDocuments failed (non-blocking):', err)
    return []
  }
}

// ── ABHA (Health ID) fetch ─────────────────────────────────────────────────────

/**
 * Known DigiLocker document type identifiers for ABHA Health ID cards.
 *
 * DigiLocker refers to ABHA documents by multiple type codes depending on
 * the issuer version. We match against all known patterns.
 */
const ABHA_DOC_TYPES = new Set([
  'ABHA',
  'HICARD',    // Health ID Card (legacy NHA type code)
  'ABDM',      // Ayushman Bharat Digital Mission umbrella type
  'AHCARD',    // Another variant seen in some NHA integrations
])

/**
 * Finds the ABHA Health ID Card document URI from a list of DigiLocker documents.
 * Returns the document URI string if found, or null otherwise.
 */
function findAbhaDocumentUri(documents: DigiLockerDocument[]): string | null {
  for (const doc of documents) {
    const type = (doc.type ?? '').toUpperCase()
    const name = (doc.name ?? '').toUpperCase()

    if (
      ABHA_DOC_TYPES.has(type) ||
      name.includes('HEALTH ID') ||
      name.includes('ABHA') ||
      name.includes('AYUSHMAN')
    ) {
      return doc.uri ?? null
    }
  }
  return null
}

/**
 * Extracts a 14-digit ABHA number from an ABHA card XML or JSON response body.
 *
 * DigiLocker serves ABHA card documents as XML (<HealthIdNumber>…</HealthIdNumber>)
 * or as JSON (healthIdNumber field) depending on the issuer version.
 * Both formats are tried. Returns null if extraction fails.
 */
function extractAbhaFromResponse(body: string): string | null {
  // ── JSON format ──────────────────────────────────────────────────────────
  try {
    const json = JSON.parse(body) as Record<string, unknown>
    const candidates = [
      json.healthIdNumber,
      json.abhaNumber,
      json.health_id_number,
      json.AbhaNumber,
    ]
    for (const val of candidates) {
      if (typeof val === 'string') {
        const digits = val.replace(/-/g, '').trim()
        if (/^\d{14}$/.test(digits)) return digits
      }
    }
  } catch {
    // Not JSON — fall through to XML
  }

  // ── XML format ───────────────────────────────────────────────────────────
  const xmlPatterns = [
    /<HealthIdNumber[^>]*>([\d-]{14,19})<\/HealthIdNumber>/i,
    /<AbhaNumber[^>]*>([\d-]{14,19})<\/AbhaNumber>/i,
    /<healthIdNumber[^>]*>([\d-]{14,19})<\/healthIdNumber>/i,
    /healthId="([\d-]{14,19})"/i,
  ]

  for (const pattern of xmlPatterns) {
    const match = body.match(pattern)
    if (match) {
      const digits = match[1].replace(/-/g, '')
      if (/^\d{14}$/.test(digits)) return digits
    }
  }

  return null
}

/**
 * Fetches the ABHA number for the authenticated DigiLocker user.
 *
 * Two-step process:
 *   1. Fetch the issued document list and locate the ABHA Health ID Card
 *   2. Fetch the card document body and parse the 14-digit ABHA number
 *
 * Returns `undefined` when:
 *   - The user has no ABHA card in their DigiLocker
 *   - Any network or parse error occurs
 *
 * This MUST be non-throwing — ABHA absence must not block Aadhaar verification.
 */
export async function fetchAbhaNumber(accessToken: string): Promise<string | undefined> {
  try {
    const { baseUrl } = getConfig()

    // Step 1: Get the issued document list
    const documents = await fetchIssuedDocuments(accessToken)
    if (documents.length === 0) return undefined

    // Step 2: Find the ABHA document URI
    const abhaUri = findAbhaDocumentUri(documents)
    if (!abhaUri) return undefined

    // Step 3: Fetch the ABHA document content
    const fileUrl = `${baseUrl}/public/oauth2/1/file/${encodeURIComponent(abhaUri)}`

    const docRes = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept':        'application/xml, application/json',
      },
    })

    if (!docRes.ok) {
      console.warn(`[DigiLocker] ABHA document fetch returned ${docRes.status}`)
      return undefined
    }

    const body = await docRes.text()
    const abhaNumber = extractAbhaFromResponse(body)

    if (abhaNumber) {
      // Log masked form only (last 4 digits visible)
      console.info(`[DigiLocker] ABHA linked — XXXX-XXXX-XX${abhaNumber.slice(-4)}`)
    }

    return abhaNumber ?? undefined
  } catch (err) {
    // Never throw — ABHA is best-effort
    console.warn('[DigiLocker] fetchAbhaNumber failed (non-blocking):', err)
    return undefined
  }
}
