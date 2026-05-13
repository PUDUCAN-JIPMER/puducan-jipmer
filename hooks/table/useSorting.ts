import { useState, useMemo } from 'react'
import { SortingState } from '@tanstack/react-table'

export const SORTABLE_KEYS = ['name', 'dob']

export function useSorting<T extends Record<string, any>>(data: T[]) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ])

  const sortedData = useMemo(() => {
    if (!data.length) return []

    return [...data].sort((a, b) => {
      const sortKey = sorting[0]?.id
      const desc = sorting[0]?.desc ?? false

      if (!sortKey) return 0

      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''

      if (sortKey === 'dob') {
        const dateA = new Date(aVal as string).getTime()
        const dateB = new Date(bVal as string).getTime()
        const cmp = dateA < dateB ? -1 : dateA > dateB ? 1 : 0
        // Flipped because older dob = higher age, so direction is visually inverted
        return desc ? cmp : -cmp
      }

      const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
      return desc ? -cmp : cmp
    })
  }, [data, sorting])

  const toggle = (columnId: string) => {
    setSorting((prev) => {
      const existing = prev.find((s) => s.id === columnId)
      if (existing) {
        // Same column — toggle direction
        return [{ id: columnId, desc: !existing.desc }]
      }
      // New column — start ascending
      return [{ id: columnId, desc: false }]
    })
  }

  return {
    sorting,
    setSorting,
    toggle,
    sortedData,
  }
}