'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { AlertTriangle, SkipForward, GitMerge, Plus } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Decision =
    | { rowIndex: number; action: 'skip' }
    | { rowIndex: number; action: 'merge'; existingPatientId: string; incomingData: any }
    | { rowIndex: number; action: 'import_anyway'; data: any }

interface FlaggedRow {
    rowIndex: number
    incomingRow: any
    match: {
        existingPatientId: string
        existingPatient: any
        score: number
        dobMatched: boolean
        phoneMatched: boolean
    }
}

interface ImportReviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    flaggedRows: FlaggedRow[]
    cleanRows: { index: number; data: any }[]
    onResolved: (decisions: Decision[]) => Promise<void>
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImportReviewDialog({
    open,
    onOpenChange,
    flaggedRows,
    cleanRows,
    onResolved,
}: ImportReviewDialogProps) {
    // Track decision per flagged row. Default is 'skip' (safest option).
    const [decisions, setDecisions] = useState<Record<number, Decision>>(() =>
        Object.fromEntries(
            flaggedRows.map((r) => [
                r.rowIndex,
                { rowIndex: r.rowIndex, action: 'skip' },
            ])
        )
    )
    const [loading, setLoading] = useState(false)

    const setDecision = (rowIndex: number, action: Decision['action'], row: FlaggedRow) => {
        setDecisions((prev) => {
            if (action === 'skip') {
                return { ...prev, [rowIndex]: { rowIndex, action: 'skip' } }
            }
            if (action === 'merge') {
                return {
                    ...prev,
                    [rowIndex]: {
                        rowIndex,
                        action: 'merge',
                        existingPatientId: row.match.existingPatientId,
                        incomingData: row.incomingRow,
                    },
                }
            }
            if (action === 'import_anyway') {
                return {
                    ...prev,
                    [rowIndex]: { rowIndex, action: 'import_anyway', data: row.incomingRow },
                }
            }
            return prev
        })
    }

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onResolved(Object.values(decisions))
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    const allDecided = flaggedRows.every((r) => decisions[r.rowIndex] !== undefined)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-h-[90vh] w-full max-w-[95vw] overflow-hidden sm:max-w-[700px]"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        Review Possible Duplicates
                    </DialogTitle>
                    <DialogDescription>
                        {flaggedRows.length} row{flaggedRows.length > 1 ? 's' : ''} in your file
                        may already exist. Review each one and choose what to do.{' '}
                        {cleanRows.length > 0 && (
                            <span className="font-medium text-green-600">
                                {cleanRows.length} clean row{cleanRows.length > 1 ? 's' : ''} will
                                be imported automatically.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-2">
                    <div className="flex flex-col gap-4 py-2">
                        {flaggedRows.map((row) => {
                            const current = decisions[row.rowIndex]?.action ?? 'skip'
                            const score = Math.round(row.match.score * 100)

                            return (
                                <div
                                    key={row.rowIndex}
                                    className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950"
                                >
                                    {/* Match summary */}
                                    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                                        <span className="font-medium text-amber-700 dark:text-amber-300">
                                            Row {row.rowIndex + 1}
                                        </span>
                                        <Badge variant="outline" className="border-amber-400 text-amber-700">
                                            {score}% name match
                                        </Badge>
                                        {row.match.dobMatched && (
                                            <Badge variant="outline" className="border-blue-400 text-blue-700">
                                                DOB matched
                                            </Badge>
                                        )}
                                        {row.match.phoneMatched && (
                                            <Badge variant="outline" className="border-blue-400 text-blue-700">
                                                Phone matched
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Side-by-side comparison */}
                                    <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-zinc-900">
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                                                From CSV
                                            </p>
                                            <p className="font-medium">{row.incomingRow.name}</p>
                                            <p className="text-zinc-500">
                                                DOB: {row.incomingRow.dob ?? '—'}
                                            </p>
                                            <p className="text-zinc-500">
                                                Phone:{' '}
                                                {Array.isArray(row.incomingRow.phoneNumber)
                                                    ? row.incomingRow.phoneNumber.join(', ')
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div className="rounded-md bg-white p-3 shadow-sm dark:bg-zinc-900">
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                                                Existing Record
                                            </p>
                                            <p className="font-medium">
                                                {row.match.existingPatient.name}
                                            </p>
                                            <p className="text-zinc-500">
                                                DOB: {row.match.existingPatient.dob ?? '—'}
                                            </p>
                                            <p className="text-zinc-500">
                                                Phone:{' '}
                                                {Array.isArray(row.match.existingPatient.phoneNumber)
                                                    ? row.match.existingPatient.phoneNumber.join(', ')
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Decision buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant={current === 'skip' ? 'default' : 'outline'}
                                            onClick={() => setDecision(row.rowIndex, 'skip', row)}
                                            className="gap-1"
                                        >
                                            <SkipForward className="h-3.5 w-3.5" />
                                            Skip
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={current === 'merge' ? 'default' : 'outline'}
                                            onClick={() => setDecision(row.rowIndex, 'merge', row)}
                                            className="gap-1"
                                        >
                                            <GitMerge className="h-3.5 w-3.5" />
                                            Merge into existing
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={current === 'import_anyway' ? 'default' : 'outline'}
                                            onClick={() =>
                                                setDecision(row.rowIndex, 'import_anyway', row)
                                            }
                                            className="gap-1"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Import anyway
                                        </Button>
                                    </div>

                                    {/* Explain the chosen action */}
                                    <p className="mt-2 text-xs text-zinc-500">
                                        {current === 'skip' &&
                                            'This row will not be imported. The existing record stays unchanged.'}
                                        {current === 'merge' &&
                                            'The existing record will be updated with fields from this CSV row.'}
                                        {current === 'import_anyway' &&
                                            'A new record will be created even though a similar one exists.'}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-zinc-500">
                        {Object.values(decisions).filter((d) => d.action === 'skip').length} skipped
                        · {Object.values(decisions).filter((d) => d.action === 'merge').length} merging
                        · {Object.values(decisions).filter((d) => d.action === 'import_anyway').length} importing
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} disabled={!allDecided || loading}>
                            {loading ? 'Importing...' : 'Confirm Import'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}