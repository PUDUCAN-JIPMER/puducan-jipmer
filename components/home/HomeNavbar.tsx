'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import Image from 'next/image'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModeToggle } from '@/components/ui/toggle'
import { NAV_LINKS } from '@/constants/navbar'

export default function HomeNavbar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (href: string) => pathname === href

    return (
        <nav className="w-screen fixed top-0 left-0 right-0 z-50 shadow-lg bg-color-blue">
            <div className="container mx-auto px-4 py-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <Image
                        src="/jipmer-logo.png"
                        alt="JIPMER"
                        width={48}
                        height={48}
                        className="object-contain"
                    />
                    <div>
                        <div className="font-bold text-white text-lg">PuduCan</div>
                        <div className="text-xs text-blue-100">JIPMER • Puducherry</div>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-8">
                    <NavLink href="/home" label="Home" isActive={isActive('/home')} />
                    <NavLink href="/home/about" label="About" isActive={isActive('/home/about')} />
                    <NavLink href="/home/reports" label="Reports" isActive={isActive('/home/reports')} />
                    <NavLink href="/home/contact" label="Contact" isActive={isActive('/home/contact')} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white transition-colors">
                                Data Entry
                                <ChevronDown size={16} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-border bg-popover text-popover-foreground">
                            {NAV_LINKS.map((link) => (
                                <DropdownMenuItem key={link.path} asChild>
                                    <Link href={link.path} className="cursor-pointer">
                                        {link.name}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Right: Theme toggle */}
                <div className="hidden sm:flex items-center gap-4">
                    <ModeToggle />
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="sm:hidden p-2 hover:bg-blue-500 rounded text-white"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="sm:hidden border-t border-blue-400 px-4 py-3 space-y-2 bg-color-blue">
                    <MobileNavLink href="/home" label="Home" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/home/about" label="About" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/home/reports" label="Reports" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/home/contact" label="Contact" onClick={() => setMobileOpen(false)} />
                    <div className="pt-3 border-t border-blue-400 space-y-1">
                        <p className="px-3 text-xs font-semibold uppercase tracking-widest text-white/70">Data Entry</p>
                        {NAV_LINKS.map((link) => (
                            <MobileNavLink
                                key={link.path}
                                href={link.path}
                                label={link.name}
                                onClick={() => setMobileOpen(false)}
                            />
                        ))}
                    </div>
                    <div className="pt-3 border-t border-blue-400 flex items-center justify-between">
                        <span className="text-sm text-white font-medium">Theme</span>
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
            className={`text-sm font-medium transition-colors border-b-2 pb-1 ${
                isActive
                    ? 'text-accent-primary border-accent-primary'
                    : 'text-white/85 border-transparent hover:text-white'
            }`}
        >
            {label}
        </Link>
    )
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-3 py-2 text-sm font-medium text-white hover:text-blue-100 hover:bg-blue-600 rounded transition-colors"
        >
            {label}
        </Link>
    )
}
