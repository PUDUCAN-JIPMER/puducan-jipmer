'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function ConfirmRetrieveDialog({
  open,
  onOpenChange,
  onConfirm,
  patientName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  patientName: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>Confirm Retrieval</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to retrieve <b>{patientName}</b>?  
          This will move the patient back to active records.
        </p>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onConfirm}
          >
            Retrieve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}