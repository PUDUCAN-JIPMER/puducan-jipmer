'use client'

import React from 'react'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { AnalyticsCard } from './AnalyticsCard'
import { AnalyticsToolbar } from './AnalyticsToolbar'
import { ChartTypeToggle } from './ChartTypeToggle'
import { AnalyticsSummaryCard } from './AnalyticsSummaryCard'
import { EmptyAnalyticsState } from './EmptyAnalyticsState'
import { useRegistrationAnalytics } from '@/hooks/stats/useRegistrationAnalytics'
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, TrendingUp } from 'lucide-react'
import type { Patient } from '@/schema/patient'

interface RegistrationAnalyticsProps {
  patients: Patient[]
}

export function RegistrationAnalytics({ patients }: RegistrationAnalyticsProps) {
  const {
    selectedRange,
    setSelectedRange,
    chartType,
    setChartType,
    customStartDate,
    customEndDate,
    setCustomStartDate,
    setCustomEndDate,
    rangeLabel,
    aggregationLabel,
    chartData,
    totalRegistrations,
    peakPeriod,
    isEmpty,
    averageRegistrations,
    trend,
    isCustomRangeValid,
    validationMessage,
  } = useRegistrationAnalytics(patients)

  const [pickerOpen, setPickerOpen] = React.useState(false)

  return (
    <AnalyticsCard
      title="Registration Analytics"
      description={`${rangeLabel} • ${aggregationLabel}`}
      action={
        <ChartTypeToggle value={chartType} onChange={setChartType} />
      }
      className="col-span-full"
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Registration trend overview with custom and preset interval support.</p>
          <p className="mt-2 text-xs text-slate-500">Choose a quick range or pick a custom window to inspect how registrations evolve.</p>
        </div>
        <AnalyticsToolbar
          selectedRange={selectedRange}
          onSelectRange={setSelectedRange}
          chartType={chartType}
          onChartTypeChange={setChartType}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          pickerOpen={pickerOpen}
          onPickerOpenChange={setPickerOpen}
          onApplyCustom={(start, end) => {
            setCustomStartDate(start)
            setCustomEndDate(end)
            setSelectedRange('custom')
          }}
          showChartToggle={false}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        <AnalyticsSummaryCard
          title="Total registrations"
          value={totalRegistrations}
          detail={`${aggregationLabel} totals across selected range`}
          icon={BarChart3}
        />
        <AnalyticsSummaryCard
          title="Peak period"
          value={peakPeriod?.label ?? 'No data'}
          detail={peakPeriod ? `${peakPeriod.count} registrations` : 'Expand the range to reveal peaks'}
          icon={TrendingUp}
        />
        <AnalyticsSummaryCard
          title="Average per interval"
          value={averageRegistrations}
          detail={`Average ${aggregationLabel.toLowerCase()} registrations`}
          icon={CalendarDays}
        />
        <AnalyticsSummaryCard
          title="Trend"
          value={trend.direction === 'flat' ? 'Stable' : trend.direction === 'up' ? 'Growing' : 'Declining'}
          detail={`${trend.percent}% ${trend.direction === 'flat' ? 'change' : trend.direction === 'up' ? 'increase' : 'decrease'}`}
          icon={trend.direction === 'up' ? ArrowUpRight : trend.direction === 'down' ? ArrowDownRight : Activity}
          tone={trend.direction === 'up' ? 'positive' : trend.direction === 'down' ? 'negative' : 'default'}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-background p-4 shadow-sm">
        {selectedRange === 'custom' && !isCustomRangeValid ? (
          <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-3xl border border-destructive/10 bg-destructive/5 p-8 text-center text-sm text-destructive">
            <p className="text-base font-semibold">Invalid custom range</p>
            <p className="max-w-md text-sm text-slate-600">{validationMessage}</p>
            <button
              type="button"
              className="mt-3 rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90"
              onClick={() => setPickerOpen(true)}
            >
              Choose valid dates
            </button>
          </div>
        ) : isEmpty ? (
          <EmptyAnalyticsState onTryAnotherRange={() => setPickerOpen(true)} />
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={64} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [value as number, 'Registrations']} />
                <Bar dataKey="count" name="Registrations" fill="#22c55e" radius={[12, 12, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={64} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [value as number, 'Registrations']} />
                <Line type="monotone" dataKey="count" name="Registrations" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </AnalyticsCard>
  )
}
