/**
 * Utilities for robust form draft persistence in localStorage.
 * Ensures keys are scoped by userId and patientId to prevent leakage and collisions.
 */

export interface DraftWrapper {
  data: Record<string, unknown>
  version: number
  updatedAt: number
}

const CURRENT_DRAFT_VERSION = 1

export const getDraftKey = (mode: 'add' | 'edit', userId: string, patientId?: string) => {
  if (mode === 'edit' && patientId) {
    return `patient-draft-v${CURRENT_DRAFT_VERSION}-edit-${patientId}-${userId}`
  }
  return `patient-draft-v${CURRENT_DRAFT_VERSION}-add-${userId}`
}

/**
 * Checks if the data contains any meaningful user-entered information.
 * Ignores common default booleans and empty structures.
 */
export const isMeaningfulData = (data: Record<string, unknown>) => {
  const meaningfulKeys = [
    'name', 'caregiverName', 'hbcrID', 'address', 'aadhaarId', 'aabhaId', 
    'bloodGroup', 'biopsyNumber', 'stageOfTheCancer', 'otherTreatmentDetails'
  ]

  if (!data) return false

  // Check strings (must be non-empty after trim)
  if (meaningfulKeys.some(key => data[key] && typeof data[key] === 'string' && (data[key] as string).trim().length > 0)) {
    return true
  }

  // Check phoneNumber (ignore [''])
  const phoneNumber = data.phoneNumber
  if (Array.isArray(phoneNumber)) {
    const hasRealPhone = phoneNumber.some((v: unknown) => v && typeof v === 'string' && v.trim().length > 0)
    if (hasRealPhone) return true
  }

  // Check diseases array (ignore empty)
  const diseases = data.diseases
  if (Array.isArray(diseases) && diseases.length > 0) {
    return true
  }

  // Check treatmentDetails array (ignore empty)
  const treatmentDetails = data.treatmentDetails
  if (Array.isArray(treatmentDetails) && treatmentDetails.length > 0) {
    return true
  }

  // Check specific non-'none' selects
  if (['rationCardColor', 'religion', 'sex'].some(key => 
    data[key] && 
    data[key] !== 'none' && 
    data[key] !== 'undefined' && 
    data[key] !== undefined
  )) {
    return true
  }

  // Check dates (hospitalRegistrationDate, dob, diagnosedDate)
  if (['hospitalRegistrationDate', 'dob', 'diagnosedDate'].some(key => 
    data[key] && typeof data[key] === 'string' && (data[key] as string).length > 0
  )) {
    return true
  }

  return false
}

export const saveDraft = (key: string, data: Record<string, unknown>, force = false) => {
  if (typeof window === 'undefined') return
  
  if (!force && !isMeaningfulData(data)) {
    // If it's not meaningful, we don't save it as a draft.
    // However, we don't clear the old draft here either, 
    // because the user might have just reset the form temporarily.
    return
  }

  const wrapper: DraftWrapper = {
    data,
    version: CURRENT_DRAFT_VERSION,
    updatedAt: Date.now()
  }

  localStorage.setItem(key, JSON.stringify(wrapper))
}

export const loadDraft = (key: string, maxAgeMs = 86400000) => { // Default 24h
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(key)
  if (!saved) return null
  
  try {
    const wrapper = JSON.parse(saved) as DraftWrapper
    
    // Version check
    if (wrapper.version !== CURRENT_DRAFT_VERSION) return null
    
    // Age check
    if (Date.now() - wrapper.updatedAt > maxAgeMs) {
      localStorage.removeItem(key)
      return null
    }

    return wrapper.data
  } catch (e) {
    console.error('Failed to parse draft', e)
    return null
  }
}

export const clearDraft = (key: string) => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}
