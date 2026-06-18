import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { toast } from 'sonner'
import { levenshtein, nameSimilarity } from '@/lib/patient/nameUtils'

// ─── 1. Aadhaar Duplicate Check ───────────────────────────────────────────────
export const checkAadhaarDuplicateUtil = async (
    aadhaarId: string
): Promise<{ exists: boolean; patientId?: string }> => {
    if (!aadhaarId || aadhaarId.length !== 12) {
        return { exists: false }
    }
    const patientsRef = collection(db, 'patients')
    const q = query(patientsRef, where('aadhaarId', '==', aadhaarId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
        const patientId = querySnapshot.docs[0].id
        toast.warning('Patient with this Aadhaar already exists.', {
            duration: 5000,
        })
        return { exists: true, patientId }
    }
    return { exists: false }
}

// ─── 2. Name + DOB + Phone fuzzy check ───────────────────────────────────────
export const checkNameDobDuplicate = async (
    name: string,
    dob: string,
    phoneNumbers: string[]
): Promise<{ exists: boolean; patientId?: string }> => {
    if (!name.trim()) return { exists: false }

    const allPatients = await getDocs(collection(db, 'patients'))
    const cleanedPhones = phoneNumbers
        .map((n) => (n ?? '').replace(/\D/g, '').slice(-10))

        .filter((p) => p.length === 10)

    for (const docSnap of allPatients.docs) {
        const patient = docSnap.data() as Patient

        const score = nameSimilarity(name, patient.name)
        const dobMatched = dob && patient.dob ? dob === patient.dob : false
        const phoneMatched = cleanedPhones.some((p) =>
            (patient.phoneNumber ?? [])
                .map((n) => (n ?? '').replace(/\D/g, '').slice(-10))
                .includes(p)
        )

        if (score >= 0.85 && (dobMatched || phoneMatched)) {
            toast.info(
                `Possible duplicate: "${patient.name}" already exists with a similar name and matching ${dobMatched ? 'date of birth' : 'phone number'}.`,
                { duration: 7000 }
            )
            return { exists: true, patientId: docSnap.id }
        }
    }
    return { exists: false }
}

// ─── 3. Bulk fuzzy check (CSV/Excel import) ───────────────────────────────────
export const bulkCheckDuplicates = async (
    rows: Partial<Patient>[]
): Promise<{ rowIndex: number; incomingRow: Partial<Patient>; match: any | null }[]> => {
    const allPatients = await getDocs(collection(db, 'patients'))
    const existing = allPatients.docs.map((d) => ({ ...(d.data() as Patient), id: d.id }))

    return rows.map((row, rowIndex) => {
        const cleanedPhones = (row.phoneNumber ?? [])
            .map((n) => (n ?? '').replace(/\D/g, '').slice(-10))
            .filter((p) => p.length === 10)

        let bestMatch = null
        let bestScore = 0

        for (const patient of existing) {
            if (!row.name || !patient.name) continue

            const score = nameSimilarity(row.name, patient.name)
            const dobMatched = row.dob && patient.dob ? row.dob === patient.dob : false
            const phoneMatched = cleanedPhones.some((p) =>
                (patient.phoneNumber ?? [])
                    .map((n) => (n ?? '').replace(/\D/g, '').slice(-10))
                    .includes(p)
            )

            if (score >= 0.85 && (dobMatched || phoneMatched) && score > bestScore) {
                bestScore = score
                bestMatch = {
                    existingPatientId: patient.id,
                    existingPatient: patient,
                    score,
                    dobMatched,
                    phoneMatched,
                }
            }
        }

        return { rowIndex, incomingRow: row, match: bestMatch }
    })
}