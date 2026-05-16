'use client'

import { QuickTimelineFilters } from './TimeRangeFilter'
import { CustomDateRangePicker } from './CustomDateRangePicker'
import { ChartTypeToggle } from './ChartTypeToggle'
import type { RegistrationRange, RegistrationChartType } from '@/hooks/stats/useRegistrationAnalytics'

interface AnalyticsToolbarProps {
  selectedRange: RegistrationRange
  onSelectRange: (range: RegistrationRange) => void
  chartType: RegistrationChartType
  onChartTypeChange: (chartType: RegistrationChartType) => void
  customStartDate: Date | null
  customEndDate: Date | null
  pickerOpen: boolean
  onPickerOpenChange: (open: boolean) => void
  onApplyCustom: (start: Date, end: Date) => void
  showChartToggle?: boolean
}

export function AnalyticsToolbar({
  selectedRange,
  onSelectRange,
  chartType,
  onChartTypeChange,
  customStartDate,
  customEndDate,
  pickerOpen,
  onPickerOpenChange,
  onApplyCustom,
  showChartToggle = true,
}: AnalyticsToolbarProps) {
  return (
    <div className="rounded-3xl border border-border bg-background/90 p-3 shadow-sm shadow-slate-200/40 ring-1 ring-slate-900/5 dark:shadow-none dark:ring-slate-800/40">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <QuickTimelineFilters value={selectedRange} onChange={onSelectRange} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {showChartToggle ? <ChartTypeToggle value={chartType} onChange={onChartTypeChange} /> : null}
            <CustomDateRangePicker
              startDate={customStartDate}
              endDate={customEndDate}
              open={pickerOpen}
              active={selectedRange === 'custom'}
              onOpenChange={onPickerOpenChange}
              onApply={onApplyCustom}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
