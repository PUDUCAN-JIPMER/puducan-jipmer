import React from 'react'

interface StatusCellProps {
    status?: string
}

export function StatusCell({ status }: StatusCellProps) {
    const statusLower = status?.toLowerCase()

    const colorClass =
        statusLower === 'alive'
            ? 'bg-green-100 text-green-800'
            : statusLower === 'not alive'
              ? 'bg-red-100 text-red-800'
              : statusLower === 'ongoing'
                ? 'bg-blue-100 text-blue-800'
                : statusLower === 'followup'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-muted-foreground'

    return (
        <span className={`rounded px-2 py-1 font-medium tracking-wider capitalize ${colorClass}`}>
            {status || 'None'}
        </span>
    )
}
