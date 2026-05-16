import { useState, useMemo } from 'react'
import { SortingState } from '@tanstack/react-table'

export const SORTABLE_KEYS = ['name', 'dob']
const STORAGE_KEY = 'patient-table-sorting'

export function useSorting<T extends Record<string, unknown>>(data: T[]) {
    const [sorting, setSorting] = useState<SortingState>(() => {
        if (typeof window === 'undefined') return [{ id: 'name', desc: false }]
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) return JSON.parse(saved)
        } catch {
            // ignore
        }
        return [{ id: 'name', desc: false }]
    })

    const toggle = (columnId: string) => {
        setSorting((prev) => {
            const existing = prev.find((s) => s.id === columnId)
            const newSorting: SortingState = existing
                ? [{ id: columnId, desc: !existing.desc }]
                : [{ id: columnId, desc: false }]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSorting))
            return newSorting
        })
    }

    const sortedData = useMemo(() => {
        if (!data.length) return []
        return [...data].sort((a, b) => {
            const sortKey = sorting[0]?.id
            const desc = sorting[0]?.desc ?? false
            if (!sortKey) return 0
            const aVal = (a[sortKey] ?? '') as string
            const bVal = (b[sortKey] ?? '') as string
            if (sortKey === 'dob') {
                const dateA = new Date(aVal as string).getTime()
                const dateB = new Date(bVal as string).getTime()
                const cmp = dateA < dateB ? -1 : dateA > dateB ? 1 : 0
                return desc ? cmp : -cmp
            }
            const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
            return desc ? -cmp : cmp
        })
    }, [data, sorting])

    return {
        sorting,
        setSorting,
        toggle,
        sortedData,
    }
}
