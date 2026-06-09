// components/HomeNavbar.tsx
'use client'

import { ChevronDown, ChevronRight, ChevronUp, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/constants/navbar'
import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function HomeNavbar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [mobileDataEntryOpen, setMobileDataEntryOpen] = useState(false)
    const { user } = useAuth()

    const navItem = (label: string, href: string, exact = false) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
            <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`group relative block w-full px-4 py-3 text-sm text-white transition-all duration-200 sm:w-auto sm:rounded sm:px-2 sm:py-1 md:px-3 md:py-2 lg:px-4 ${
                    isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                }`}
            >
                <span>{label}</span>
            </Link>
        )
    }

    const isDataEntryActive = NAV_LINKS.some((link) => pathname.startsWith(link.path))

    return (
        <nav className="border-b bg-pink-600/15 py-2 text-white shadow sm:px-2 lg:px-6">
            <div className="mx-auto flex w-full items-center justify-between gap-2 px-2 md:px-4 lg:gap-4 lg:px-6">
                <div className="flex items-center">
                    <Image
                        src="/jipmer-logo.png"
                        alt="JIPMER Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                    />
                    <div className="hidden leading-tight min-[900px]:block">
                        <h1 className="text-xl font-semibold xl:text-2xl">PuduCan</h1>
                    </div>
                </div>

                <div className="hidden items-center space-x-1 text-nowrap sm:flex md:space-x-2 lg:space-x-3">
                    {navItem('Home', '/home', true)}
                    {navItem('About', '/home/about')}
                    {user && navItem('Reports', '/home/reports')}

                    {/* Desktop Data Entry — plain div, no Radix */}
                    <div className="group relative">
                        <button
                            className={`relative flex items-center rounded px-2 py-1 text-[13px] text-white transition-all duration-300 md:px-3 md:py-2 lg:px-4 ${
                                isDataEntryActive
                                    ? 'bg-white/20 font-semibold shadow-sm'
                                    : 'hover:bg-white/10'
                            }`}
                        >
                            <span>Data Entry</span>
                            <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                        </button>

                        <div className="invisible absolute top-full left-0 z-50 mt-1 w-44 rounded-md border border-white/10 bg-pink-950/80 py-1 opacity-0 shadow-lg backdrop-blur-md transition-all duration-150 group-hover:visible group-hover:opacity-100">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.path}
                                    className="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {navItem('Contact', '/home/contact')}

                    {/* <div className="text-foreground ml-2">
                        <ModeToggle />
                    </div> */}
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="flex items-center p-2 sm:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`overflow-hidden transition-all duration-300 sm:hidden ${
                    mobileOpen ? 'mt-2 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="flex flex-col border-t border-white/10 bg-pink-950/60 backdrop-blur-md">
                    {navItem('Home', '/home', true)}
                    {navItem('About', '/home/about')}
                    {user && navItem('Reports', '/home/reports')}

                    {/* Mobile Data Entry */}
                    <button
                        onClick={() => setMobileDataEntryOpen(!mobileDataEntryOpen)}
                        className="flex w-full items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/10"
                    >
                        <span>Data Entry</span>
                        {mobileDataEntryOpen ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>

                    <div
                        className={`overflow-hidden bg-white/5 transition-all duration-300 ${
                            mobileDataEntryOpen ? 'max-h-60' : 'max-h-0'
                        }`}
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                onClick={() => setMobileOpen(false)}
                                className="block px-8 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {navItem('Contact', '/home/contact')}
                </div>
            </div>
        </nav>
    )
}
