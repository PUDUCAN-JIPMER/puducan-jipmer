'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook to monitor actual backend reachability.
 * Uses a recursive setTimeout and fetch probe to bypass caches/Service Workers.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isMounted = useRef(true)
  const checkStatusRef = useRef<() => Promise<void>>(async () => {})

  const scheduleNextCheck = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isMounted.current) return

    // 15s sequential interval to prevent overlapping requests and quota drain
    timerRef.current = setTimeout(() => {
      checkStatusRef.current()
    }, 15000)
  }, [])

  const checkStatus = useCallback(async () => {
    // 1. Browser-level check
    if (!navigator.onLine) {
      setIsOnline(false)
      scheduleNextCheck()
      return
    }

    try {
      // 2. Cache-busting fetch probe to verify true reachability
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      await fetch(`/favicon.ico?_t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        mode: 'no-cors',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (isMounted.current) {
        setIsOnline(true)
      }
    } catch {
      if (isMounted.current) {
        setIsOnline(false)
      }
    } finally {
      scheduleNextCheck()
    }
  }, [scheduleNextCheck])

  // Keep ref updated with latest callback
  useEffect(() => {
    checkStatusRef.current = checkStatus
  }, [checkStatus])

  useEffect(() => {
    isMounted.current = true
    
    // Initial check
    const runInitialCheck = async () => {
      await checkStatus()
    }
    runInitialCheck()

    // Immediate feedback on browser events
    const handleOnline = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      checkStatus()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      isMounted.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkStatus])

  return isOnline
}

