'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil } from 'lucide-react'
import { db } from '@/firebase'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { checkAadhaarDuplicateUtil } from '@/lib/patient/checkPatientRecord'
import { PatientSchema, PatientFormInputs } from '@/schema/patient'
import GenericPatientForm from './GenericPatientForm'
import clsx from 'clsx'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'

interface GenericPatientDialogProps {
    mode: 'add' | 'edit'
    trigger?: React.ReactNode
    patientData?: PatientFormInputs & { id?: string }
    onSuccess?: () => void
}

export default function GenericPatientDialog({
    mode,
    trigger,
    patientData,
    onSuccess,
}: GenericPatientDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const isEdit = mode === 'edit'
    const queryClient = useQueryClient()
    const {orgId} = useAuth()

    const form = useForm<PatientFormInputs>({
        resolver: zodResolver(PatientSchema),
        defaultValues: {
            name: '',
            caregiverName: '',
            hbcrID: '',
            phoneNumber: [''],
            hospitalRegistrationDate: '',
            sex: undefined,
            dob: '',
            address: '',
            aadhaarId: '',
            aabhaId: '',
            rationCardColor: 'none',
            religion: 'none',
            bloodGroup: '',
            diseases: [],
            assignedHospital: { id: '', name: '' },
            diagnosedYearsAgo: '',
            diagnosedDate: '',
            treatmentStartDate: null,
            treatmentEndDate: null,
            patientStatus: 'Alive',
            patientDeathDate: '',
            hasAadhaar: true,
            suspectedCase: false,
            biopsyNumber: '',
            stageOfTheCancer: '',
            treatmentDetails: [],
            otherTreatmentDetails: '',
        },
    })

    const { handleSubmit, reset, watch, setValue } = form
    const aadhaarId = watch('aadhaarId')
    const hasAadhaar = watch('hasAadhaar')

    // Initialize form with patient data for edit mode
    useEffect(() => {
        if (isEdit && patientData && open) {
            reset(patientData)
        }
    }, [isEdit, patientData, open, reset])

    // Aadhaar duplicate check (skip for edit mode if Aadhaar hasn't changed)
    useEffect(() => {
        if (
            hasAadhaar &&
            aadhaarId?.length === 12 &&
            (!isEdit || aadhaarId !== patientData?.aadhaarId)
        ) {
            const timer = setTimeout(async () => {
                await checkAadhaarDuplicateUtil(aadhaarId)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [aadhaarId, hasAadhaar, isEdit, patientData])

    // Save to localStorage (for add mode only)
    useEffect(() => {
        if (!isEdit) {
            localStorage.setItem('addPatientFormData', JSON.stringify(form.getValues()))
        }
    }, [watch(), form, isEdit])

    // Load from localStorage (for add mode only)
    useEffect(() => {
        if (open && !isEdit) {
            const saved = localStorage.getItem('addPatientFormData')
            if (saved) {
                try {
                    reset(JSON.parse(saved))
                } catch {
                    console.warn('Invalid saved form data')
                }
            }
        }
    }, [open, reset, isEdit])

    const onSubmit = async (data: PatientFormInputs) => {
        console.log('📝 Submitting patient data (Optimistic)...', mode)
        setIsSaving(true)
        
        try {
            const patientRef = isEdit && patientData?.id
                ? doc(db, 'patients', patientData.id)
                : collection(db, 'patients')

            // Trigger Firestore write
            const firestoreOp = isEdit 
                ? updateDoc(patientRef as any, data)
                : addDoc(patientRef as any, {
                    ...data,
                    createdAt: serverTimestamp(),
                })

            console.log('✅ Firestore write initiated')

            // OPTIMISTIC COMPLETION: 
            // We do NOT await firestoreOp here for the UI to move on.
            // This ensures the dialog closes immediately in offline mode.
            
            toast.success(isEdit ? 'Patient updated successfully.' : 'Patient added successfully.')
            if (!isEdit) localStorage.removeItem('addPatientFormData')

            setOpen(false)
            reset()
            
            // Background task: Handle completion and invalidation
            firestoreOp.then(() => {
                console.log('🏁 Firestore write confirmed (local/remote)')
                const queryKey = orgId ? ['patients', orgId] : ['patients']
                queryClient.invalidateQueries({ queryKey })
                onSuccess?.()
            }).catch(err => {
                console.error('❌ Background Firestore write failed:', err)
                // Note: We don't show a blocking error here as the UI is already closed,
                // but we log it and could show a non-intrusive toast.
            })

        } catch (err) {
            console.error('❌ Immediate submission error:', err)
            toast.error('Failed to process patient data.')
        } finally {
            // We set isSaving to false immediately because the UI transition (closing) 
            // will unmount or hide the button anyway.
            setIsSaving(false)
        }
    }

    const defaultTrigger = isEdit ? (
        <Button size="icon" variant="outline" title="Update">
            <Pencil className="h-4 w-4" />
        </Button>
    ) : (
        <Button variant="outline" className="cursor-pointer border-2 !border-green-400">
            <Plus className="h-4 w-4" /> <span className="hidden sm:block">Add Patient</span>
        </Button>
    )

    return (
        <FormProvider {...form}>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

                <DialogContent
                    onInteractOutside={(e) => e.preventDefault()}
                    className={clsx(
                        'max-h-[90vh] w-full max-w-[95vw] overflow-y-auto sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] 2xl:max-w-[90vw]'
                    )}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {isEdit ? 'Update Patient Details' : 'Add New Patient Details'}
                        </DialogTitle>
                    </DialogHeader>

                    <GenericPatientForm
                        form={form}
                        reset={reset}
                        handleSubmit={handleSubmit}
                        onSubmit={onSubmit}
                        isEdit={isEdit}
                        isSaving={isSaving}
                    />
                </DialogContent>
            </Dialog>
        </FormProvider>
    )
}
