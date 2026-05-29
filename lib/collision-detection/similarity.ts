/**
 * Probabilistic Patient Identity Collision Detection
 * Identifies likely duplicate oncology patients across hospitals
 */

type PatientRecord = {
	id: string
	name: string
	dob?: string
	phoneNumber?: string[]
	aadhaarId?: string
	aabhaId?: string
	bloodGroup?: string
	sex?: string
	assignedHospital: {
		id: string
		name: string
	}
	diagnosedDate?: string
	biopsyNumber?: string
	hbcrID?: string
	createdAt?: string
}

type CollisionMatch = {
	patientA: PatientRecord
	patientB: PatientRecord
	similarityScore: number
	matchingFields: string[]
	riskLevel: 'high' | 'medium' | 'low'
}

/**
 * Levenshtein distance for fuzzy string matching
 */
function levenshteinDistance(a: string, b: string): number {
	const matrix: number[][] = []

	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i]
	}

	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j
	}

	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1]
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j] + 1
				)
			}
		}
	}

	return matrix[b.length][a.length]
}

/**
 * Normalize and transliterate names for comparison
 * Handles regional spelling variations and common abbreviations
 */
function normalizeName(name: string): string {
	if (!name) return ''

	let normalized = name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ')
		// Handle Dr./Dr prefix
		.replace(/\bdr\.?\s+/g, '')
		// Handle periods but keep the letters
		.replace(/\./g, '')
		// Standardize spacing
		.replace(/\s+/g, ' ')

	// Remove extra spaces again
	return normalized.replace(/\s+/g, ' ').trim()
}

/**
 * Calculate name similarity score (0-1)
 */
function nameSimarity(name1: string, name2: string): number {
	const norm1 = normalizeName(name1)
	const norm2 = normalizeName(name2)

	if (norm1 === norm2) return 1

	// Extract initials for fuzzy matching
	const parts1 = norm1.split(' ').filter((p) => p.length > 0)
	const parts2 = norm2.split(' ').filter((p) => p.length > 0)
	const initials1 = parts1.map((n) => n[0]).join('')
	const initials2 = parts2.map((n) => n[0]).join('')

	// If initials match and both have multiple parts, very high confidence
	if (initials1 === initials2 && parts1.length > 1 && parts2.length > 1) return 0.95

	// If initials match and at least one part matches, high confidence
	if (initials1 === initials2) {
		for (const p1 of parts1) {
			if (parts2.some((p2) => p2.startsWith(p1.substring(0, 3)))) return 0.9
		}
		return 0.85
	}

	// Levenshtein distance similarity
	const maxLen = Math.max(norm1.length, norm2.length)
	const distance = levenshteinDistance(norm1, norm2)
	return Math.max(0, 1 - distance / maxLen)
}

/**
 * Calculate demographic similarity score (0-1)
 */
function demographicSimilarity(patient1: PatientRecord, patient2: PatientRecord): number {
	let score = 0
	let weights = 0

	// DOB comparison (if both exist)
	if (patient1.dob && patient2.dob) {
		score += patient1.dob === patient2.dob ? 0.3 : 0
		weights += 0.3
	}

	// Gender comparison
	if (patient1.sex && patient2.sex) {
		score += patient1.sex === patient2.sex ? 0.15 : 0
		weights += 0.15
	}

	// Blood group comparison
	if (patient1.bloodGroup && patient2.bloodGroup) {
		score += patient1.bloodGroup === patient2.bloodGroup ? 0.15 : 0
		weights += 0.15
	}

	// Phone number comparison
	if (patient1.phoneNumber?.length && patient2.phoneNumber?.length) {
		const overlap = patient1.phoneNumber.some((p1) =>
			patient2.phoneNumber?.includes(p1)
		)
		score += overlap ? 0.25 : 0
		weights += 0.25
	}

	return weights > 0 ? score / weights : 0
}

/**
 * Calculate ID-based collision score
 */
function idSimilarity(patient1: PatientRecord, patient2: PatientRecord): number {
	let matches = 0
	let checked = 0

	// Aadhaar ID
	if (patient1.aadhaarId && patient2.aadhaarId) {
		if (patient1.aadhaarId === patient2.aadhaarId) matches++
		checked++
	}

	// ABHA ID
	if (patient1.aabhaId && patient2.aabhaId) {
		if (patient1.aabhaId === patient2.aabhaId) matches++
		checked++
	}

	// HBCR ID (Hospital-level cancer registry ID)
	if (patient1.hbcrID && patient2.hbcrID) {
		if (patient1.hbcrID === patient2.hbcrID) matches++
		checked++
	}

	// Biopsy Number (unique per patient per hospital)
	if (patient1.biopsyNumber && patient2.biopsyNumber) {
		if (patient1.biopsyNumber === patient2.biopsyNumber) matches++
		checked++
	}

	return checked > 0 ? matches / checked : 0
}

/**
 * Calculate treatment pattern similarity
 */
function treatmentPatternSimilarity(patient1: PatientRecord, patient2: PatientRecord): number {
	let score = 0
	let weights = 0

	// Diagnosis date proximity (within 90 days = likely same case)
	if (patient1.diagnosedDate && patient2.diagnosedDate) {
		const date1 = new Date(patient1.diagnosedDate).getTime()
		const date2 = new Date(patient2.diagnosedDate).getTime()
		const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24)

		if (daysDiff < 90) {
			score += 0.3
		} else if (daysDiff < 365) {
			score += 0.15
		}
		weights += 0.3
	}

	return weights > 0 ? score / weights : 0
}

/**
 * Detect cross-hospital collisions
 */
export function detectCollisions(
	patients: PatientRecord[],
	nameThreshold = 0.6,
	overallThreshold = 0.72
): CollisionMatch[] {
	const collisions: CollisionMatch[] = []
	const checked = new Set<string>()

	for (let i = 0; i < patients.length; i++) {
		for (let j = i + 1; j < patients.length; j++) {
			const key = `${patients[i].id}-${patients[j].id}`

			if (checked.has(key)) continue
			checked.add(key)

			// Skip same hospital records
			if (patients[i].assignedHospital.id === patients[j].assignedHospital.id) {
				continue
			}

			const nameScore = nameSimarity(patients[i].name, patients[j].name)

			// Skip if names don't match well enough
			if (nameScore < nameThreshold) {
				continue
			}

			const demoScore = demographicSimilarity(patients[i], patients[j])
			const idScore = idSimilarity(patients[i], patients[j])
			const treatmentScore = treatmentPatternSimilarity(patients[i], patients[j])

			// Weighted overall score - name is strongest indicator
			let overallScore: number
			if (nameScore === 1.0) {
				// Perfect name match - score depends on supporting evidence
				overallScore = Math.min(1.0, 0.85 + demoScore * 0.15)
			} else {
				overallScore =
					nameScore * 0.5 + demoScore * 0.25 + idScore * 0.15 + treatmentScore * 0.1
			}

			if (overallScore >= overallThreshold) {
				const matchingFields: string[] = []

				if (nameScore > 0.8) matchingFields.push('name')
				if (patients[i].dob === patients[j].dob && patients[i].dob) matchingFields.push('dob')
				if (patients[i].sex === patients[j].sex && patients[i].sex) matchingFields.push('sex')
				if (idScore > 0.5) matchingFields.push('identifiers')
				if (treatmentScore > 0.3) matchingFields.push('treatment_pattern')

				let riskLevel: 'high' | 'medium' | 'low' = 'low'
			if (overallScore >= 0.80) riskLevel = 'high'
			else if (overallScore >= 0.70) riskLevel = 'medium'
				collisions.push({
					patientA: patients[i],
					patientB: patients[j],
					similarityScore: parseFloat(overallScore.toFixed(3)),
					matchingFields,
					riskLevel,
				})
			}
		}
	}

	return collisions.sort((a, b) => b.similarityScore - a.similarityScore)
}

/**
 * Get collision summary by hospital
 */
export function getCollisionAlert(collisions: CollisionMatch[]): {
	totalCollisions: number
	byHospital: Record<
		string,
		{
			hospitalName: string
			highRiskCount: number
			mediumRiskCount: number
		}
	>
} {
	const byHospital: Record<
		string,
		{
			hospitalName: string
			highRiskCount: number
			mediumRiskCount: number
		}
	> = {}

	collisions.forEach((collision) => {
		const hospitalId = collision.patientA.assignedHospital.id

		if (!byHospital[hospitalId]) {
			byHospital[hospitalId] = {
				hospitalName: collision.patientA.assignedHospital.name,
				highRiskCount: 0,
				mediumRiskCount: 0,
			}
		}

		if (collision.riskLevel === 'high') {
			byHospital[hospitalId].highRiskCount++
		} else if (collision.riskLevel === 'medium') {
			byHospital[hospitalId].mediumRiskCount++
		}
	})

	return {
		totalCollisions: collisions.length,
		byHospital,
	}
}
