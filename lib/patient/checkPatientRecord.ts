import { db } from '@/firebase'
import { Patient } from '@/schema/patient'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { toast } from 'sonner'
import { levenshtein, nameSimilarity } from '@/lib/patient/nameUtils'

// ─── Levenshtein Distance ─────────────────────────────────────────────────────
// Counts the minimum single-character edits to turn string a into string b.
// e.g. levenshtein("Murgan", "Murugan") === 1
function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length
    const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    )
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]
}

// Returns a 0–1 similarity score. 1.0 = identical, 0.0 = completely different.
// e.g. nameSimilarity("Rajeshwari Murgan", "Rajeshwari Murugan") ≈ 0.94
export function nameSimilarity(a: string, b: string): number {
    const ca = a.toLowerCase().trim()
    const cb = b.toLowerCase().trim()
    if (ca === cb) return 1
    const maxLen = Math.max(ca.length, cb.length)
    return maxLen === 0 ? 1 : 1 - levenshtein(ca, cb) / maxLen
}

// ─── 1. Aadhaar Duplicate Check (unchanged — already works) ──────────────────
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

// ─── 2. Name + DOB + Phone fuzzy check (replaces broken checkNamePhoneDuplicate)
// Called from the Add Patient form when hasAadhaar is false.
// Flags only when name similarity ≥85% AND at least dob or phone also matches.
// This avoids false positives on common names like "Meena Devi".
export const checkNameDobDuplicate = async (
    name: string,
    dob: string,
    phoneNumbers: string[]
): Promise<{ exists: boolean; patientId?: string }> => {
    if (!name.trim()) return { exists: false }

    const allPatients = await getDocs(collection(db, 'patients'))
    const cleanedPhones = phoneNumbers
        .map((p) => p.replace(/\D/g, '').slice(-10))
        .filter((p) => p.length === 10)

    for (const docSnap of allPatients.docs) {
        const patient = docSnap.data() as Patient

        const score = nameSimilarity(name, patient.name)
        const dobMatched = dob && patient.dob ? dob === patient.dob : false
        const phoneMatched = cleanedPhones.some((p) =>
            (patient.phoneNumber ?? [])
                .map((n) => n.replace(/\D/g, '').slice(-10))
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

// ─── 3. Bulk fuzzy check (used by CSV/Excel import) ──────────────────────────
// Fetches all existing patients ONCE, then checks every incoming row against them.
// Returns one result per row — match is null if the row is clean, or filled if suspicious.
// Called before any Firestore writes so nothing is saved until the user reviews.
export const bulkCheckDuplicates = async (
    rows: Partial<Patient>[]
): Promise<{ rowIndex: number; incomingRow: Partial<Patient>; match: any | null }[]> => {
    const allPatients = await getDocs(collection(db, 'patients'))
    const existing = allPatients.docs.map((d) => ({ ...(d.data() as Patient), id: d.id }))
 
    return rows.map((row, rowIndex) => {
        const cleanedPhones = (row.phoneNumber ?? [])
            .map((p) => p.replace(/\D/g, '').slice(-10))
            .filter((p) => p.length === 10)
 
        let bestMatch = null
        let bestScore = 0
 
        for (const patient of existing) {
            if (!row.name || !patient.name) continue
 
            const score = nameSimilarity(row.name, patient.name)
            const dobMatched = row.dob && patient.dob ? row.dob === patient.dob : false
            const phoneMatched = cleanedPhones.some((p) =>
                (patient.phoneNumber ?? [])
                    .map((n) => n.replace(/\D/g, '').slice(-10))
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