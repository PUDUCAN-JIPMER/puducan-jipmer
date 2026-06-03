import { parseDateResilient } from './dateHelpers'

const checkDateValidation = (dob: string | undefined, today: Date): Date | string => {
    if (!dob) return 'N/A'

    const birthDate = parseDateResilient(dob)
    if (!birthDate) return 'Invalid date'

    // Basic range checks (e.g. no future years)
    if (birthDate.getFullYear() > today.getFullYear()) return 'Invalid date'

    // No future dates
    if (birthDate > today) return 'Invalid date'

    return birthDate
}

export const dobToAgeUtil = (dob?: string): string => {
    const today = new Date()
    const birthDate = checkDateValidation(dob, today)
    if (typeof birthDate === 'string') return birthDate

    let years = today.getFullYear() - birthDate.getFullYear()
    let months = today.getMonth() - birthDate.getMonth()
    let days = today.getDate() - birthDate.getDate()

    if (days < 0) {
        months--
        const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate()
        days += prevMonthDays
    }

    if (months < 0) {
        years--
        months += 12
    }

    if (years >= 1) return `${years} yrs`
    if (months >= 1) return `${months} month${months > 1 ? 's' : ''}`
    return '<1 month'
}
