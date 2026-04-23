/**
 * Unit tests for the ML feature extraction module.
 *
 * Tests cover:
 *   - Date computation helpers (daysBetween, computeAge)
 *   - Categorical encoding lookups
 *   - Full feature vector extraction from Patient records
 *   - Edge cases: missing data, null fields, invalid dates
 */

import { describe, expect, it } from 'vitest'
import {
  daysBetween,
  computeAge,
  encodeCategorical,
  extractFeatures,
} from '@/lib/ml/featureExtractor'
import type { Patient } from '@/schema/patient'
import modelWeights from '@/lib/ml/model-weights.json'
import type { CategoricalMaps } from '@/lib/ml/types'

const categoricalMaps = modelWeights.categoricalMaps as CategoricalMaps

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

describe('daysBetween', () => {
  it('computes correct positive difference', () => {
    expect(daysBetween('2026-01-01', '2026-01-31')).toBe(30)
  })

  it('returns 0 for same day', () => {
    expect(daysBetween('2026-03-15', '2026-03-15')).toBe(0)
  })

  it('returns negative for reversed dates', () => {
    expect(daysBetween('2026-02-01', '2026-01-01')).toBe(-31)
  })

  it('returns null for missing start date', () => {
    expect(daysBetween(null, '2026-01-01')).toBeNull()
  })

  it('returns null for missing end date', () => {
    expect(daysBetween('2026-01-01', undefined)).toBeNull()
  })

  it('returns null for empty string dates', () => {
    expect(daysBetween('', '2026-01-01')).toBeNull()
  })

  it('returns null for unparseable date', () => {
    expect(daysBetween('not-a-date', '2026-01-01')).toBeNull()
  })
})

describe('computeAge', () => {
  it('computes correct age for past birthday this year', () => {
    const ref = new Date('2026-06-15')
    expect(computeAge('1990-01-01', ref)).toBe(36)
  })

  it('adjusts age when birthday has not occurred yet', () => {
    const ref = new Date('2026-06-15')
    expect(computeAge('1990-12-01', ref)).toBe(35)
  })

  it('returns null for missing DOB', () => {
    expect(computeAge(undefined)).toBeNull()
  })

  it('returns null for empty string DOB', () => {
    expect(computeAge('')).toBeNull()
  })

  it('returns null for invalid date string', () => {
    expect(computeAge('xyz')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Categorical encoding
// ---------------------------------------------------------------------------

describe('encodeCategorical', () => {
  it('returns mapped value for known key', () => {
    expect(encodeCategorical('male', categoricalMaps.sex)).toBe(1)
    expect(encodeCategorical('female', categoricalMaps.sex)).toBe(0)
  })

  it('returns default for unknown key', () => {
    expect(encodeCategorical('unknown_value', categoricalMaps.sex, 99)).toBe(99)
  })

  it('returns default for null value', () => {
    expect(encodeCategorical(null, categoricalMaps.sex)).toBe(0)
  })

  it('returns default for undefined value', () => {
    expect(encodeCategorical(undefined, categoricalMaps.sex)).toBe(0)
  })

  it('returns default for empty string', () => {
    expect(encodeCategorical('', categoricalMaps.sex)).toBe(0)
  })

  it('correctly encodes cancer stages', () => {
    expect(encodeCategorical('In Situ', categoricalMaps.stageOfTheCancer)).toBe(0)
    expect(encodeCategorical('Stage I', categoricalMaps.stageOfTheCancer)).toBe(1)
    expect(encodeCategorical('Stage II', categoricalMaps.stageOfTheCancer)).toBe(2)
    expect(encodeCategorical('Stage III', categoricalMaps.stageOfTheCancer)).toBe(3)
    expect(encodeCategorical('Stage IV', categoricalMaps.stageOfTheCancer)).toBe(4)
  })

  it('correctly encodes insurance types', () => {
    expect(encodeCategorical('none', categoricalMaps.insuranceType)).toBe(0)
    expect(encodeCategorical('Government', categoricalMaps.insuranceType)).toBe(1)
    expect(encodeCategorical('Private', categoricalMaps.insuranceType)).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Full feature extraction
// ---------------------------------------------------------------------------

describe('extractFeatures', () => {
  const referenceDate = new Date('2026-04-23')

  // Minimal valid patient record
  const validPatient: Patient = {
    id: 'test-001',
    name: 'Test Patient',
    sex: 'male',
    dob: '1970-05-15',
    address: '123 Test Street',
    hasAadhaar: true,
    assignedHospital: { id: 'h-001', name: 'Test Hospital' },
    hospitalRegistrationDate: '2025-10-01',
    treatmentStartDate: '2025-10-15',
    treatmentEndDate: null,
    stageOfTheCancer: 'Stage II',
    patientStatus: 'Alive',
    assignedAsha: 'asha_01',
    transferred: false,
    insurance: { type: 'Government', id: 'GOV-123' },
    rationCardColor: 'yellow',
    followUps: [
      { date: '2025-11-01', remarks: 'Stable' },
      { date: '2026-01-15', remarks: 'Improving' },
    ],
  }

  it('returns a 12-element feature vector for a valid patient', () => {
    const features = extractFeatures(validPatient, categoricalMaps, referenceDate)
    expect(features).not.toBeNull()
    expect(features).toHaveLength(12)
  })

  it('computes correct age', () => {
    const features = extractFeatures(validPatient, categoricalMaps, referenceDate)!
    // Born 1970-05-15, reference 2026-04-23 → birthday not yet this year → age 55
    expect(features[0]).toBe(55)
  })

  it('encodes sex correctly', () => {
    const features = extractFeatures(validPatient, categoricalMaps, referenceDate)!
    // male → 1
    expect(features[1]).toBe(1)
  })

  it('encodes cancer stage correctly', () => {
    const features = extractFeatures(validPatient, categoricalMaps, referenceDate)!
    // Stage II → 2
    expect(features[2]).toBe(2)
  })

  it('computes days since registration', () => {
    const features = extractFeatures(validPatient, categoricalMaps, referenceDate)!
    // 2025-10-01 to 2026-04-23 = 204 days
    expect(features[3]).toBe(204)
  })

  it('computes follow-up count', () => {
    const features = extractFeatures(validPatient, categoricalMaps, referenceDate)!
    expect(features[5]).toBe(2)
  })

  it('encodes has_asha_assigned as 1 when ASHA is present', () => {
    const features = extractFeatures(validPatient, categoricalMaps, referenceDate)!
    expect(features[8]).toBe(1)
  })

  it('returns null when DOB is missing', () => {
    const patientNoDob = { ...validPatient, dob: undefined }
    expect(extractFeatures(patientNoDob, categoricalMaps, referenceDate)).toBeNull()
  })

  it('returns null when hospital registration date is missing', () => {
    const patientNoReg = { ...validPatient, hospitalRegistrationDate: undefined }
    expect(extractFeatures(patientNoReg, categoricalMaps, referenceDate)).toBeNull()
  })

  it('handles patient with no follow-ups', () => {
    const noFollowUps = { ...validPatient, followUps: [] }
    const features = extractFeatures(noFollowUps, categoricalMaps, referenceDate)!
    // follow_up_count should be 0
    expect(features[5]).toBe(0)
    // days_since_last_follow_up should fall back to days_since_registration
    expect(features[6]).toBe(features[3])
  })

  it('handles patient with no ASHA assigned', () => {
    const noAsha = { ...validPatient, assignedAsha: '' }
    const features = extractFeatures(noAsha, categoricalMaps, referenceDate)!
    expect(features[8]).toBe(0)
  })

  it('handles missing insurance', () => {
    const noInsurance = { ...validPatient, insurance: undefined }
    const features = extractFeatures(noInsurance, categoricalMaps, referenceDate)!
    // Should default to 0 (none)
    expect(features[7]).toBe(0)
  })
})
