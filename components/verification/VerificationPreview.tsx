'use client'

import { Clock, ShieldCheck } from 'lucide-react'
import type { VerifiedPatientData } from '@/lib/verification/types'

interface VerificationPreviewProps {
  data: VerifiedPatientData
}

interface PreviewRow {
  label: string
  value: string | undefined
}

const SOURCE_LABELS: Record<VerifiedPatientData['verificationSource'], string> = {
  digilocker: 'DigiLocker',
  abha: 'ABHA',
  mock: 'Simulated (Mock)',
}

function formatVerifiedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/**
 * VerificationPreview — displays the demographic data returned by the
 * identity provider so the healthcare worker can review it before confirming
 * the autofill action.
 *
 * Security: maskedId is shown as-is; the full identifier is never present.
 */
export function VerificationPreview({ data }: VerificationPreviewProps) {
  /** Format raw 14-digit ABHA as XX-XXXX-XXXX-XXXX for display. */
  function formatAbha(raw: string): string {
    const d = raw.replace(/-/g, '')
    if (d.length !== 14) return raw
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}-${d.slice(10)}`
  }

  const rows: PreviewRow[] = [
    { label: 'Full name',    value: data.fullName },
    { label: 'Date of birth', value: data.dob },
    { label: 'Gender',       value: data.gender },
    { label: 'Address',      value: data.address },
    { label: 'Phone number', value: data.phoneNumber },
    { label: 'Aadhaar (masked)', value: data.maskedId },
    {
      label: 'ABHA number',
      value: data.abhaNumber ? formatAbha(data.abhaNumber) : undefined,
    },
  ]

  return (
    <div className="space-y-4">
      {/* ── Verification success banner ─────────────────────────── */}
      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Identity verified via {SOURCE_LABELS[data.verificationSource]}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-emerald-600/80 dark:text-emerald-400/70">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {formatVerifiedAt(data.verifiedAt)}
          </p>
        </div>
      </div>

      {/* ── Demographic data table ──────────────────────────────── */}
      <dl className="divide-y divide-border rounded-lg border border-border text-sm">
        {rows
          .filter((r) => r.value)
          .map((row) => (
            <div key={row.label} className="flex gap-4 px-4 py-3">
              <dt className="w-32 shrink-0 font-medium text-muted-foreground">
                {row.label}
              </dt>
              <dd className="text-foreground">{row.value}</dd>
            </div>
          ))}
      </dl>

      <p className="text-xs text-muted-foreground">
        These fields will be pre-filled into the registration form. All fields remain
        editable — review and confirm the final values before saving.
      </p>
    </div>
  )
}
