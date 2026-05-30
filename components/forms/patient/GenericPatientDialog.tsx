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
import { useEffect, useState, useRef, useCallback } from 'react'
import { checkAadhaarDuplicateUtil } from '@/lib/patient/checkPatientRecord'
import { PatientSchema, PatientFormInputs } from '@/schema/patient'
import GenericPatientForm from './GenericPatientForm'
import clsx from 'clsx'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getDraftKey } from '@/lib/common/draft-utils'
import { useFormPersistence } from '@/hooks/useFormPersistence'

interface GenericPatientDialogProps {
    mode: 'add' | 'edit'
    trigger?: React.ReactNode
    patientData?: PatientFormInputs & { id?: string }
    onSuccess?: () => void
    // for keyboard shortcuts
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export default function GenericPatientDialog({
    mode,
    trigger,
    patientData,
    onSuccess,
    // for keyboard shortcuts
    open,
    onOpenChange,
}: GenericPatientDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const isEdit = mode === 'edit'
    const queryClient = useQueryClient()

    const isOpen = open ?? internalOpen
    const setIsOpen = onOpenChange ?? setInternalOpen

    const { orgId, userId } = useAuth()
    const draftKey = userId ? getDraftKey(mode, userId, patientData?.id) : null

    const form = useForm<PatientFormInputs>({
        // zodResolver typing can sometimes conflict with react-hook-form's Resolver
        // cast to any to avoid TS incompatible-resolver issues
        resolver: zodResolver(PatientSchema) as any,
        mode: 'onChange',
        reValidateMode: 'onChange',
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
            stageOfTheCancer: undefined,
            treatmentDetails: [],
            otherTreatmentDetails: '',
        },
    })

    const { handleSubmit, reset, watch } = form
    const aadhaarId = watch('aadhaarId')
    const hasAadhaar = watch('hasAadhaar')

    // Initialize Persistence Hook
    const { flush, clear, setSubmitting, setSubmitted } = useFormPersistence(form, {
        key: draftKey,
        enabled: !!isOpen,
        initialData: isEdit ? patientData : undefined,
    })

    // 1. Aadhaar duplicate check
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

    // 2. Flush-on-Close & Atomic Clear
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            flush() // Immediate flush before closing
        }
        setIsOpen(open)
    }

    const handleClear = () => {
        clear() // Atomic Clear
        reset({
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
            assignedHospital: isEdit ? patientData?.assignedHospital : { id: '', name: '' },
            diagnosedYearsAgo: '',
            diagnosedDate: '',
            treatmentStartDate: null,
            treatmentEndDate: null,
            patientStatus: 'Alive',
            patientDeathDate: '',
            hasAadhaar: true,
            suspectedCase: false,
            biopsyNumber: '',
            stageOfTheCancer: undefined,
            treatmentDetails: [],
            otherTreatmentDetails: '',
        })
        toast.success('Form and draft cleared')
    }

    const onSubmit = async (data: PatientFormInputs) => {
        console.log('📝 Submitting patient data (Optimistic)...', mode)
        setIsSaving(true)
        setSubmitting(true) // Signal start of submission

        try {
            // Remove undefined values before updating Firestore (from upstream)
            const cleanedData = Object.fromEntries(
                Object.entries(data).filter(([_, value]) => value !== undefined)
            )

            const patientRef = isEdit && patientData?.id
                ? doc(db, 'patients', patientData.id)
                : collection(db, 'patients')

            // Trigger Firestore write
            const firestoreOp = isEdit
                ? updateDoc(patientRef as any, cleanedData)
                : addDoc(patientRef as any, {
                    ...cleanedData,
                    createdAt: serverTimestamp(),
                })

            console.log('✅ Firestore write initiated')

            toast.success(isEdit ? 'Patient updated successfully.' : 'Patient added successfully.')

            // Invalidate draft immediately and lock persistence
            setSubmitted()

            setIsOpen(false)
            reset()

            // Background task: Handle completion and invalidation
            firestoreOp.then(() => {
                console.log('🏁 Firestore write confirmed (local/remote)')
                const queryKey = orgId ? ['patients', { orgId }] : ['patients']
                queryClient.invalidateQueries({ queryKey })
                onSuccess?.()
            }).catch(err => {
                console.error('❌ Background Firestore write failed:', err)
            })

        } catch (err) {
            console.error('❌ Immediate submission error:', err)
            toast.error('Failed to process patient data.')
            setSubmitting(false) // Release lock on error
        } finally {
            setIsSaving(false)
        }
    }

    const defaultTrigger = isEdit ? (
        <Button size="icon" variant="outline" title="Update">
            <Pencil className="h-4 w-4" />
        </Button>
    ) : (
        <Button variant="outline" className="cursor-pointer border-2 border-green-400!">
            <Plus className="h-4 w-4" /> <span className="hidden sm:block">Add Patient</span>
        </Button>
    )

    return (
        <FormProvider {...form}>
            {/* added isOpen to handle both keyboard shortcut and click */}
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

                <DialogContent
                    onInteractOutside={(e) => e.preventDefault()}
                    className={clsx(
                        'max-h-[90vh] w-full max-w-[95vw] overflow-y-auto sm:max-w-2xl md:max-w-3xl lg:max-w-5xl 2xl:max-w-[90vw]'
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
                        onClear={handleClear}
                        isEdit={isEdit}
                        isSaving={isSaving}
                    />
                </DialogContent>
            </Dialog>
        </FormProvider>
    )
}
