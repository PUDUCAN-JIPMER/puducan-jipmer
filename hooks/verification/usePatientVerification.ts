'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MockProvider } from '@/lib/providers/mockProvider'
import { DigiLockerProvider } from '@/lib/providers/digilockerProvider'
import { VerificationService } from '@/lib/verification/service'
import {
  DUPLICATE_CONFIDENCE_HIGH,
  OTP_LENGTH,
  OTP_TTL_SECONDS,
} from '@/lib/verification/constants'
import { logDuplicateOverride } from '@/lib/audit/logger'
import type {
  DuplicateCheckResult,
  VerificationStep,
  VerifiedPatientData,
} from '@/lib/verification/types'
import type { UsePatientVerificationReturn } from '@/types/verification/verification.types'
import { useAuth } from '@/contexts/AuthContext'

/** True when DigiLocker API credentials are configured (server-side check is authoritative;
 *  this env var is a client-side feature flag only — not a secret). */
const IS_DIGILOCKER_PRODUCTION =
  process.env.NEXT_PUBLIC_DIGILOCKER_ENABLED === 'true'

/**
 * usePatientVerification — state machine for the full verification workflow.
 *
 * Step sequence:
 *   method → consent → phone → otp → loading → duplicate? → preview → success
 *                   ↘ (digilocker path) → loading → duplicate? → preview → success
 *   Any terminal provider error → error step.
 *
 * DigiLocker path (production):
 *   method → consent → loading (popup opened) → duplicate? → preview → success
 *   The phone/OTP steps are skipped — DigiLocker handles authentication.
 *
 * OTP path (mock / fallback):
 *   method → consent → phone → otp → loading → duplicate? → preview → success
 *
 * @param initialStep - Starting step. Default 'method' for new registrations;
 *   pass 'consent' from VerifyPatientButton to skip method selection on re-verify.
 *
 * Security:
 *   - OTP is generated in-memory and NEVER written to Firestore, localStorage,
 *     or any log. It lives only in this hook's closure.
 *   - DigiLocker: code_verifier lives only on the server. This hook never sees it.
 *   - Duplicate overrides are logged to verification_logs before proceeding.
 *   - Full Aadhaar numbers are never exposed from this hook.
 */
export function usePatientVerification(
  initialStep: VerificationStep = 'method',
): UsePatientVerificationReturn {
  const { role, userId } = useAuth()

  // ── Step machine state ────────────────────────────────────────────────────
  const [step, setStep] = useState<VerificationStep>(initialStep)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  // ── OTP state ─────────────────────────────────────────────────────────────
  /** Dev-mode only: OTP returned by the API for on-screen display.
   *  Empty string in production (SMS is the only delivery channel). */
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [otpSecondsLeft, setOtpSecondsLeft] = useState<number>(OTP_TTL_SECONDS)
  const [otpExpired, setOtpExpired] = useState(false)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── DigiLocker popup reference ────────────────────────────────────────────
  const popupRef = useRef<Window | null>(null)

  // ── Async / error / duplicate state ───────────────────────────────────────
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [verifiedData, setVerifiedData] = useState<VerifiedPatientData | null>(null)
  const [duplicate, setDuplicate] = useState<DuplicateCheckResult | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')

  // ── Override reason for high-confidence duplicate blocks ──────────────────
  const [overrideReason, setOverrideReason] = useState('')

  // ── Countdown interval ────────────────────────────────────────────────────

  function startCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setOtpSecondsLeft(OTP_TTL_SECONDS)
    setOtpExpired(false)

    countdownRef.current = setInterval(() => {
      setOtpSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          countdownRef.current = null
          setOtpExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1_000)
  }

  function stopCountdown() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }

  useEffect(() => () => stopCountdown(), [])

  // ── Cleanup popup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close()
      }
    }
  }, [])

  // ── Step 0: choose verification method ───────────────────────────────────
  const selectMethod = useCallback((method: 'digilocker' | 'manual') => {
    if (method === 'digilocker') {
      setError(null)
      setStep('consent')
    }
    // 'manual' path: the modal component handles this via onSelectManual callback
  }, [])

  // ── Step 1 → 2: consent confirmed ─────────────────────────────────────────
  const proceedToPhone = useCallback(() => {
    setError(null)
    // In production DigiLocker mode, skip the phone/OTP steps and go straight
    // to the DigiLocker OAuth popup.
    if (IS_DIGILOCKER_PRODUCTION) {
      void startDigiLockerOAuth()
    } else {
      setStep('phone')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── DigiLocker OAuth popup flow ────────────────────────────────────────────
  const startDigiLockerOAuth = useCallback(async () => {
    setError(null)
    setStep('loading')
    setIsLoading(true)
    setStatusMessage('Initiating DigiLocker verification…')

    try {
      const provider = new DigiLockerProvider({
        onOpenPopup: (authorizationUrl: string) => {
          const width  = 600
          const height = 700
          const left   = window.screenX + (window.outerWidth  - width)  / 2
          const top    = window.screenY + (window.outerHeight - height) / 2
          const popup  = window.open(
            authorizationUrl,
            'digilocker-auth',
            `width=${width},height=${height},left=${left},top=${top},` +
            'scrollbars=yes,resizable=yes,toolbar=no,menubar=no',
          )
          popupRef.current = popup
        },
        onStatusMessage: (msg: string) => setStatusMessage(msg),
      })

      const service = new VerificationService(provider, {
        verifierId: userId,
        verifierRole: role,
      })

      const result = await service.verify()
      setVerifiedData(result.data)
      setDuplicate(result.duplicate)
      setStep(result.duplicate.isDuplicate ? 'duplicate' : 'preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DigiLocker verification failed.')
      setStep('error')
    } finally {
      setIsLoading(false)
      setStatusMessage('')
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close()
      }
    }
  }, [userId, role])

  // ── Step 2 → 3: send OTP via server API ────────────────────────────────────
  const sendOtp = useCallback(async () => {
    const cleaned = phone.trim().replace(/\D/g, '')
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    setError(null)
    setOtp('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      })
      const data = (await res.json()) as { error?: string; devOtp?: string }

      if (!res.ok) {
        setError(data.error ?? 'Failed to send OTP. Please try again.')
        return
      }
      // devOtp is only present in NODE_ENV=development; empty in production
      setGeneratedOtp(data.devOtp ?? '')
      startCountdown()
      setStep('otp')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone])

  // ── Resend: call same API, reset countdown ─────────────────────────────────
  const resendOtp = useCallback(async () => {
    setOtp('')
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim().replace(/\D/g, '') }),
      })
      const data = (await res.json()) as { error?: string; devOtp?: string }

      if (!res.ok) {
        setError(data.error ?? 'Failed to resend OTP. Please try again.')
        return
      }
      setGeneratedOtp(data.devOtp ?? '')
      startCountdown()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone])

  // ── Step 3 → 4 → 5 or 6: verify OTP server-side, then call provider ───────
  const verifyOtp = useCallback(async () => {
    if (otp.trim().length !== OTP_LENGTH) {
      setError(`Please enter a ${OTP_LENGTH}-digit OTP.`)
      return
    }
    setError(null)

    // 1. Validate OTP against server-side hash
    const verifyRes = await fetch('/api/verification/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim().replace(/\D/g, ''), otp: otp.trim() }),
    })
    const verifyData = (await verifyRes.json()) as { error?: string }

    if (!verifyRes.ok) {
      // Stay on OTP step so the user can retry; resume the countdown if still running
      setError(verifyData.error ?? 'Incorrect OTP. Please try again.')
      return
    }

    // 2. OTP valid — call identity provider (MockProvider in dev/fallback)
    stopCountdown()
    setError(null)
    setStep('loading')
    setIsLoading(true)

    try {
      const provider = new MockProvider(phone.trim().replace(/\D/g, ''))
      const service = new VerificationService(provider, {
        verifierId: userId,
        verifierRole: role,
      })
      const result = await service.verify()
      setVerifiedData(result.data)
      setDuplicate(result.duplicate)
      setStep(result.duplicate.isDuplicate ? 'duplicate' : 'preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.')
      setStep('error')
    } finally {
      setIsLoading(false)
    }
  }, [otp, phone, userId, role])

  // ── Step 5 → 6: resolve duplicate, log override if high confidence ─────────
  const confirmDuplicate = useCallback(async () => {
    const highMatch = duplicate?.allMatches?.find(
      (m) => m.confidenceScore >= DUPLICATE_CONFIDENCE_HIGH,
    )
    if (highMatch && overrideReason.trim().length < 20) {
      setError('Override reason must be at least 20 characters.')
      return
    }
    setError(null)
    if (highMatch) {
      void logDuplicateOverride({
        verifierId:      userId,
        verifierRole:    role,
        maskedId:        verifiedData?.maskedId ?? null,
        confidenceScore: highMatch.confidenceScore,
        matchedBy:       highMatch.matchedBy,
        overrideReason:  overrideReason.trim(),
      })
    }
    setStep('preview')
  }, [duplicate, overrideReason, userId, role, verifiedData])

  // ── Full reset ─────────────────────────────────────────────────────────────
  const resetFlow = useCallback(() => {
    stopCountdown()
    setStep(initialStep)
    setPhone('')
    setOtp('')
    setGeneratedOtp('')
    setOtpSecondsLeft(OTP_TTL_SECONDS)
    setOtpExpired(false)
    setError(null)
    setIsLoading(false)
    setVerifiedData(null)
    setDuplicate(null)
    setOverrideReason('')
    setStatusMessage('')
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close()
    }
  }, [initialStep])

  return {
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
    isDigiLockerProduction: IS_DIGILOCKER_PRODUCTION,
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
  }
}
