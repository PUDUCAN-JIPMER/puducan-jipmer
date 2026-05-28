/**
 * detector.ts — Three-tier duplicate patient detection.
 *
 * Tiers (executed in priority order):
 *   1. Aadhaar exact match   → confidence 1.0  (definitive)
 *   2. Phone exact match     → confidence 0.85 (high)
 *   3. Name + DOB fuzzy      → confidence = similarity × 0.7  (medium)
 *
 * All matches above DUPLICATE_CONFIDENCE_SOFT are returned, sorted by
 * confidence descending. The caller decides how to present them in the UI.
 *
 * This is the single authoritative duplicate detector for all verification flows.
 */

import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'
import type { Patient } from '@/schema/patient'
import type {
  DuplicateCheckResult,
  DuplicatePatientSummary,
  VerifiedPatientData,
} from '@/lib/verification/types'
import {
  DUPLICATE_CONFIDENCE_SOFT,
  FUZZY_NAME_THRESHOLD,
} from '@/lib/verification/constants'
import { stringSimilarity } from './fuzzy'

// ── Internal helpers ──────────────────────────────────────────────────────────

function buildSummary(
  docId: string,
  patient: Patient,
  matchedBy: DuplicatePatientSummary['matchedBy'],
  confidenceScore: number,
): DuplicatePatientSummary {
  return {
    id: docId,
    name: patient.name,
    dob: patient.dob,
    hospitalRegistrationDate: patient.hospitalRegistrationDate,
    assignedHospitalName: patient.assignedHospital?.name,
    matchedBy,
    confidenceScore,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * detectDuplicates — queries Firestore for potential duplicate patients.
 *
 * Returns { isDuplicate: false } when no match exceeds DUPLICATE_CONFIDENCE_SOFT.
 * When matches are found, `patient` holds the highest-confidence match and
 * `allMatches` holds the full sorted list for UI rendering.
 */
export async function detectDuplicates(
  data: VerifiedPatientData,
): Promise<DuplicateCheckResult> {
  const patientsRef = collection(db, 'patients')
  const matches: DuplicatePatientSummary[] = []

  // ── Tier 1: Aadhaar 12-digit exact match ─────────────────────────────────
  if (data.aadhaarNumber) {
    const snap = await getDocs(
      query(patientsRef, where('aadhaarId', '==', data.aadhaarNumber)),
    )
    snap.docs.forEach((doc) => {
      matches.push(buildSummary(doc.id, doc.data() as Patient, 'maskedId', 1.0))
    })
  }

  // ── Tier 2: Phone number exact match (skip if Tier 1 found matches) ──────
  if (matches.length === 0 && data.phoneNumber) {
    const cleanPhone = data.phoneNumber.replace(/\D/g, '')
    // Try last 10 digits (bare) AND E.164 form (+91XXXXXXXXXX)
    const candidates = [cleanPhone.slice(-10), `+91${cleanPhone.slice(-10)}`]

    for (const fmt of candidates) {
      const snap = await getDocs(
        query(patientsRef, where('phoneNumber', 'array-contains', fmt)),
      )
      snap.docs.forEach((doc) => {
        if (!matches.some((m) => m.id === doc.id)) {
          matches.push(buildSummary(doc.id, doc.data() as Patient, 'phone', 0.85))
        }
      })
      if (matches.length > 0) break
    }
  }

  // ── Tier 3: Name + DOB fuzzy (skip if earlier tiers found matches) ────────
  if (matches.length === 0 && data.fullName && data.dob) {
    const allSnap = await getDocs(patientsRef)

    allSnap.docs.forEach((doc) => {
      const p = doc.data() as Patient
      if (!p.name || p.dob !== data.dob) return   // DOB must match exactly

      const sim = stringSimilarity(p.name, data.fullName)
      if (sim < FUZZY_NAME_THRESHOLD) return

      const confidence = sim * 0.7                 // max 0.7 for fuzzy tier
      if (confidence >= DUPLICATE_CONFIDENCE_SOFT) {
        matches.push(buildSummary(doc.id, p, 'name+dob', confidence))
      }
    })
  }

  // Sort highest confidence first
  matches.sort((a, b) => b.confidenceScore - a.confidenceScore)

  if (matches.length === 0) {
    return { isDuplicate: false, allMatches: [] }
  }

  return {
    isDuplicate: true,
    patient: matches[0],
    allMatches: matches,
  }
}
