import { useMemo } from 'react'

export function useStats<TableDataType>({
    TableData = [], // default to empty array
    isPatientTab, isHospitalTab
}: {
    TableData?: TableDataType[]
    isPatientTab: boolean
    isHospitalTab: boolean
}) {

    return useMemo(() => {
        let stats = {
            total: 0,
            assigned: 0,
            unassigned: 0,
            male: 0,
            female: 0,
            others: 0,
            alive: 0,
            deceased: 0,
        }

        TableData.forEach((row: any) => {
            stats.total++

            if (isPatientTab) {
                if (row.assignedAsha && row.assignedAsha !== 'none') stats.assigned++
                else stats.unassigned++

                if ((row.status || '').toLowerCase() === 'alive') stats.alive++
                else if ((row.status || '').toLowerCase() === 'death') stats.deceased++
            }
            if (!isHospitalTab) {
                switch ((row.sex || '').toLowerCase()) {
                    case 'male':
                        stats.male++
                        break
                    case 'female':
                        stats.female++
                        break
                    default:
                        stats.others++
                }
            }
        })

        return stats
    }, [TableData, isPatientTab])
}
