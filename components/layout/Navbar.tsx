'use client'

import { useAuth } from '@/contexts/AuthContext'
import { BarChart3, Menu, Moon, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ModeToggle } from '../ui/toggle'
import SignOutButton from './SignOutButton'

const STATS_ROLES = ['admin', 'doctor', 'nurse']

export default function Navbar() {
    const { role } = useAuth()
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)

    const canViewStats = role && STATS_ROLES.includes(role)

    const statsHref = '/PuduCan/stats'
    const isStatsActive = pathname === statsHref

    return (
        <nav className="border-b bg-background shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 md:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-2xl font-bold tracking-tight text-green-600"
                >
                    PuduCan
                </Link>

                {/* Hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                >
                    {menuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>

                {/* Desktop Menu */}
                <div className="hidden items-center gap-4 md:flex">
                    <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium">
                        Press{' '}
                        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                            ?
                        </kbd>{' '}
                        for shortcuts
                    </div>

                    {canViewStats && (
                        <Link
                            href={statsHref}
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

                    <ModeToggle />
                    <SignOutButton />
                </div>
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div
                    id="mobile-menu"
                    className="animate-in slide-in-from-top-2 border-t bg-background md:hidden"
                >
                    <div className="flex flex-col divide-y px-4 py-2">
                        {canViewStats && (
                            <Link
                                href={statsHref}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 rounded-md px-3 py-4 text-sm font-medium transition-colors ${
                                    isStatsActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground hover:bg-muted/50 hover:text-primary'
                                }`}
                            >
                                <BarChart3 className="h-4 w-4" />
                                <span>Stats</span>
                            </Link>
                        )}

                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between rounded-md px-3 py-4 transition-colors hover:bg-muted/50">
                            <div className="flex items-center gap-3 text-sm font-medium">
                                <Moon className="h-4 w-4" />
                                Appearance
                            </div>

                            <ModeToggle />
                        </div>

                        {/* Sign Out */}
                        <div className="pt-3">
                            <SignOutButton className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50" />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}