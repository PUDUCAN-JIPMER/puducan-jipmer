'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { generateSummary } from '@/app/action'
import { Patient } from '@/schema/patient'
import { Sparkles, AlertTriangle, Loader2, RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

type PatientSummaryDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    patient: Partial<Patient>
    patientName: string
}

type SummaryState = {
    summary: string | null
    error: string | null
}

function toPlainValue(value: unknown): unknown {
    if (value === null || value === undefined) return value
    if (typeof value !== 'object') return value
    if (value instanceof Date) return value.toISOString()

    if (
        'seconds' in value &&
        'nanoseconds' in value &&
        typeof value.seconds === 'number' &&
        typeof value.nanoseconds === 'number'
    ) {
        return new Date(value.seconds * 1000).toISOString()
    }

    if (Array.isArray(value)) return value.map(toPlainValue)

    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
            key,
            toPlainValue(nestedValue),
        ])
    )
}

export function PatientSummaryDialog({ open, onOpenChange, patient, patientName }: PatientSummaryDialogProps) {
    const [loading, setLoading] = useState(false)
    const [summaryState, setSummaryState] = useState<SummaryState>({
        summary: null,
        error: null,
    })

    const loadSummary = useCallback(async () => {
        if (!patient?.id) {
            setSummaryState({
                summary: null,
                error: 'Patient ID is missing. Unable to generate summary.',
            })
            return
        }

        setLoading(true)
        setSummaryState({ summary: null, error: null })

        try {
            const result = await generateSummary(toPlainValue(patient) as Partial<Patient>)

            if (result.success && result.summary) {
                setSummaryState({
                    summary: result.summary,
                    error: null,
                })
                return
            }

            setSummaryState({
                summary: null,
                error: result.summaryError || result.message || 'Unable to generate AI summary.',
            })
        } catch (error) {
            setSummaryState({
                summary: null,
                error: error instanceof Error ? error.message : 'Unexpected error while generating AI summary.',
            })
        } finally {
            setLoading(false)
        }
    }, [patient])

    useEffect(() => {
        if (open) loadSummary()
    }, [open, loadSummary])

    const statusConfig = {
        icon: summaryState.error ? AlertTriangle : Sparkles,
        color: summaryState.error ? 'text-red-600' : 'text-blue-600',
        bg: summaryState.error ? 'bg-red-50' : 'bg-blue-50',
        label: summaryState.error ? 'Action Needed' : 'AI Generated',
    }

    const StatusIcon = statusConfig.icon

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Patient Summary
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {/* Patient Header with Status */}
                    <div className={`rounded-lg ${statusConfig.bg} border p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Patient</p>
                                <p className="text-lg font-semibold">{patientName}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.color} border-current`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {loading ? 'Generating' : statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <div>
                                <p className="text-sm font-medium">Generating AI summary...</p>
                                <p className="text-xs text-muted-foreground">Reviewing cancer screening and treatment fields.</p>
                            </div>
                        </div>
                    )}

                    {!loading && summaryState.error && (
                        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                <div>
                                    <p className="text-sm font-medium text-red-700">Summary unavailable</p>
                                    <p className="text-sm text-red-600">{summaryState.error}</p>
                                </div>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={loadSummary}>
                                <RefreshCcw className="h-3.5 w-3.5" />
                                Try again
                            </Button>
                        </div>
                    )}

                    {!loading && summaryState.summary && (
                        <div className="space-y-3 rounded-lg border bg-background p-4">
                            <h3 className="flex items-center gap-2 text-sm font-semibold">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Clinician Summary
                            </h3>
                            <p className="text-sm leading-6 text-muted-foreground">{summaryState.summary}</p>
                            <p className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                                AI-generated summary. Please verify with the full patient record before clinical decisions.
                            </p>
                        </div>
                    )}

                    <Button onClick={() => onOpenChange(false)} className="w-full" variant="outline">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
