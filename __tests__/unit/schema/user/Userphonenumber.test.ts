import { describe, it, expect } from 'vitest'
import { UserSchema } from '@/schema/user'

// Base valid user object (nurse)
const baseUser = {
    email: 'nurse@example.com',
    name: 'Jane Nurse',
    role: 'nurse' as const,
    orgId: 'org123',
    orgName: 'Test Hospital',
}

describe('UserSchema - phoneNumber field validation', () => {
    // ─── Valid cases ────────────────────────────────────────────────────────

    it('should allow phoneNumber to be omitted entirely', () => {
        const result = UserSchema.safeParse({ ...baseUser })
        expect(result.success).toBe(true)
    })

    it('should allow phoneNumber to be an empty string', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '' })
        expect(result.success).toBe(true)
    })

    it('should accept a valid 10-digit mobile number starting with 9', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '9876543210' })
        expect(result.success).toBe(true)
    })

    it('should accept a valid 10-digit mobile number starting with 6', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '6012345678' })
        expect(result.success).toBe(true)
    })

    it('should accept a valid 10-digit mobile number starting with 7', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '7123456789' })
        expect(result.success).toBe(true)
    })

    it('should accept a valid 10-digit mobile number starting with 8', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '8765432109' })
        expect(result.success).toBe(true)
    })

    it('should strip +91 country code and accept resulting 10-digit number', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '+919876543210' })
        expect(result.success).toBe(true)
    })

    it('should strip 91 country code and accept resulting 10-digit number', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '919876543210' })
        expect(result.success).toBe(true)
    })

    it('should treat bare +91 (no digits after) as empty and accept it', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '+91' })
        expect(result.success).toBe(true)
    })

    // ─── Invalid cases ───────────────────────────────────────────────────────

    it('should reject a phone number with more than 10 digits (e.g. 11 digits)', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '98765432101' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('phoneNumber')
        }
    })

    it('should reject the example from the bug report: +9198765432197 (too many digits)', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '+9198765432197' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('phoneNumber')
        }
    })

    it('should reject a phone number with fewer than 10 digits', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '987654321' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('phoneNumber')
        }
    })

    it('should reject a number starting with 5 (invalid Indian mobile prefix)', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '5123456789' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('phoneNumber')
        }
    })

    it('should reject a number starting with 0 (invalid Indian mobile prefix)', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '0123456789' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('phoneNumber')
        }
    })

    it('should reject a number containing non-digit characters', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: '9876-43210' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('phoneNumber')
        }
    })

    it('should reject an alphabetic string', () => {
        const result = UserSchema.safeParse({ ...baseUser, phoneNumber: 'notanumber' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('phoneNumber')
        }
    })
})