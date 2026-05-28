'use client'

import { cn } from '@/lib/utils'
import { OTP_TTL_SECONDS } from '@/lib/verification/constants'
import type { OTPCountdownTimerProps } from '@/types/verification/verification.types'

/**
 * OTPCountdownTimer — controlled countdown display for OTP validity.
 *
 * The component is purely presentational. The parent hook
 * (usePatientVerification) owns the countdown interval and passes
 * `secondsLeft` as a controlled prop.
 *
 * Colour transitions communicate urgency:
 *   > 30 s  →  green   (plenty of time)
 *   10–30 s →  amber   (hurry up)
 *   < 10 s  →  red     (almost expired)
 *     0 s   →  red + "Expired" label
 *
 * Accessibility: uses role="timer" and aria-live="polite" so screen
 * readers announce the countdown without being disruptive.
 */
export function OTPCountdownTimer({ secondsLeft, className }: OTPCountdownTimerProps) {
  const expired = secondsLeft <= 0
  const minutes = Math.floor(Math.max(0, secondsLeft) / 60)
  const seconds = Math.max(0, secondsLeft) % 60
  const display = `${minutes}:${String(seconds).padStart(2, '0')}`

  // Fraction of total time remaining — drives the colour
  const fraction = secondsLeft / OTP_TTL_SECONDS

  const colourClass = expired
    ? 'text-destructive border-destructive/40 bg-destructive/10'
    : fraction > 0.33
      ? 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/30'
      : fraction > 0.11
        ? 'text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950/30'
        : 'text-destructive border-destructive/40 bg-destructive/10'

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={expired ? 'OTP expired' : `OTP expires in ${display}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        'text-xs font-medium tabular-nums transition-colors',
        colourClass,
        className,
      )}
    >
      {expired ? (
        <span>Expired</span>
      ) : (
        <>
          <span aria-hidden="true">⏱</span>
          <span>{display}</span>
        </>
      )}
    </div>
  )
}
