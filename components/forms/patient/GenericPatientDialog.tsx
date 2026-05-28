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
import { Pencil, Plus } from 'lucide-react'
import { db } from '@/firebase'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { useCallback, useEffect, useState } from 'react'
import { checkAadhaarDuplicateUtil } from '@/lib/patient/checkPatientRecord'
import { PatientSchema, PatientFormInputs } from '@/schema/patient'
import GenericPatientForm from './GenericPatientForm'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { VerifyPatientButton } from '@/components/verification/VerifyPatientButton'
import { VerificationModal } from '@/components/verification/VerificationModal'
import { mapVerifiedDataToPatientFields } from '@/lib/verification/mapper'
import type { VerifiedPatientData, VerificationSource } from '@/lib/verification/types'

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

    const { orgId } = useAuth()

    // ── Verification modal (add mode only) ───────────────────────────────────
    // In add mode the modal opens automatically and starts at the 'method' step
    // so the healthcare worker chooses DigiLocker or manual entry inside the modal.
    const [verificationModalOpen, setVerificationModalOpen] = useState(false)
    const [showForm, setShowForm] = useState(isEdit)

    // Open the verification modal as soon as the add-mode dialog opens.
    // For edit mode the form is always shown directly.
    useEffect(() => {
        if (isOpen && !isEdit) {
            setVerificationModalOpen(true)
        }
        if (!isOpen) {
            setVerificationModalOpen(false)
            setShowForm(isEdit)
            setIsVerified(false)
            setVerificationSource('mock')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isEdit])

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
            abhaId: '',
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

    const [isVerified, setIsVerified] = useState(false)
    const [verificationSource, setVerificationSource] = useState<VerificationSource>('mock')

    /** Shared autofill logic used by both verification paths. */
    const applyVerifiedData = useCallback(
        (data: VerifiedPatientData) => {
            const mapped = mapVerifiedDataToPatientFields(data)
            setValue('name', mapped.name, { shouldValidate: true, shouldDirty: true })
            setValue('dob', mapped.dob, { shouldValidate: true, shouldDirty: true })
            setValue('sex', mapped.sex, { shouldValidate: true, shouldDirty: true })
            if (mapped.address) {
                setValue('address', mapped.address, { shouldValidate: true, shouldDirty: true })
            }
            if (mapped.phoneNumber && mapped.phoneNumber.length > 0) {
                setValue('phoneNumber', mapped.phoneNumber, { shouldValidate: true, shouldDirty: true })
            }
            if (mapped.aadhaarId) {
                setValue('aadhaarId', mapped.aadhaarId, { shouldValidate: true, shouldDirty: true })
            }
            if (mapped.abhaId) {
                setValue('abhaId', mapped.abhaId, { shouldValidate: true, shouldDirty: true })
            }
            setValue('verification', {
                verified: true,
                source: data.verificationSource,
                maskedId: data.maskedId,
                verifiedAt: data.verifiedAt,
            })
            setIsVerified(true)
            setVerificationSource(data.verificationSource)
        },
        [setValue],
    )

    /** In-form re-verification (VerifyPatientButton inside the form). */
    const handleVerified = useCallback(
        (data: VerifiedPatientData) => applyVerifiedData(data),
        [applyVerifiedData],
    )

    /** Verification modal DigiLocker path: autofill + show form. */
    const handleVerifiedFromModal = useCallback(
        (data: VerifiedPatientData) => {
            applyVerifiedData(data)
            setVerificationModalOpen(false)
            setShowForm(true)
            setIsOpen(true)   // keep external open prop in sync
        },
        [applyVerifiedData, setIsOpen],
    )

    /** Verification modal manual path: skip verification, show empty form. */
    const handleSelectManual = useCallback(() => {
        setVerificationModalOpen(false)
        setShowForm(true)
        setIsOpen(true)       // keep external open prop in sync
    }, [setIsOpen])

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

    // ── Shared form content (used by both modes) ────────────────────────────
    const formDialogContent = (
        <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto sm:max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] 2xl:max-w-[90vw]"
        >
            <DialogHeader>
                <DialogTitle>
                    {isEdit ? 'Update Patient Details' : 'Add New Patient Details'}
                </DialogTitle>
            </DialogHeader>

            <div className="flex items-center justify-between border-b pb-3">
                <p className="text-xs text-muted-foreground">
                    Use DigiLocker to auto-fill patient demographics.
                </p>
                <VerifyPatientButton
                    onVerified={handleVerified}
                    isVerified={isVerified}
                    verificationSource={verificationSource}
                />
            </div>

            <GenericPatientForm
                form={form}
                reset={reset}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                isEdit={isEdit}
            />
        </DialogContent>
    )

    return (
        <FormProvider {...form}>
            {/* ── EDIT MODE — standard Dialog + trigger ─────────────────── */}
            {isEdit && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
                    {formDialogContent}
                </Dialog>
            )}

            {/* ── ADD MODE ──────────────────────────────────────────────── */}
            {!isEdit && (
                <>
                    {/* Trigger button — opens verification modal ONLY, never the Dialog.
                        display:contents keeps the button's original DOM box intact. */}
                    <div
                        style={{ display: 'contents' }}
                        onClick={() => setVerificationModalOpen(true)}
                    >
                        {trigger || defaultTrigger}
                    </div>

                    {/* Patient form dialog — controlled, only opens when showForm=true.
                        This prevents the ghost "Add New Patient Details" header from
                        appearing behind the verification modal. */}
                    <Dialog
                        open={showForm}
                        onOpenChange={(next) => {
                            if (!next) {
                                setShowForm(false)
                                setIsOpen(false)
                                reset()
                                localStorage.removeItem('addPatientFormData')
                            }
                        }}
                    >
                        {formDialogContent}
                    </Dialog>

                    {/* Verification modal — method selector → OTP → preview.
                        Renders via portal so it floats above everything. */}
                    <VerificationModal
                        open={verificationModalOpen}
                        onOpenChange={(next) => { if (!next) setVerificationModalOpen(false) }}
                        onVerified={handleVerifiedFromModal}
                        onSelectManual={handleSelectManual}
                    />
                </>
            )}
        </FormProvider>
    )
}
