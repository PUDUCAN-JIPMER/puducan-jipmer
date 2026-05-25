// components/hoc/withAuth.tsx
'use client'

import { ComponentType, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

interface WithAuthProps {
    allowedRoles: readonly string[]
    redirectMap: Record<string, string>
}

export function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    { allowedRoles, redirectMap }: WithAuthProps
) {
    return function AuthComponent(props: P) {
        const router = useRouter()
        const { user, role, isLoadingAuth } = useAuth()

        // Handle redirects safely inside useEffect
        useEffect(() => {
            if (!isLoadingAuth) {
                if (!user) {
                    router.replace('/login')
                } else if (role && !allowedRoles.includes(role)) {
                    const redirectPath = redirectMap[role] || '/login'
                    toast.warning('You are not allowed to view this page')
                    router.replace(redirectPath)
                }
            }
        }, [user, role, isLoadingAuth, allowedRoles, redirectMap, router])

        // While auth is loading
        if (isLoadingAuth) {
            return (
                <main className="flex h-screen flex-col items-center justify-center">
                    <Loading />
                    <p className="mt-4 text-gray-600">Checking authentication...</p>
                </main>
            )
        }

        // While redirecting (no UI flicker)
        if (!user || (role && !allowedRoles.includes(role))) {
            return null
        }

        // ✅ Authorized, render page
        return <WrappedComponent {...props} />
    }
}
