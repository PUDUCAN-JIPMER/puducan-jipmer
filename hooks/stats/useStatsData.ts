import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { Hospital } from '@/schema/hospital'
import { UserDoc } from '@/schema/user'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useMemo } from 'react'

// Stable references to prevent exhaustive-deps warnings in useMemo
const EMPTY_PATIENTS: Patient[] = []
const EMPTY_HOSPITALS: Hospital[] = []
const EMPTY_USERS: UserDoc[] = []

interface UseStatsDataProps {
    role: string | null
    orgId: string | null
}

export function useStatsData({ role, orgId }: UseStatsDataProps) {
    const isAdmin = role === 'admin'
    
    // TODO: Uncomment when needed for patient-specific role logic
    // const isPatientRole = role === 'doctor' || role === 'nurse'

    // ── Patients ──────────────────────────────────────────────────────
    const patientsQuery = useQuery<Patient[], Error>({
        queryKey: ['stats-patients', { role, orgId }],
        queryFn: async () => {
            let q
            if (isAdmin) {
                // Admin sees all patients across every hospital
                q = query(collection(db, 'patients'))
            } else if (orgId) {
                // Doctor / Nurse see only their hospital's patients
                q = query(collection(db, 'patients'), where('assignedHospital.id', '==', orgId))
            } else {
                return []
            }
            const snap = await getDocs(q)
            return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Patient[]
        },
        enabled: !!(role && (isAdmin || orgId)),
        staleTime: 60 * 1000,
    })

    // ── Hospitals (admin only) ────────────────────────────────────────
    const hospitalsQuery = useQuery<Hospital[], Error>({
        queryKey: ['stats-hospitals'],
        queryFn: async () => {
            const snap = await getDocs(collection(db, 'hospitals'))
            return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Hospital[]
        },
        enabled: isAdmin,
        staleTime: 60 * 1000,
    })

    // ── Users (admin only) ───────────────────────────────────────────
    const usersQuery = useQuery<UserDoc[], Error>({
        queryKey: ['stats-users'],
        queryFn: async () => {
            const snap = await getDocs(collection(db, 'users'))
            return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserDoc[]
        },
        enabled: isAdmin,
        staleTime: 60 * 1000,
    })

    const patients = patientsQuery.data ?? EMPTY_PATIENTS
    const hospitals = hospitalsQuery.data ?? EMPTY_HOSPITALS
    const users = usersQuery.data ?? EMPTY_USERS

    // ── Derived patient stats (shared by all roles) ───────────────────
    const patientStats = useMemo(() => {
        const total = patients.length
        const alive = patients.filter((p) => p.patientStatus === 'Alive').length
        const deceased = patients.filter((p) => p.patientStatus === 'Not Alive').length
        const notAvailable = total - alive - deceased

        const male = patients.filter((p) => p.sex === 'male').length
        const female = patients.filter((p) => p.sex === 'female').length
        const other = patients.filter((p) => p.sex === 'other').length

        const withAsha = patients.filter(
            (p) => p.assignedAsha && p.assignedAsha !== 'none'
        ).length

        // Disease distribution
        const diseaseMap: Record<string, number> = {}
        patients.forEach((p) => {
            ;(p.diseases ?? []).forEach((d) => {
                if (d) diseaseMap[d] = (diseaseMap[d] ?? 0) + 1
            })
        })
        const diseaseData = Object.entries(diseaseMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10) // top 10 diseases

        // Cancer stage distribution
        const stageMap: Record<string, number> = {}
        patients.forEach((p) => {
            const stage = p.stageOfTheCancer?.trim() || 'Unknown'
            stageMap[stage] = (stageMap[stage] ?? 0) + 1
        })
        const stageData = Object.entries(stageMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => a.name.localeCompare(b.name))

        // Insurance type
        const insuranceMap: Record<string, number> = { Government: 0, Private: 0, None: 0 }
        patients.forEach((p) => {
            const type = p.insurance?.type
            if (type === 'Government') insuranceMap['Government']++
            else if (type === 'Private') insuranceMap['Private']++
            else insuranceMap['None']++
        })
        const insuranceData = Object.entries(insuranceMap)
            .map(([name, value]) => ({ name, value }))
            .filter((d) => d.value > 0)

        // Ration card colour
        const rationMap: Record<string, number> = { Red: 0, Yellow: 0, None: 0 }
        patients.forEach((p) => {
            const c = p.rationCardColor
            if (c === 'red') rationMap['Red']++
            else if (c === 'yellow') rationMap['Yellow']++
            else rationMap['None']++
        })
        const rationData = Object.entries(rationMap).map(([name, value]) => ({ name, value }))

        // Monthly registrations – last 12 months
        const monthMap: Record<string, number> = {}
        const now = new Date()
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
            monthMap[key] = 0
        }
        patients.forEach((p) => {
            if (p.hospitalRegistrationDate) {
                const d = new Date(p.hospitalRegistrationDate)
                const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                if (key in monthMap) monthMap[key]++
            }
        })
        const registrationTrend = Object.entries(monthMap).map(([month, count]) => ({
            month,
            count,
        }))

        return {
            total,
            alive,
            deceased,
            notAvailable,
            male,
            female,
            other,
            withAsha,
            withoutAsha: total - withAsha,
            diseaseData,
            stageData,
            insuranceData,
            rationData,
            registrationTrend,
            statusData: [
                { name: 'Alive', value: alive },
                { name: 'Not Alive', value: deceased },
                { name: 'Not Available', value: notAvailable },
            ].filter((d) => d.value > 0),
            genderData: [
                { name: 'Male', value: male },
                { name: 'Female', value: female },
                { name: 'Other', value: other },
            ].filter((d) => d.value > 0),
        }
    }, [patients])

    // ── Derived admin stats ───────────────────────────────────────────
    const adminStats = useMemo(() => {
        if (!isAdmin) return null

        const doctors = users.filter((u) => u.role === 'doctor').length
        const nurses = users.filter((u) => u.role === 'nurse').length
        const ashas = users.filter((u) => u.role === 'asha').length
        const admins = users.filter((u) => u.role === 'admin').length

        // Patients per hospital with filtering and sorting
        const hospitalMap: Record<string, { name: string; patients: number }> = {}
        hospitals.forEach((h) => {
            hospitalMap[h.id!] = { name: h.name, patients: 0 }
        })
        patients.forEach((p) => {
            const hId = p.assignedHospital?.id
            if (hId && hospitalMap[hId]) hospitalMap[hId].patients++
        })
        
        // Filter out zero-value hospitals and sort in descending order
        const patientsPerHospital = Object.values(hospitalMap)
            .filter((h) => h.patients > 0)
            .sort((a, b) => b.patients - a.patients)

        // Staff role data with filtering and sorting
        const staffRoleData = [
            { name: 'Doctors', value: doctors },
            { name: 'Nurses', value: nurses },
            { name: 'ASHAs', value: ashas },
            { name: 'Admins', value: admins },
        ]
            .filter((d) => d.value > 0)
            .sort((a, b) => b.value - a.value)

        // ASHA coverage with filtering
        const ashaCoverageData = Object.values(hospitalMap)
            .map((h) => {
                const hPatients = patients.filter((p) => p.assignedHospital?.id === Object.keys(hospitalMap).find((k) => hospitalMap[k] === h))
                const covered = hPatients.filter((p) => p.assignedAsha && p.assignedAsha !== 'none').length
                return { name: h.name, covered, uncovered: hPatients.length - covered }
            })
            .filter((d) => (d.covered + d.uncovered) > 0)
            .sort((a, b) => (b.covered + b.uncovered) - (a.covered + a.uncovered))

        return {
            totalHospitals: hospitals.length,
            totalStaff: doctors + nurses + ashas + admins,
            doctors,
            nurses,
            ashas,
            admins,
            patientsPerHospital,
            staffRoleData,
            ashaCoverageData,
        }
    }, [isAdmin, hospitals, users, patients])

    return {
        patientStats,
        adminStats,
        isLoading:
            patientsQuery.isLoading ||
            (isAdmin && (hospitalsQuery.isLoading || usersQuery.isLoading)),
        isError: patientsQuery.isError || hospitalsQuery.isError || usersQuery.isError,
    }
}