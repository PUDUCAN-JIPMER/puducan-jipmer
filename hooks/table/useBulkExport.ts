export type exportHeader = {
    name: string  //column label in csv
    key: string  //key to read from exportRow
}

type exportRow = Record<string, unknown>

function toCSV (rows: exportRow[], headers: exportHeader[]): string {

    const HeaderLine = headers.map((h) => `${h.name}`).join(',') 

    //wrap values in quotes and escape existing quotes
    const DataLines = rows.map((row) => {
        return headers.map((h) => {
            const value = row[h.key] ?? ''
            const escapedValue = String(value).replace(/"/g, '""')
            return `"${escapedValue}"`
        }).join(',')
    })

    return [HeaderLine, ...DataLines].join('\n')
}


function downloadCSV (csv: string, filename: string) {
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

export function useBulkExport () {
    function exportSelected(
        selectedIds: string[],
        headers: exportHeader[],
        collectionName: string,
        allData: exportRow[]

    ) {
        if(!selectedIds.length) return

        // filter data to only include selected rows
        const selectedRows = allData.filter( (row) => selectedIds.includes(String(row.id)) )

        if(!selectedRows.length) return

        const csv = toCSV(selectedRows, headers)
        const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        const filename = `${collectionName}_export_${date}.csv`
        downloadCSV(csv, filename)

    }

    return { exportSelected }
}
