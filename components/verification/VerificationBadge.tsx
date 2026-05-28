'use client'

import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VerificationSource } from '@/lib/verification/types'

interface VerificationBadgeProps {
  source: VerificationSource
  className?: string
}

const SOURCE_LABEL: Record<VerificationSource, string> = {
  digilocker: 'DigiLocker',
  abha: 'ABHA',
  mock: 'DigiLocker (Demo)',
}

/**
 * VerificationBadge — compact inline indicator displayed on a patient record
 * or registration form once identity verification has completed.
 *
 * Supports dark/light mode via Tailwind semantic colour tokens.
 */
export function VerificationBadge({ source, className }: VerificationBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Verified via ${SOURCE_LABEL[source]}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700',
        'dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400',
        className,
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Verified via {SOURCE_LABEL[source]}
    </span>
  )
}
