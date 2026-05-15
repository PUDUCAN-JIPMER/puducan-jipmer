'use client'

import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * A global banner that appears when the user is offline.
 * Notifies the user that their data will sync automatically once reconnected.
 */
export function OfflineBanner() {
  const isOnline = useNetworkStatus()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isOnline) return null

  return (
    <div
      id="global-offline-banner"
      className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-center px-4 py-2 bg-red-700 text-white shadow-[0_-4px_12px_rgba(0,0,0,0.5)] border-t-2 border-yellow-400 select-none pointer-events-none"
    >
      <div className="flex items-center gap-3 pointer-events-auto">
        <WifiOff className="h-5 w-5 text-white animate-pulse flex-shrink-0" />
        <span className="text-sm font-semibold uppercase tracking-wide">
          Offline
        </span>
        <span className="text-xs opacity-80">
          Auto-sync when connected
        </span>
      </div>
    </div>
  )
}
