import { format } from 'date-fns'
import { parseDateResilient } from './dateHelpers'

export function formatDobToDDMMYYYY(dob: string): string {
    if (!dob) return ''
    const date = parseDateResilient(dob)
    if (!date) return 'Invalid Date'
    return format(date, 'dd-MM-yyyy')
}
