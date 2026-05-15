'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { db } from '@/firebase'
import { collection, query, limit, getDocsFromServer } from 'firebase/firestore'

/**
 * Hook to monitor actual Firebase backend reachability.
 * Uses getDocsFromServer to bypass local IndexedDB/PWA caches.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkStatus = useCallback(async () => {
    // 1. If navigator says offline, we are definitely offline
    if (!navigator.onLine) {
      setIsOnline(false)
      return
    }

    try {
      // 2. Perform a lightweight SERVER-ONLY Firestore read.
      // We use getDocsFromServer specifically to bypass the IndexedDB cache.
      const hospitalsRef = collection(db, 'hospitals')
      const q = query(hospitalsRef, limit(1))
      
      await getDocsFromServer(q)
      
      // If the request succeeds, the backend is truly reachable
      setIsOnline(true)
    } catch (error) {
      // If the request fails/throws, the backend is unreachable (Offline)
      setIsOnline(false)
    }
  }, [])

  useEffect(() => {
    // Initial check on mount
    checkStatus()

    // Listen for browser events for immediate feedback
    const handleOnline = () => checkStatus()
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Poll every 3 seconds to detect backend connectivity drops
    checkIntervalRef.current = setInterval(checkStatus, 3000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [checkStatus])

  return isOnline
}

