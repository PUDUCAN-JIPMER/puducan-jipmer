import { formatDobToDDMMYYYY } from '../../lib/patient/dateFormatter'
import { describe, it, expect } from 'vitest'

describe('formatDobToDDMMYYYY', () => {
    it('returns empty string if dob is empty', () => {
        expect(formatDobToDDMMYYYY('')).toBe('')
    })

    it('returns "Invalid Date" for invalid formats or values', () => {
        expect(formatDobToDDMMYYYY('12-13')).toBe('Invalid Date')
        expect(formatDobToDDMMYYYY('abc-def-ghi')).toBe('Invalid Date')
        expect(formatDobToDDMMYYYY('32-01-2020')).toBe('Invalid Date')
        expect(formatDobToDDMMYYYY('31-04-2020')).toBe('Invalid Date')
    })

    it('successfully formats standard and alternative valid date formats', () => {
        expect(formatDobToDDMMYYYY('01-06-2023')).toBe('01-06-2023')
        expect(formatDobToDDMMYYYY('2023-06-01')).toBe('01-06-2023')
        expect(formatDobToDDMMYYYY('01/06/2023')).toBe('01-06-2023')
        expect(formatDobToDDMMYYYY('2023/06/01')).toBe('01-06-2023')
        expect(formatDobToDDMMYYYY('06/28/2023')).toBe('28-06-2023')
        expect(formatDobToDDMMYYYY('2023-06-01T00:00:00Z')).toBe('01-06-2023')
        expect(formatDobToDDMMYYYY('Thu Jun 01 2023 00:00:00 GMT+0000')).toBe('01-06-2023')
    })
})
