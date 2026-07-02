'use client'

export type TriageLevel = 'critical' | 'high' | 'urgent' | 'non-urgent' | null | undefined

const TRIAGE_CONFIG: Record<
    NonNullable<TriageLevel>,
    { label: string; emoji: string; className: string }
> = {
    critical: {
        label: 'Level 1 — Critical',
        emoji: '🔴',
        className: 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    },
    high: {
        label: 'Level 2 — High',
        emoji: '🟠',
        className: 'bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    },
    urgent: {
        label: 'Level 3 — Urgent',
        emoji: '🟡',
        className: 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    },
    'non-urgent': {
        label: 'Level 4 — Non-Urgent',
        emoji: '🟢',
        className: 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    },
}

export function TriageCell({ level }: { level: TriageLevel }) {
    if (!level) return <span className="text-muted-foreground text-xs italic">—</span>
    const config = TRIAGE_CONFIG[level]
    if (!config) return null
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
            {config.emoji} {config.label}
        </span>
    )
}