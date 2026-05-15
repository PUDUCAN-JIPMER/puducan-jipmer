'use client'

import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp } from 'lucide-react'
import type { RegistrationChartType } from '@/hooks/stats/useRegistrationAnalytics'

interface ChartSwitcherProps {
  value: RegistrationChartType
  onChange: (value: RegistrationChartType) => void
}

export function ChartSwitcher({ value, onChange }: ChartSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-background p-1 shadow-sm">
      <Button
        type="button"
        variant={value === 'bar' ? 'secondary' : 'outline'}
        size="sm"
        className="gap-1"
        onClick={() => onChange('bar')}
      >
        <BarChart3 className="h-4 w-4" />
        Bar
      </Button>
      <Button
        type="button"
        variant={value === 'line' ? 'secondary' : 'outline'}
        size="sm"
        className="gap-1"
        onClick={() => onChange('line')}
      >
        <TrendingUp className="h-4 w-4" />
        Line
      </Button>
    </div>
  )
}
