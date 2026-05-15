'use client'

import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp } from 'lucide-react'
import type { RegistrationChartType } from '@/hooks/stats/useRegistrationAnalytics'

interface ChartTypeToggleProps {
  value: RegistrationChartType
  onChange: (value: RegistrationChartType) => void
}

export function ChartTypeToggle({ value, onChange }: ChartTypeToggleProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-border bg-background shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold transition-all duration-200 first:rounded-l-full last:rounded-r-full ${
          value === 'bar'
            ? 'bg-emerald-600 text-emerald-50 shadow-sm hover:bg-emerald-700'
            : 'text-slate-500 hover:text-foreground'
        }`}
        aria-pressed={value === 'bar'}
        onClick={() => onChange('bar')}
      >
        <BarChart3 className="h-4 w-4" />
        Bar
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold transition-all duration-200 first:rounded-l-full last:rounded-r-full ${
          value === 'line'
            ? 'bg-emerald-600 text-emerald-50 shadow-sm hover:bg-emerald-700'
            : 'text-slate-500 hover:text-foreground'
        }`}
        aria-pressed={value === 'line'}
        onClick={() => onChange('line')}
      >
        <TrendingUp className="h-4 w-4" />
        Line
      </Button>
    </div>
  )
}
