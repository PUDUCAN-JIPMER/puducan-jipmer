import { describe, it, expect } from 'vitest'
import { PatientSchema } from '@/schema/patient'

describe('PatientSchema - caregiverName field validation', () => {
    it('should pass when caregiverName is empty string', () => {
        const result = PatientSchema.safeParse({
            name: 'John Doe',
            caregiverName: '',
            sex: 'male',
            dob: '1990-01-01',
            address: 'Some address',
            hasAadhaar: true,
            assignedHospital: { id: 'h1', name: 'Test Hospital' },
        })

        expect(result.success).toBe(true)
    })

    it('should fail when caregiverName exceeds 100 characters', () => {
        const longName = 'b'.repeat(101)
        const result = PatientSchema.safeParse({
            name: 'John Doe',
            caregiverName: longName, // ❌ too long
            sex: 'male',
            dob: '1990-01-01',
            address: 'Some address',
            assignedHospital: { id: 'h1', name: 'Test Hospital' },
            hasAadhaar: true,
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Name length can\'t exceed 100 characters")
            expect(result.error.issues[0].path).toContain('caregiverName')
        }
    })

    it('should pass when caregiverName is valid', () => {
        const result = PatientSchema.safeParse({
            name: 'John Doe',
            caregiverName: 'Jane Doe', // ✅ valid
            sex: 'male',
            dob: '1990-01-01',
            address: 'Some address',
            assignedHospital: { id: 'h1', name: 'Test Hospital' },
            hasAadhaar: true,
        })

        expect(result.success).toBe(true)
    })
})
