/**
 * fuzzy.ts — Levenshtein-based string similarity for name fuzzy matching.
 *
 * Used by the duplicate detection system to catch name variants that refer
 * to the same person despite minor typos or transliteration differences:
 *   "Abdul Rahman" ≈ "Abdul Rehman"   → similarity 0.92  (flag)
 *   "Meena Santhosh" ≈ "Meena Santhoch" → similarity 0.93 (flag)
 *   "Rajesh Kumar" ≈ "Suresh Raina"   → similarity 0.48  (skip)
 *
 * All functions are pure and have no side effects — safe to use in tests.
 */

/**
 * Computes the Levenshtein edit distance between two strings.
 * Returns the minimum number of single-character edits (insertions,
 * deletions, substitutions) to transform `a` into `b`.
 *
 * Time: O(m × n)   Space: O(m × n)
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length

  // Allocate matrix of size (m+1) × (n+1)
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => {
      if (i === 0) return j  // empty prefix of a → j insertions
      if (j === 0) return i  // empty prefix of b → i deletions
      return 0
    }),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j],     // deletion
            dp[i][j - 1],     // insertion
            dp[i - 1][j - 1], // substitution
          )
      }
    }
  }

  return dp[m][n]
}

/**
 * Returns a normalised similarity score in [0.0, 1.0].
 *   1.0  → identical strings
 *   0.0  → completely different strings
 *
 * Comparison is case-insensitive and trims surrounding whitespace.
 */
export function stringSimilarity(a: string, b: string): number {
  const aNorm = a.toLowerCase().trim()
  const bNorm = b.toLowerCase().trim()

  if (aNorm === bNorm) return 1.0
  if (aNorm.length === 0 || bNorm.length === 0) return 0.0

  const distance = levenshteinDistance(aNorm, bNorm)
  const maxLength = Math.max(aNorm.length, bNorm.length)
  return 1 - distance / maxLength
}

/**
 * Returns `true` if the two patient names are similar enough (>= threshold)
 * to be flagged as a potential duplicate match.
 */
export function namesAreSimilar(a: string, b: string, threshold: number): boolean {
  return stringSimilarity(a, b) >= threshold
}
