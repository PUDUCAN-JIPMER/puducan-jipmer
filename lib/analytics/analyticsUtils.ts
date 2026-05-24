/**
 * analyticsUtils.ts
 *
 * Reusable, pure utility functions for analytics computation.
 * Organised into four responsibilities:
 *
 *   1. Constants
 *   2. Shared types
 *   3. Formatting   – bucket keys → human-readable labels
 *   4. Aggregation  – interval arithmetic + bucket generation
 *   5. Trend        – half-aggregation trend computation
 */

import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  format,
  getISOWeek,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns'

// ── 1. Constants ───────────────────────────────────────────────────────────────

/** Maximum number of items shown in ranked analytics lists (e.g. top diseases). */
export const MAX_ANALYTICS_ITEMS = 10

/**
 * Hard upper bound on generated buckets per computation.
 * Guards against infinite loops from malformed date ranges.
 */
const MAX_BUCKETS = 500

// ── 2. Types ───────────────────────────────────────────────────────────────────

export type Interval = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface RegistrationPoint {
  key: string
  label: string
  count: number
}

export interface TrendResult {
  direction: 'up' | 'down' | 'flat'
  /** Rounded difference between the average of the second half and the first half. */
  change: number
  /** Percentage change relative to the first-half average. */
  percent: number
}

// ── 3. Formatting ──────────────────────────────────────────────────────────────

/**
 * Returns a stable string key for the bucket that contains `date`
 * when grouped by `interval`.
 */
export function bucketKey(date: Date, interval: Interval): string {
  switch (interval) {
    case 'day':
      return format(startOfDay(date), 'yyyy-MM-dd')
    case 'week':
      return `${format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy')}-W${getISOWeek(date)}`
    case 'month':
      return format(startOfMonth(date), 'yyyy-MM')
    case 'quarter': {
      const quarter = Math.floor(date.getMonth() / 3) + 1
      return `${format(date, 'yyyy')}-Q${quarter}`
    }
    default:
      return format(date, 'yyyy')
  }
}

/**
 * Converts a bucket key back to a human-readable axis label.
 *
 * Note: day keys use `T00:00:00` to parse in local time and avoid
 * off-by-one day errors in timezones west of UTC.
 */
export function formatLabel(key: string, interval: Interval): string {
  switch (interval) {
    case 'day':
      return format(new Date(`${key}T00:00:00`), 'dd MMM')
    case 'week': {
      const [year, week] = key.split('-W')
      return `W${week} ${year}`
    }
    case 'month': {
      const [year, month] = key.split('-')
      return format(new Date(Number(year), Number(month) - 1, 1), 'MMM yyyy')
    }
    case 'quarter': {
      const [year, quarter] = key.split('-Q')
      return `Q${quarter} ${year}`
    }
    default:
      return key
  }
}

/** Returns a display name for the given interval granularity. */
export function getIntervalLabel(interval: Interval): string {
  switch (interval) {
    case 'day':     return 'Daily'
    case 'week':    return 'Weekly'
    case 'month':   return 'Monthly'
    case 'quarter': return 'Quarterly'
    default:        return 'Yearly'
  }
}

// ── 4. Aggregation ─────────────────────────────────────────────────────────────

/** Returns the start boundary of the interval period containing `date`. */
export function startOfInterval(date: Date, interval: Interval): Date {
  switch (interval) {
    case 'day':     return startOfDay(date)
    case 'week':    return startOfWeek(date, { weekStartsOn: 1 })
    case 'month':   return startOfMonth(date)
    case 'quarter': return startOfQuarter(date)
    default:        return startOfYear(date)
  }
}

/** Advances `date` forward by `amount` intervals. */
export function addInterval(date: Date, interval: Interval, amount: number): Date {
  switch (interval) {
    case 'day':     return addDays(date, amount)
    case 'week':    return addWeeks(date, amount)
    case 'month':   return addMonths(date, amount)
    case 'quarter': return addQuarters(date, amount)
    default:        return addYears(date, amount)
  }
}

/**
 * Picks the most appropriate interval granularity for the given date span,
 * so charts remain readable regardless of the selected range.
 */
export function getAdaptiveInterval(start: Date, end: Date): Interval {
  const days   = differenceInCalendarDays(end, start)
  const months = differenceInCalendarMonths(end, start)
  const years  = differenceInCalendarYears(end, start)

  if (days   <= 30) return 'day'
  if (days   <= 90) return 'week'
  if (months <= 18) return 'month'
  if (years  < 5)   return 'quarter'
  return 'year'
}

/**
 * Generates an ordered list of `{ key, label }` bucket descriptors spanning
 * from `rangeStart` to `rangeEnd` at the requested `interval` granularity.
 *
 * Edge cases handled:
 *  - Returns `[]` when the range is empty or invalid.
 *  - Caps output at MAX_BUCKETS to protect against degenerate inputs.
 *  - Partial final intervals (e.g. current month not yet complete) are
 *    included so recent data is never silently omitted.
 */
export function generateBuckets(
  rangeStart: Date,
  rangeEnd: Date,
  interval: Interval,
): Array<{ key: string; label: string }> {
  if (!rangeStart || !rangeEnd || rangeEnd <= rangeStart) return []

  const buckets: Array<{ key: string; label: string }> = []
  let cursor = startOfInterval(rangeStart, interval)
  const maxCursor = startOfInterval(rangeEnd, interval)

  while (cursor <= maxCursor && buckets.length < MAX_BUCKETS) {
    const key = bucketKey(cursor, interval)
    buckets.push({ key, label: formatLabel(key, interval) })
    cursor = addInterval(cursor, interval, 1)
  }

  return buckets
}

// ── 5. Trend Analysis ──────────────────────────────────────────────────────────

/**
 * Computes the trend direction and magnitude for a registration time series.
 *
 * **Algorithm: aggregated halves**
 * The data is split into a first half and a second half. The average count
 * of each half is compared, producing a smoothed signal that is far more
 * stable than a naive first-vs-last bucket comparison.
 *
 * Benefits over first/last comparison:
 *  - Resistant to single-bucket spikes or troughs at either end.
 *  - Accurately represents datasets that fluctuate mid-range.
 *  - Degrades gracefully on sparse or partial-interval datasets.
 *
 * Edge cases:
 *  - Fewer than 2 data points → always returns `flat`.
 *  - All-zero first half with non-zero second half → 100 % increase.
 *  - All-zero both halves → 0 % change, `flat`.
 */
export function computeTrend(data: RegistrationPoint[]): TrendResult {
  if (data.length < 2) return { direction: 'flat', change: 0, percent: 0 }

  const mid        = Math.floor(data.length / 2)
  const firstHalf  = data.slice(0, mid)
  const secondHalf = data.slice(mid)

  const avgFirst  = firstHalf.reduce((s, e) => s + e.count, 0)  / (firstHalf.length  || 1)
  const avgSecond = secondHalf.reduce((s, e) => s + e.count, 0) / (secondHalf.length || 1)

  const rawChange = avgSecond - avgFirst
  const percent   =
    avgFirst === 0
      ? avgSecond === 0 ? 0 : 100
      : Math.round((rawChange / avgFirst) * 100)

  return {
    direction: rawChange > 0 ? 'up' : rawChange < 0 ? 'down' : 'flat',
    change:    Math.round(rawChange),
    percent,
  }
}
