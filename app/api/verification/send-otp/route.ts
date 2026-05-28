/**
 * POST /api/verification/send-otp
 *
 * Generates a 6-digit OTP, stores its SHA-256 hash in Firestore with a 90s
 * TTL, and delivers it via SMS (MSG91 in production; console log in dev).
 *
 * Rate limit: 5 sends per phone number per 10-minute window.
 *
 * Request body:  { phone: string }   — 10-digit Indian mobile number
 * Response 200:  { success: true, devOtp?: string }
 *                devOtp is only present in NODE_ENV === 'development'
 * Response 400:  { error: string }   — invalid phone
 * Response 429:  { error: string }   — rate limit exceeded
 * Response 500:  { error: string }   — SMS delivery or storage failure
 */

import { NextRequest, NextResponse } from 'next/server'
import { storeOtp } from '@/lib/otp/otpStore'
import { sendOtpSms } from '@/lib/otp/smsProvider'
import { validatePhoneNumber } from '@/lib/verification/validation'
import { OTP_LENGTH } from '@/lib/verification/constants'

function generateOtp(): string {
  const min = 10 ** (OTP_LENGTH - 1)
  const max = 10 ** OTP_LENGTH - 1
  return String(Math.floor(min + Math.random() * (max - min + 1)))
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { phone?: unknown }
    const phone = String(body.phone ?? '').replace(/\D/g, '')

    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please enter a 10-digit Indian mobile number.' },
        { status: 400 },
      )
    }

    const otp = generateOtp()

    // Store hash + enforce rate limit
    const { allowed, message } = await storeOtp(phone, otp)
    if (!allowed) {
      return NextResponse.json({ error: message }, { status: 429 })
    }

    // Send via SMS (throws on provider failure)
    await sendOtpSms(phone, otp)

    // Return the raw OTP only in development so the UI can display it.
    // In production the OTP is delivered exclusively via SMS.
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json({
      success: true,
      ...(isDev && { devOtp: otp }),
    })
  } catch (err) {
    console.error('[send-otp]', err)
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 },
    )
  }
}
