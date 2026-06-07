import { computePatientRisk } from '../../lib/patient/riskScoring'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { Patient } from '../../schema/patient'

describe('computePatientRisk', () => {
    // Freeze current date to 2026-05-25 for consistent testing
    beforeAll(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-05-25T00:00:00Z'))
    })

    afterAll(() => {
        vi.useRealTimers()
    })

    it('returns 0 score (Low Risk) for empty patient details', () => {
        const patient: Partial<Patient> = {}
        const result = computePatientRisk(patient)
        expect(result.score).toBe(0)
        expect(result.level).toBe('Low')
        expect(result.reasons.length).toBe(0)
    })

    it('scores missed follow-up for a patient with no follow-ups and registered > 30 days ago', () => {
        const patient: Partial<Patient> = {
            hospitalRegistrationDate: '2026-04-10', // 45 days ago
            treatmentStartDate: '2026-04-10',
        }
        const result = computePatientRisk(patient)
        expect(result.score).toBe(2)
        expect(result.reasons[0]).toContain('No follow-up registered in over 30 days')
    })

    it('scores missed follow-up for last follow-up > 30 and > 60 days ago', () => {
        const patient35Days: Partial<Patient> = {
            followUps: [{ date: '2026-04-20T00:00:00Z', remarks: 'Good health' }], // 35 days ago
        }
        const result35 = computePatientRisk(patient35Days)
        expect(result35.score).toBe(2)
        expect(result35.reasons[0]).toContain('Last follow-up was more than 30 days ago')

        const patient65Days: Partial<Patient> = {
            followUps: [{ date: '2026-03-20T00:00:00Z', remarks: 'Good health' }], // 66 days ago
        }
        const result65 = computePatientRisk(patient65Days)
        expect(result65.score).toBe(3)
        expect(result65.reasons[0]).toContain('Last follow-up was more than 60 days ago')
    })

    it('scores symptom/clinical severity (suspectedCase & cancer stage)', () => {
        const patientSuspected: Partial<Patient> = {
            suspectedCase: true,
        }
        const resultSuspected = computePatientRisk(patientSuspected)
        expect(resultSuspected.score).toBe(2)
        expect(resultSuspected.reasons[0]).toContain('Suspected cancer case')

        const patientStage4: Partial<Patient> = {
            stageOfTheCancer: { stage: 'Stage IV' },
        }
        const resultStage4 = computePatientRisk(patientStage4)
        expect(resultStage4.score).toBe(3)
        expect(resultStage4.reasons[0]).toContain('Stage IV')

        const patientStage3: Partial<Patient> = {
            stageOfTheCancer: { stage: 'Stage III' },
        }
        const resultStage3 = computePatientRisk(patientStage3)
        expect(resultStage3.score).toBe(2)
        expect(resultStage3.reasons[0]).toContain('Stage III')
    })

    it('scores age-based risk correctly', () => {
        const patientAge66: Partial<Patient> = {
            dob: '1960-01-01', // age ~66
        }
        const resultAge66 = computePatientRisk(patientAge66)
        expect(resultAge66.score).toBe(1)
        expect(resultAge66.reasons[0]).toContain('Advanced age: 66 years')

        const patientAge86: Partial<Patient> = {
            dob: '1940-01-01', // age ~86
        }
        const resultAge86 = computePatientRisk(patientAge86)
        expect(resultAge86.score).toBe(2)
        expect(resultAge86.reasons[0]).toContain('Advanced age: 86 years')
    })

    it('scores delayed treatment start (> 15 days since registration with no treatment start)', () => {
        const patientDelayedTx: Partial<Patient> = {
            hospitalRegistrationDate: '2026-05-01', // 24 days ago
            treatmentStartDate: null,
        }
        const result = computePatientRisk(patientDelayedTx)
        expect(result.score).toBe(2)
        expect(result.reasons[0]).toContain('Delayed treatment start')
    })

    it('scores red-flag remarks in recent follow-ups', () => {
        const patientOneWarning: Partial<Patient> = {
            followUps: [
                { date: '2026-05-20T00:00:00Z', remarks: 'Patient complains of severe pain' },
            ],
        }
        const resultOne = computePatientRisk(patientOneWarning)
        expect(resultOne.score).toBe(1) // +1 point for 1 warning remark
        expect(resultOne.reasons[0]).toContain('potential red-flag symptoms')

        const patientTwoWarnings: Partial<Patient> = {
            followUps: [
                { date: '2026-05-20T00:00:00Z', remarks: 'Patient has vomiting side effect' },
                { date: '2026-05-15T00:00:00Z', remarks: 'Condition is getting worse' },
            ],
        }
        const resultTwo = computePatientRisk(patientTwoWarnings)
        expect(resultTwo.score).toBe(3) // +3 points for 2 warning remarks
        expect(resultTwo.reasons[0]).toContain('Repeated follow-ups indicate persistent/worsening symptoms')
    })

    it('classifies risk levels correctly', () => {
        // High Risk (score >= 6)
        const patientHigh: Partial<Patient> = {
            suspectedCase: true, // +2
            stageOfTheCancer: { stage: 'Stage IV' }, // +3
            dob: '1940-01-01', // +2
        }
        const resultHigh = computePatientRisk(patientHigh)
        expect(resultHigh.score).toBe(7)
        expect(resultHigh.level).toBe('High')

        // Medium Risk (score between 3 and 5)
        const patientMed: Partial<Patient> = {
            suspectedCase: true, // +2
            dob: '1960-01-01', // +1
        }
        const resultMed = computePatientRisk(patientMed)
        expect(resultMed.score).toBe(3)
        expect(resultMed.level).toBe('Medium')

        // Low Risk (score < 3)
        const patientLow: Partial<Patient> = {
            dob: '1960-01-01', // +1
        }
        const resultLow = computePatientRisk(patientLow)
        expect(resultLow.score).toBe(1)
        expect(resultLow.level).toBe('Low')
    })
})
