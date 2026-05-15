'use client'

import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  endOfDay,
  format,
  getISOWeek,
  isBefore,
  isValid,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import type { Patient } from '@/schema/patient'

export type RegistrationRange = '1m' | '3m' | '6m' | '12m' | '3y' | '5y' | 'all' | 'custom'
export type RegistrationChartType = 'bar' | 'line'

type Interval = 'day' | 'week' | 'month' | 'quarter' | 'year'

const PRESET_CONFIG: Record<Exclude<RegistrationRange, 'custom'>, { label: string; months?: number; interval: Interval }> = {
  '1m': { label: 'Last 1 Month', months: 1, interval: 'month' },
  '3m': { label: 'Last 3 Months', months: 3, interval: 'month' },
  '6m': { label: 'Last 6 Months', months: 6, interval: 'month' },
  '12m': { label: 'Last 12 Months', months: 12, interval: 'month' },
  '3y': { label: 'Last 3 Years', months: 36, interval: 'quarter' },
  '5y': { label: 'Last 5 Years', months: 60, interval: 'year' },
  all: { label: 'All Time', interval: 'year' },
}

function bucketKey(date: Date, interval: Interval) {
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

function formatLabel(key: string, interval: Interval) {
  switch (interval) {
    case 'day':
      return format(new Date(key), 'dd MMM')
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

function startOfInterval(date: Date, interval: Interval) {
  switch (interval) {
    case 'day':
      return startOfDay(date)
    case 'week':
      return startOfWeek(date, { weekStartsOn: 1 })
    case 'month':
      return startOfMonth(date)
    case 'quarter':
      return startOfQuarter(date)
    default:
      return startOfYear(date)
  }
}

function addInterval(date: Date, interval: Interval, amount: number) {
  switch (interval) {
    case 'day':
      return addDays(date, amount)
    case 'week':
      return addWeeks(date, amount)
    case 'month':
      return addMonths(date, amount)
    case 'quarter':
      return addQuarters(date, amount)
    default:
      return addYears(date, amount)
  }
}

function getAdaptiveInterval(start: Date, end: Date): Interval {
  const days = differenceInCalendarDays(end, start)
  const months = differenceInCalendarMonths(end, start)
  const years = differenceInCalendarYears(end, start)

  if (days <= 30) return 'day'
  if (days <= 90) return 'week'
  if (months <= 18) return 'month'
  if (years < 5) return 'quarter'
  return 'year'
}

function getIntervalLabel(interval: Interval) {
  switch (interval) {
    case 'day':
      return 'Daily'
    case 'week':
      return 'Weekly'
    case 'month':
      return 'Monthly'
    case 'quarter':
      return 'Quarterly'
    default:
      return 'Yearly'
  }
}

export interface RegistrationPoint {
  label: string
  count: number
  key: string
}

export function useRegistrationAnalytics(patients: Patient[]) {
  const [selectedRange, setSelectedRange] = useState<RegistrationRange>('12m')
  const [chartType, setChartType] = useState<RegistrationChartType>('bar')
  const [customStartDate, setCustomStartDate] = useState<Date>(() => {
    const now = new Date()
    return addDays(startOfDay(now), -29)
  })
  const [customEndDate, setCustomEndDate] = useState<Date>(() => new Date())

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

  const customRangeValid = useMemo(
    () => isBefore(customStartDate, customEndDate),
    [customStartDate, customEndDate]
  )

  const rangeStart = useMemo(() => {
    if (selectedRange === 'custom') {
      return customRangeValid ? startOfDay(customStartDate) : null
    }

    const now = new Date()
    const config = PRESET_CONFIG[selectedRange as Exclude<RegistrationRange, 'custom'>]

    if (selectedRange === 'all') {
      if (!filteredDates.length) return startOfMonth(now)
      const earliest = filteredDates.reduce((earliest, date) => (date < earliest ? date : earliest), filteredDates[0])
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

  const currentInterval = useMemo<Interval>(() => {
    if (selectedRange === 'custom' && rangeStart && rangeEnd) {
      return getAdaptiveInterval(rangeStart, rangeEnd)
    }

    if (selectedRange === 'custom') {
      return 'day'
    }

    return PRESET_CONFIG[selectedRange as Exclude<RegistrationRange, 'custom'>].interval
  }, [rangeEnd, rangeStart, selectedRange])

  const registrationData = useMemo(() => {
    if (!filteredDates.length || !rangeStart || !rangeEnd) {
      return {
        data: [] as RegistrationPoint[],
        summary: { total: 0, peak: null as RegistrationPoint | null },
      }
    }

    const buckets: Array<{ key: string; label: string }> = []
    let cursor = startOfInterval(rangeStart, currentInterval)
    const maxCursor = startOfInterval(rangeEnd, currentInterval)

    while (cursor <= maxCursor) {
      const key = bucketKey(cursor, currentInterval)
      buckets.push({ key, label: formatLabel(key, currentInterval) })
      cursor = addInterval(cursor, currentInterval, 1)
    }

    const counts: Record<string, number> = {}
    filteredDates.forEach((date) => {
      if (date < rangeStart || date > rangeEnd) return
      const key = bucketKey(date, currentInterval)
      counts[key] = (counts[key] ?? 0) + 1
    })

    const data = buckets.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      count: counts[bucket.key] ?? 0,
    }))

    const total = data.reduce((sum, entry) => sum + entry.count, 0)
    const peak = data.reduce(
      (best, current) => (current.count > (best?.count ?? -1) ? current : best),
      null as RegistrationPoint | null
    )

    return { data, summary: { total, peak } }
  }, [currentInterval, filteredDates, rangeEnd, rangeStart])

  const averageRegistrations = useMemo(() => {
    const count = registrationData.data.length
    return count ? Math.round(registrationData.summary.total / count) : 0
  }, [registrationData])

  const trend = useMemo(() => {
    const data = registrationData.data
    if (data.length < 2) return { direction: 'flat', change: 0, percent: 0 }
    const first = data[0].count
    const last = data[data.length - 1].count
    const change = last - first
    const percent = first === 0 ? (last === 0 ? 0 : 100) : Math.round((change / first) * 100)
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
      change,
      percent,
    }
  }, [registrationData.data])

  const rangeLabel = useMemo(() => {
    if (selectedRange === 'custom') {
      return customRangeValid
        ? `${format(customStartDate, 'dd MMM yyyy')} – ${format(customEndDate, 'dd MMM yyyy')}`
        : 'Custom range'
    }

    return PRESET_CONFIG[selectedRange as Exclude<RegistrationRange, 'custom'>].label
  }, [customEndDate, customRangeValid, customStartDate, selectedRange])

  const aggregationLabel = useMemo(() => {
    if (selectedRange === 'custom') {
      return getIntervalLabel(currentInterval)
    }

    const preset = PRESET_CONFIG[selectedRange as Exclude<RegistrationRange, 'custom'>].interval
    return getIntervalLabel(preset)
  }, [currentInterval, selectedRange])

  const validationMessage = selectedRange === 'custom' && !customRangeValid ? 'Start date must be before end date.' : ''

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
    isEmpty: registrationData.data.every((entry) => entry.count === 0),
    isCustomRangeValid: customRangeValid,
    validationMessage,
  }
}
