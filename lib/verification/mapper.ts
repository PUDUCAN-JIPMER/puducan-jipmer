import type { PatientFormInputs } from '@/schema/patient'
import type { VerifiedPatientData } from './types'

/**
 * The subset of PatientFormInputs that the verification system can populate.
 * Every field remains editable by the healthcare worker after autofill.
 */
export type AutoFillFields = Pick<
  PatientFormInputs,
  'name' | 'dob' | 'sex' | 'address' | 'phoneNumber' | 'aadhaarId' | 'abhaId'
>

/**
 * Normalises the gender string returned by any provider to the enum values
 * expected by the patient schema.
 */
function mapGender(gender: string): PatientFormInputs['sex'] {
  const g = gender.toLowerCase().trim()
  if (g === 'male') return 'male'
  if (g === 'female') return 'female'
  return 'other'
}

/**
 * Formats a raw phone number to E.164 so react-phone-number-input
 * renders it without validation errors. Assumes Indian (+91) numbers
 * when a bare 10-digit value is provided.
 */
function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return `+${digits}`
}

export function mapVerifiedDataToPatientFields(data: VerifiedPatientData): AutoFillFields {
  return {
    name:        data.fullName.trim(),
    dob:         data.dob,
    sex:         mapGender(data.gender),
    address:     data.address?.trim() ?? '',
    phoneNumber: data.phoneNumber ? [toE164(data.phoneNumber)] : [],
    aadhaarId:   data.aadhaarNumber ?? '',
    // Strip hyphens from ABHA number before storing (raw 14 digits).
    // Empty string when the provider did not resolve an ABHA account.
    abhaId:      data.abhaNumber ? data.abhaNumber.replace(/-/g, '') : '',
  }
}
