import { dobToAgeUtil } from '../../lib/patient/dobToAge'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

describe('dobToAgeUtil', () => {
    beforeAll(() => {
        vi.useFakeTimers()

        vi.setSystemTime(new Date('2025-08-16T00:00:00Z'))
    })

    afterAll(() => {
        vi.useRealTimers()
    })

    it("returns 'N/A' if dob is undefined", () => {
        expect(dobToAgeUtil(undefined)).toBe('N/A')
    })

    it("returns 'Invalid' for malformed dob", () => {
        expect(dobToAgeUtil('12-13')).toBe('Invalid date')
        expect(dobToAgeUtil('abc-def-ghi')).toBe('Invalid date')
    })

    it("returns 'Invalid date' for impossible dates", () => {
        expect(dobToAgeUtil('32-01-2020')).toBe('Invalid date')
        expect(dobToAgeUtil('00-01-2020')).toBe('Invalid date')
        expect(dobToAgeUtil('01-13-2020')).toBe('Invalid date')
        expect(dobToAgeUtil('01-00-2020')).toBe('Invalid date')
    })

    it('returns years for age >= 1 year', () => {
        expect(dobToAgeUtil('01-06-2023')).toBe('2 yrs')
        expect(dobToAgeUtil('31-05-2020')).toBe('5 yrs')
        expect(dobToAgeUtil('01-01-2000')).toBe('25 yrs')
    })

    it('returns months for age < 1 year and >= 1 month', () => {
        expect(dobToAgeUtil('01-07-2025')).toBe('1 month')
        expect(dobToAgeUtil('01-06-2025')).toBe('2 months')
        expect(dobToAgeUtil('13-05-2025')).toBe('3 months')
        expect(dobToAgeUtil('01-03-2025')).toBe('5 months')
    })

    it("returns '<1 month' for age less than 1 month", () => {
        expect(dobToAgeUtil('17-07-2025')).toBe('<1 month')
        expect(dobToAgeUtil('31-07-2025')).toBe('<1 month')
        expect(dobToAgeUtil('01-08-2025')).toBe('<1 month')
    })

    it('handles various alternative resilient date formats gracefully', () => {
        expect(dobToAgeUtil('2023-06-01')).toBe('2 yrs')
        expect(dobToAgeUtil('01/06/2023')).toBe('2 yrs')
        expect(dobToAgeUtil('2023/06/01')).toBe('2 yrs')
        expect(dobToAgeUtil('06/28/2023')).toBe('2 yrs')
        expect(dobToAgeUtil('2023-06-01T00:00:00Z')).toBe('2 yrs')
        expect(dobToAgeUtil('Thu Jun 01 2023 00:00:00 GMT+0000')).toBe('2 yrs')
    })
})
