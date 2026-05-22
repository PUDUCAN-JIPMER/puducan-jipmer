'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil } from 'lucide-react'
import { useState } from 'react'
import GenericHospitalForm from './GenericHospitalForm'

import { db } from '@/firebase'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { HospitalFormInputs } from '@/schema/hospital'
import { useQueryClient } from '@tanstack/react-query'

interface GenericHospitalDialogProps {
    mode: 'add' | 'edit'
    hospitalData?: HospitalFormInputs & { id?: string }
    trigger?: React.ReactNode
    onSuccess?: () => void

    // for keyboard shortcuts
    open?: boolean
    onOpenChange?: (open:boolean) => void
}

export default function GenericHospitalDialog({
    mode,
    hospitalData,
    trigger,
    onSuccess,
    // for keyboard shortcuts
    open,
    onOpenChange,
}: GenericHospitalDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const queryClient = useQueryClient()

    const isOpen = open ?? internalOpen

    const setIsOpen = onOpenChange ?? setInternalOpen

    const isEdit = mode === 'edit'

    const onSubmit = async (data: HospitalFormInputs) => {
        try {
            if (isEdit && hospitalData?.id) {
                await updateDoc(doc(db, 'hospitals', hospitalData.id), data)
                toast.success('Hospital updated successfully.')
            } else {
                await addDoc(collection(db, 'hospitals'), data)
                toast.success('Hospital added successfully.')
            }

            // ✅ Invalidate hospitals query so tables refresh
            queryClient.invalidateQueries({ queryKey: ['hospitals'] })

            setIsOpen(false)
            onSuccess?.()
        } catch (err) {
            console.error(`Error ${isEdit ? 'updating' : 'adding'} hospital:`, err)
            toast.error(`Failed to ${isEdit ? 'update' : 'add'} hospital. Please try again.`)
        }
    }

    const defaultTrigger = isEdit ? (
        <Button size="icon" variant="outline" title="Update">
            <Pencil className="h-4 w-4" />
        </Button>
    ) : (
        <Button
            variant="outline"
            className="cursor-pointer border-2 !border-green-400 capitalize"
        >
            <Plus className="h-4 w-4" /> <span className='hidden sm:block'>Add Hospital</span>
        </Button>
    )

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Update Hospital Details' : 'Add New Hospital'}
                    </DialogTitle>
                </DialogHeader>
                <GenericHospitalForm
                    initialData={hospitalData}
                    onSuccess={() => setIsOpen(false)}
                    onSubmit={onSubmit}
                />
            </DialogContent>
        </Dialog>
    )
}
