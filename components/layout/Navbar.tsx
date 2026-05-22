'use client'

import { useAuth } from '@/contexts/AuthContext'
import { BarChart3, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ModeToggle } from '../ui/toggle'
import SignOutButton from './SignOutButton'

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
        <div>
            <nav className="bg-background flex items-center justify-between border-b px-4 py-3 shadow md:px-8">
                
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-green-600">
                    PuduCan
                </Link>

                {/* Hamburger Menu (Mobile) */}
                <div className="md:hidden">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-muted focus:outline-none"
                        aria-label="Open menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Desktop Menu */}
                <div className="hidden items-center gap-4 md:flex">
                    
                    {/* Shortcuts Info */}
                    <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors">
                        Press{' '}
                        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                            ?
                        </kbd>{' '}
                        for shortcuts
                    </div>

                    {/* Stats Link */}
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

                {/* Mobile Menu */}
                {menuOpen && (
                    <>
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                            onClick={() => setMenuOpen(false)}
                        />

                        {/* Mobile Sidebar */}
                        <div className="fixed top-0 right-0 z-50 flex h-full w-64 flex-col border-l bg-background shadow-xl transition-transform duration-300 md:hidden">
                            
                            {/* Sidebar Header */}
                            <div className="flex items-center justify-between border-b px-4 py-4">
                                <h2 className="text-base font-semibold">
                                    Menu
                                </h2>

                                <button
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-md p-2 transition-colors hover:bg-muted"
                                    aria-label="Close menu"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Navigation Items */}
                            <div className="flex flex-col gap-2 p-4">

                                {canViewStats && (
                                    <Link
                                        href={statsHref}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                            isStatsActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        Stats
                                    </Link>
                                )}

                                {/* Theme Toggle */}
                                <div className="flex justify-center rounded-md border p-3">
                                    <ModeToggle />
                                </div>

                                {/* Sign Out */}
                                <SignOutButton className="w-full" />
                            </div>
                        </div>
                    </>
                )}
            </nav>
        </div>
    )
}