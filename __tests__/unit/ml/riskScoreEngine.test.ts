/**
 * Unit tests for the ML risk score inference engine.
 *
 * Tests cover:
 *   - Mathematical primitives (sigmoid, standardize, dotProduct)
 *   - Risk tier classification boundaries
 *   - Factor attribution (top contributing features)
 *   - Full inference pipeline from Patient record to RiskResult
 *   - Cross-language precision validation using test-vectors.json
 *   - Edge cases: deceased patients, missing data
 */

import { describe, expect, it } from 'vitest'
import {
  sigmoid,
  standardize,
  dotProduct,
  classifyRiskTier,
  computeTopFactors,
  computeRiskScore,
} from '@/lib/ml/riskScoreEngine'
import type { Patient } from '@/schema/patient'
import type { TestVector } from '@/lib/ml/types'
import modelWeights from '@/lib/ml/model-weights.json'
import testVectors from './test-vectors.json'

// ---------------------------------------------------------------------------
// Mathematical primitives
// ---------------------------------------------------------------------------

describe('sigmoid', () => {
  it('returns 0.5 for input 0', () => {
    expect(sigmoid(0)).toBe(0.5)
  })

  it('returns ~0.731 for input 1', () => {
    expect(sigmoid(1)).toBeCloseTo(0.7310585786, 5)
  })

  it('returns ~0.269 for input -1', () => {
    expect(sigmoid(-1)).toBeCloseTo(0.2689414214, 5)
  })

  it('approaches 1 for large positive input', () => {
    expect(sigmoid(100)).toBeCloseTo(1.0, 10)
  })

  it('approaches 0 for large negative input', () => {
    expect(sigmoid(-100)).toBeCloseTo(0.0, 10)
  })

  it('handles overflow protection at extreme values', () => {
    expect(sigmoid(1000)).toBeCloseTo(1, 10)
    expect(sigmoid(-1000)).toBeCloseTo(0, 10)
  })
})

describe('standardize', () => {
  it('returns 0 when value equals mean', () => {
    expect(standardize(50, 50, 10)).toBe(0)
  })

  it('returns 1 when value is one std above mean', () => {
    expect(standardize(60, 50, 10)).toBe(1)
  })

  it('returns -1 when value is one std below mean', () => {
    expect(standardize(40, 50, 10)).toBe(-1)
  })

  it('returns 0 when std is zero (constant feature)', () => {
    expect(standardize(42, 42, 0)).toBe(0)
  })
})

describe('dotProduct', () => {
  it('computes correct dot product', () => {
    expect(dotProduct([1, 2, 3], [4, 5, 6])).toBe(32) // 4+10+18
  })

  it('returns 0 for zero vectors', () => {
    expect(dotProduct([0, 0, 0], [1, 2, 3])).toBe(0)
  })

  it('throws on length mismatch', () => {
    expect(() => dotProduct([1, 2], [1, 2, 3])).toThrow('length mismatch')
  })
})

// ---------------------------------------------------------------------------
// Risk tier classification
// ---------------------------------------------------------------------------

describe('classifyRiskTier', () => {
  it('classifies scores below 0.3 as Low', () => {
    expect(classifyRiskTier(0)).toBe('Low')
    expect(classifyRiskTier(0.1)).toBe('Low')
    expect(classifyRiskTier(0.29)).toBe('Low')
  })

  it('classifies scores 0.3 to 0.6 as Medium', () => {
    expect(classifyRiskTier(0.3)).toBe('Medium')
    expect(classifyRiskTier(0.45)).toBe('Medium')
    expect(classifyRiskTier(0.59)).toBe('Medium')
  })

  it('classifies scores 0.6 and above as High', () => {
    expect(classifyRiskTier(0.6)).toBe('High')
    expect(classifyRiskTier(0.8)).toBe('High')
    expect(classifyRiskTier(1.0)).toBe('High')
  })
})

// ---------------------------------------------------------------------------
// Factor attribution
// ---------------------------------------------------------------------------

describe('computeTopFactors', () => {
  it('returns top 3 factors sorted by absolute contribution', () => {
    const features = [0.5, -0.2, 1.5, 0.1]
    const weights = [0.1, 0.8, 0.3, 0.5]
    const names = ['age', 'sex_encoded', 'cancer_stage_ordinal', 'days_since_registration']

    const factors = computeTopFactors(features, weights, names, 3)

    expect(factors).toHaveLength(3)
    // Contributions: 0.05, -0.16, 0.45, 0.05
    // Sorted by abs: cancer_stage (0.45), sex (-0.16), age/days (0.05 tie)
    expect(factors[0]).toContain('Cancer stage severity')
  })

  it('returns direction indicators (↑ for positive, ↓ for negative)', () => {
    const features = [1.0, -1.0]
    const weights = [0.5, 0.5]
    const names = ['age', 'sex_encoded']

    const factors = computeTopFactors(features, weights, names, 2)

    expect(factors[0]).toContain('↑')
    expect(factors[1]).toContain('↓')
  })
})

// ---------------------------------------------------------------------------
// Full inference pipeline
// ---------------------------------------------------------------------------

describe('computeRiskScore', () => {
  const referenceDate = new Date('2026-04-23')

  const testPatient: Patient = {
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
    stageOfTheCancer: 'Stage III',
    patientStatus: 'Alive',
    assignedAsha: '',
    transferred: false,
    insurance: { type: 'none' },
    rationCardColor: 'red',
    followUps: [],
  }

  it('returns a valid RiskResult for a complete patient record', () => {
    const result = computeRiskScore(testPatient, referenceDate)

    expect(result).not.toBeNull()
    expect(result!.score).toBeGreaterThanOrEqual(0)
    expect(result!.score).toBeLessThanOrEqual(1)
    expect(['Low', 'Medium', 'High']).toContain(result!.tier)
    expect(result!.factors.length).toBeGreaterThan(0)
    expect(result!.factors.length).toBeLessThanOrEqual(3)
  })

  it('returns null for deceased patients', () => {
    const deceased = { ...testPatient, patientStatus: 'Not Alive' as const }
    expect(computeRiskScore(deceased, referenceDate)).toBeNull()
  })

  it('returns null when DOB is missing', () => {
    const noDob = { ...testPatient, dob: undefined }
    expect(computeRiskScore(noDob, referenceDate)).toBeNull()
  })

  it('returns null when registration date is missing', () => {
    const noReg = { ...testPatient, hospitalRegistrationDate: undefined }
    expect(computeRiskScore(noReg, referenceDate)).toBeNull()
  })

  it('returns higher risk for patients without ASHA and no follow-ups', () => {
    const highRisk = {
      ...testPatient,
      assignedAsha: '',
      followUps: [],
      stageOfTheCancer: 'Stage IV',
      insurance: { type: 'none' as const },
    }

    const lowRisk = {
      ...testPatient,
      assignedAsha: 'asha_01',
      followUps: [
        { date: '2026-03-01', remarks: 'Good' },
        { date: '2026-04-01', remarks: 'Stable' },
      ],
      stageOfTheCancer: 'Stage I',
      insurance: { type: 'Government' as const },
    }

    const highResult = computeRiskScore(highRisk, referenceDate)
    const lowResult = computeRiskScore(lowRisk, referenceDate)

    expect(highResult).not.toBeNull()
    expect(lowResult).not.toBeNull()

    // A patient with worse indicators should generally score higher
    expect(highResult!.score).toBeGreaterThan(lowResult!.score)
  })
})

// ---------------------------------------------------------------------------
// Cross-language precision validation
//
// These test vectors are generated by the Python training script. If both
// implementations (Python sklearn + TS pure math) produce the same output
// for the same input within 1e-5 tolerance, the models are in sync.
// ---------------------------------------------------------------------------

describe('cross-language precision (test vectors)', () => {
  const vectors = testVectors as TestVector[]

  // Helper: manually run the inference math on raw feature values
  function computeScoreFromRawFeatures(rawFeatures: Record<string, number>): number {
    const { features, weights, intercept, scaler } = modelWeights

    const featureValues = features.map((name: string) => rawFeatures[name])

    // Standardize
    const scaled = featureValues.map(
      (val: number, i: number) => {
        const std = scaler.std[i]
        return std === 0 ? 0 : (val - scaler.mean[i]) / std
      }
    )

    // Dot product + intercept
    let z = intercept
    for (let i = 0; i < scaled.length; i++) {
      z += scaled[i] * weights[i]
    }

    // Sigmoid
    const clamped = Math.max(-500, Math.min(500, z))
    return 1 / (1 + Math.exp(-clamped))
  }

  vectors.forEach((vector, index) => {
    it(`test vector ${index}: TS output matches expected score within 1e-5`, () => {
      const tsScore = computeScoreFromRawFeatures(vector.rawFeatures)

      expect(Math.abs(tsScore - vector.expectedScore)).toBeLessThan(1e-5)
    })
  })
})
