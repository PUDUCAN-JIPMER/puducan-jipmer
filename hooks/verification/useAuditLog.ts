'use client'

import { useCallback, useState } from 'react'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { AUDIT_COLLECTION } from '@/lib/verification/constants'
import type { AuditLogEntry } from '@/lib/verification/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuditLogRecord extends AuditLogEntry {
  id: string
}

export interface AuditLogFilters {
  status?: 'success' | 'failure' | 'all'
  staffUid?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface UseAuditLogReturn {
  logs: AuditLogRecord[]
  isLoading: boolean
  hasMore: boolean
  error: string | null
  filters: AuditLogFilters
  setFilters: (f: AuditLogFilters) => void
  fetchFirst: () => Promise<void>
  fetchNext: () => Promise<void>
  reset: () => void
}

const PAGE_SIZE = 25

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useAuditLog — paginated admin viewer for verification_logs entries.
 *
 * Responsibilities:
 *   - Fetches PAGE_SIZE entries per page, sorted newest-first
 *   - Supports filtering by success/failure status and staff UID
 *   - Cursor-based pagination via Firestore startAfter
 *   - Error state exposed for the UI to handle gracefully
 *
 * Access: admin role only (enforced by Firestore security rules — this hook
 * does not check the role; the page component does via withAuth).
 */
export function useAuditLog(): UseAuditLogReturn {
  const [logs, setLogs] = useState<AuditLogRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<DocumentSnapshot | null>(null)
  const [filters, setFiltersState] = useState<AuditLogFilters>({ status: 'all' })

  function buildConstraints(afterCursor?: DocumentSnapshot): QueryConstraint[] {
    const constraints: QueryConstraint[] = [orderBy('timestamp', 'desc')]

    if (filters.status === 'success') {
      constraints.push(where('success', '==', true))
    } else if (filters.status === 'failure') {
      constraints.push(where('success', '==', false))
    }

    if (filters.staffUid) {
      constraints.push(where('verifierId', '==', filters.staffUid))
    }

    if (afterCursor) {
      constraints.push(startAfter(afterCursor))
    }

    constraints.push(limit(PAGE_SIZE))
    return constraints
  }

  const fetchFirst = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const snap = await getDocs(
        query(collection(db, AUDIT_COLLECTION), ...buildConstraints()),
      )
      const records = snap.docs.map((d) => ({ id: d.id, ...(d.data() as AuditLogEntry) }))
      setLogs(records)
      setCursor(snap.docs[snap.docs.length - 1] ?? null)
      setHasMore(snap.docs.length === PAGE_SIZE)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs.')
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchNext = useCallback(async () => {
    if (!cursor || !hasMore) return
    setIsLoading(true)
    setError(null)
    try {
      const snap = await getDocs(
        query(collection(db, AUDIT_COLLECTION), ...buildConstraints(cursor)),
      )
      const records = snap.docs.map((d) => ({ id: d.id, ...(d.data() as AuditLogEntry) }))
      setLogs((prev) => [...prev, ...records])
      setCursor(snap.docs[snap.docs.length - 1] ?? null)
      setHasMore(snap.docs.length === PAGE_SIZE)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more audit logs.')
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, hasMore, filters])

  const setFilters = useCallback((f: AuditLogFilters) => {
    setFiltersState(f)
    setCursor(null)
    setLogs([])
    setHasMore(false)
  }, [])

  const reset = useCallback(() => {
    setLogs([])
    setCursor(null)
    setHasMore(false)
    setError(null)
    setFiltersState({ status: 'all' })
  }, [])

  return { logs, isLoading, hasMore, error, filters, setFilters, fetchFirst, fetchNext, reset }
}
