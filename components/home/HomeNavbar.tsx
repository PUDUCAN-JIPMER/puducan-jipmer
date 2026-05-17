// components/HomeNavbar.tsx
'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronRight, ChevronUp, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/constants/navbar'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ModeToggle } from '../ui/toggle'
import { getPaperSavedLabel } from '@/lib/papersaved'

export default function HomeNavbar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [mobileDataEntryOpen, setMobileDataEntryOpen] = useState(false)
    const [paperLabel, setPaperLabel] = useState('🌿 Loading...')

    useEffect(() => {
        getPaperSavedLabel().then(setPaperLabel)
    }, [])

    const navItem = (label: string, href: string, exact = false) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
            <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`group relative block rounded px-2 py-1 text-sm text-white transition-all duration-300 md:px-3 md:py-2 lg:px-4 ${
                    isActive ? 'font-semibold text-white' : ''
                }`}
            >
                <span className="relative z-10 p-2 sm:hover:bg-transparent">{label}</span>
                <span className="absolute bottom-0 left-0 hidden h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full sm:block"></span>
            </Link>
        )
    }

    return (
        <nav className="border-b bg-[#0e65bc] py-2 text-white shadow sm:px-2 lg:px-6">
            <div className="mx-auto flex w-full items-center justify-between gap-2 px-2 md:px-4 lg:gap-4 lg:px-6">
                <div className="flex items-center gap-2 lg:gap-3">
                    <Image
                        src="/jipmer-logo.png"
                        alt="JIPMER Logo"
                        width={70}
                        height={70}
                        className="h-10 w-10 object-contain sm:h-12 sm:w-12 lg:h-[70px] lg:w-[70px]"
                    />
                    <div className="hidden leading-tight min-[900px]:block">
                        <h1 className="text-xl font-semibold xl:text-2xl">PuduCan</h1>
                        <p className="text-xs text-gray-100 xl:text-sm">
                            Improving Cancer Patient Healthcare Management
                        </p>
                    </div>
                </div>

                <div className="hidden items-center space-x-1 text-nowrap sm:flex md:space-x-2 lg:space-x-3">
                    {navItem('Home', '/home', true)}

                    {navItem('About', '/home/about')}

                    {navItem('Reports', '/home/reports')}

                    <DropdownMenu>
                        <DropdownMenuTrigger className="group relative flex items-center rounded px-2 py-1 text-[13px] text-white transition-all duration-300 focus:outline-none md:px-3 md:py-2 lg:px-4">
                            <span className="relative z-10">Data Entry</span>

                            <ChevronDown className="ml-1 h-4 w-4" />
                            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-44">
                            {NAV_LINKS.map((link) => (
                                <DropdownMenuItem asChild key={link.name}>
                                    <Link href={link.path}>{link.name}</Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {navItem('Contact', '/home/contact')}

                    {/* ✅ Paper Saved Badge — desktop */}
                    <span className="flex items-center gap-1 text-xs font-medium text-green-800 bg-green-100 border border-green-300 rounded-full px-3 py-1 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                        {paperLabel}
                    </span>

                    <div className="text-foreground ml-2">
                        <ModeToggle />
                    </div>
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
                    mobileOpen ? 'mt-3 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="mx-auto flex w-fit flex-col space-y-1 pt-2 text-left text-white">
                    {navItem('Home', '/home', true)}

                    {navItem('About', '/home/about')}

                    {navItem('Reports', '/home/reports')}

                    {/* Mobile Data Entry */}
                    <button
                        onClick={() => setMobileDataEntryOpen(!mobileDataEntryOpen)}
                        className="flex items-center gap-2 rounded px-4 py-2 text-sm"
                    >
                        <span>Data Entry</span>

                        {mobileDataEntryOpen ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>

                    <div
                        className={`ml-4 overflow-hidden transition-all duration-300 ${
                            mobileDataEntryOpen ? 'max-h-60' : 'max-h-0'
                        }`}
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded px-4 py-2 text-sm hover:bg-white/10"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {navItem('Contact', '/home/contact')}

                    {/* ✅ Paper Saved Badge — mobile */}
                    <span className="mx-4 flex items-center gap-1 text-xs font-medium text-green-800 bg-green-100 border border-green-300 rounded-full px-3 py-1 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                        {paperLabel}
                    </span>
                </div>
            </div>
        </nav>
    )
}


