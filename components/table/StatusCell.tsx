import React from 'react'

interface StatusCellProps {
    status?: string
}

export function StatusCell({ status }: StatusCellProps) {
    const statusLower = status?.toLowerCase()

    const colorClass =
        statusLower === 'alive'
            ? 'bg-primary/10 text-primary border border-primary/20'
            : statusLower === 'not alive'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : statusLower === 'ongoing'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                : statusLower === 'followup'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : statusLower === 'not available'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'text-muted-foreground border border-border'
                   

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium select-none capitalize ${colorClass}`}>
            {status || 'None'}
        </span>
    )
}
