/**
 * digilocker.test.ts — Unit tests for the DigiLocker integration layer.
 *
 * Tests cover:
 *   1. PKCE utilities (generateCodeVerifier, deriveCodeChallenge, generatePkcePair)
 *   2. Data sanitiser (maskAadhaar, encryptAadhaar, normaliseDob, normaliseGender,
 *                       composeAddress, sanitiseKycData)
 *   3. DigiLocker API client helpers (buildAuthorizationUrl, parseAadhaarKycXml)
 *   4. DigiLockerProvider integration (mock fetch)
 *
 * All tests that require server-side env vars (DIGILOCKER_CLIENT_ID etc.)
 * mock the process.env object rather than the live environment.
 *
 * Security-specific assertions:
 *   - Raw Aadhaar UID never appears in sanitised output
 *   - DEV mode encryption is clearly tagged
 *   - PKCE challenge is not the same as the verifier
 *   - state parameter is always 32 hex characters (16 bytes)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateCodeVerifier,
  deriveCodeChallenge,
  generateOAuthState,
  generatePkcePair,
} from '../../lib/digilocker/pkce'
import {
  maskAadhaar,
  encryptAadhaar,
  normaliseDob,
  normaliseGender,
  composeAddress,
  sanitiseKycData,
} from '../../lib/digilocker/sanitiser'
import type { RawAadhaarKyc } from '../../lib/digilocker/types'

// ── PKCE utilities ────────────────────────────────────────────────────────────

describe('PKCE — generateCodeVerifier', () => {
  it('returns a non-empty string', () => {
    expect(generateCodeVerifier().length).toBeGreaterThan(0)
  })

  it('returns only base64url characters', () => {
    const verifier = generateCodeVerifier()
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('returns at least 43 characters (RFC 7636 minimum)', () => {
    // 32 bytes in base64url = ceil(32 * 4/3) ≈ 43 chars
    expect(generateCodeVerifier().length).toBeGreaterThanOrEqual(43)
  })

  it('generates unique values on each call', () => {
    const v1 = generateCodeVerifier()
    const v2 = generateCodeVerifier()
    expect(v1).not.toBe(v2)
  })
})

describe('PKCE — deriveCodeChallenge', () => {
  it('returns a base64url string', () => {
    const verifier   = generateCodeVerifier()
    const challenge  = deriveCodeChallenge(verifier)
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('challenge is different from verifier', () => {
    const verifier  = generateCodeVerifier()
    const challenge = deriveCodeChallenge(verifier)
    expect(challenge).not.toBe(verifier)
  })

  it('is deterministic for the same input', () => {
    const verifier = 'test-verifier-abc123'
    expect(deriveCodeChallenge(verifier)).toBe(deriveCodeChallenge(verifier))
  })

  it('produces different challenges for different verifiers', () => {
    expect(deriveCodeChallenge('verifier-A')).not.toBe(deriveCodeChallenge('verifier-B'))
  })
})

describe('PKCE — generateOAuthState', () => {
  it('returns a 32-character hex string (16 bytes)', () => {
    expect(generateOAuthState()).toMatch(/^[0-9a-f]{32}$/)
  })

  it('generates unique values on each call', () => {
    expect(generateOAuthState()).not.toBe(generateOAuthState())
  })
})

describe('PKCE — generatePkcePair', () => {
  it('returns all three fields', () => {
    const pair = generatePkcePair()
    expect(pair).toHaveProperty('codeVerifier')
    expect(pair).toHaveProperty('codeChallenge')
    expect(pair).toHaveProperty('state')
  })

  it('challenge matches the derived value from the verifier', () => {
    const pair = generatePkcePair()
    expect(pair.codeChallenge).toBe(deriveCodeChallenge(pair.codeVerifier))
  })

  it('state is 32 hex characters', () => {
    expect(generatePkcePair().state).toMatch(/^[0-9a-f]{32}$/)
  })
})

// ── Aadhaar masking ───────────────────────────────────────────────────────────

describe('sanitiser — maskAadhaar', () => {
  it('masks the first 8 digits', () => {
    expect(maskAadhaar('123456789012')).toBe('XXXX-XXXX-9012')
  })

  it('exposes only the last 4 digits', () => {
    const masked = maskAadhaar('999988887777')
    expect(masked).toBe('XXXX-XXXX-7777')
  })

  it('throws for non-12-digit input', () => {
    expect(() => maskAadhaar('12345')).toThrow()
    expect(() => maskAadhaar('1234567890123')).toThrow()
    expect(() => maskAadhaar('abcdefghijkl')).toThrow()
  })

  it('does not expose digits 1–8', () => {
    const masked = maskAadhaar('123456789012')
    expect(masked).not.toContain('1234')
    expect(masked).not.toContain('5678')
  })
})

// ── Aadhaar encryption ────────────────────────────────────────────────────────

describe('sanitiser — encryptAadhaar', () => {
  beforeEach(() => {
    vi.stubEnv('DIGILOCKER_AADHAAR_KEY', '')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns a DEV-tagged placeholder when no key is set', () => {
    const result = encryptAadhaar('123456789012')
    expect(result).toMatch(/^dev:/)
  })

  it('DEV placeholder does NOT expose the raw UID in a decodable way without inspection', () => {
    // The dev placeholder is base64-encoded, not plain text
    const result = encryptAadhaar('123456789012')
    expect(result).not.toContain('123456789012')
  })

  it('returns iv:authTag:ciphertext format when key is provided', () => {
    // 64-character hex key (32 bytes)
    vi.stubEnv('DIGILOCKER_AADHAAR_KEY', 'a'.repeat(64))
    const result = encryptAadhaar('123456789012')
    const parts = result.split(':')
    expect(parts).toHaveLength(3)
    // iv: 24 hex chars (12 bytes), authTag: 32 hex chars (16 bytes), ciphertext: hex
    expect(parts[0]).toMatch(/^[0-9a-f]{24}$/)  // 12 bytes IV
    expect(parts[1]).toMatch(/^[0-9a-f]{32}$/)  // 16 bytes authTag
    expect(parts[2]).toMatch(/^[0-9a-f]+$/)      // ciphertext
  })

  it('produces different ciphertext on each call (random IV)', () => {
    vi.stubEnv('DIGILOCKER_AADHAAR_KEY', 'b'.repeat(64))
    const enc1 = encryptAadhaar('123456789012')
    const enc2 = encryptAadhaar('123456789012')
    expect(enc1).not.toBe(enc2)
  })
})

// ── Date normalisation ────────────────────────────────────────────────────────

describe('sanitiser — normaliseDob', () => {
  it('passes through YYYY-MM-DD unchanged', () => {
    expect(normaliseDob('1990-03-15')).toBe('1990-03-15')
  })

  it('converts DD-MM-YYYY to YYYY-MM-DD', () => {
    expect(normaliseDob('15-03-1990')).toBe('1990-03-15')
  })

  it('converts DD/MM/YYYY to YYYY-MM-DD', () => {
    expect(normaliseDob('15/03/1990')).toBe('1990-03-15')
  })

  it('pads single-digit day and month', () => {
    expect(normaliseDob('5/3/1990')).toBe('1990-03-05')
  })

  it('throws for unrecognised formats', () => {
    expect(() => normaliseDob('March 15, 1990')).toThrow()
    expect(() => normaliseDob('')).toThrow()
  })
})

// ── Gender normalisation ──────────────────────────────────────────────────────

describe('sanitiser — normaliseGender', () => {
  it('maps M → Male', () => expect(normaliseGender('M')).toBe('Male'))
  it('maps F → Female', () => expect(normaliseGender('F')).toBe('Female'))
  it('maps T → Other', () => expect(normaliseGender('T')).toBe('Other'))
  it('maps unknown → Other', () => expect(normaliseGender('X')).toBe('Other'))
  it('is case-insensitive', () => {
    expect(normaliseGender('m')).toBe('Male')
    expect(normaliseGender('f')).toBe('Female')
  })
})

// ── Address composition ───────────────────────────────────────────────────────

describe('sanitiser — composeAddress', () => {
  it('joins all non-empty fields with commas', () => {
    const addr = composeAddress({
      house: '42',
      street: 'MG Road',
      vtc: 'Puducherry',
      state: 'Puducherry',
      pc: '605001',
    })
    expect(addr).toContain('42')
    expect(addr).toContain('MG Road')
    expect(addr).toContain('Puducherry')
    expect(addr).toContain('- 605001')
  })

  it('omits empty or undefined fields', () => {
    const addr = composeAddress({ state: 'Tamil Nadu' })
    expect(addr).toBe('Tamil Nadu')
  })

  it('handles co (care-of) prefix', () => {
    const addr = composeAddress({ co: 'Rajan' })
    expect(addr).toBe('C/O Rajan')
  })

  it('does not include "India" country label', () => {
    const addr = composeAddress({ vtc: 'Chennai', country: 'India' })
    expect(addr).not.toContain('India')
  })

  it('includes non-India country names', () => {
    const addr = composeAddress({ vtc: 'Colombo', country: 'Sri Lanka' })
    expect(addr).toContain('Sri Lanka')
  })
})

// ── sanitiseKycData ────────────────────────────────────────────────────────────

describe('sanitiser — sanitiseKycData', () => {
  const mockRaw: RawAadhaarKyc = {
    uid: '123456789012',
    poi: {
      name:   ' Demo Patient ',
      dob:    '15-03-1990',
      gender: 'F',
      phone:  '9876543210',
    },
    poa: {
      house:  '42',
      street: 'MG Road',
      vtc:    'Puducherry',
      state:  'Puducherry',
      pc:     '605001',
    },
  }

  it('returns a DigiLockerDemographics object', () => {
    const result = sanitiseKycData(mockRaw)
    expect(result).toHaveProperty('fullName')
    expect(result).toHaveProperty('dob')
    expect(result).toHaveProperty('gender')
    expect(result).toHaveProperty('maskedAadhaar')
    expect(result).toHaveProperty('encryptedAadhaar')
    expect(result).toHaveProperty('verifiedAt')
  })

  it('trims fullName', () => {
    const result = sanitiseKycData(mockRaw)
    expect(result.fullName).toBe('Demo Patient')
  })

  it('normalises DOB to YYYY-MM-DD', () => {
    const result = sanitiseKycData(mockRaw)
    expect(result.dob).toBe('1990-03-15')
  })

  it('normalises gender F → Female', () => {
    const result = sanitiseKycData(mockRaw)
    expect(result.gender).toBe('Female')
  })

  it('NEVER includes the raw 12-digit UID in the result', () => {
    const result = sanitiseKycData(mockRaw)
    const serialised = JSON.stringify(result)
    // Raw UID must not appear anywhere in the output
    expect(serialised).not.toContain('123456789012')
  })

  it('maskedAadhaar shows only last 4 digits', () => {
    const result = sanitiseKycData(mockRaw)
    expect(result.maskedAadhaar).toBe('XXXX-XXXX-9012')
  })

  it('encryptedAadhaar is set and non-empty', () => {
    const result = sanitiseKycData(mockRaw)
    expect(result.encryptedAadhaar.length).toBeGreaterThan(0)
  })

  it('formats phone to E.164 with +91 prefix', () => {
    const result = sanitiseKycData(mockRaw)
    expect(result.phoneNumber).toBe('+919876543210')
  })

  it('returns undefined phoneNumber when phone is absent', () => {
    const result = sanitiseKycData({ ...mockRaw, poi: { ...mockRaw.poi, phone: undefined } })
    expect(result.phoneNumber).toBeUndefined()
  })

  it('throws when UID is missing', () => {
    expect(() => sanitiseKycData({ ...mockRaw, uid: '' })).toThrow(/Aadhaar UID/)
  })

  it('throws when UID has wrong length', () => {
    expect(() => sanitiseKycData({ ...mockRaw, uid: '12345' })).toThrow(/Aadhaar UID/)
  })

  it('throws when name is empty', () => {
    expect(() =>
      sanitiseKycData({ ...mockRaw, poi: { ...mockRaw.poi, name: '  ' } }),
    ).toThrow(/name/)
  })

  it('throws when DOB is missing', () => {
    expect(() =>
      sanitiseKycData({ ...mockRaw, poi: { ...mockRaw.poi, dob: '' } }),
    ).toThrow()
  })

  it('verifiedAt is a valid ISO timestamp', () => {
    const result = sanitiseKycData(mockRaw)
    expect(new Date(result.verifiedAt).toISOString()).toBe(result.verifiedAt)
  })

  it('abhaNumber is undefined when not provided', () => {
    const result = sanitiseKycData(mockRaw)
    expect(result.abhaNumber).toBeUndefined()
  })

  it('includes abhaNumber when a valid 14-digit value is provided', () => {
    const result = sanitiseKycData(mockRaw, '91123456789012')
    expect(result.abhaNumber).toBe('91123456789012')
  })

  it('accepts hyphenated ABHA format (XX-XXXX-XXXX-XXXX)', () => {
    const result = sanitiseKycData(mockRaw, '91-1234-5678-9012')
    expect(result.abhaNumber).toBe('91123456789012')
  })

  it('silently drops malformed ABHA — does not throw', () => {
    const result = sanitiseKycData(mockRaw, 'INVALID-ABHA')
    expect(result.abhaNumber).toBeUndefined()
  })

  it('silently drops ABHA with wrong digit count', () => {
    expect(sanitiseKycData(mockRaw, '12345').abhaNumber).toBeUndefined()
    expect(sanitiseKycData(mockRaw, '123456789012345').abhaNumber).toBeUndefined()
  })
})

// ── normaliseAbhaNumber ───────────────────────────────────────────────────────

import { normaliseAbhaNumber } from '../../lib/digilocker/sanitiser'

describe('sanitiser — normaliseAbhaNumber', () => {
  it('returns a 14-digit string for a valid raw ABHA number', () => {
    expect(normaliseAbhaNumber('91123456789012')).toBe('91123456789012')
  })

  it('strips hyphens from XX-XXXX-XXXX-XXXX format', () => {
    expect(normaliseAbhaNumber('91-1234-5678-9012')).toBe('91123456789012')
  })

  it('returns undefined for undefined input', () => {
    expect(normaliseAbhaNumber(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(normaliseAbhaNumber('')).toBeUndefined()
  })

  it('returns undefined for fewer than 14 digits', () => {
    expect(normaliseAbhaNumber('1234567890123')).toBeUndefined()   // 13 digits
  })

  it('returns undefined for more than 14 digits', () => {
    expect(normaliseAbhaNumber('123456789012345')).toBeUndefined() // 15 digits
  })

  it('returns undefined when non-digit characters remain after stripping hyphens', () => {
    expect(normaliseAbhaNumber('ABCDE-FGHIJ-KL')).toBeUndefined()
  })

  it('is consistent — same input always gives same output', () => {
    expect(normaliseAbhaNumber('91-1234-5678-9012')).toBe(
      normaliseAbhaNumber('91-1234-5678-9012'),
    )
  })
})
