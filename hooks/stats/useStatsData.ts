import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { Hospital } from '@/schema/hospital'
import { UserDoc } from '@/schema/user'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query } from 'firebase/firestore'
import { useMemo } from 'react'
import { MAX_ANALYTICS_ITEMS } from '@/lib/analytics/analyticsUtils'

interface UseStatsDataProps {
    role: string | null
    orgId: string | null
}

export function useStatsData({ role, orgId }: UseStatsDataProps) {
    const isAdmin = role === 'admin'

    // ── Patients ──────────────────────────────────────────────────────
    // NOTE: useTableData (Doctor Dashboard) always fetches ALL patients with no
    // Firestore-level filter, even when orgId is present. The previous
    // where('assignedHospital.id', '==', orgId) filter returned 0 results
    // because the nested field path / index was not matching correctly.
    // We mirror the dashboard's proven approach: fetch the full collection and
    // let the derived stats memos do the in-memory per-hospital aggregation.
    const patientsQuery = useQuery<Patient[], Error>({
        queryKey: ['stats-patients', { role }],
        queryFn: async () => {
            const collectionName = 'patients'
            console.log('Analytics collection:', collectionName)
            const q = query(collection(db, collectionName))
            const snap = await getDocs(q)
            console.log('Fetched analytics docs:', snap.docs.length)
            if (snap.docs.length > 0) {
                const sample = snap.docs[0].data()
                console.log('Sample doc assignedHospital:', sample.assignedHospital, '| orgId:', orgId)
                console.log('Sample hospitalRegistrationDate:', sample.hospitalRegistrationDate)
            }
            return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Patient[]
        },
        enabled: !!role,
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

    const patients = useMemo(() => patientsQuery.data ?? [], [patientsQuery.data])
    const hospitals = useMemo(() => hospitalsQuery.data ?? [], [hospitalsQuery.data])
    const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])

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
            ; (p.diseases ?? []).forEach((d) => {
                if (d) diseaseMap[d] = (diseaseMap[d] ?? 0) + 1
            })
        })
        const diseaseData = Object.entries(diseaseMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, MAX_ANALYTICS_ITEMS)

        // Cancer stage distribution (use structured stage + optional sub-stage)
        const stageMap: Record<string, number> = {}
        patients.forEach((p) => {
            const s = p.stageOfTheCancer
            const stage = s?.stage
                ? s.subStage
                    ? `${s.stage} + ${s.subStage}`
                    : s.stage
                : 'Unknown'
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
            // Registration trend: last 12 months (chronological)
            registrationTrend: (() => {
                const now = new Date()
                // build list of last 12 months keys in YYYY-MM format
                const months: string[] = Array.from({ length: 12 }).map((_, i) => {
                    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
                    const y = d.getFullYear()
                    const m = String(d.getMonth() + 1).padStart(2, '0')
                    return `${y}-${m}`
                })

                const counts: Record<string, number> = {}
                for (const key of months) counts[key] = 0

                for (const p of patients) {
                    const raw = p.hospitalRegistrationDate ?? p.createdAt ?? null
                    if (!raw) continue
                    const d = new Date(String(raw))
                    if (Number.isNaN(d.getTime())) continue
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                    if (key in counts) counts[key]++
                }

                return months.map((k) => {
                    const [y, m] = k.split('-')
                    const date = new Date(Number(y), Number(m) - 1, 1)
                    const label = date.toLocaleString('default', { month: 'short', year: 'numeric' })
                    return { month: label, count: counts[k] ?? 0 }
                })
            })(),
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

        // Patients per hospital (sorted by count)
        const hospitalMap: Record<string, { name: string; patients: number }> = {}
        hospitals.forEach((h) => {
            hospitalMap[h.id!] = { name: h.name, patients: 0 }
        })
        patients.forEach((p) => {
            const hId = p.assignedHospital?.id
            if (hId && hospitalMap[hId]) hospitalMap[hId].patients++
        })
        const patientsPerHospital = Object.values(hospitalMap).sort(
            (a, b) => b.patients - a.patients
        )

        const staffRoleData = [
            { name: 'Doctors', value: doctors },
            { name: 'Nurses', value: nurses },
            { name: 'ASHAs', value: ashas },
            { name: 'Admins', value: admins },
        ].filter((d) => d.value > 0)

        // ASHA coverage: patients with vs without assigned ASHA per hospital
        const ashaCoverageData = Object.values(hospitalMap).map((h) => {
            const hPatients = patients.filter((p) => p.assignedHospital?.id === Object.keys(hospitalMap).find((k) => hospitalMap[k] === h))
            const covered = hPatients.filter((p) => p.assignedAsha && p.assignedAsha !== 'none').length
            return { name: h.name, covered, uncovered: hPatients.length - covered }
        })

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
        patients,
        adminStats,
        isLoading:
            patientsQuery.isLoading ||
            (isAdmin && (hospitalsQuery.isLoading || usersQuery.isLoading)),
        isError: patientsQuery.isError || hospitalsQuery.isError || usersQuery.isError,
    }
}
