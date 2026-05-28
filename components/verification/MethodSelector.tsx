'use client'

import { ChevronRight, ClipboardList, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MethodSelectorProps } from '@/types/verification/verification.types'

/**
 * MethodSelector — Step 0 of the registration flow.
 *
 * Presents two registration paths with deliberate visual hierarchy:
 *   Primary  → DigiLocker verification (prominent card with CTA)
 *   Secondary → Manual data entry (understated link-style button)
 *
 * Accessibility: both options are keyboard-reachable via Tab + Enter.
 * The component is presentation-only; all state lives in the parent.
 */
export function MethodSelector({
  onSelectDigiLocker,
  onSelectManual,
  className,
}: MethodSelectorProps) {
  return (
    <div className={cn('space-y-5 py-2', className)}>

      {/* ── DigiLocker — primary CTA ──────────────────────────────────── */}
      <button
        type="button"
        onClick={onSelectDigiLocker}
        className={cn(
          'group w-full flex items-center gap-4 rounded-xl',
          'border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/30 p-5 text-left',
          'transition-all hover:border-emerald-400 hover:from-emerald-50 hover:to-emerald-100/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
          'dark:border-emerald-800 dark:from-emerald-950/30 dark:to-emerald-950/10',
          'dark:hover:border-emerald-600',
        )}
        aria-label="Verify patient identity with DigiLocker"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 shadow-sm dark:bg-emerald-900">
          <ShieldCheck
            className="h-6 w-6 text-emerald-700 dark:text-emerald-300"
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-emerald-900 dark:text-emerald-100">
              Verify with DigiLocker
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              Recommended
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Auto-fills name, DOB, gender &amp; address from Aadhaar-linked records.
            Reduces fake and duplicate entries.
          </p>
        </div>

        <ChevronRight
          className="h-4 w-4 shrink-0 text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </button>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3" role="separator" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* ── Manual entry — secondary ──────────────────────────────────── */}
      <button
        type="button"
        onClick={onSelectManual}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-lg',
          'border border-border bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground',
          'transition-all hover:border-foreground/25 hover:bg-muted/50 hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label="Enter patient details manually"
      >
        <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
        Enter details manually
      </button>

    </div>
  )
}
