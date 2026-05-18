'use client'

import { ChevronRight } from 'lucide-react'

const statusStyles: Record<string, string> = {
    Alive: 'bg-primary/10 text-primary border border-primary/20',
    'Not Alive': 'bg-destructive/10 text-destructive border border-destructive/20',
    'Not Available': 'bg-muted text-muted-foreground border border-border',
}

export function PatientHeader({
    name,
    address,
    isOpen,
    onToggle,
    diseases,
    patientStatus,
    suspectedCase,
}: {
    name?: string
    address?: string
    isOpen?: boolean
    onToggle?: () => void
    diseases?: string[]
    patientStatus?: string
    suspectedCase?: boolean
}) {
    const initials = (name ?? 'U')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    const statusLabel = patientStatus ?? 'Alive'
    const statusClass = statusStyles[statusLabel] ?? statusStyles['Not Available']

    return (
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3.5">
            {/* Avatar + Info */}
            <div className="flex items-center gap-3 min-w-0">
                {/* Initials avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary select-none">
                    {initials}
                </div>

                <div className="min-w-0">
                    {/* Name + badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-semibold text-foreground truncate">
                            {name || 'Unnamed Patient'}
                        </p>
                        {suspectedCase && (
                            <span className="shrink-0 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                                Suspected
                            </span>
                        )}
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                            {statusLabel}
                        </span>
                    </div>

                    {/* Address */}
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {address || 'No address'}
                    </p>

                    {/* Disease pills */}
                    {diseases && diseases.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {diseases.slice(0, 3).map((d) => (
                                <span
                                    key={d}
                                    className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive border border-destructive/15"
                                >
                                    {d}
                                </span>
                            ))}
                            {diseases.length > 3 && (
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                    +{diseases.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Arrow hint */}
            <div className="shrink-0 text-muted-foreground/50">
                <ChevronRight size={18} />
            </div>
        </div>
    )
}