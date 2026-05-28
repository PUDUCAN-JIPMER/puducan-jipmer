/**
 * POST /api/verification/verify-otp
 *
 * Validates a submitted OTP against the SHA-256 hash stored in Firestore.
 * On success the session is deleted (prevents replay attacks).
 * Attempt counter is incremented on failure; session is locked after
 * OTP_MAX_ATTEMPTS (5) incorrect guesses.
 *
 * Request body:  { phone: string, otp: string }
 * Response 200:  { success: true }
 * Response 400:  { error: string }   — invalid inputs or wrong OTP
 * Response 500:  { error: string }   — storage error
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp/otpStore'
import { validatePhoneNumber } from '@/lib/verification/validation'
import { OTP_LENGTH } from '@/lib/verification/constants'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { phone?: unknown; otp?: unknown }
    const phone = String(body.phone ?? '').replace(/\D/g, '')
    const otp   = String(body.otp   ?? '').trim()

    if (!validatePhoneNumber(phone)) {
      return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 })
    }

    if (!/^\d+$/.test(otp) || otp.length !== OTP_LENGTH) {
      return NextResponse.json(
        { error: `OTP must be exactly ${OTP_LENGTH} digits.` },
        { status: 400 },
      )
    }

    const result = await verifyOtp(phone, otp)

    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[verify-otp]', err)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 },
    )
  }
}
