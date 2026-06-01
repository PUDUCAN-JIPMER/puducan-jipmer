'use client'

import { useEffect, useRef, useCallback } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'
import { saveDraft, loadDraft, clearDraft as apiClearDraft, isMeaningfulData } from '@/lib/common/draft-utils'
import { toast } from 'sonner'

/**
 * Robust hook for form persistence.
 * Features:
 * - Scoped by 'key' (patient/mode/user)
 * - Prevents "zombie drafts" via submission tracking (submittedKeysRef)
 * - Resets session guards every time 'enabled' becomes true
 * - Deterministic restoration vs initialization priority
 * - Correctly handles post-restoration edits (survives tab close)
 */
export function useFormPersistence<TFieldValues extends FieldValues>(
    form: UseFormReturn<TFieldValues>,
    {
        key,
        enabled,
        initialData,
        onRestore
    }: {
        key: string | null
        enabled: boolean
        initialData?: TFieldValues
        onRestore?: (data: TFieldValues) => void
    }
) {
    const { reset, getValues, watch } = form
    
    // submittedKeysRef prevents re-restoring data that was successfully saved in this component mount lifetime
    const submittedKeysRef = useRef(new Set<string>())
    
    // Lifecycle Guards
    const isSubmittingRef = useRef(false)
    const isRestoringRef = useRef(false) // Transient: true only DURING the reset() call (blocks saves)
    const isRestoredRef = useRef(false)   // Session: true after first restoration (blocks re-restoration)
    const lastSavedDataRef = useRef<string>('')
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const cancelPendingSave = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
            debounceTimerRef.current = null
        }
    }, [])

    /**
     * Immediately saves current form state to localStorage if meaningful and not locked.
     */
    const flush = useCallback((force = false) => {
        if (!key || !enabled || isSubmittingRef.current || isRestoringRef.current) {
            return
        }
        
        const data = getValues()
        const stringified = JSON.stringify(data)
        
        // Skip if data hasn't changed
        if (!force && stringified === lastSavedDataRef.current) return
        
        // Skip if not meaningful (unless forcing)
        if (!force && !isMeaningfulData(data as Record<string, unknown>)) return

        saveDraft(key, data as Record<string, unknown>, force)
        lastSavedDataRef.current = stringified
    }, [key, enabled, getValues])

    /**
     * Wipes storage for the CURRENT session.
     */
    const clearPersistence = useCallback(() => {
        cancelPendingSave()
        if (key) apiClearDraft(key)
        lastSavedDataRef.current = ''
    }, [key, cancelPendingSave])

    /**
     * Restoration Logic - Deterministic and safe.
     */
    const performRestoration = useCallback(() => {
        if (!enabled || !key || isSubmittingRef.current || isRestoredRef.current) return

        // SAFETY: Never restore if we just successfully submitted this key in this component lifetime
        if (submittedKeysRef.current.has(key)) return

        const saved = loadDraft(key) as TFieldValues | null
        if (saved && isMeaningfulData(saved as Record<string, unknown>)) {
            isRestoringRef.current = true
            isRestoredRef.current = true
            try {
                reset(saved)
                lastSavedDataRef.current = JSON.stringify(saved)
                if (onRestore) onRestore(saved)
                toast.info('Restored unsaved draft')
            } catch (e) {
                console.error('Restoration failed', e)
                isRestoredRef.current = false
            } finally {
                // Release hydration lock so user can edit and save
                isRestoringRef.current = false
            }
        }
    }, [enabled, key, reset, onRestore])

    // 1. Session Start & Initialization Lifecycle
    useEffect(() => {
        if (enabled && key) {
            // New "Open" session starts. Reset session-specific guards.
            isRestoredRef.current = false
            isSubmittingRef.current = false
            lastSavedDataRef.current = ''
            cancelPendingSave()
            
            // Check for Local Draft Priority
            const saved = loadDraft(key) as TFieldValues | null
            const hasValidDraft = saved && 
                                isMeaningfulData(saved as Record<string, unknown>) && 
                                !submittedKeysRef.current.has(key)

            if (hasValidDraft) {
                performRestoration()
            } else if (initialData) {
                // Initialize with Base Data
                isRestoringRef.current = true
                try {
                    reset(initialData)
                    lastSavedDataRef.current = JSON.stringify(initialData)
                } finally {
                    isRestoringRef.current = false
                }
            }
        } else if (!enabled) {
            // Session ended (dialog closed)
            cancelPendingSave()
        }
    }, [enabled, key, initialData, performRestoration, cancelPendingSave, reset])

    // 2. Auto-save (Watch)
    useEffect(() => {
        if (!enabled || !key) return

        const subscription = watch((values) => {
            // Block saves during critical periods (hydration or async submit)
            if (isSubmittingRef.current || isRestoringRef.current) return

            // Optimization: Avoid saving if data hasn't actually changed since last write
            const stringified = JSON.stringify(values)
            if (stringified === lastSavedDataRef.current) return

            cancelPendingSave()
            debounceTimerRef.current = setTimeout(() => {
                if (enabled && key && !isSubmittingRef.current && !isRestoringRef.current) {
                    saveDraft(key, values as Record<string, unknown>)
                    lastSavedDataRef.current = JSON.stringify(values)
                }
                debounceTimerRef.current = null
            }, 1000)
        })

        return () => {
            subscription.unsubscribe()
            cancelPendingSave()
        }
    }, [enabled, key, watch, cancelPendingSave])

    // 3. True Crash Survival (Unload Listeners)
    useEffect(() => {
        const handleUnload = () => {
            if (enabled && key && !isSubmittingRef.current && !isRestoringRef.current) {
                // Synchronous flush
                const data = getValues()
                if (isMeaningfulData(data as Record<string, unknown>)) {
                    saveDraft(key, data as Record<string, unknown>, true)
                }
            }
        }

        window.addEventListener('beforeunload', handleUnload)
        window.addEventListener('pagehide', handleUnload)
        
        return () => {
            window.removeEventListener('beforeunload', handleUnload)
            window.removeEventListener('pagehide', handleUnload)
        }
    }, [enabled, key, getValues])

    return { 
        flush, 
        clear: clearPersistence,
        setSubmitting: (val: boolean) => { isSubmittingRef.current = val },
        setSubmitted: () => { 
            if (key) {
                submittedKeysRef.current.add(key)
            }
            isSubmittingRef.current = false
            clearPersistence() 
        }
    }
}
