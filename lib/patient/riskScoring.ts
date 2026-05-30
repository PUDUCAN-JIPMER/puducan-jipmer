import { Patient } from '@/schema/patient'

export interface RiskAssessment {
    score: number
    level: 'Low' | 'Medium' | 'High'
    reasons: string[]
}

/**
 * Calculates a patient's risk level based on static, predefined rules:
 * 1. Missed/delayed follow-ups
 * 2. Suspected case or advanced stage
 * 3. Advanced age (above 65 or 75)
 * 4. Delayed treatment start (registered > 15 days ago but no treatment start date)
 * 5. Red-flag symptoms in follow-up remarks
 */
export function computePatientRisk(patient: Partial<Patient>): RiskAssessment {
    let score = 0
    const reasons: string[] = []

    if (!patient) {
        return { score: 0, level: 'Low', reasons: [] }
    }

    const today = new Date()

    // 1. Missed / Delayed Follow-up
    const followUps = patient.followUps ?? []
    const regDateStr = patient.hospitalRegistrationDate

    if (followUps.length === 0) {
        if (regDateStr) {
            const regDate = new Date(regDateStr)
            if (!isNaN(regDate.getTime())) {
                const diffTime = Math.abs(today.getTime() - regDate.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                if (diffDays > 30) {
                    score += 2
                    reasons.push(`No follow-up registered in over 30 days since registration (+2)`)
                }
            }
        }
    } else {
        // Find latest follow up date
        let latestDate: Date | null = null
        for (const f of followUps) {
            if (f.date) {
                const d = new Date(f.date)
                if (!isNaN(d.getTime())) {
                    if (!latestDate || d > latestDate) {
                        latestDate = d
                    }
                }
            }
        }

        if (latestDate) {
            const diffTime = Math.abs(today.getTime() - latestDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            if (diffDays > 60) {
                score += 3
                reasons.push(`Last follow-up was more than 60 days ago (${diffDays} days) (+3)`)
            } else if (diffDays > 30) {
                score += 2
                reasons.push(`Last follow-up was more than 30 days ago (${diffDays} days) (+2)`)
            }
        }
    }

    // 2. Symptom / Clinical Severity
    if (patient.suspectedCase) {
        score += 2
        reasons.push(`Suspected cancer case (priority diagnostic follow-up) (+2)`)
    }

    const stageVal = patient.stageOfTheCancer?.stage
    if (stageVal) {
        if (stageVal === 'Stage IV') {
            score += 3
            reasons.push(`Advanced disease stage (Stage IV) (+3)`)
        } else if (stageVal === 'Stage III') {
            score += 2
            reasons.push(`Advanced disease stage (Stage III) (+2)`)
        }
    }

    // 3. Age-Based Risk Category
    if (patient.dob) {
        // dob is stored in YYYY-MM-DD format
        const birthDate = new Date(patient.dob)
        if (!isNaN(birthDate.getTime())) {
            let age = today.getFullYear() - birthDate.getFullYear()
            const m = today.getMonth() - birthDate.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            if (age > 75) {
                score += 2
                reasons.push(`Advanced age: ${age} years (> 75) (+2)`)
            } else if (age > 65) {
                score += 1
                reasons.push(`Advanced age: ${age} years (> 65) (+1)`)
            }
        }
    }

    // 4. Delayed Treatment Start
    // Registered but no treatmentStartDate, and registered > 15 days ago
    if (regDateStr && !patient.treatmentStartDate) {
        const regDate = new Date(regDateStr)
        if (!isNaN(regDate.getTime())) {
            const diffTime = Math.abs(today.getTime() - regDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            if (diffDays > 15) {
                score += 2
                reasons.push(`Delayed treatment start (> 15 days since registration) (+2)`)
            }
        }
    }

    // 5. Abnormal / Red-Flag Remarks
    // Scan last 3 follow-up remarks for warning keywords
    const redFlags = [
        'pain', 'bleed', 'vomit', 'fever', 'worse', 'deteriorat', 'side effect', 
        'severe', 'abnormal', 'refus', 'weak', 'progress'
    ]
    let flaggedFollowUpCount = 0

    // Sort follow-ups newest first
    const sortedFollowUps = [...followUps].sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0
        const db = b.date ? new Date(b.date).getTime() : 0
        return db - da
    })

    const recentFollowUps = sortedFollowUps.slice(0, 3)
    for (const f of recentFollowUps) {
        if (f.remarks) {
            const remarksLower = f.remarks.toLowerCase()
            const hasFlag = redFlags.some(flag => remarksLower.includes(flag))
            if (hasFlag) {
                flaggedFollowUpCount++
            }
        }
    }

    if (flaggedFollowUpCount >= 2) {
        score += 3
        reasons.push(`Repeated follow-ups indicate persistent/worsening symptoms (${flaggedFollowUpCount} follow-ups) (+3)`)
    } else if (flaggedFollowUpCount === 1) {
        score += 1
        reasons.push(`Recent follow-up remark contains potential red-flag symptoms (+1)`)
    }

    // Determine Risk Level
    let level: 'Low' | 'Medium' | 'High' = 'Low'
    if (score >= 6) {
        level = 'High'
    } else if (score >= 3) {
        level = 'Medium'
    }

    return { score, level, reasons }
}
