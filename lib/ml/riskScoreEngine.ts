/**
 * Client-side logistic regression inference engine for patient risk scoring.
 *
 * This module has ZERO external dependencies. It implements the mathematical
 * operations of a trained sklearn LogisticRegression model:
 *   1. Feature extraction from Patient record
 *   2. Z-score standardization using saved scaler params
 *   3. Dot product: z = weights · features + intercept
 *   4. Sigmoid activation: P = 1 / (1 + exp(-z))
 *   5. Risk tier classification + factor attribution
 *
 * The model weights (coefficients, scaler, categorical maps) are loaded from
 * a static JSON file that is the output of the Python training script.
 */

import type { Patient } from '@/schema/patient'
import type { ModelWeights, RiskResult, RiskTier } from './types'
import { extractFeatures, FEATURE_LABELS } from './featureExtractor'
import modelWeightsData from './model-weights.json'

// Load and type-assert the model weights from the JSON import
const MODEL: ModelWeights = modelWeightsData as ModelWeights

// Validate model integrity at load time — fail loudly if the JSON is malformed
const featureCount = MODEL.features.length
if (
  MODEL.weights.length !== featureCount ||
  MODEL.scaler.mean.length !== featureCount ||
  MODEL.scaler.std.length !== featureCount
) {
  console.error(
    `[ML] model-weights.json is malformed: features(${featureCount}), ` +
    `weights(${MODEL.weights.length}), mean(${MODEL.scaler.mean.length}), ` +
    `std(${MODEL.scaler.std.length}) — arrays must all be the same length.`
  )
}

// Flag: whether this model was trained on real data or is just the baseline stub
const isModelTrained = MODEL.metrics.samplesUsed > 0

// ---------------------------------------------------------------------------
// Mathematical primitives
// ---------------------------------------------------------------------------

/**
 * Sigmoid activation function: σ(z) = 1 / (1 + e^(-z))
 *
 * Clamps input to [-500, 500] to prevent floating point overflow.
 * At z = -500, sigmoid ≈ 0. At z = 500, sigmoid ≈ 1.
 */
export function sigmoid(z: number): number {
  const clamped = Math.max(-500, Math.min(500, z))
  return 1 / (1 + Math.exp(-clamped))
}

/**
 * Standardizes a feature value using z-score normalization:
 *   z = (x - mean) / std
 *
 * If std is zero (constant feature), returns 0 to avoid division by zero.
 */
export function standardize(value: number, mean: number, std: number): number {
  if (std === 0) return 0
  return (value - mean) / std
}

/**
 * Computes the dot product of two equal-length numeric arrays.
 * Throws if the arrays have different lengths.
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `dotProduct: array length mismatch (${a.length} vs ${b.length})`
    )
  }
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

// ---------------------------------------------------------------------------
// Risk tier classification
// ---------------------------------------------------------------------------

/** Score thresholds for risk tier boundaries */
const RISK_THRESHOLDS = {
  LOW_MAX: 0.3,
  MEDIUM_MAX: 0.6,
} as const

/**
 * Maps a probability score [0, 1] to a human-readable risk tier.
 *   - [0.0, 0.3) → Low
 *   - [0.3, 0.6) → Medium
 *   - [0.6, 1.0] → High
 */
export function classifyRiskTier(score: number): RiskTier {
  if (score < RISK_THRESHOLDS.LOW_MAX) return 'Low'
  if (score < RISK_THRESHOLDS.MEDIUM_MAX) return 'Medium'
  return 'High'
}

// ---------------------------------------------------------------------------
// Factor attribution
// ---------------------------------------------------------------------------

/**
 * Computes the top contributing factors to the risk score.
 *
 * Method: For each feature, the contribution is defined as:
 *   contribution_i = standardized_feature_i × weight_i
 *
 * We sort by absolute contribution (descending) and return the top N
 * feature names with human-readable labels. This is mathematically
 * equivalent to a first-order linear attribution — appropriate for
 * logistic regression where feature contributions are additive in log-odds.
 */
export function computeTopFactors(
  standardizedFeatures: number[],
  weights: number[],
  featureNames: string[],
  topN: number = 3
): string[] {
  const contributions = standardizedFeatures.map((feat, i) => ({
    name: featureNames[i],
    contribution: feat * weights[i],
    absContribution: Math.abs(feat * weights[i]),
  }))

  // Sort by absolute contribution, descending
  contributions.sort((a, b) => b.absContribution - a.absContribution)

  return contributions.slice(0, topN).map((c) => {
    const label = FEATURE_LABELS[c.name] || c.name
    const direction = c.contribution > 0 ? '↑' : '↓'
    return `${label} ${direction}`
  })
}

// ---------------------------------------------------------------------------
// Main inference function
// ---------------------------------------------------------------------------

/**
 * Computes the follow-up adherence risk score for a patient.
 *
 * Returns null if the patient record lacks sufficient data for inference
 * (e.g., missing DOB or hospital registration date).
 *
 * @param patient - A Patient record from Firestore
 * @param referenceDate - Optional date to use as "today" (useful for testing)
 * @returns RiskResult with score, tier, and top contributing factors
 */
export function computeRiskScore(
  patient: Patient,
  referenceDate?: Date
): RiskResult | null {
  // Don't show scores from an untrained baseline model
  if (!isModelTrained) return null

  // Skip deceased patients — risk scoring is for treatment adherence
  if (patient.patientStatus === 'Not Alive') return null

  // Step 1: Extract raw feature vector from patient record
  const rawFeatures = extractFeatures(patient, MODEL.categoricalMaps, referenceDate)
  if (rawFeatures === null) return null

  // Step 2: Standardize features using the saved scaler
  const { mean, std } = MODEL.scaler
  const standardizedFeatures = rawFeatures.map((val, i) =>
    standardize(val, mean[i], std[i])
  )

  // Step 3: Compute linear combination z = w·x + b
  const z = dotProduct(standardizedFeatures, MODEL.weights) + MODEL.intercept

  // Step 4: Apply sigmoid to get probability
  const score = sigmoid(z)

  // Step 5: Classify tier and compute factor attribution
  const tier = classifyRiskTier(score)
  const factors = computeTopFactors(
    standardizedFeatures,
    MODEL.weights,
    MODEL.features
  )

  return { score, tier, factors }
}
