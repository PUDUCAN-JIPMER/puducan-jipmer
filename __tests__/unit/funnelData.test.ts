import { describe, it, expect } from 'vitest'

// ── replicate the exact funnelData logic from useStatsData.ts ──────
function computeFunnelData(patients: any[]) {
    return [
        {
            name: 'Registered',
            value: patients.filter(p => !!p.hospitalRegistrationDate).length,
        },
        {
            name: 'Treatment Started',
            value: patients.filter(p => !!p.treatmentStartDate).length,
        },
        {
            name: 'Treatment Completed',
            value: patients.filter(p => !!p.treatmentEndDate).length,
        },
        {
            name: 'Follow-up Recorded',
            value: patients.filter(p => (p.followUps?.length ?? 0) > 0).length,
        },
        {
            name: 'Alive at Last Update',
            value: patients.filter(p => p.patientStatus === 'Alive').length,
        },
    ]
}

// ── tests ──────────────────────────────────────────────────────────
describe('funnelData computation', () => {

    it('returns all zeros for an empty patient list', () => {
        const result = computeFunnelData([])
        result.forEach(stage => expect(stage.value).toBe(0))
    })

    it('correctly counts registered patients', () => {
        const patients = [
            { hospitalRegistrationDate: '2024-01-01' },
            { hospitalRegistrationDate: '2024-02-01' },
            {},
        ]
        const result = computeFunnelData(patients)
        expect(result[0].value).toBe(2)
    })

    it('correctly counts treatment started', () => {
        const patients = [
            { treatmentStartDate: '2024-01-15' },
            { treatmentStartDate: null },
            {},
        ]
        const result = computeFunnelData(patients)
        expect(result[1].value).toBe(1)
    })

    it('correctly counts treatment completed', () => {
        const patients = [
            { treatmentEndDate: '2024-06-01' },
            { treatmentEndDate: '2024-07-01' },
            { treatmentEndDate: null },
        ]
        const result = computeFunnelData(patients)
        expect(result[2].value).toBe(2)
    })

    it('correctly counts patients with follow-ups', () => {
        const patients = [
            { followUps: [{ date: '2024-03-01', remarks: 'Good' }] },
            { followUps: [] },
            { followUps: undefined },
        ]
        const result = computeFunnelData(patients)
        expect(result[3].value).toBe(1)
    })

    it('correctly counts alive patients', () => {
        const patients = [
            { patientStatus: 'Alive' },
            { patientStatus: 'Alive' },
            { patientStatus: 'Not Alive' },
            { patientStatus: 'Not Available' },
        ]
        const result = computeFunnelData(patients)
        expect(result[4].value).toBe(2)
    })

    it('funnel values are non-increasing from registered to alive', () => {
        const patients = [
            {
                hospitalRegistrationDate: '2024-01-01',
                treatmentStartDate: '2024-02-01',
                treatmentEndDate: '2024-06-01',
                followUps: [{ date: '2024-07-01' }],
                patientStatus: 'Alive',
            },
            {
                hospitalRegistrationDate: '2024-01-01',
                treatmentStartDate: '2024-02-01',
                patientStatus: 'Not Alive',
            },
            {
                hospitalRegistrationDate: '2024-01-01',
            },
        ]
        const result = computeFunnelData(patients)
        for (let i = 1; i < result.length; i++) {
            expect(result[i].value).toBeLessThanOrEqual(result[i - 1].value)
        }
    })

    it('returns correct stage names in correct order', () => {
        const result = computeFunnelData([])
        expect(result.map(r => r.name)).toEqual([
            'Registered',
            'Treatment Started',
            'Treatment Completed',
            'Follow-up Recorded',
            'Alive at Last Update',
        ])
    })
})