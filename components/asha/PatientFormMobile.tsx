'use client'

import { useAuth } from '@/contexts/AuthContext'
import { updatePatient } from '@/lib/api/patient.api'
import { Patient } from '@/schema'
import { PatientFormInputs, PatientSchema } from '@/schema/patient'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ColumnFive, ColumnFour, ColumnOne, ColumnThree, ColumnTwo } from '../forms/patient'
import { PatientHeader, SwipeableColumns, ActionButtons } from '.'

export default function PatientFormMobile({ patient }: { patient: Patient }) {
    const { userId } = useAuth()
    const [isSaving, setIsSaving] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<PatientFormInputs>({
        resolver: zodResolver(PatientSchema),
        defaultValues: {
            ...patient,
            followUps: patient.followUps ?? [],
            gpsLocation: patient.gpsLocation ?? null,
        },
    })

    // 1. Auto-Load Draft on Mount
    useEffect(() => {
        if (!patient.id) return
        const savedDraft = localStorage.getItem(`patient-draft-${patient.id}`)
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft)
                // Use reset to update the form without marking it as dirty immediately
                form.reset(draft)
            } catch (e) {
                console.error('Failed to load patient draft', e)
            }
        }
    }, [patient.id, form])

    // 2. Auto-Save Draft on Change (Debounced)
    const watchedValues = form.watch()
    useEffect(() => {
        if (!patient.id) return
        const timeoutId = setTimeout(() => {
            localStorage.setItem(`patient-draft-${patient.id}`, JSON.stringify(watchedValues))
        }, 1000)
        return () => clearTimeout(timeoutId)
    }, [watchedValues, patient.id])

    const handleSubmit = form.handleSubmit(
        async (values) => {
            console.log('📝 ASHA: Submitting patient update (Optimistic)...', patient.id)
            setIsSaving(true)
            
            try {
                if (!patient.id) throw new Error('Patient ID missing')

                const cleanValues = Object.fromEntries(
                    Object.entries(values).filter(([, v]) => v !== undefined)
                ) as PatientFormInputs

                // Trigger update without awaiting for UI completion
                const updatePromise = updatePatient(patient.id, cleanValues)
                console.log('✅ ASHA: Update initiated')

                // 3. Clear draft and show success immediately
                localStorage.removeItem(`patient-draft-${patient.id}`)
                toast.success('Patient updated successfully!')

                // Background tasks
                updatePromise.then(() => {
                    console.log('🏁 ASHA: Update confirmed')
                    const queryKey = ['patients', { ashaId: userId }]
                    queryClient.invalidateQueries({ queryKey })
                }).catch(err => {
                    console.error('❌ ASHA: Background update failed', err)
                })

            } catch (err) {
                console.error('❌ ASHA: Immediate update error', err)
                toast.error('Failed to process changes.')
            } finally {
                setIsSaving(false)
            }
        },
        (errors) => {
            console.error('❌ Validation errors:', errors)
            toast.error('Please fix validation errors before saving.')
        }
    )

    const handleDone = useCallback(async () => {
        try {
            setIsSaving(true)
            if (!patient.id) throw new Error('Patient ID missing')

            await updatePatient(patient.id, { assignedAsha: 'none' })
            toast.success('Patient marked as finished and unassigned.')
        } catch (err) {
            console.error(err)
            toast.error('Failed to update patient.')
        } finally {
            setIsSaving(false)
        }
    }, [patient.id])

    const columns = [
        <ColumnOne key="col1" form={form} isAsha />,
        <ColumnTwo key="col2" form={form} isAsha />,
        <ColumnThree key="col3" form={form} isAsha />,
        !patient.suspectedCase && <ColumnFour key="col4" form={form} isAsha />,
        <ColumnFive key="col5" form={form} isAsha />,
    ]

    return (
        <FormProvider {...form}>
            <div className="w-full max-w-[1440px] rounded-lg border pb-6 shadow-sm">
                <PatientHeader
                    name={patient.name}
                    address={patient.address}
                    isOpen={isOpen}
                    onToggle={() => setIsOpen(!isOpen)}
                />

                {isOpen && (
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center border-t px-4 py-2"
                    >
                        <SwipeableColumns
                            columns={columns}
                            activeIndex={activeIndex}
                            setActiveIndex={setActiveIndex}
                        />
                        <ActionButtons
                            isSaving={isSaving}
                            onSave={handleSubmit}
                            onDone={handleDone}
                        />
                    </form>
                )}
            </div>
        </FormProvider>
    )
}
