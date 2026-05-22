'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/firebase'
import { deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'

type Collections = 'patients' | 'hospitals' | 'doctors' | 'nurses' | 'ashas' | 'removedPatients'

type WithIdAndName = { id: string | number; name?: string } & Record<string, any>

type BulkDeleteDialogProps = {
    open: boolean
    ids: string[]
    rowsData?: Record<string, any>[]
    collectionName: Collections
    onClose: () => void
    onDeleted?: (deletedIds: string[]) => void
}

function labelFromCollection(coll: Collections) {
    switch (coll) {
        case 'patients':
            return 'Patient'
        case 'hospitals':
            return 'Hospital'
        case 'doctors':
            return 'Doctor'
        case 'nurses':
            return 'Nurse'
        case 'ashas':
            return 'ASHA'
        case 'removedPatients':
            return 'Removed Patient'
        default:
            return 'Record'
    }
}

function mapToFirestoreCollection(coll: Collections) {
    if (coll === 'patients') return 'patients'
    if (coll === 'hospitals') return 'hospitals'
    if (coll === 'removedPatients') return 'removedPatients'
    // doctors, nurses, ashas are all in 'users'
    return 'users'
}

export default function BulkDeleteDialog({
    open,
    ids,
    rowsData = [],
    collectionName,
    onClose,
    onDeleted,
}: BulkDeleteDialogProps) {
    const queryClient = useQueryClient()
    const [reason, setReason] = useState('')

    const isPatient = collectionName === 'patients'
    const label = labelFromCollection(collectionName)
    const count = ids.length
    const pluralLabel = count === 1 ? label : `${label}s`

    const mutation = useMutation({
        mutationFn: async () => {
            if (!ids.length) throw new Error('No records selected for deletion')

            if (isPatient) {
                // require a reason
                if (!reason.trim())
                    throw new Error('Please enter a reason before deleting these patients.')
                // entries to removedPatients
               await Promise.all(ids.map(async (id) => {
                    const patientData = rowsData.find((row: any) => row.id === id) ?? { id}

                    await setDoc(doc(db, 'removedPatients', id), {
                        ...patientData,
                        deletionReason: reason,
                        deletedAt: serverTimestamp(),
                        removedFrom: 'patients'
                    })
                await deleteDoc(doc(db, 'patients', id))
                })
               )

                
            } else {
                // direct delete for hospitals/users/removedPatients
                const coll = mapToFirestoreCollection(collectionName)
                console.log('coll:', coll)
                console.log('id:', ids)  
                await Promise.all(ids.map((id) => deleteDoc(doc(db, coll, id))))
            }

            return ids
        },
        onSuccess: (deletedIds) => {
            // invalidate the right list
            if (collectionName === 'patients') {
                queryClient.invalidateQueries({ queryKey: ['patients'] })
                queryClient.invalidateQueries({ queryKey: ['removedPatients'] })
            } else if (collectionName === 'hospitals') {
                queryClient.invalidateQueries({ queryKey: ['hospitals'] })
            } else if (collectionName === 'removedPatients') {
                queryClient.invalidateQueries({ queryKey: ['removedPatients'] })
            } else {
                // doctors, nurses, ashas
                queryClient.invalidateQueries({ queryKey: ['users'] })
            }

            toast.success(`${count} ${count === 1 ? label : label + 's'} deleted successfully`)
            onDeleted?.(deletedIds)
            setReason('')
            onClose()
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Deletion failed')
            // keep dialog open so the user can fix reason or retry
        },
    })

    const handleConfirm = () => {
        mutation.mutate()
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) onClose()
            }}
        >
            <DialogContent>
                <DialogHeader>
                        <DialogTitle>Delete {count} {pluralLabel}</DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <p>
                        Are you sure you want to delete{' '}
                        <strong className="text-red-600">{count} {pluralLabel.toLowerCase()}</strong>?
                    </p>
                    <p className="text-sm text-orange-500">Note: This action cannot be undone.</p>
                </div>

                {isPatient && (
                    <div className="mt-3 space-y-4">
                        <label className="mb-2 block text-sm font-medium">
                            Reason for deletion
                        </label>
                        <Input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason..."
                        />
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Deleting…' : `Delete ${count} ${pluralLabel}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
