import type { IdentityProvider } from '@/lib/verification/provider'
import type { VerifiedPatientData } from '@/lib/verification/types'

/**
 * ABHAProvider — placeholder for the Ayushman Bharat Health Account (ABHA)
 * identity verification integration.
 *
 * Maintains the same IdentityProvider interface as DigiLockerProvider and
 * MockProvider so it can be swapped in without changes to the service layer.
 *
 * Implementation pending NHA API access and integration approval.
 */
export class ABHAProvider implements IdentityProvider {
  readonly source = 'abha' as const
  async verify(): Promise<VerifiedPatientData> {
    throw new Error(
      'ABHA integration is pending. Use MockProvider for development.',
    )
  }
}
