'use client'

import { ShieldCheck, Smartphone } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface VerificationLoaderProps {
  /** Optional live status message (e.g. from DigiLocker polling) */
  statusMessage?: string
  /** When true, renders DigiLocker-specific branding and wording */
  isDigiLocker?: boolean
  className?: string
}

/**
 * VerificationLoader — shown during Step 4 while the identity provider
 * call is in-flight and duplicate detection is running.
 *
 * In DigiLocker mode: shows a popup-awaiting indicator with the live
 * status message from the polling loop.
 *
 * In mock/OTP mode: shows a generic "Verifying…" skeleton.
 *
 * Cannot be dismissed by the user — closing the modal during verification
 * would leave the system in an ambiguous state.
 */
export function VerificationLoader({
  statusMessage,
  isDigiLocker = false,
  className,
}: VerificationLoaderProps) {
  const primaryText = statusMessage
    ? statusMessage
    : isDigiLocker
      ? 'Waiting for DigiLocker authentication…'
      : 'Verifying identity…'

  const subText = isDigiLocker
    ? 'Please complete the sign-in in the DigiLocker popup. This window will update automatically.'
    : 'Securely fetching demographic details. This usually takes a moment.'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={primaryText}
      className={cn('flex flex-col items-center gap-6 py-6', className)}
    >
      {/* Animated icon */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div
          className={cn(
            'absolute inset-0 animate-ping rounded-full',
            isDigiLocker ? 'bg-emerald-500/15' : 'bg-primary/10',
          )}
        />
        <div
          className={cn(
            'relative flex h-20 w-20 items-center justify-center rounded-full',
            isDigiLocker ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-primary/10',
          )}
        >
          {isDigiLocker ? (
            <Smartphone
              className="h-10 w-10 animate-pulse text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          ) : (
            <ShieldCheck className="h-10 w-10 animate-pulse text-primary" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* DigiLocker brand badge */}
      {isDigiLocker && (
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/30">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
            DigiLocker
          </span>
          <span className="text-xs text-emerald-600/70 dark:text-emerald-400/60">
            by Ministry of Electronics &amp; IT, Govt. of India
          </span>
        </div>
      )}

      {/* Status text */}
      <div className="space-y-1.5 text-center">
        <p
          key={primaryText}
          className={cn(
            'text-sm font-semibold transition-all duration-300',
            isDigiLocker ? 'text-emerald-800 dark:text-emerald-200' : 'text-foreground',
          )}
        >
          {primaryText}
        </p>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
          {subText}
        </p>
      </div>

      {/* Skeleton preview — matches VerificationPreview row layout */}
      <div className="w-full max-w-sm space-y-3" aria-hidden="true">
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  )
}
