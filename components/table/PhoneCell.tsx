import { useState } from 'react'

export function PhoneCell({
    phoneNumbers,
    isPatientTab,
}: {
    phoneNumbers: (string | undefined)[] | undefined
    isPatientTab: boolean
}) {
    const [showAll, setShowAll] = useState(false)

    const MAX_DISPLAY = 2
    const MAX_ALLOWED = 10

    const numbers = Array.isArray(phoneNumbers) ? phoneNumbers : phoneNumbers ? [phoneNumbers] : []

    if (numbers.length > MAX_ALLOWED) {
        console.warn(`Too many phone numbers! Max allowed is ${MAX_ALLOWED}.`)
    }

    const trimmed = numbers.slice(0, MAX_ALLOWED)
    const displayNumbers = showAll ? trimmed : trimmed.slice(0, MAX_DISPLAY)
    const remaining = trimmed.length - MAX_DISPLAY

    return (
        <div className="border-border whitespace-pre-wrap">
            {displayNumbers.map((num, i) => (
                <div key={i}>{num}</div>
            ))}

            {numbers.filter((n) => typeof n === 'string' && n.trim()).length === 0 && <p className="text-muted-foreground">—</p>}

            {!showAll && remaining > 0 && (
                <div
                    className="cursor-pointer text-blue-500 underline"
                    onClick={() => setShowAll(true)}
                >
                    ... {remaining} more
                </div>
            )}

            {showAll && trimmed.length > MAX_DISPLAY && (
                <div
                    className="cursor-pointer text-blue-500 underline"
                    onClick={() => setShowAll(false)}
                >
                    Show less
                </div>
            )}
        </div>
    )
}
