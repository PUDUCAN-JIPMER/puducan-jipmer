// components/NavigationLoading.tsx
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Loading from '@/components/ui/loading'

export default function NavigationLoading() {
    const [isLoading, setIsLoading] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setIsLoading(false)
    }, [pathname])

    useEffect(() => {
        const handleAnchorClick = (event: Event) => {
            const target = event.currentTarget as HTMLAnchorElement

            if(!target.href) return

            if(target.target === '_blank') return

            const targetUrl = new URL(target.href , window.location.href)
            if(targetUrl.hostname !== window.location.hostname) return

            if(targetUrl.pathname === window.location.pathname && targetUrl.hash) return

            
            if (target.href) {
                setIsLoading(true)
            }
        }

        const handleMutation: MutationCallback = (mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    const anchorElements = document.querySelectorAll('a[href]')
                    anchorElements.forEach((anchor) => {
                        anchor.addEventListener('click', handleAnchorClick)
                    })
                }
            })
        }

        const observer = new MutationObserver(handleMutation)
        observer.observe(document, { childList: true, subtree: true })

        // Attach listeners to existing links
        const existingAnchors = document.querySelectorAll('a[href]')
        existingAnchors.forEach((anchor) => {
            anchor.addEventListener('click', handleAnchorClick)
        })

        return () => {
            observer.disconnect()
            document.querySelectorAll('a[href]').forEach((anchor) => {
                anchor.removeEventListener('click', handleAnchorClick)
            })
        }
    }, [])

    if (!isLoading) return null

    return (
        <div className="flex h-screen flex-col items-center justify-center">
            {' '}
            <Loading />
        </div>
    )
}
