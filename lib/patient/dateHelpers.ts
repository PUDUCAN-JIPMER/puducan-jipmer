import { parse, isValid } from 'date-fns'

/**
 * Resiliently parses a date string into a JavaScript Date object.
 * Supports various formats such as yyyy-MM-dd, dd-MM-yyyy, dd/MM/yyyy, MM/dd/yyyy, etc.
 * Falls back to native Date parsing for ISO 8601 strings and Date object serializations.
 */
export function parseDateResilient(dateStr: string | undefined | null): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null

    const trimmed = dateStr.trim()
    if (!trimmed) return null

    // If a string contains delimiters (- or /) but has only one delimiter, it's a 2-part date (e.g. "12-13"),
    // which cannot represent a full DOB (day, month, and year). We reject it.
    const delimiterCount = (trimmed.match(/[-\/]/g) || []).length
    if (delimiterCount === 1) {
        return null
    }

    // Supported date formats for date-fns parsing.
    const formats = [
        'yyyy-MM-dd',
        'dd-MM-yyyy',
        'dd/MM/yyyy',
        'MM/dd/yyyy',
        'yyyy/MM/dd',
        'yyyy-M-d',
        'd-M-yyyy',
        'd/M/yyyy',
        'M/d/yyyy',
        'yyyy/M/d'
    ]

    const referenceDate = new Date()

    for (const fmt of formats) {
        try {
            const parsed = parse(trimmed, fmt, referenceDate)
            if (isValid(parsed)) {
                return parsed
            }
        } catch {
            // Ignore format mismatch and continue
        }
    }

    // If the input matches a standard numeric date format pattern (3 parts separated by - or /)
    // but failed parsing above, it represents an invalid numeric date (e.g., 31-04-2020, 01-13-2020).
    // We explicitly reject it to prevent native Date parser from incorrectly parsing it.
    const numericDatePattern = /^\d{1,4}[-\/]\d{1,4}[-\/]\d{1,4}$/
    if (numericDatePattern.test(trimmed)) {
        return null
    }

    // Fallback: native Date parsing (handles ISO strings, Date.toString(), etc.)
    try {
        const fallback = new Date(trimmed)
        if (isValid(fallback)) {
            return fallback
        }
    } catch {
        // Ignore parsing errors
    }

    return null
}
