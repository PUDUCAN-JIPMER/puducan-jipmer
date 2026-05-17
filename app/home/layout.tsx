// /app/home/layout.tsx
import HomeNavbar from '@/components/home/HomeNavbar'
import NavigationLoading from './NavigationLoading'
import { Suspense } from 'react'
import Footer from '@/components/ui/footer'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col ">
            <HomeNavbar />
            <NavigationLoading />

            <main className="p-4 min-h-screen">{children}</main>

            <Footer />
        </div>
    )
}
