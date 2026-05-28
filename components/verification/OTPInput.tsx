'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { OTP_LENGTH } from '@/lib/verification/constants'
import type { OTPInputProps } from '@/types/verification/verification.types'

/**
 * OTPInput — 6-cell individual digit input for OTP verification.
 *
 * UX behaviour:
 *   - Each cell accepts exactly one digit
 *   - Focus advances to the next cell automatically on digit entry
 *   - Backspace clears the current cell and moves focus to the previous cell
 *   - Paste of a 6-digit string fills all cells at once
 *   - Tab / Shift-Tab navigate between cells
 *
 * Accessibility:
 *   - Each cell has aria-label="Digit N of 6"
 *   - The group has role="group" with a descriptive label
 *   - Error state is communicated via aria-invalid
 */
export function OTPInput({
  value,
  onChange,
  length = OTP_LENGTH,
  disabled = false,
  hasError = false,
  autoFocus = false,
  className,
}: OTPInputProps) {
  // Build exactly `length` single-char slots; empty slots become ''
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Auto-focus first cell on mount when requested
  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  function handleChange(index: number, rawValue: string) {
    const digit = rawValue.replace(/\D/g, '').slice(-1)
    if (!digit) return

    const next = digits.map((d, i) => (i === index ? digit : d)).join('')
    onChange(next)

    // Advance focus to next cell
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[index]) {
        // Clear current cell
        const next = digits.map((d, i) => (i === index ? '' : d)).join('')
        onChange(next)
      } else if (index > 0) {
        // Move to previous cell and clear it
        const next = digits.map((d, i) => (i === index - 1 ? '' : d)).join('')
        onChange(next)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted.padEnd(length, '').slice(0, length))
    // Focus the cell after the last pasted digit
    const focusIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div
      role="group"
      aria-label="One-time password input"
      className={cn('flex items-center gap-2 sm:gap-3', className)}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={hasError}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-11 w-10 sm:h-12 sm:w-11 rounded-lg border text-center text-lg font-semibold',
            'bg-background text-foreground',
            'transition-colors focus-visible:outline-none focus-visible:ring-2',
            !hasError && [
              'border-input focus-visible:border-primary focus-visible:ring-primary/20',
            ],
            hasError && [
              'border-destructive bg-destructive/5 text-destructive',
              'focus-visible:border-destructive focus-visible:ring-destructive/20',
            ],
            disabled && 'cursor-not-allowed opacity-50',
          )}
        />
      ))}
    </div>
  )
}
