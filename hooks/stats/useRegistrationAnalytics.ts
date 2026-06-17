'use client'

import { useMemo, useState } from 'react'
import { addDays, addMonths, endOfDay, format, isBefore, isValid, startOfDay, startOfMonth } from 'date-fns'
import type { Patient } from '@/schema/patient'
import {
  bucketKey,
  computeTrend,
  generateBuckets,
  getAdaptiveInterval,
  getIntervalLabel,
  type Interval,
  type RegistrationPoint,
} from '@/lib/analytics/analyticsUtils'

export type RegistrationRange = '1m' | '3m' | '6m' | '12m' | '3y' | '5y' | 'all' | 'custom'
export type RegistrationChartType = 'bar' | 'line'

// Re-export so existing imports of RegistrationPoint from this file still work.
export type { RegistrationPoint } from '@/lib/analytics/analyticsUtils'

const PRESET_CONFIG: Record<
  Exclude<RegistrationRange, 'custom'>,
  { label: string; months?: number; interval: Interval }
> = {
  '1m': { label: 'Last 1 Month', months: 1, interval: 'month' },
  '3m': { label: 'Last 3 Months', months: 3, interval: 'month' },
  '6m': { label: 'Last 6 Months', months: 6, interval: 'month' },
  '12m': { label: 'Last 12 Months', months: 12, interval: 'month' },
  '3y': { label: 'Last 3 Years', months: 36, interval: 'quarter' },
  '5y': { label: 'Last 5 Years', months: 60, interval: 'year' },
  all: { label: 'All Time', interval: 'year' },
}

export function useRegistrationAnalytics(patients: Patient[] = []) {
  const [selectedRange, setSelectedRange] = useState<RegistrationRange>('12m')
  const [chartType, setChartType] = useState<RegistrationChartType>('bar')
  const [customStartDate, setCustomStartDate] = useState<Date>(() =>
    addDays(startOfDay(new Date()), -29),
  )
  const [customEndDate, setCustomEndDate] = useState<Date>(() => new Date())

  // ── Derive valid registration dates from patient records ──────────────────
  const filteredDates = useMemo(() => {
    return patients
      .map((patient) => {
        const raw = patient.hospitalRegistrationDate
        if (!raw) return null
        const date = new Date(raw)
        return isValid(date) ? date : null
      })
      .filter((date): date is Date => date !== null)
  }, [patients])

  // ── Custom range validity ─────────────────────────────────────────────────
  const customRangeValid = useMemo(
    () => isBefore(customStartDate, customEndDate),
    [customStartDate, customEndDate],
  )

  // ── Compute window boundaries ─────────────────────────────────────────────
  const rangeStart = useMemo(() => {
    if (selectedRange === 'custom') {
      return customRangeValid ? startOfDay(customStartDate) : null
    }

    const now = new Date()
    const config = PRESET_CONFIG[selectedRange as Exclude<RegistrationRange, 'custom'>]

    if (selectedRange === 'all') {
      if (!filteredDates.length) return startOfMonth(now)
      const earliest = filteredDates.reduce(
        (acc, date) => (date < acc ? date : acc),
        filteredDates[0],
      )
      return startOfMonth(earliest)
    }

    return startOfMonth(addMonths(startOfMonth(now), -((config.months ?? 0) - 1)))
  }, [customRangeValid, customStartDate, filteredDates, selectedRange])

  const rangeEnd = useMemo(() => {
    if (selectedRange === 'custom') {
      return customRangeValid ? endOfDay(customEndDate) : null
    }
    return endOfDay(new Date())
  }, [customEndDate, customRangeValid, selectedRange])

  // ── Select bucket granularity ─────────────────────────────────────────────
  const currentInterval = useMemo<Interval>(() => {
    if (selectedRange === 'custom') {
      return rangeStart && rangeEnd ? getAdaptiveInterval(rangeStart, rangeEnd) : 'day'
    }
    return PRESET_CONFIG[selectedRange as Exclude<RegistrationRange, 'custom'>].interval
  }, [rangeEnd, rangeStart, selectedRange])

  // ── Build bucketed registration counts ───────────────────────────────────
  const registrationData = useMemo(() => {
    const empty = {
      data: [] as RegistrationPoint[],
      summary: { total: 0, peak: null as RegistrationPoint | null },
    }

    if (!rangeStart || !rangeEnd) return empty

    // Generate all interval buckets across the selected window.
    const buckets = generateBuckets(rangeStart, rangeEnd, currentInterval)

    // Aggregate patient counts into the appropriate bucket.
    const counts: Record<string, number> = {}
    filteredDates.forEach((date) => {
      if (date < rangeStart || date > rangeEnd) return
      const key = bucketKey(date, currentInterval)
      counts[key] = (counts[key] ?? 0) + 1
    })

    // Merge bucket descriptors with their counts (defaulting to 0).
    const data: RegistrationPoint[] = buckets.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      count: counts[bucket.key] ?? 0,
    }))

    const total = data.reduce((sum, entry) => sum + entry.count, 0)
    const peak = data.reduce(
      (best, current) => (current.count > (best?.count ?? -1) ? current : best),
      null as RegistrationPoint | null,
    )

    return { data, summary: { total, peak } }
  }, [currentInterval, filteredDates, rangeEnd, rangeStart])

  // ── Derived summary metrics ────────────────────────────────────────────────
  const averageRegistrations = useMemo(() => {
    const count = registrationData.data.length
    return count > 0 ? Math.round(registrationData.summary.total / count) : 0
  }, [registrationData])

  /**
   * Trend uses half-aggregation (via computeTrend) instead of a naive
   * first-vs-last bucket comparison, making it robust against single-bucket
   * outliers at either end of the dataset.
   */
  const trend = useMemo(
    () => computeTrend(registrationData.data),
    [registrationData.data],
  )

  // ── Display labels ────────────────────────────────────────────────────────
  const rangeLabel = useMemo(() => {
    if (selectedRange === 'custom') {
      return customRangeValid
        ? `${format(customStartDate, 'dd MMM yyyy')} – ${format(customEndDate, 'dd MMM yyyy')}`
        : 'Custom range'
    }
    return PRESET_CONFIG[selectedRange as Exclude<RegistrationRange, 'custom'>].label
  }, [customEndDate, customRangeValid, customStartDate, selectedRange])

  const aggregationLabel = useMemo(() => {
    if (selectedRange === 'custom') return getIntervalLabel(currentInterval)
    const preset = PRESET_CONFIG[selectedRange as Exclude<RegistrationRange, 'custom'>].interval
    return getIntervalLabel(preset)
  }, [currentInterval, selectedRange])

  // ── isEmpty: explicit length guard prevents empty arrays from being
  //    treated as valid non-empty analytics with no activity. ────────────────
  const isEmpty =
    registrationData.data.length === 0 ||
    registrationData.data.every((entry) => entry.count === 0)

  const validationMessage =
    selectedRange === 'custom' && !customRangeValid
      ? 'Start date must be before end date.'
      : ''

  return {
    selectedRange,
    setSelectedRange,
    chartType,
    setChartType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    rangeLabel,
    aggregationLabel,
    chartData: registrationData.data,
    totalRegistrations: registrationData.summary.total,
    peakPeriod: registrationData.summary.peak,
    averageRegistrations,
    trend,
    isEmpty,
    isCustomRangeValid: customRangeValid,
    validationMessage,
  }
}
