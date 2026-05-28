/**
 * smsProvider.ts — SMS delivery abstraction for OTP messages.
 *
 * Provider selection (evaluated at call-time, not build-time):
 *   MSG91  → when MSG91_API_KEY and MSG91_TEMPLATE_ID are set (production)
 *   Console → development fallback when env vars are absent
 *
 * To add a second provider (e.g. Twilio), implement the same interface
 * and add a branch in sendOtpSms().
 *
 * Security: the OTP value is ONLY passed into this function from the
 * API route after it has already been hashed and stored in Firestore.
 * It is never written to any log here in production mode.
 */

export type SmsProvider = 'msg91' | 'console'

export interface SmsResult {
  sent: boolean
  provider: SmsProvider
}

/**
 * Sends a 6-digit OTP to the given Indian mobile number.
 * Falls back to server-side console.info() when no SMS credentials are set
 * (development / demo mode — the API route returns the OTP to the client
 * for display, so staff can test the flow without real SMS).
 */
export async function sendOtpSms(
  phone: string,
  otp: string,
): Promise<SmsResult> {
  const apiKey     = process.env.MSG91_API_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID

  // ── Development / demo fallback ──────────────────────────────────────────
  if (!apiKey || !templateId) {
    // Intentionally verbose so the OTP is easy to find during testing
    console.info(`[OTP DEV] ☎  ${phone}  →  ${otp}  (SMS not sent — set MSG91_API_KEY to enable)`)
    return { sent: true, provider: 'console' }
  }

  // ── MSG91 OTP API v5 ──────────────────────────────────────────────────────
  // Docs: https://msg91.com/help/send-otp-api
  const mobile = `91${phone.replace(/\D/g, '').slice(-10)}`

  const response = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authkey': apiKey,
    },
    body: JSON.stringify({
      template_id: templateId,
      mobile,
      otp,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`MSG91 error ${response.status}: ${body}`)
  }

  return { sent: true, provider: 'msg91' }
}
