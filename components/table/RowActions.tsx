// components/RowActions.tsx
'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/firebase'
import { HospitalFormInputs, UserDoc } from '@/schema'
import type { Patient } from '@/schema/patient'
import { useQueryClient } from '@tanstack/react-query'
import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { Eye, Pencil, RotateCcw, Trash2, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import AshaSearchDialog from '../dialogs/AshaSearchDialog'
import TransferDialog from '../dialogs/TransferDialog'
import {PatientSummaryDialog} from '../dialogs/PatientSummaryDialog'
import GenericHospitalDialog from '../forms/hospital/GenericHospitalDialog'
import GenericPatientDialog from '../forms/patient/GenericPatientDialog'
import GenericUserDialog from '../forms/user/GenericUserDialog'

type RowDataBase = {
    id: string | number
    [key: string]: unknown
}

type RowActionsProps = {
    rowData: RowDataBase
    activeTab: string
    isPatientTab: boolean
    isRemovedPatientsTab?: boolean
    onView: (data: RowDataBase) => void
    onDelete: (data: RowDataBase) => void
}

export function RowActions({
    rowData,
    activeTab,
    isPatientTab,
    isRemovedPatientsTab,
    onView,
    onDelete,
}: RowActionsProps) {
    const [assignedAshaId, setAssignedAshaId] = useState((rowData as Patient).assignedAsha || '')
    const [summaryOpen, setSummaryOpen] = useState(false)
    const queryClient = useQueryClient()
    const { role } = useAuth()

    const handleRetrieve = async () => {
        try {
            if (!rowData.id) throw new Error('Missing patient ID')

            const patientId = rowData.id.toString()

            // move patient back to "patients"
            await setDoc(doc(db, 'patients', patientId), {
                ...rowData,
                restoredAt: new Date().toISOString(),
            })

            // delete from "removedPatients"
            await deleteDoc(doc(db, 'removedPatients', patientId))

            queryClient.invalidateQueries({ queryKey: ['patients'] })
            queryClient.invalidateQueries({ queryKey: ['removedPatients'] })

            toast.success(`Patient ${rowData.name} retrieved successfully!`)
        } catch (err) {
            toast.error('Failed to retrieve patient. Check console.')
            console.error(err)
        }
    }

    return (
        <div className="flex flex-col sm:justify-center items-center gap-2 sm:flex-row">
            {/* View */}
            <Button size="icon" variant="outline" onClick={() => onView(rowData)} title="View">
                <Eye className="h-4 w-4" />
            </Button>

            {/* Patient Summary */}
            {isPatientTab && (
                <>
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setSummaryOpen(true)}
                        title="Patient Summary"
                    >
                        <Lightbulb className="h-4 w-4" />
                    </Button>
                    <PatientSummaryDialog
                        open={summaryOpen}
                        onOpenChange={setSummaryOpen}
                        patient={rowData as Patient}
                        patientName={(rowData as Patient).name || 'Unknown Patient'}
                    />
                </>
            )}

            {/* Patient Edit */}
            {isPatientTab && (
                <GenericPatientDialog
                    mode="edit"
                    patientData={rowData as Patient}
                    trigger={
                        <Button size="icon" variant="outline" title="Update">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    }
                />
            )}

            {/* User Edit */}
            {['ashas', 'doctors', 'nurses'].includes(activeTab) && (
                <GenericUserDialog
                    mode="edit"
                    userType={activeTab}
                    userData={rowData as UserDoc}
                    trigger={
                        <Button size="icon" variant="outline" title="Update">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    }
                />
            )}

            {/* Hospital Edit */}
            {activeTab === 'hospitals' && (
                <GenericHospitalDialog
                    mode="edit"
                    hospitalData={rowData as HospitalFormInputs & { id: string }}
                />
            )}

            {/* Transfer Patient */}
            {isPatientTab && (
                <TransferDialog
                    patient={rowData as Patient}
                    onTransfer={async (hospitalId, hospitalName) => {
                        try {
                            if (!rowData.id) throw new Error('Missing patient document ID')
                            const patientRef = doc(db, 'patients', rowData.id.toString())
                            await updateDoc(patientRef, {
                                assignedHospital: { id: hospitalId, name: hospitalName },
                                assignedAsha: '',
                            })
                            toast.success(`Transferred ${rowData.name} to new PHC.`)
                        } catch (err) {
                            toast.error('Transfer failed. See console for details.' + err)
                        }
                    }}
                />
            )}

            {/* Assign ASHA */}
            {isPatientTab && (
                <AshaSearchDialog
                    patientId={rowData.id.toString()}
                    assignedAshaId={assignedAshaId}
                    onAssigned={(ashaId: string | null) => setAssignedAshaId(ashaId ?? '')}
                />
            )}

            {/* Retrieve Patient */}
            {isRemovedPatientsTab && (
                <Button
                    size="icon"
                    variant="outline"
                    className="text-green-600"
                    onClick={handleRetrieve}
                    title="Retrieve Patient"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            )}

            {/* Delete */}
            {role !== 'nurse' && (
                <Button
                    size="icon"
                    variant="destructive"
                    className="text-white"
                    onClick={() => onDelete(rowData)}
                    title="Delete"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
