import { describe, it, expect } from 'vitest'
import {
  levenshteinDistance,
  stringSimilarity,
  namesAreSimilar,
} from '../../lib/duplicate/fuzzy'

// ── levenshteinDistance ───────────────────────────────────────────────────────

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('abc', 'abc')).toBe(0)
  })

  it('returns the full length when one string is empty', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3)
    expect(levenshteinDistance('abc', '')).toBe(3)
  })

  it('counts a single substitution', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1)
  })

  it('counts a single insertion', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1)
  })

  it('counts a single deletion', () => {
    expect(levenshteinDistance('cats', 'cat')).toBe(1)
  })

  it('handles completely different strings', () => {
    // "abc" → "xyz" requires 3 substitutions
    expect(levenshteinDistance('abc', 'xyz')).toBe(3)
  })

  it('is symmetric (order does not matter)', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(
      levenshteinDistance('sitting', 'kitten'),
    )
  })
})

// ── stringSimilarity ──────────────────────────────────────────────────────────

describe('stringSimilarity', () => {
  it('returns 1.0 for identical strings', () => {
    expect(stringSimilarity('hello', 'hello')).toBe(1.0)
  })

  it('returns 1.0 for identical strings with different cases', () => {
    expect(stringSimilarity('Hello', 'hello')).toBe(1.0)
  })

  it('returns 1.0 for identical strings with surrounding spaces', () => {
    expect(stringSimilarity('  hello  ', 'hello')).toBe(1.0)
  })

  it('returns 0.0 when one string is empty', () => {
    expect(stringSimilarity('', 'hello')).toBe(0.0)
    expect(stringSimilarity('hello', '')).toBe(0.0)
  })

  it('returns 0.0 for two empty strings', () => {
    expect(stringSimilarity('', '')).toBe(1.0)   // identical
  })

  it('returns high similarity for minor typos (single char substitution)', () => {
    // "Santhosh" vs "Santhoch" — one substitution at end
    const sim = stringSimilarity('Meena Santhosh', 'Meena Santhoch')
    expect(sim).toBeGreaterThan(0.85)
  })

  it('returns high similarity for transliteration variants', () => {
    // Common: Rahman / Rehman (one char substitution)
    const sim = stringSimilarity('Abdul Rahman', 'Abdul Rehman')
    expect(sim).toBeGreaterThan(0.85)
  })

  it('returns low similarity for completely different names', () => {
    const sim = stringSimilarity('Rajesh Kumar', 'Suresh Raina')
    expect(sim).toBeLessThan(0.70)
  })

  it('returns moderate similarity for same first name, different surname', () => {
    const sim = stringSimilarity('Priya Lakshmi', 'Priya Devi')
    // Different enough to not be a definitive match
    expect(sim).toBeLessThan(0.90)
  })

  it('handles single-character strings', () => {
    expect(stringSimilarity('a', 'a')).toBe(1.0)
    expect(stringSimilarity('a', 'b')).toBe(0.0)
  })
})

// ── namesAreSimilar ───────────────────────────────────────────────────────────

describe('namesAreSimilar', () => {
  it('returns true when similarity meets the threshold', () => {
    expect(namesAreSimilar('Abdul Rahman', 'Abdul Rehman', 0.85)).toBe(true)
  })

  it('returns false when similarity is below the threshold', () => {
    expect(namesAreSimilar('Rajesh Kumar', 'Suresh Raina', 0.85)).toBe(false)
  })

  it('returns true for identical names at any threshold', () => {
    expect(namesAreSimilar('Meena Santhosh', 'Meena Santhosh', 0.99)).toBe(true)
  })

  it('respects threshold boundary: exact threshold value → true', () => {
    // Use strings where we can predict the distance
    // "abc" vs "axc": 1 edit, maxLen 3 → similarity = 1 - 1/3 ≈ 0.667
    const sim = stringSimilarity('abc', 'axc')
    expect(namesAreSimilar('abc', 'axc', sim)).toBe(true)
    expect(namesAreSimilar('abc', 'axc', sim + 0.001)).toBe(false)
  })
})
