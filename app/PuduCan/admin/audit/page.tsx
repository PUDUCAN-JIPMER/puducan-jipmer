'use client'

import { useEffect } from 'react'
import { withAuth } from '@/components/hoc/withAuth'
import { ROLE_CONFIG } from '@/constants/auth'
import { useAuditLog } from '@/hooks/verification/useAuditLog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, RefreshCw, ShieldCheck, ShieldOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuditLogRecord } from '@/hooks/verification/useAuditLog'

// ── Helpers ───────────────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<string, string> = {
  mock:        'Mock (Dev)',
  digilocker:  'DigiLocker',
  abha:        'ABHA',
}

function formatTimestamp(ts: unknown): string {
  if (!ts) return '—'
  try {
    // Firestore Timestamp has .toDate(); ISO strings parse directly
    const date =
      typeof ts === 'object' && ts !== null && 'toDate' in ts
        ? (ts as { toDate: () => Date }).toDate()
        : new Date(ts as string)
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return '—'
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ success }: { success: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        success
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
          : 'border-destructive/40 bg-destructive/10 text-destructive',
      )}
    >
      {success ? (
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
      ) : (
        <ShieldOff className="h-3 w-3" aria-hidden="true" />
      )}
      {success ? 'Success' : 'Failed'}
    </span>
  )
}

function AuditRow({ log }: { log: AuditLogRecord }) {
  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/40">
      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
        {formatTimestamp(log.timestamp)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge success={log.success} />
      </td>
      <td className="px-4 py-3 text-sm">
        {SOURCE_LABEL[log.provider] ?? log.provider}
      </td>
      <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
        {log.maskedId ?? '—'}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {log.verifierRole ?? '—'}
      </td>
      <td className="px-4 py-3 max-w-xs">
        {log.error ? (
          <span className="text-xs text-destructive">{log.error}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function AuditPageContent() {
  const {
    logs,
    isLoading,
    hasMore,
    error,
    filters,
    setFilters,
    fetchFirst,
    fetchNext,
  } = useAuditLog()

  // Fetch on mount and whenever filters change
  useEffect(() => {
    void fetchFirst()
  }, [fetchFirst])

  const isEmpty = !isLoading && logs.length === 0 && !error

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verification Audit Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Immutable record of all patient identity verification attempts.
            Full Aadhaar numbers are never stored here.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchFirst()}
          disabled={isLoading}
          aria-label="Refresh audit log"
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(v) =>
            setFilters({ ...filters, status: v as 'success' | 'failure' | 'all' })
          }
        >
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="success">Success only</SelectItem>
            <SelectItem value="failure">Failures only</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {logs.length > 0 && `Showing ${logs.length} entries`}
        </span>
      </div>

      {/* ── Error banner ───────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Failed to load audit logs</p>
            <p className="mt-0.5 text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm" aria-label="Verification audit log">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Masked ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                Error
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && logs.length === 0 ? (
              <SkeletonRows />
            ) : isEmpty ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No verification log entries found.
                </td>
              </tr>
            ) : (
              logs.map((log) => <AuditRow key={log.id} log={log} />)
            )}
          </tbody>
        </table>
      </div>

      {/* ── Load more ──────────────────────────────────────────────── */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => void fetchNext()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Loading…
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default withAuth(AuditPageContent, ROLE_CONFIG.admin)
