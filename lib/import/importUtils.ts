import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { collection, addDoc, getDocs, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { getCollectionName } from '@/lib/common/getCollectionName'
import { PatientSchema } from '@/schema/patient'
import { bulkCheckDuplicates } from '@/lib/patient/checkPatientRecord'

// ─── Entry point ──────────────────────────────────────────────────────────────
// onReviewNeeded is called when duplicates are found — it opens ImportReviewDialog.
// If no duplicates, import proceeds silently without calling it.
export const importData = async (
    e: React.ChangeEvent<HTMLInputElement>,
    queryClient: any,
    onReviewNeeded: (
        flagged: any[],
        cleanRows: any[],
        onResolved: (decisions: any[]) => Promise<void>
    ) => void
) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

    if (isExcel) {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(sheet)
        // ✅ pass onReviewNeeded down
        await uploadToFirestore(json, 'patients', queryClient, onReviewNeeded)
    } else {
        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                // ✅ pass onReviewNeeded down
                await uploadToFirestore(results.data as any[], 'patients', queryClient, onReviewNeeded)
            },
        })
    }

    e.target.value = ''
}

// ─── Preprocessor (unchanged from original) ──────────────────────────────────
const preprocessPatientRow = async (
    row: any,
    hospitalMap: Record<string, { id: string; name: string }>
) => {
    const cleaned: any = {}

    cleaned.name = row.name?.trim() ?? ''
    cleaned.caregiverName = row.caregiverName ?? ''
    cleaned.sex = (row.sex ?? '').toLowerCase()
    cleaned.address = row.address ?? ''

    cleaned.phoneNumber = row.phoneNumber
        ? String(row.phoneNumber).split(',').map((p: string) => p.trim())
        : []

    if (row.dob) {
        cleaned.dob = row.dob
    } else if (row.age) {
        const currentYear = new Date().getFullYear()
        cleaned.dob = `${currentYear - Number(row.age)}-01-01`
    }

    const hospitalName = row.hospitalName?.trim()
    if (hospitalName && hospitalMap[hospitalName]) {
        cleaned.assignedHospital = hospitalMap[hospitalName]
    }

    if (row.insuranceType && row.insuranceType !== 'none') {
        cleaned.insurance = { type: row.insuranceType, id: row.insuranceId ?? '' }
    } else {
        cleaned.insurance = { type: 'none' }
    }

    cleaned.hasAadhaar = String(row.hasAadhaar).toLowerCase() === 'yes'
    cleaned.suspectedCase = String(row.suspectedCase).toLowerCase() === 'yes'

    cleaned.diseases = row.disease
        ? String(row.disease).split(',').map((d: string) => d.trim())
        : []

    cleaned.treatmentDetails = row.treatmentDetails
        ? String(row.treatmentDetails).split(',').map((d: string) => d.trim())
        : []

    Object.assign(cleaned, {
        aabhaId: row.aabhaId ?? '',
        aadhaarId: row.aadhaarId ?? '',
        bloodGroup: row.bloodGroup ?? '',
        religion: row.religion ?? '',
        patientStatus: row.patientStatus ?? 'Alive',
        diagnosedDate: String(row.diagnosedDate) ?? '',
        diagnosedYearsAgo: row.diagnosedYearsAgo ?? '',
        hospitalRegistrationDate: String(row.hospitalRegistrationDate) ?? '',
        treatmentStartDate: String(row.treatmentStartDate) ?? '',
        treatmentEndDate: String(row.treatmentEndDate) ?? '',
        biopsyNumber: row.biopsyNumber ?? '',
        transferred: row.transferred === 'true',
        transferredFrom: row.transferredFrom ?? '',
        hbcrID: row.hbcrID ?? '',
        hospitalRegistrationId: row.hospitalRegistrationId ?? '',
        stageOfTheCancer: row.stageOfTheCancer ?? '',
        reasonOfRemoval: row.reasonOfRemoval ?? '',
        otherTreatmentDetails: row.otherTreatmentDetails ?? '',
    })

    return cleaned
}

// ─── Core upload function ─────────────────────────────────────────────────────
const uploadToFirestore = async (
    rows: any[],
    activeTab: string,
    queryClient: any,
    onReviewNeeded: (
        flagged: any[],
        cleanRows: any[],
        onResolved: (decisions: any[]) => Promise<void>
    ) => void
) => {
    try {
        const collectionName = getCollectionName(activeTab)
        const colRef = collection(db, collectionName)
        const schema = PatientSchema

        if (!schema) throw new Error(`No schema defined for activeTab: ${activeTab}`)

        let hospitalMap: Record<string, { id: string; name: string }> = {}
        if (activeTab === 'patients') {
            const snap = await getDocs(collection(db, 'hospitals'))
            snap.forEach((doc) => {
                const data = doc.data()
                hospitalMap[data.name] = { id: doc.id, name: data.name }
            })
        }

        // ── Step 1: Schema validation ─────────────────────────────────────────
        const validRows: { index: number; data: any }[] = []
        const errors: { row: number; issues: string[]; rowData: any }[] = []

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]
            row = await preprocessPatientRow(row, hospitalMap)
            const parsed = schema.safeParse(row)
            if (!parsed.success) {
                errors.push({
                    row: i + 1,
                    issues: parsed.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`),
                    rowData: row,
                })
                continue
            }
            validRows.push({ index: i, data: parsed.data })
        }

        // Report schema errors immediately — same as before
        if (errors.length > 0) {
            console.error('❌ Validation errors:', errors)
            alert(`⚠️ ${errors.length} rows failed validation. An error report has been downloaded.`)
            const errorSheet = XLSX.utils.json_to_sheet(
                errors.map((err) => ({
                    Row: err.row,
                    Issues: err.issues.join('; '),
                    ...err.rowData,
                }))
            )
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, errorSheet, 'Errors')
            XLSX.writeFile(wb, `import-errors-${activeTab}.xlsx`)
        }

        if (validRows.length === 0) return

        // ── Step 2: Duplicate scan — nothing written to Firestore yet ─────────
        const checkResults = await bulkCheckDuplicates(validRows.map((r) => r.data))
        const flagged = checkResults.filter((r) => r.match !== null)
        const flaggedIndexes = new Set(flagged.map((r) => r.rowIndex))
        const cleanRows = validRows.filter((_, i) => !flaggedIndexes.has(i))

        if (flagged.length === 0) {
            // ── No duplicates — write everything directly ─────────────────────
            let successCount = 0
            for (const { data } of cleanRows) {
                await addDoc(colRef, { ...data, createdAt: serverTimestamp() })
                successCount++
            }
            queryClient.invalidateQueries({ queryKey: [collectionName] })
            alert(`✅ Imported ${successCount} records successfully`)
            return
        }

        // ── Step 3: Duplicates found — pause and open review dialog ──────────
        // Clean rows are NOT written yet either — everything waits for the user.
        onReviewNeeded(flagged, cleanRows, async (decisions) => {
            let successCount = 0

            // Write clean rows first
            for (const { data } of cleanRows) {
                await addDoc(colRef, { ...data, createdAt: serverTimestamp() })
                successCount++
            }

            // Apply per-row decisions from the review dialog
            for (const decision of decisions) {
                if (decision.action === 'skip') {
                    
                    continue
                }
                if (decision.action === 'merge') {
                    
                    await updateDoc(
                        doc(db, collectionName, decision.existingPatientId),
                        decision.incomingData
                    )
                    successCount++
                }
                if (decision.action === 'import_anyway') {
    
                    await addDoc(colRef, { ...decision.data, createdAt: serverTimestamp() })
                    successCount++
                }
            }

            queryClient.invalidateQueries({ queryKey: [collectionName] })

            const skipped = decisions.filter((d: any) => d.action === 'skip').length
            alert(
                `✅ Import complete.\n` +
                `Imported: ${successCount} records\n` +
                `Skipped: ${skipped} flagged rows`
            )
        })

    } catch (err) {
        console.error('Error uploading data:', err)
        alert(err instanceof Error ? err.message : 'Failed to import data.')
    }
}