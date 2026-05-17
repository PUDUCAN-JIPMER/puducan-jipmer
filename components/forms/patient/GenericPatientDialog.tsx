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
import { int } from 'zod'

interface GenericPatientDialogProps {
    mode: 'add' | 'edit'
    trigger?: React.ReactNode
    patientData?: PatientFormInputs & { id?: string }
    onSuccess?: () => void
    // for keyboard shortcuts
    open?: boolean
    onOpenChange?: (open:boolean) => void
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
    const isEdit = mode === 'edit'
    const queryClient = useQueryClient()

    const isOpen = open ?? internalOpen

    const setIsOpen = onOpenChange ?? setInternalOpen

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
        if (isOpen && !isEdit) {
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
        try {
            if (isEdit && patientData?.id) {
                // Update existing patient
                await updateDoc(doc(db, 'patients', patientData.id), data)
                toast.success('Patient updated successfully.')
            } else {
                // Add new patient
                await addDoc(collection(db, 'patients'), {
                    ...data,
                    createdAt: serverTimestamp(), // ✅ Firestore timestamp
                })
                toast.success('Patient added successfully.')
                localStorage.removeItem('addPatientFormData')
            }

            // queryClient.invalidateQueries({ queryKey: ['patients'] })
            if (orgId) {
                queryClient.invalidateQueries({ queryKey: ['patients', orgId] })
            } else {
                queryClient.invalidateQueries({ queryKey: ['patients'] })
            }

            setIsOpen(false)
            reset()
            onSuccess?.()
        } catch (err) {
            console.error(`Error ${isEdit ? 'updating' : 'adding'} patient:`, err)
            toast.error(`Failed to ${isEdit ? 'update' : 'add'} patient. Please try again.`)
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
            {/* added isOpen to handle both keyboard shortcut and click */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                    />
                </DialogContent>
            </Dialog>
        </FormProvider>
    )
}
