'use client'

import { AlertTriangle, ShieldAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { DuplicatePatientSummary } from '@/lib/verification/types'
import { DUPLICATE_CONFIDENCE_HIGH } from '@/lib/verification/constants'

const MATCH_LABEL: Record<string, string> = {
  maskedId:   'verification token (Aadhaar)',
  phone:      'phone number',
  'name+dob': 'name and date of birth',
}

const OVERRIDE_MIN_CHARS = 20

// ── Props ─────────────────────────────────────────────────────────────────────

interface DuplicatePatientWarningProps {
  /** The highest-confidence duplicate match to display. */
  patient: DuplicatePatientSummary
  /** All matches — used to decide hard vs soft mode automatically. */
  allMatches?: DuplicatePatientSummary[]
  /** Hard-block mode: current override reason value */
  overrideReason?: string
  /** Hard-block mode: called when the user types in the reason textarea */
  onOverrideReasonChange?: (reason: string) => void
  /** Soft mode: dismiss banner. Hard mode: confirm override (after validation). */
  onConfirm: () => void
  /** Inline error from the parent (e.g., reason too short) */
  error?: string | null
}

// ── Patient detail list ───────────────────────────────────────────────────────

function PatientDetails({ patient }: { patient: DuplicatePatientSummary }) {
  return (
    <ul className="mt-1 space-y-0.5 text-sm">
      <li><span className="font-medium">Name:</span> {patient.name}</li>
      {patient.dob && (
        <li><span className="font-medium">DOB:</span> {patient.dob}</li>
      )}
      {patient.assignedHospitalName && (
        <li>
          <span className="font-medium">Hospital:</span>{' '}
          {patient.assignedHospitalName}
        </li>
      )}
      {patient.hospitalRegistrationDate && (
        <li>
          <span className="font-medium">Registered:</span>{' '}
          {patient.hospitalRegistrationDate}
        </li>
      )}
      <li>
        <span className="font-medium">Matched by:</span>{' '}
        {MATCH_LABEL[patient.matchedBy] ?? patient.matchedBy}
      </li>
    </ul>
  )
}

// ── Hard-block variant (confidenceScore >= DUPLICATE_CONFIDENCE_HIGH) ─────────

function HardBlockWarning({
  patient,
  overrideReason = '',
  onOverrideReasonChange,
  onConfirm,
  error,
}: Required<Pick<DuplicatePatientWarningProps, 'patient' | 'overrideReason' | 'onOverrideReasonChange' | 'onConfirm'>> &
  Pick<DuplicatePatientWarningProps, 'error'>) {
  const charsLeft = OVERRIDE_MIN_CHARS - overrideReason.trim().length
  const canConfirm = overrideReason.trim().length >= OVERRIDE_MIN_CHARS

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-lg border-2 border-destructive bg-destructive/5 p-4 text-sm dark:border-destructive/60 dark:bg-destructive/10"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert
          className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
          aria-hidden="true"
        />
        <div className="flex-1 space-y-2">
          <p className="font-semibold text-destructive">
            Duplicate patient detected — registration blocked
          </p>
          <p className="text-muted-foreground">
            A patient with <strong>confidence {(patient.confidenceScore * 100).toFixed(0)}%</strong> has
            already been registered. Review before proceeding.
          </p>

          <div className="rounded-md border border-destructive/30 bg-background px-3 py-2 text-foreground">
            <PatientDetails patient={patient} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="override-reason" className="text-xs font-medium">
              Override reason{' '}
              <span className="text-muted-foreground">(required, min {OVERRIDE_MIN_CHARS} characters)</span>
            </Label>
            <Textarea
              id="override-reason"
              rows={3}
              placeholder="Explain why you are proceeding despite a possible duplicate (e.g. 'New admission for returning patient admitted under a different hospital on…')"
              value={overrideReason}
              onChange={(e) => onOverrideReasonChange?.(e.target.value)}
              className={cn(
                'resize-none text-sm',
                error && 'border-destructive ring-1 ring-destructive',
              )}
              aria-describedby={error ? 'override-error' : undefined}
            />
            <div className="flex items-center justify-between">
              {error ? (
                <p id="override-error" className="text-xs text-destructive">{error}</p>
              ) : charsLeft > 0 ? (
                <p className="text-xs text-muted-foreground">{charsLeft} more characters required</p>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Reason accepted</p>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={!canConfirm}
            onClick={onConfirm}
            className="w-full"
          >
            Override and proceed to preview
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Soft-warning variant (0.70 ≤ confidenceScore < 0.95) ─────────────────────

function SoftWarning({
  patient,
  onConfirm,
}: Pick<DuplicatePatientWarningProps, 'patient' | 'onConfirm'>) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30"
    >
      <button
        type="button"
        aria-label="Dismiss duplicate warning"
        onClick={onConfirm}
        className="absolute right-3 top-3 rounded p-0.5 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <div className="space-y-1.5">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            Possible existing patient found
          </p>
          <p className="text-amber-700 dark:text-amber-400">
            A record was matched by{' '}
            <strong>{MATCH_LABEL[patient.matchedBy] ?? patient.matchedBy}</strong>{' '}
            with {(patient.confidenceScore * 100).toFixed(0)}% confidence:
          </p>
          <div className="text-amber-700 dark:text-amber-400">
            <PatientDetails patient={patient} />
          </div>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
            You may proceed if this is a new admission for the same patient.
            Review carefully before saving.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * DuplicatePatientWarning — confidence-aware duplicate alert.
 *
 * - confidenceScore >= DUPLICATE_CONFIDENCE_HIGH (0.95):
 *   Hard block — registration cannot proceed until a written override reason
 *   (≥ 20 characters) is provided. The reason is logged to verification_logs.
 *
 * - confidenceScore < DUPLICATE_CONFIDENCE_HIGH:
 *   Soft warning — collapsible amber banner, dismissible with a single click.
 */
export function DuplicatePatientWarning({
  patient,
  allMatches,
  overrideReason = '',
  onOverrideReasonChange,
  onConfirm,
  error,
}: DuplicatePatientWarningProps) {
  const topMatch = allMatches?.[0] ?? patient
  const isHardBlock = topMatch.confidenceScore >= DUPLICATE_CONFIDENCE_HIGH

  if (isHardBlock) {
    return (
      <HardBlockWarning
        patient={topMatch}
        overrideReason={overrideReason}
        onOverrideReasonChange={onOverrideReasonChange ?? (() => {})}
        onConfirm={onConfirm}
        error={error}
      />
    )
  }

  return <SoftWarning patient={patient} onConfirm={onConfirm} />
}
