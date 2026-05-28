import type { VerifiedPatientData, VerificationSource } from './types'

/**
 * IdentityProvider — generic interface that every verification backend must
 * implement. Concrete providers (Mock, DigiLocker, ABHA) are in lib/providers/.
 */
export interface IdentityProvider {
  /** Identifies the provider in audit logs. Must be a known VerificationSource. */
  readonly source: VerificationSource
  verify(): Promise<VerifiedPatientData>
}
