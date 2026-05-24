import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * Formats export values into a clean, Excel/CSV-friendly string.
 *
 * Handles:
 * - null / undefined / empty values → returns 'N/A'
 * - arrays → converts to comma-separated string
 * - objects / Firebase timestamp objects → returns 'N/A'
 * - primitive values → converts to string
 *
 * This helps prevent:
 * - empty Excel cells
 * - unreadable object values
 * - unsupported object serialization in CSV/Excel exports
 *
 * @param value - Raw Firestore/export field value
 * @returns A formatted string safe for CSV and Excel export
 */

/**
 * Format empty or complex values
 */
const formatValue = (value: unknown): string => {
    // Empty values
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return 'N/A'
    }

    // Arrays
    if (Array.isArray(value)) {
        return value.length
            ? value.map((item) => String(item)).join(', ')
            : 'N/A'
    }

    // Firebase timestamp objects / nested objects
    if (typeof value === 'object') {
        return 'N/A'
    }

    return String(value)
}

/**
 * Generates a readable timestamp for exported file names.
 *
 * Example:
 * patients_2026-05-19_01-58PM.xlsx
 */

const getFormattedTimestamp = () => {
    const now = new Date()

    const date = now.toISOString().split('T')[0]

    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
        .replace(/:/g, '-')
        .replace(/\s/g, '')

    return `${date}_${time}`
}



/**
 * Transform firestore patient data
 * into meaningful export structure
 */
const transformExportData = <T extends Record<string, unknown>>(data: T[]) => {
    return data.map((row) => ({
        'Aadhaar ID': formatValue(row.aadhaarId),
        'ABHA ID': formatValue(row.abhaId),

        'Patient Name': formatValue(row.name),
        Age: formatValue(row.age),
        Sex: formatValue(row.sex),

        Address: formatValue(row.address),

        Disease: formatValue(row.diseases),
        'Cancer Stage': formatValue(row.stageOfTheCancer),

        'Blood Group': formatValue(row.bloodGroup),
        Religion: formatValue(row.religion),

        'Patient Status': formatValue(row.patientStatus),

        'Caregiver Name': formatValue(row.caregiverName),

        'Assigned ASHA': formatValue(row.assignedAsha),

        'Treatment Start Date': formatValue(row.treatmentStartDate),
        'Treatment End Date': formatValue(row.treatmentEndDate),

        'Hospital Registration Date': formatValue(row.hospitalRegistrationDate),
    }))
}



/**
 * Export CSV
 */
export const exportToCSV = <T extends Record<string, unknown>>(
    data: T[],
    fileName: string
) => {
    if (!data?.length) return

    const transformedData = transformExportData(data)


    const worksheet = XLSX.utils.json_to_sheet(transformedData)

    const csvContent = XLSX.utils.sheet_to_csv(worksheet)

    // UTF-8 BOM for Excel compatibility
    const blob = new Blob(
        ['\uFEFF' + csvContent],
        { type: 'text/csv;charset=utf-8;' }
    )

    const timestamp = getFormattedTimestamp()

    saveAs(blob, `${fileName}_${timestamp}.csv`)
}

/**
 * Export Excel
 */
export const exportToExcel = <T extends Record<string, unknown>>(
    data: T[],
    fileName: string,
    sheetName = 'Patients'
) => {
    if (!data?.length) return

    const transformedData = transformExportData(data)

    const worksheet = XLSX.utils.json_to_sheet(transformedData)

    /**
     * Auto column widths
     */
    const colWidths = Object.keys(transformedData[0]).map((key) => ({
        wch: Math.max(
            key.length + 5,
            ...transformedData.map((row) =>
                String(row[key as keyof typeof row] || 'N/A').length + 2
            ),
        ),
    }))

    worksheet['!cols'] = colWidths

    /**
     * Bold Header Styling
     * (basic styling support)
     */
    const headers = Object.keys(transformedData[0])

    headers.forEach((_, index) => {
        const cellAddress = XLSX.utils.encode_cell({
            r: 0,
            c: index,
        })

        if (!worksheet[cellAddress]) return

        worksheet[cellAddress].s = {
            font: {
                bold: true,
            },
        }
    })

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sheetName
    )

    const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
    })

    const blob = new Blob(
        [excelBuffer],
        {
            type:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
    )

    const timestamp = getFormattedTimestamp()

    saveAs(blob, `${fileName}_${timestamp}.xlsx`)
}
