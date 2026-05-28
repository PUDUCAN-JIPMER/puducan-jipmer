'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VerificationModal } from './VerificationModal'
import { VerificationBadge } from './VerificationBadge'
import type { VerifiedPatientData } from '@/lib/verification/types'

interface VerifyPatientButtonProps {
  /** Called with the verified data when the user confirms autofill. */
  onVerified: (data: VerifiedPatientData) => void
  /** Whether verification has already completed for the current form session. */
  isVerified: boolean
  verificationSource?: VerifiedPatientData['verificationSource']
}

/**
 * VerifyPatientButton — surface-level entry point for the verification
 * workflow. Renders either:
 *
 *  - A "Verify via DigiLocker" trigger button (pre-verification), or
 *  - A VerificationBadge + "Re-verify" option (post-verification).
 *
 * Manages only the modal open/close state; all flow logic lives in
 * VerificationModal → usePatientVerification.
 */
export function VerifyPatientButton({
  onVerified,
  isVerified,
  verificationSource = 'mock',
}: VerifyPatientButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {isVerified ? (
        <>
          <VerificationBadge source={verificationSource} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setModalOpen(true)}
            aria-label="Re-verify patient identity"
          >
            <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
            Re-verify
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
          onClick={() => setModalOpen(true)}
          aria-label="Verify patient identity via DigiLocker"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Verify via DigiLocker
        </Button>
      )}

      <VerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onVerified={onVerified}
        initialStep="consent"
      />
    </div>
  )
}
