'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface ConsentCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/**
 * ConsentCheckbox — explicit patient consent gate.
 *
 * The verification workflow is disabled until the healthcare worker confirms
 * that the patient has been informed and has agreed to identity verification.
 * This satisfies healthcare data-consent requirements.
 */
export function ConsentCheckbox({ checked, onCheckedChange }: ConsentCheckboxProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
      <Checkbox
        id="patient-consent"
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(Boolean(val))}
        aria-required="true"
        className="mt-0.5 shrink-0"
      />
      <Label
        htmlFor="patient-consent"
        className="cursor-pointer text-sm leading-relaxed text-foreground"
      >
        I confirm that the patient has been informed about and has consented to
        identity verification via DigiLocker for the purpose of auto-filling
        their registration details.
      </Label>
    </div>
  )
}
