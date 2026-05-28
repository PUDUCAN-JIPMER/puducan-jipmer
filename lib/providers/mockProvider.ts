import type { IdentityProvider } from '@/lib/verification/provider'
import type { VerifiedPatientData } from '@/lib/verification/types'
import { MOCK_PHONE_PERSONAS } from '@/lib/verification/constants'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Default persona used when the phone number is not in MOCK_PHONE_PERSONAS */
const DEFAULT_PERSONA = {
  name: 'Demo Patient',
  aadhaarNumber: '234567891234',
  maskedId: 'XXXX-XXXX-1234',
  dob: '2001-05-12',
  gender: 'Male' as const,
  address: 'Chennai, Tamil Nadu',
}

/**
 * MockProvider — realistic simulation of a DigiLocker-style identity lookup.
 *
 * Returns different deterministic demographic data based on the phone number,
 * allowing testers to exercise multiple personas without real API calls.
 * Known test personas are defined in lib/verification/constants.ts.
 *
 * Security: no real identity data, no external requests, no secrets required.
 */
export class MockProvider implements IdentityProvider {
  readonly source = 'mock' as const
  constructor(private readonly phone: string) {}

  async verify(): Promise<VerifiedPatientData> {
    await delay(2000)

    const cleaned = this.phone.replace(/\D/g, '').slice(-10)
    const persona = MOCK_PHONE_PERSONAS[cleaned] ?? DEFAULT_PERSONA

    return {
      fullName:           persona.name,
      dob:                persona.dob,
      gender:             persona.gender,
      address:            persona.address,
      phoneNumber:        this.phone,
      aadhaarNumber:      persona.aadhaarNumber,
      abhaNumber:         persona.abhaNumber,   // undefined when not linked
      maskedId:           persona.maskedId,
      verificationSource: 'mock',
      verifiedAt:         new Date().toISOString(),
    }
  }
}
