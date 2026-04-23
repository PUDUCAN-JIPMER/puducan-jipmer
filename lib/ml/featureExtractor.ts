/**
 * Feature extraction module for the risk scoring ML pipeline.
 *
 * Converts a raw Patient record from Firestore into a numeric feature vector
 * that matches the ordering defined in model-weights.json. All categorical
 * encoding is driven by the categoricalMaps from the model weights — there
 * are zero hardcoded string → number mappings in this file.
 */

import type { Patient } from '@/schema/patient'
import type { CategoricalMaps } from './types'

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Calculates the number of whole days between two date strings.
 * Returns null if either date is missing or unparseable.
 */
export function daysBetween(startDateStr: string | null | undefined, endDateStr: string | null | undefined): number | null {
  if (!startDateStr || !endDateStr) return null

  const start = new Date(startDateStr)
  const end = new Date(endDateStr)

  // Guard against invalid date parsing
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null

  const diffMs = end.getTime() - start.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Computes patient age in years from a date-of-birth string.
 * Returns null if the DOB is missing or unparseable.
 */
export function computeAge(dob: string | undefined, referenceDate?: Date): number | null {
  if (!dob) return null

  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return null

  const ref = referenceDate ?? new Date()
  let age = ref.getFullYear() - birth.getFullYear()

  // Adjust if the birthday hasn't occurred yet this year
  const monthDiff = ref.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// ---------------------------------------------------------------------------
// Categorical lookup
// ---------------------------------------------------------------------------

/**
 * Looks up a string value in a categorical map. Returns a default value if the
 * key is missing or not found. This is the ONLY mechanism for encoding —
 * the maps come from model-weights.json so Python and TS stay in perfect sync.
 */
export function encodeCategorical(
  value: string | undefined | null,
  map: Record<string, number>,
  defaultValue: number = 0
): number {
  if (value == null || value === '') return defaultValue
  return map[value] ?? defaultValue
}

// ---------------------------------------------------------------------------
// Feature vector construction
// ---------------------------------------------------------------------------

/** Human-readable labels for each feature, indexed to match the feature vector */
export const FEATURE_LABELS: Record<string, string> = {
  age: 'Patient age',
  sex_encoded: 'Sex',
  cancer_stage_ordinal: 'Cancer stage severity',
  days_since_registration: 'Days since hospital registration',
  treatment_duration_days: 'Duration of treatment',
  follow_up_count: 'Number of follow-ups',
  days_since_last_follow_up: 'Days since last follow-up',
  insurance_type_encoded: 'Insurance coverage',
  has_asha_assigned: 'ASHA worker assigned',
  is_transferred: 'Patient was transferred',
  ration_card_encoded: 'Ration card status',
  patient_status_encoded: 'Patient vital status',
}

/**
 * Extracts a numeric feature vector from a Patient record.
 *
 * The returned array MUST match the feature ordering in model-weights.json.
 * Every feature is derived using only:
 *   - Patient record fields (from Firestore schema)
 *   - categoricalMaps (from model-weights.json)
 *   - The current date for time-based features
 *
 * Returns null if the patient record lacks the minimum required fields
 * (DOB + hospital registration date) to produce a meaningful prediction.
 */
export function extractFeatures(
  patient: Patient,
  categoricalMaps: CategoricalMaps,
  referenceDate?: Date
): number[] | null {
  const today = referenceDate ?? new Date()
  const todayStr = today.toISOString().split('T')[0]

  // --- Minimum data check ---
  // Without DOB and registration date we can't produce a reliable score
  const age = computeAge(patient.dob, today)
  if (age === null) return null

  const daysSinceRegistration = daysBetween(patient.hospitalRegistrationDate, todayStr)
  if (daysSinceRegistration === null) return null

  // --- Categorical features (all driven by maps from JSON) ---
  const sexEncoded = encodeCategorical(patient.sex, categoricalMaps.sex)
  const cancerStageOrdinal = encodeCategorical(
    patient.stageOfTheCancer,
    categoricalMaps.stageOfTheCancer
  )
  const insuranceTypeEncoded = encodeCategorical(
    patient.insurance?.type,
    categoricalMaps.insuranceType
  )
  const rationCardEncoded = encodeCategorical(
    patient.rationCardColor,
    categoricalMaps.rationCardColor
  )
  const patientStatusEncoded = encodeCategorical(
    patient.patientStatus,
    categoricalMaps.patientStatus
  )

  // --- Numeric features ---
  const treatmentDurationDays = daysBetween(
    patient.treatmentStartDate,
    patient.treatmentEndDate ?? todayStr
  ) ?? 0

  const followUpCount = patient.followUps?.length ?? 0

  // Find the most recent follow-up date to compute recency gap
  let daysSinceLastFollowUp = daysSinceRegistration // default: no follow-ups ever
  if (patient.followUps && patient.followUps.length > 0) {
    const followUpDates = patient.followUps
      .map((f) => f.date)
      .filter((d): d is string => d != null && d !== '')
      .map((d) => new Date(d).getTime())
      .filter((t) => !isNaN(t))

    if (followUpDates.length > 0) {
      const mostRecentMs = Math.max(...followUpDates)
      const gapMs = today.getTime() - mostRecentMs
      daysSinceLastFollowUp = Math.max(0, Math.floor(gapMs / (1000 * 60 * 60 * 24)))
    }
  }

  const hasAshaAssigned = patient.assignedAsha && patient.assignedAsha.trim() !== '' ? 1 : 0
  const isTransferred = patient.transferred ? 1 : 0

  // --- Assemble feature vector (order MUST match model-weights.json "features" array) ---
  return [
    age,
    sexEncoded,
    cancerStageOrdinal,
    daysSinceRegistration,
    treatmentDurationDays,
    followUpCount,
    daysSinceLastFollowUp,
    insuranceTypeEncoded,
    hasAshaAssigned,
    isTransferred,
    rationCardEncoded,
    patientStatusEncoded,
  ]
}
