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
        // cast to unknown as never to avoid TS incompatible-resolver issues and no-explicit-any rule
        resolver: zodResolver(PatientSchema) as unknown as never,
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

    // Helper to deeply strip undefined values before writing to Firestore
    const sanitizeForFirestore = (obj: unknown): unknown => {
        if (obj === null || obj === undefined) return null
        if (Array.isArray(obj)) {
            return obj.map(sanitizeForFirestore)
        }
        if (typeof obj === 'object') {
            const result: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
                if (value !== undefined) {
                    result[key] = sanitizeForFirestore(value)
                }
            }
            return result
        }
        return obj
    }

    const onSubmit = async (data: PatientFormInputs) => {
        const sanitizedData = sanitizeForFirestore(data) as Record<string, unknown>

        setIsSaving(true)
        setSubmitting(true)
        try {
            if (isEdit && patientData?.id) {
                // Update existing patient

                await updateDoc(doc(db, 'patients', patientData.id), {
                    ...sanitizedData,
                    updatedAt: serverTimestamp(),
                })
                toast.success('Patient updated successfully.')
            } else {
                // Add new patient

                await addDoc(collection(db, 'patients'), {
                    ...sanitizedData,
                    createdAt: serverTimestamp(), // ✅ Firestore timestamp
                    updatedAt: serverTimestamp(),
                })
                toast.success('Patient added successfully.')
            }

            // queryClient.invalidateQueries({ queryKey: ['patients'] })
            if (orgId) {
                queryClient.invalidateQueries({ queryKey: ['patients', orgId] })
            } else {
                queryClient.invalidateQueries({ queryKey: ['patients'] })
            }

            setSubmitted()
            setIsOpen(false)
            reset()
            onSuccess?.()
        } catch (err) {
            const e = err as any
            const code = String(e?.code ?? '')
            const message = String(e?.message ?? '')

            let friendly = `Could not ${isEdit ? 'update' : 'add'} patient. Please try again.`
            if (code.includes('permission-denied')) {
                friendly = 'Permission denied. Please login again or contact an admin.'
            } else if (code.includes('unauthenticated')) {
                friendly = 'Session expired. Please login and try again.'
            } else if (code.includes('unavailable')) {
                friendly = 'Network issue. Please check your internet connection and try again.'
            } else if (code.includes('resource-exhausted')) {
                friendly = 'Server is busy. Please try again in a minute.'
            }

            toast.error(friendly, {
                description: code || message ? `${code}${code && message ? ' — ' : ''}${message}` : undefined,
                duration: 8000,
            })
        } finally {
            setIsSaving(false)
            setSubmitting(false)
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
