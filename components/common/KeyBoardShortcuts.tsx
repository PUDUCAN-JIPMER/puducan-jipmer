'use client'

import { Dialog,DialogContent, DialogDescription, DialogTitle, } from "@/components/ui/dialog"
interface KeyBoardShortcutsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const shortcuts = [
    {
        key: '/',
        action: 'Focus Search'
    },
    {
        key: 'Shift + F',
        action: 'Open filter',
    },
    {
        key: 'Shift + N',
        action: 'Add new Patient/Hospital/Asha/Doctor'
    },
    {
        key: 'Esc',
        action: 'Close Dialogue'
    },
    {
        key: '?',
        action: 'Show keyboard shortcuts',
    }
]

export function KeyBoardShortcuts({
    open, onOpenChange,
}: KeyBoardShortcutsProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogDescription>
                    <DialogTitle>
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogDescription>

                <div className="space-y-3">
                    {shortcuts.map((shortcut) => (
                        <div key={shortcut.key}
                        className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-sm text-muted-foreground">
                                {shortcut.action}
                            </span>
                            <kbd className="rounded border bg-muted px-2 py-1 text-xs font-medium">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}