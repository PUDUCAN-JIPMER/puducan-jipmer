'use client'

import { useAuth } from '@/contexts/AuthContext'
import { BarChart3, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ModeToggle } from '../ui/toggle'
import SignOutButton from './SignOutButton'
import { paperSavedLabel } from '@/lib/paperSaved'

// Roles that can see the Stats link
const STATS_ROLES = ['admin', 'doctor', 'nurse']

export default function Navbar() {
    const { role } = useAuth()
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)

    const canViewStats = role && STATS_ROLES.includes(role)

    const statsHref = '/PuduCan/stats'
    const isStatsActive = pathname === statsHref

    
    return (
        <nav className="bg-background flex items-center justify-between border-b px-4 py-3 shadow md:px-8">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-green-600">
                PuduCan
            </Link>


            <div className="md:hidden">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-gray-600 focus:outline-none"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
                {canViewStats && (
                    <Link
                        href={statsHref}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            isStatsActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground hover:bg-muted'
                        }`}
                    >
                        <BarChart3 className="h-4 w-4" />
                        Stats
                    </Link>
                )}
                <ModeToggle />
                <SignOutButton />
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div className="absolute top-16 right-0 z-50 min-w-[180px] rounded-md border-t bg-background shadow-md md:hidden">
                    <div className="flex flex-col items-start gap-2 p-4">
                        {canViewStats && (
                            <Link
                                href={statsHref}
                                onClick={() => setMenuOpen(false)}
                                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    isStatsActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground hover:bg-muted'
                                }`}
                            >
                                <BarChart3 className="h-4 w-4" />
                                Stats
                            </Link>
                        )}
                        <div className="w-full flex justify-center">
                            <ModeToggle />
                        </div>
                        <SignOutButton className="w-full" />
                    </div>
                </div>
            )}
        </nav>
    )
}
