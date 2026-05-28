/**
 * hooks/verification/index.ts — Barrel export for all verification hooks.
 *
 * Consumers can import from this single path:
 *   import { usePatientVerification, useDuplicateDetection, useConsentTracking }
 *     from '@/hooks/verification'
 */

export { usePatientVerification } from './usePatientVerification'
export { useDuplicateDetection }  from './useDuplicateDetection'
export { useConsentTracking }     from './useConsentTracking'
export { useAuditLog }            from './useAuditLog'
export type { AuditLogRecord, AuditLogFilters } from './useAuditLog'
