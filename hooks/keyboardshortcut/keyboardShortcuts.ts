'use client'

import { useEffect } from "react"

type ShortcutOptions = {
    onSearchFocus?: () => void
    onOpenFilter?: () => void
    onNewPatient?: () => void
    onOpenShortcuts?: () => void
    onCloseDialog?: () => void
}

export function useKeyboardShortcurts({
    onSearchFocus, onOpenFilter, onNewPatient, onOpenShortcuts, onCloseDialog,
}: ShortcutOptions) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const activeElement = document.activeElement

            // shift it first for unfocusing search bar
            if(event.key === 'Escape'){
                if(document.activeElement instanceof HTMLElement){
                    document.activeElement.blur()
                }
                onCloseDialog?.()
                return
            }

            const isTyping = activeElement instanceof HTMLInputElement ||
                             activeElement instanceof HTMLTextAreaElement

            if(isTyping) return

            if(event.key === '/'){
                event.preventDefault()
                onSearchFocus?.()
            }

            if((event.shiftKey) &&
                event.key.toLowerCase() === 'f'){
                    event.preventDefault()
                    onOpenFilter?.()
                }
            
            if(event.shiftKey && event.key.toLowerCase() === 'n'){
                event.preventDefault()
                onNewPatient?.()
            }

            if(event.key === '?'){
                event.preventDefault()
                onOpenShortcuts?.()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return() => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            )
        }
    }, [
        onSearchFocus,
        onNewPatient,
        onCloseDialog,
        onOpenFilter,
        onOpenShortcuts
    ])
}