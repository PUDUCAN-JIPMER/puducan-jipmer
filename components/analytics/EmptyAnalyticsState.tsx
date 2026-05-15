'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface EmptyAnalyticsStateProps {
  onTryAnotherRange: () => void
}

export function EmptyAnalyticsState({ onTryAnotherRange }: EmptyAnalyticsStateProps) {
  return (
    <Card className="border border-dashed border-border bg-muted/80 text-muted-foreground p-8">
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
          <BarChart3 className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">No registration activity found</h3>
          <p className="mt-2 text-sm text-slate-500">
            There are no patient registrations in the selected window. Try another range or add new patient records to start collecting trend data.
          </p>
        </div>
        <Button type="button" size="sm" onClick={onTryAnotherRange}>
          Try another date range
        </Button>
      </div>
    </Card>
  )
}
