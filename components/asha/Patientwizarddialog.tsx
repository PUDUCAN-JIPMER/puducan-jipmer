'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { updatePatient } from '@/lib/api/patient.api'
import { Patient } from '@/schema'
import { PatientFormInputs, PatientSchema } from '@/schema/patient'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ColumnFive, ColumnFour, ColumnOne, ColumnThree, ColumnTwo } from '../forms/patient'
import { ActionButtons } from '.'

const STEP_LABELS = ['Personal', 'Medical', 'Diagnosis', 'Treatment', 'Follow-ups']

export function PatientWizardDialog({
    patient,
    open,
    onClose,
}: {
    patient: Patient
    open: boolean
    onClose: () => void
}) {
    const { userId } = useAuth()
    const [isSaving, setIsSaving] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [direction, setDirection] = useState<'forward' | 'back'>('forward')
    const [animating, setAnimating] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<PatientFormInputs>({
        resolver: zodResolver(PatientSchema),
        defaultValues: {
            ...patient,
            followUps: patient.followUps ?? [],
            gpsLocation: patient.gpsLocation ?? null,
        },
    })

    // Reset step when dialog opens
    useEffect(() => {
        if (open) setActiveIndex(0)
    }, [open])

    const steps = [
        <ColumnOne key="col1" form={form} isAsha />,
        <ColumnTwo key="col2" form={form} isAsha />,
        <ColumnThree key="col3" form={form} isAsha />,
        !patient.suspectedCase ? <ColumnFour key="col4" form={form} isAsha /> : null,
        <ColumnFive key="col5" form={form} isAsha />,
    ].filter(Boolean)

    const totalSteps = steps.length

    const navigate = (dir: 'forward' | 'back') => {
        if (animating) return
        if (dir === 'forward' && activeIndex >= totalSteps - 1) return
        if (dir === 'back' && activeIndex <= 0) return
        setDirection(dir)
        setAnimating(true)
        setTimeout(() => {
            setActiveIndex((i) => (dir === 'forward' ? i + 1 : i - 1))
            setAnimating(false)
        }, 220)
    }

    const handleSubmit = form.handleSubmit(
        async (values) => {
            try {
                setIsSaving(true)
                if (!patient.id) throw new Error('Patient ID missing')
                const cleanValues = Object.fromEntries(
                    Object.entries(values).filter(([_, v]) => v !== undefined)
                ) as PatientFormInputs
                await updatePatient(patient.id, cleanValues)
                toast.success('Patient updated successfully!')
                queryClient.invalidateQueries({ queryKey: ['patients', { ashaId: userId }] })
                onClose()
            } catch (err) {
                console.error(err)
                toast.error('Failed to save changes. Try again.')
            } finally {
                setIsSaving(false)
            }
        },
        (errors) => {
            console.error('Validation errors:', errors)
            toast.error('Please fix validation errors before saving.')
        }
    )

    const handleDone = useCallback(async () => {
        try {
            setIsSaving(true)
            if (!patient.id) throw new Error('Patient ID missing')
            await updatePatient(patient.id, { assignedAsha: 'none' })
            toast.success('Patient marked as finished and unassigned.')
            onClose()
        } catch (err) {
            console.error(err)
            toast.error('Failed to update patient.')
        } finally {
            setIsSaving(false)
        }
    }, [patient.id, onClose])

    const isFirst = activeIndex === 0
    const isLast = activeIndex === totalSteps - 1
    const progress = ((activeIndex + 1) / totalSteps) * 100

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">

                {/* ── Header ── */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
                    <div className="min-w-0">
                        <DialogTitle className="text-base font-semibold text-foreground truncate">
                            {patient.name || 'Unnamed Patient'}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {patient.address}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-4 shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Progress bar ── */}
                <div className="h-1 w-full bg-muted shrink-0">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* ── Step indicators ── */}
                <div className="flex items-center justify-center gap-1 px-6 py-3 shrink-0">
                    {steps.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                if (i !== activeIndex) {
                                    setDirection(i > activeIndex ? 'forward' : 'back')
                                    setAnimating(true)
                                    setTimeout(() => {
                                        setActiveIndex(i)
                                        setAnimating(false)
                                    }, 220)
                                }
                            }}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className={`
                                h-1.5 rounded-full transition-all duration-300
                                ${i === activeIndex
                                    ? 'w-6 bg-primary'
                                    : i < activeIndex
                                    ? 'w-4 bg-primary/40'
                                    : 'w-4 bg-muted-foreground/20'}
                            `} />
                            <span className={`
                                hidden sm:block text-[10px] font-medium transition-colors
                                ${i === activeIndex ? 'text-primary' : 'text-muted-foreground/50'}
                            `}>
                                {STEP_LABELS[i]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── Current step label (mobile) ── */}
                <div className="sm:hidden text-center pb-1 shrink-0">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                        {STEP_LABELS[activeIndex]}
                    </span>
                </div>

                {/* ── Scrollable form content ── */}
                <FormProvider {...form}>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-1 flex-col min-h-0"
                    >
                        {/* Content with slide animation */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                            <div
                                key={activeIndex}
                                className={`
                                    transition-all duration-220
                                    ${animating
                                        ? direction === 'forward'
                                            ? 'opacity-0 translate-x-4'
                                            : 'opacity-0 -translate-x-4'
                                        : 'opacity-100 translate-x-0'}
                                `}
                                style={{ transition: 'opacity 220ms ease, transform 220ms ease' }}
                            >
                                {steps[activeIndex]}
                            </div>
                        </div>

                        {/* ── Navigation footer ── */}
                        <div className="shrink-0 border-t border-border px-6 py-4">
                            {isLast ? (
                                /* Last step: Save + Done */
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <ChevronLeft size={14} />
                                        <button
                                            type="button"
                                            onClick={() => navigate('back')}
                                            className="underline underline-offset-2 hover:text-foreground transition-colors"
                                        >
                                            Back to {STEP_LABELS[activeIndex - 1]}
                                        </button>
                                    </div>
                                    <ActionButtons
                                        isSaving={isSaving}
                                        onSave={handleSubmit}
                                        onDone={handleDone}
                                    />
                                </div>
                            ) : (
                                /* All other steps: Prev + Next */
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate('back')}
                                        disabled={isFirst}
                                        className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>

                                    {/* Step count */}
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {activeIndex + 1} / {totalSteps}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => navigate('forward')}
                                        disabled={isLast}
                                        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}