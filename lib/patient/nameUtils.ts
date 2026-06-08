export function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length
    const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    )
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]
}

export function nameSimilarity(a: string, b: string): number {
    const ca = a.toLowerCase().trim()
    const cb = b.toLowerCase().trim()
    if (ca === cb) return 1
    const maxLen = Math.max(ca.length, cb.length)
    return maxLen === 0 ? 1 : 1 - levenshtein(ca, cb) / maxLen
}