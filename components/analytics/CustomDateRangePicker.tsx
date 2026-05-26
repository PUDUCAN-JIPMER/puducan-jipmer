'use client'

import * as React from 'react'
import { format, isAfter, isBefore, isValid } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown } from 'lucide-react'

interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

function formatDate(value: Date | null) {
  return value ? format(value, 'dd MMM yyyy') : 'Select date'
}

function toInputValue(value: Date | null) {
  return value ? format(value, 'yyyy-MM-dd') : ''
}

function parseInputValue(value: string) {
  const date = new Date(value)
  return isValid(date) ? date : null
}

interface CustomDateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  open: boolean
  active?: boolean
  onOpenChange: (open: boolean) => void
  onApply: (start: Date, end: Date) => void
}

export function CustomDateRangePicker({
  startDate,
  endDate,
  open,
  active = false,
  onOpenChange,
  onApply,
}: CustomDateRangePickerProps) {
  const [selected, setSelected] = React.useState<DateRange | undefined>(
    startDate && endDate ? { from: startDate, to: endDate } : undefined
  )
  const [localError, setLocalError] = React.useState<string>('')

  React.useEffect(() => {
    setSelected(startDate && endDate ? { from: startDate, to: endDate } : undefined)
  }, [startDate, endDate])

  const start = selected?.from ?? null
  const end = selected?.to ?? null
  const isValidRange = Boolean(start && end && isBefore(start, end))
  const errorMessage = !start || !end ? 'Please select both dates.' : isAfter(start, end) ? 'Start date must be before end date.' : ''

  const handleApply = () => {
    if (!start || !end) {
      setLocalError('Please choose both a start and end date.')
      return
    }

    if (isAfter(start, end) || start.getTime() === end.getTime()) {
      setLocalError('Start date must be earlier than end date.')
      return
    }

    setLocalError('')
    onApply(start, end)
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={open || active ? 'secondary' : 'outline'}
          size="sm"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 hover:bg-accent/80"
          aria-label="Open custom date range picker"
        >
          {start && end ? `${formatDate(start)} – ${formatDate(end)}` : 'Custom range'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-[min(22rem,100vw)] max-w-[22rem] p-3">
        <div className="space-y-3">
          <div className="grid gap-2">
            <div className="space-y-1">
              <Label htmlFor="custom-range-start" className="text-emerald-700">
                Start Date
              </Label>
              <Input
                id="custom-range-start"
                type="date"
                value={toInputValue(start)}
                className="h-10 text-center text-sm font-semibold border-emerald-200 bg-emerald-50/50 focus:border-emerald-400 focus:ring-emerald-400/30 no-calendar-icon"
                onChange={(event) => {
                  const next = parseInputValue(event.target.value)
                  setSelected((prev: DateRange | undefined) => ({ from: next ?? undefined, to: prev?.to }))
                  setLocalError('')
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-range-end" className="text-sky-700">
                End Date
              </Label>
              <Input
                id="custom-range-end"
                type="date"
                value={toInputValue(end)}
                className="h-10 text-center text-sm font-semibold border-sky-200 bg-sky-50/50 focus:border-sky-400 focus:ring-sky-400/30 no-calendar-icon"
                onChange={(event) => {
                  const next = parseInputValue(event.target.value)
                  setSelected((prev: DateRange | undefined) => ({ from: prev?.from, to: next ?? undefined }))
                  setLocalError('')
                }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background/90 p-1 shadow-sm">
            <Calendar
              className="w-full"
              mode="range"
              selected={selected}
              onSelect={setSelected}
              defaultMonth={start ?? new Date()}
            />
          </div>

          {localError ? (
            <p className="text-sm text-destructive">{localError}</p>
          ) : errorMessage ? (
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isValidRange}
              onClick={handleApply}
            >
              Apply range
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
