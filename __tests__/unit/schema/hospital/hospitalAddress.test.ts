import { describe, it, expect } from 'vitest'
import { HospitalSchema } from '@/schema/hospital'

describe('HospitalSchema - address field validation', () => {
    it('should fail when address is empty', () => {
        const result = HospitalSchema.safeParse({
            name: 'Test Hospital',
            address: '', // ❌ empty
            contactNumber: '+919876543210',
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Address is required.')
            expect(result.error.issues[0].path).toContain('address')
        }
    })

    it('should fail when address is only numbers', () => {
        const result = HospitalSchema.safeParse({
            name: 'Test Hospital',
            address: '12345', // ❌ only numbers
            contactNumber: '+919876543210',
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Address cannot be only numbers')
            expect(result.error.issues[0].path).toContain('address')
        }
    })

    it('should pass when address is valid', () => {
        const result = HospitalSchema.safeParse({
            name: 'Test Hospital',
            address: '123 Main Street, New Delhi', // ✅ valid
            contactNumber: '+919876543210',
        })

        expect(result.success).toBe(true)
    })
})
