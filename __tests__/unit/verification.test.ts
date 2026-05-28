import { describe, it, expect } from 'vitest'
import { validateProviderResponse } from '../../lib/verification/validation'
import { mapVerifiedDataToPatientFields } from '../../lib/verification/mapper'
import { MockProvider } from '../../lib/providers/mockProvider'
import type { VerifiedPatientData } from '../../lib/verification/types'

// ── validateProviderResponse ───────────────────────────────────────────────

describe('validateProviderResponse', () => {
    const valid: VerifiedPatientData = {
        fullName: 'Demo Patient',
        dob: '2001-05-12',
        gender: 'Male',
        verificationSource: 'mock',
        verifiedAt: new Date().toISOString(),
    }

    it('accepts a fully populated valid payload', () => {
        expect(validateProviderResponse(valid)).toBe(true)
    })

    it('accepts a valid payload with optional fields', () => {
        expect(
            validateProviderResponse({
                ...valid,
                address: 'Chennai',
                phoneNumber: '9876543210',
                maskedId: 'XXXX-XXXX-1234',
            }),
        ).toBe(true)
    })

    it('rejects null', () => {
        expect(validateProviderResponse(null)).toBe(false)
    })

    it('rejects a non-object', () => {
        expect(validateProviderResponse('string')).toBe(false)
        expect(validateProviderResponse(42)).toBe(false)
    })

    it('rejects when fullName is empty', () => {
        expect(validateProviderResponse({ ...valid, fullName: '' })).toBe(false)
        expect(validateProviderResponse({ ...valid, fullName: '   ' })).toBe(false)
    })

    it('rejects when dob is missing', () => {
        const { dob: _dob, ...rest } = valid
        expect(validateProviderResponse(rest)).toBe(false)
    })

    it('rejects an unknown verificationSource', () => {
        expect(validateProviderResponse({ ...valid, verificationSource: 'unknown' })).toBe(false)
    })

    it('rejects when verifiedAt is empty', () => {
        expect(validateProviderResponse({ ...valid, verifiedAt: '' })).toBe(false)
    })
})

// ── mapVerifiedDataToPatientFields ─────────────────────────────────────────

describe('mapVerifiedDataToPatientFields', () => {
    const base: VerifiedPatientData = {
        fullName: '  Demo Patient  ',
        dob: '2001-05-12',
        gender: 'Male',
        address: '  Chennai, TN  ',
        phoneNumber: '9876543210',
        maskedId: 'XXXX-XXXX-1234',
        verificationSource: 'mock',
        verifiedAt: new Date().toISOString(),
    }

    it('trims fullName and maps to name', () => {
        const result = mapVerifiedDataToPatientFields(base)
        expect(result.name).toBe('Demo Patient')
    })

    it('passes dob unchanged', () => {
        const result = mapVerifiedDataToPatientFields(base)
        expect(result.dob).toBe('2001-05-12')
    })

    it('maps gender Male → male', () => {
        expect(mapVerifiedDataToPatientFields({ ...base, gender: 'Male' }).sex).toBe('male')
    })

    it('maps gender Female → female', () => {
        expect(mapVerifiedDataToPatientFields({ ...base, gender: 'Female' }).sex).toBe('female')
    })

    it('maps unknown gender → other', () => {
        expect(mapVerifiedDataToPatientFields({ ...base, gender: 'Other' }).sex).toBe('other')
        expect(mapVerifiedDataToPatientFields({ ...base, gender: 'Nonbinary' as 'Other' }).sex).toBe('other')
    })

    it('trims address', () => {
        const result = mapVerifiedDataToPatientFields(base)
        expect(result.address).toBe('Chennai, TN')
    })

    it('wraps phoneNumber in an array and formats to E.164', () => {
        const result = mapVerifiedDataToPatientFields({ ...base, phoneNumber: '+91-9876543210' })
        expect(result.phoneNumber).toEqual(['+919876543210'])
    })

    it('returns empty phoneNumber array when phone is absent', () => {
        const { phoneNumber: _p, ...rest } = base
        const result = mapVerifiedDataToPatientFields(rest as VerifiedPatientData)
        expect(result.phoneNumber).toEqual([])
    })

    it('returns empty address string when address is absent', () => {
        const { address: _a, ...rest } = base
        const result = mapVerifiedDataToPatientFields(rest as VerifiedPatientData)
        expect(result.address).toBe('')
    })
})

// ── MockProvider ───────────────────────────────────────────────────────────

describe('MockProvider', () => {
    it('returns a valid VerifiedPatientData object', async () => {
        const provider = new MockProvider('9876543210')
        const result = await provider.verify()

        expect(result.fullName).toBeTruthy()
        expect(result.dob).toBeTruthy()
        expect(result.verificationSource).toBe('mock')
        expect(result.phoneNumber).toBe('9876543210')
        expect(typeof result.verifiedAt).toBe('string')
    }, 10_000)

    it('returns a masked ID that does not contain real digits in the first segments', async () => {
        const provider = new MockProvider('9876543210')
        const result = await provider.verify()
        expect(result.maskedId).toMatch(/^X{4}-X{4}-\d{4}$/)
    }, 10_000)

    it('returns a 12-digit aadhaarNumber', async () => {
        const provider = new MockProvider('9876543210')
        const result = await provider.verify()
        expect(result.aadhaarNumber).toMatch(/^\d{12}$/)
    }, 10_000)

    it('returns the Female persona for 9876543210', async () => {
        const provider = new MockProvider('9876543210')
        const result = await provider.verify()
        expect(result.gender).toBe('Female')
        expect(result.aadhaarNumber).toBe('234567891234')
        expect(result.maskedId).toBe('XXXX-XXXX-1234')
    }, 10_000)

    it('returns the Male persona for 9123456789', async () => {
        const provider = new MockProvider('9123456789')
        const result = await provider.verify()
        expect(result.gender).toBe('Male')
        expect(result.aadhaarNumber).toBe('345678901234')
        expect(result.maskedId).toBe('XXXX-XXXX-5678')
    }, 10_000)

    it('falls back to default persona for an unknown phone number', async () => {
        const provider = new MockProvider('9999999999')
        const result = await provider.verify()
        expect(result.fullName).toBe('Demo Patient')
        expect(result.aadhaarNumber).toBe('234567891234')
        expect(result.maskedId).toBe('XXXX-XXXX-1234')
    }, 10_000)

    it('preserves the phone number passed to the constructor', async () => {
        const phone = '9000000001'
        const provider = new MockProvider(phone)
        const result = await provider.verify()
        expect(result.phoneNumber).toBe(phone)
    }, 10_000)
})
