'use client'

import { Card } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsSummaryCardProps {
  title: string
  value: string | number
  detail: string
  icon: LucideIcon
  tone?: 'default' | 'positive' | 'negative'
}

export function AnalyticsSummaryCard({ title, value, detail, icon: Icon, tone = 'default' }: AnalyticsSummaryCardProps) {
  const toneClasses = {
    default: 'bg-muted text-foreground',
    positive: 'bg-emerald-500 text-emerald-50',
    negative: 'bg-rose-500 text-rose-50',
  }

  return (
    <Card className="border border-border bg-background p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
        </div>
        <div className={cn('inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}
