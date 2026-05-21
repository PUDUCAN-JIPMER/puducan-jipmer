'use client'

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import * as React from 'react'

export function ThemeProvider({
    children,
    ...props
}: ThemeProviderProps) {
    const [mounted, setMounted] = React.useState<boolean>(false)
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <>{children}</>
    }

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
