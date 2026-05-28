import type { IdentityProvider } from './provider'
import type { DuplicateCheckResult, VerifiedPatientData } from './types'
import { validateProviderResponse } from './validation'
import { detectDuplicates } from '@/lib/duplicate/detector'
import { writeAuditLog } from '@/lib/audit/logger'

export interface VerificationResult {
  data: VerifiedPatientData
  duplicate: DuplicateCheckResult
}

export interface VerificationContext {
  verifierId: string | null
  verifierRole: string | null
}

/**
 * VerificationService orchestrates a complete verification round-trip:
 *  1. Calls the injected IdentityProvider.
 *  2. Validates the response structure.
 *  3. Runs three-tier duplicate detection (Aadhaar → Phone → Name+DOB fuzzy).
 *  4. Writes an immutable audit log entry (success or failure).
 *
 * The constructor accepts a VerificationContext so audit entries carry the
 * verifier's identity without coupling it to provider implementations.
 */
export class VerificationService {
  constructor(
    private readonly provider: IdentityProvider,
    private readonly context: VerificationContext = { verifierId: null, verifierRole: null },
  ) {}

  async verify(): Promise<VerificationResult> {
    let raw: unknown

    try {
      raw = await this.provider.verify()
    } catch (err) {
      void writeAuditLog({
        verifierId: this.context.verifierId,
        verifierRole: this.context.verifierRole,
        provider: this.provider.source,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown provider error',
      })
      throw err
    }

    if (!validateProviderResponse(raw)) {
      const msg = 'Provider returned invalid or malformed data.'
      void writeAuditLog({
        verifierId: this.context.verifierId,
        verifierRole: this.context.verifierRole,
        provider: this.provider.source,
        success: false,
        error: msg,
      })
      throw new Error(msg)
    }

    const data: VerifiedPatientData = raw
    const duplicate = await detectDuplicates(data)

    void writeAuditLog({
      verifierId: this.context.verifierId,
      verifierRole: this.context.verifierRole,
      provider: data.verificationSource,
      success: true,
      maskedId: data.maskedId ?? null,
    })

    return { data, duplicate }
  }
}
