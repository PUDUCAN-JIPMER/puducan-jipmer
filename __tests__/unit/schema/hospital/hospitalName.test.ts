import { describe, it, expect } from 'vitest'
import { HospitalSchema } from '@/schema/hospital'

describe('HospitalSchema - name field validation', () => {
    it('should fail when name is empty', () => {
        const result = HospitalSchema.safeParse({
            name: '', // ❌ empty
            address: '123 Main Street',
            contactNumber: '+919876543210',
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Hospital name is required.')
            expect(result.error.issues[0].path).toContain('name')
        }
    })

    it('should fail when name contains invalid characters', () => {
        const result = HospitalSchema.safeParse({
            name: 'Hospital@123', // ❌ invalid characters
            address: '123 Main Street',
            contactNumber: '+919876543210',
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].path).toContain('name')
        }
    })

    it('should pass when name is valid', () => {
        const result = HospitalSchema.safeParse({
            name: 'St. Mary\'s Hospital - Main', // ✅ valid
            address: '123 Main Street',
            contactNumber: '+919876543210',
        })

        expect(result.success).toBe(true)
    })

    it('should fail when name is whitespace', () => {
        const result = HospitalSchema.safeParse({
            name: "     ", // empty space
            address: "123 addressville",
            contactNumber: "911234512345" // 10 digits followed by 91 or +91
        })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Hospital name is required.')
            expect(result.error.issues[0].path).toContain('name')
        }

    })
})
