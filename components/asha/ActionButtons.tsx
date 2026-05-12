'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, Save } from 'lucide-react'

export function ActionButtons({
    isSaving,
    onSave,
    onDone,
}: {
    isSaving: boolean
    onSave: () => void
    onDone: () => Promise<void>
}) {
    return (
        <footer className="mt-6 flex w-full gap-3 border-t border-border pt-5">
            {/* Save */}
            <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Save size={15} aria-hidden />
                {isSaving ? 'Saving…' : 'Save Changes'}
            </button>

            {/* Done — with confirmation dialog */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button
                        type="button"
                        disabled={isSaving}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle2 size={15} aria-hidden />
                        Mark Done
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mark patient as finished?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will unassign the patient from you. You won't see them in your
                            list anymore.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDone}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </footer>
    )
}