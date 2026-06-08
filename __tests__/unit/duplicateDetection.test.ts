// __tests__/duplicateDetection.test.ts
// Run with: pnpm vitest run __tests__/duplicateDetection.test.ts

import { describe, it, expect } from 'vitest'
import { levenshtein, nameSimilarity } from '@/lib/patient/nameUtils'

// ─── levenshtein ──────────────────────────────────────────────────────────────

describe('levenshtein', () => {
    it('returns 0 for identical strings', () => {
        expect(levenshtein('meena devi', 'meena devi')).toBe(0)
    })

    it('returns 1 for a single missing letter (Murgan vs Murugan)', () => {
        expect(levenshtein('murgan', 'murugan')).toBe(1)
    })

    it('returns 1 for a trailing space', () => {
        expect(levenshtein('meena devi', 'meena devi ')).toBe(1)
    })

    it('returns 1 for a single substitution', () => {
        expect(levenshtein('meena', 'reena')).toBe(1)
    })

    it('handles completely different strings', () => {
        expect(levenshtein('abc', 'xyz')).toBe(3)
    })

    it('handles empty strings', () => {
        expect(levenshtein('', '')).toBe(0)
        expect(levenshtein('abc', '')).toBe(3)
        expect(levenshtein('', 'abc')).toBe(3)
    })
})

// ─── nameSimilarity ───────────────────────────────────────────────────────────

describe('nameSimilarity', () => {
    it('returns 1.0 for identical names', () => {
        expect(nameSimilarity('Rajeshwari Murugan', 'Rajeshwari Murugan')).toBe(1)
    })

    it('returns 1.0 for identical names regardless of case', () => {
        expect(nameSimilarity('MEENA DEVI', 'meena devi')).toBe(1)
    })

    it('returns 1.0 for names with leading/trailing spaces', () => {
        expect(nameSimilarity('Meena Devi ', ' Meena Devi')).toBe(1)
    })

    it('scores Rajeshwari Murgan vs Rajeshwari Murugan above 0.85 (one letter typo)', () => {
        const score = nameSimilarity('Rajeshwari Murgan', 'Rajeshwari Murugan')
        expect(score).toBeGreaterThanOrEqual(0.85)
    })

    it('scores Meena D. vs Meena Devi below 0.85 (abbreviated — should NOT auto-flag)', () => {
        const score = nameSimilarity('Meena D.', 'Meena Devi')
        expect(score).toBeLessThan(0.85)
    })

    it('scores completely different names below 0.85', () => {
        const score = nameSimilarity('Rajeshwari Murugan', 'Sunita Kumari')
        expect(score).toBeLessThan(0.85)
    })

    it('scores common name variants correctly — Meena Devi vs Meena Devi (trailing space)', () => {
        const score = nameSimilarity('Meena Devi', 'Meena Devi ')
        expect(score).toBe(1) // trailing space is normalised away
    })
})

// ─── Threshold behaviour ──────────────────────────────────────────────────────
// These tests verify the 0.85 threshold works as intended for the registry use case.

describe('threshold edge cases', () => {
    it('flags Rajeshwari Murgan (1 letter missing) — should be caught', () => {
        const score = nameSimilarity('Rajeshwari Murgan', 'Rajeshwari Murugan')
        expect(score).toBeGreaterThanOrEqual(0.85)
    })

    it('does NOT flag Meena Devi vs Kavitha Devi — common surname, different person', () => {
        const score = nameSimilarity('Meena Devi', 'Kavitha Devi')
        expect(score).toBeLessThan(0.85)
    })

    it('flags Priya Krishnan vs Priya Krishan (1 letter missing)', () => {
        const score = nameSimilarity('Priya Krishnan', 'Priya Krishan')
        expect(score).toBeGreaterThanOrEqual(0.85)
    })

    it('does NOT flag completely different names', () => {
        const score = nameSimilarity('Anbu Selvi', 'Rajeshwari Murugan')
        expect(score).toBeLessThan(0.85)
    })
})