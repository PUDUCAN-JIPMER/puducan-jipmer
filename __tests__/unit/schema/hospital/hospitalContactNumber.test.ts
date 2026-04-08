import { describe, it, expect } from 'vitest'
import { HospitalSchema } from '@/schema/hospital'

describe('HospitalSchema - contactNumber field validation', () => {
    it('should pass when contactNumber is optional and empty', () => {
        const result = HospitalSchema.safeParse({
            name: 'Test Hospital',
            address: '123 Main Street',
            // contactNumber omitted ✅ optional
        })

        expect(result.success).toBe(true)
    })

    it('should fail when contactNumber format is invalid', () => {
        const result = HospitalSchema.safeParse({
            name: 'Test Hospital',
            address: '123 Main Street',
            contactNumber: '9876543210', // ❌ missing +91
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('contactNumber')
        }
    })

    it('should pass when contactNumber is valid with +91', () => {
        const result = HospitalSchema.safeParse({
            name: 'Test Hospital',
            address: '123 Main Street',
            contactNumber: '+919876543210', // ✅ valid
        })

        expect(result.success).toBe(true)
    })

    it('should pass when contactNumber is valid with 91', () => {
        const result = HospitalSchema.safeParse({
            name: 'Test Hospital',
            address: '123 Main Street',
            contactNumber: '919876543210', // ✅ valid
        })

        expect(result.success).toBe(true)
    })
})
