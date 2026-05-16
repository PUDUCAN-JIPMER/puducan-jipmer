import { toast } from 'sonner'

export type exportHeader = {
    name: string
    key: string
}

type exportRow = Record<string, unknown>

function toCSV(rows: exportRow[], headers: exportHeader[]): string {
    const headerLine = headers.map((h) => `${h.name}`).join(',')
    const dataLines = rows.map((row) =>
        headers.map((h) => {
            const value = row[h.key] ?? ''
            return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
    )
    return [headerLine, ...dataLines].join('\n')
}

function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function useBulkExport() {
    function exportSelected(
        selectedIds: string[],
        headers: exportHeader[],
        collectionName: string,
        allData: exportRow[]
    ) {
        if (!selectedIds.length) return

        const selectedRows = allData.filter((row) =>
            selectedIds.includes(String(row.id))
        )

        if (!selectedRows.length) return

        const csv = toCSV(selectedRows, headers)
        const date = new Date().toISOString().split('T')[0]
        const filename = `${collectionName}_export_${date}.csv`
        downloadCSV(csv, filename)
        toast.success(`${selectedRows.length} records exported`)
    }

    return { exportSelected }
}
