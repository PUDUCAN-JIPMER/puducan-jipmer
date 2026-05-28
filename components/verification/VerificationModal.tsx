'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Info, Loader2, RotateCcw, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePatientVerification } from '@/hooks/verification/usePatientVerification'
import { MethodSelector } from './MethodSelector'
import { ConsentCheckbox } from './ConsentCheckbox'
import { OTPInput } from './OTPInput'
import { OTPCountdownTimer } from './OTPCountdownTimer'
import { VerificationLoader } from './VerificationLoader'
import { VerificationPreview } from './VerificationPreview'
import { DuplicatePatientWarning } from './DuplicatePatientWarning'
import type { VerificationStep, VerifiedPatientData } from '@/lib/verification/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface VerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the verified data when the user confirms autofill. */
  onVerified: (data: VerifiedPatientData) => void
  /**
   * Called when the user selects "Enter manually" from the method step.
   * The modal will close; the parent is responsible for showing the form.
   */
  onSelectManual?: () => void
  /**
   * Override the starting step.
   *   - 'method'  (default) — shows MethodSelector first (new registrations)
   *   - 'consent'           — skips method selection (re-verification from inside the form)
   */
  initialStep?: VerificationStep
}

// ── Step progress bar ─────────────────────────────────────────────────────────

const PROGRESS_LABELS = ['Consent', 'Phone', 'OTP', 'Verify'] as const

const STEP_PROGRESS_INDEX: Partial<Record<VerificationStep, number>> = {
  consent:   0,
  phone:     1,
  otp:       2,
  loading:   3,
  duplicate: 3,
  preview:   3,
}

function StepProgress({ step }: { step: VerificationStep }) {
  const currentIndex = STEP_PROGRESS_INDEX[step] ?? -1
  if (currentIndex === -1) return null

  return (
    <div className="flex items-center pl-1 pr-8 pb-4 mr-2" aria-hidden="true">
      {PROGRESS_LABELS.map((label, idx) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full items-center">
            {/* connector left */}
            {idx > 0 && (
              <div
                className={cn(
                  'h-px flex-1 transition-colors duration-300',
                  idx <= currentIndex ? 'bg-emerald-500' : 'bg-border',
                )}
              />
            )}
            {/* dot */}
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full border-2 transition-all duration-300',
                idx < currentIndex
                  ? 'border-emerald-500 bg-emerald-500'
                  : idx === currentIndex
                    ? 'border-emerald-600 bg-emerald-600 scale-125 shadow-sm shadow-emerald-300'
                    : 'border-border bg-background',
              )}
            />
            {/* connector right */}
            {idx < PROGRESS_LABELS.length - 1 && (
              <div
                className={cn(
                  'h-px flex-1 transition-colors duration-300',
                  idx < currentIndex ? 'bg-emerald-500' : 'bg-border',
                )}
              />
            )}
          </div>
          <span
            className={cn(
              'text-[10px] font-medium transition-colors duration-300',
              idx === currentIndex
                ? 'text-emerald-600 dark:text-emerald-400'
                : idx < currentIndex
                  ? 'text-emerald-500/70 dark:text-emerald-500/60'
                  : 'text-muted-foreground/50',
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Step copy ─────────────────────────────────────────────────────────────────

const STEP_TITLES: Record<string, string> = {
  method:    'Add New Patient',
  consent:   'Patient Identity Verification',
  phone:     'Enter Mobile Number',
  otp:       'Enter One-Time Password',
  loading:   'Verifying Identity…',
  duplicate: 'Possible Duplicate Patient',
  preview:   'Review Verified Details',
  success:   'Verification Complete',
  error:     'Verification Failed',
}

const STEP_DESCRIPTIONS: Record<string, string> = {
  method:
    'Choose how you would like to register this patient.',
  consent:
    'Verify patient identity via DigiLocker to auto-fill registration details and reduce entry errors.',
  phone:
    "Enter the patient's registered mobile number to receive a verification OTP.",
  otp:
    'Enter the 6-digit OTP sent to the patient\'s mobile number.',
  loading:
    'Securely fetching demographic details from the identity provider.',
  duplicate:
    'One or more existing patient records may match this identity. Review carefully before proceeding.',
  preview:
    'Review the verified details below before confirming the auto-fill.',
  success:
    'Patient demographics have been verified and the form has been pre-filled.',
  error:
    'The verification could not be completed. You may start over or register manually.',
}

// ── Modal ─────────────────────────────────────────────────────────────────────

/**
 * VerificationModal — multi-step dialog that orchestrates the complete
 * verification workflow.
 *
 * Step sequence:
 *   method → consent → phone → otp → loading → duplicate? → preview → success
 *   (any terminal error → error step)
 *
 * Security constraints enforced:
 *   - Consent must be checked before proceeding past the consent step.
 *   - OTP must match before the provider call is made.
 *   - High-confidence duplicates require a written override reason (≥ 20 chars).
 *   - Modal cannot be closed during the loading step.
 *   - Full Aadhaar is never rendered in the modal.
 */
export function VerificationModal({
  open,
  onOpenChange,
  onVerified,
  onSelectManual,
  initialStep = 'method',
}: VerificationModalProps) {
  const {
    step,
    phone,
    otp,
    generatedOtp,
    otpSecondsLeft,
    otpExpired,
    overrideReason,
    error,
    isLoading,
    verifiedData,
    duplicate,
    statusMessage,
    isDigiLockerProduction,
    setPhone,
    setOtp,
    setOverrideReason,
    selectMethod,
    proceedToPhone,
    sendOtp,
    resendOtp,
    verifyOtp,
    confirmDuplicate,
    resetFlow,
  } = usePatientVerification(initialStep)

  const [consent, setConsent] = useState(false)

  function handleClose() {
    if (isLoading) return           // block close during provider call
    resetFlow()
    setConsent(false)
    onOpenChange(false)
  }

  function handleSelectManual() {
    onSelectManual?.()
    handleClose()
  }

  function handleConfirmAutofill() {
    if (!verifiedData) return
    onVerified(verifiedData)
    resetFlow()
    setConsent(false)
    // Transition to success step (modal stays open briefly to confirm)
    // The hook's resetFlow already went back to initialStep, but we need
    // the parent to know we're done; here we just close immediately for UX simplicity.
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose()
      }}
    >
      <DialogContent
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto"
        aria-describedby="verification-description"
        // Prevent accidental closure on outside-click during loading
        onInteractOutside={isLoading ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <StepProgress step={step} />
          <DialogTitle>{STEP_TITLES[step] ?? 'Verification'}</DialogTitle>
          <DialogDescription id="verification-description">
            {STEP_DESCRIPTIONS[step] ?? ''}
          </DialogDescription>
        </DialogHeader>

        {/* ── Step content ──────────────────────────────────────────────── */}
        <div className="py-2">

          {/* Step 0 — method selection */}
          {step === 'method' && (
            <MethodSelector
              onSelectDigiLocker={() => selectMethod('digilocker')}
              onSelectManual={handleSelectManual}
            />
          )}

          {/* Step 1 — consent */}
          {step === 'consent' && (
            <ConsentCheckbox checked={consent} onCheckedChange={setConsent} />
          )}

          {/* Step 2 — phone input */}
          {step === 'phone' && (
            <div className="space-y-2">
              <Label htmlFor="verify-phone">Mobile number</Label>
              <div
                className={cn(
                  'flex h-11 overflow-hidden rounded-md border bg-background transition-colors',
                  'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0',
                  error ? 'border-destructive' : 'border-input',
                )}
              >
                <div className="flex shrink-0 select-none items-center gap-1.5 border-r border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                  🇮🇳 <span className="font-medium">+91</span>
                </div>
                <input
                  id="verify-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && phone.length === 10 && !isLoading) {
                      void sendOtp()
                    }
                  }}
                  autoComplete="tel"
                  autoFocus
                  disabled={isLoading}
                  aria-describedby={error ? 'phone-error' : undefined}
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div
                  className={cn(
                    'flex shrink-0 items-center pr-3 font-mono text-xs transition-colors',
                    phone.length === 10
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground/40',
                  )}
                >
                  {phone.length}/10
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — OTP input */}
          {step === 'otp' && (
            <div className="space-y-4">
              {generatedOtp && (
                <div
                  data-testid="mock-otp-display"
                  className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30"
                >
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Simulated OTP:{' '}
                      <span
                        className="font-mono tracking-[0.25em]"
                        aria-label={`OTP code: ${generatedOtp}`}
                      >
                        {generatedOtp}
                      </span>
                    </p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/70">
                      In production this code is delivered via SMS to the patient.
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>One-time password</Label>
                  <OTPCountdownTimer secondsLeft={otpSecondsLeft} />
                </div>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading || otpExpired}
                  hasError={!!error}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 4 — loading */}
          {step === 'loading' && (
            <VerificationLoader
              statusMessage={statusMessage || undefined}
              isDigiLocker={isDigiLockerProduction}
            />
          )}

          {/* Step 5 — duplicate resolution */}
          {step === 'duplicate' && duplicate?.patient && (
            <DuplicatePatientWarning
              patient={duplicate.patient}
              allMatches={duplicate.allMatches}
              overrideReason={overrideReason}
              onOverrideReasonChange={setOverrideReason}
              onConfirm={() => void confirmDuplicate()}
              error={error}
            />
          )}

          {/* Step 6 — preview */}
          {step === 'preview' && verifiedData && (
            <VerificationPreview data={verifiedData} />
          )}

          {/* Step 7 — success */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
                <ShieldCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Identity Verified</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Patient demographics have been auto-filled from the verified identity.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Autofill applied
              </div>
            </div>
          )}

          {/* Step 8 — error (terminal) */}
          {step === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Verification Failed</p>
                {error && (
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                )}
              </div>
            </div>
          )}

          {/* Inline error (phone / OTP steps only) */}
          {error && (step === 'phone' || step === 'otp') && (
            <p
              id={step === 'phone' ? 'phone-error' : 'otp-error'}
              role="alert"
              className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        {/* ── Footer actions ────────────────────────────────────────────── */}
        <DialogFooter>
          {/* Cancel / Close — hidden during loading; relabelled on terminal steps */}
          {step !== 'loading' && step !== 'success' && step !== 'duplicate' && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              {step === 'error' ? 'Close' : 'Cancel'}
            </Button>
          )}

          {/* Consent step */}
          {step === 'consent' && (
            <Button
              type="button"
              disabled={!consent}
              onClick={proceedToPhone}
              className={isDigiLockerProduction ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
            >
              {isDigiLockerProduction ? (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                  Verify with DigiLocker
                </>
              ) : (
                'Continue'
              )}
            </Button>
          )}

          {/* Phone step */}
          {step === 'phone' && (
            <Button
              type="button"
              disabled={phone.length !== 10 || isLoading}
              onClick={() => void sendOtp()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          )}

          {/* OTP step */}
          {step === 'otp' && (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={isLoading || !otpExpired}
                onClick={() => void resendOtp()}
                aria-label="Resend a new OTP"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Resend OTP'
                )}
              </Button>
              <Button
                type="button"
                disabled={otp.length !== 6 || isLoading || otpExpired}
                onClick={() => void verifyOtp()}
              >
                Verify OTP
              </Button>
            </>
          )}

          {/* Preview step */}
          {step === 'preview' && (
            <Button type="button" onClick={handleConfirmAutofill}>
              Confirm & Auto-fill
            </Button>
          )}

          {/* Error step — restart */}
          {step === 'error' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetFlow(); setConsent(false) }}
            >
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Start Over
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
