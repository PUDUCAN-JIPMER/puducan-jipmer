'use client'

import { Button } from '@/components/ui/button'
import type { RegistrationRange } from '@/hooks/stats/useRegistrationAnalytics'

const TIME_RANGES: Array<{ key: Exclude<RegistrationRange, 'custom'>; label: string }> = [
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: '12m', label: '12M' },
  { key: '3y', label: '3Y' },
  { key: '5y', label: '5Y' },
  { key: 'all', label: 'ALL' },
]

interface QuickTimelineFiltersProps {
  value: RegistrationRange
  onChange: (value: RegistrationRange) => void
}

export function QuickTimelineFilters({ value, onChange }: QuickTimelineFiltersProps) {
  return (
    <div role="group" aria-label="Predefined time range" className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto pb-1">
      {TIME_RANGES.map((option) => {
        const active = option.key === value
        return (
          <Button
            key={option.key}
            type="button"
            variant={active ? 'secondary' : 'ghost'}
            size="sm"
            className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 ${
              active
                ? 'bg-emerald-600 text-emerald-50 shadow-sm hover:bg-emerald-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-foreground'
            }`}
            aria-pressed={active}
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
