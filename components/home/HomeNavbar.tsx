'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { ModeToggle } from '@/components/ui/toggle'

export default function HomeNavbar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (href: string) => pathname === href

    return (
        <nav className="border-b border-border bg-white dark:bg-slate-950 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Left: Logo and branding */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                        <Image
                            src="/jipmer-logo.png"
                            alt="JIPMER"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-semibold text-base text-primary">PuduCan</div>
                        <div className="text-xs text-muted hidden sm:block">JIPMER • Puducherry</div>
                    </div>
                </div>

                {/* Right: Navigation and theme toggle (desktop) */}
                <div className="hidden sm:flex items-center gap-1">
                    <NavLink href="/home" label="Home" isActive={isActive('/home')} />
                    <NavLink href="/home/about" label="About" isActive={isActive('/home/about')} />
                    <NavLink href="/home/reports" label="Reports" isActive={isActive('/home/reports')} />
                    <NavLink href="/home/contact" label="Contact" isActive={isActive('/home/contact')} />
                    <div className="ml-2 pl-2 border-l border-border">
                        <ModeToggle />
                    </div>
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="sm:hidden p-2 hover:bg-accent/10 rounded"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="sm:hidden border-t border-border bg-white dark:bg-slate-950 px-4 py-3 space-y-2">
                    <MobileNavLink href="/home" label="Home" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/home/about" label="About" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/home/reports" label="Reports" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/home/contact" label="Contact" onClick={() => setMobileOpen(false)} />
                    <div className="pt-2 flex items-center justify-between">
                        <span className="text-sm text-muted">Theme</span>
                        <ModeToggle />
                    </div>
                </div>
            )}
        </nav>
    )
}

function NavLink({
    href,
    label,
    isActive,
}: {
    href: string
    label: string
    isActive: boolean
}) {
    return (
        <Link
            href={href}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                isActive
                    ? 'text-primary bg-accent/10'
                    : 'text-foreground hover:bg-accent/5'
            }`}
        >
            {label}
        </Link>
    )
}

function MobileNavLink({
    href,
    label,
    onClick,
}: {
    href: string
    label: string
    onClick: () => void
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/10 rounded transition-colors"
        >
            {label}
        </Link>
    )
}
