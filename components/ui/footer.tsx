'use client'

import { auth } from '@/firebase'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { getPaperSavedCount, calculateSheetsSaved } from '@/lib/papersaved'
import Link from 'next/link'

type FooterColumn =
    | { label: string; links: { text: string; href: string; external?: boolean }[]; lines?: never }
    | { label: string; lines: string[]; links?: never }

const FOOTER_COLUMNS: FooterColumn[] = [
    {
        label: 'Quick Links',
        links: [
            { text: 'Home', href: '/home' },
            { text: 'About PuduCan', href: '/home#about' },
            { text: 'Access Dashboard', href: '/login' },
            { text: 'Reports', href: '/dashboard/reports' },
            { text: 'Data Entry', href: '/dashboard/data-entry' },
        ],
    },
    {
        label: 'Support',
        links: [
            { text: 'Contact Us', href: '/home/contact' },
            { text: 'Training Materials', href: '/home/training' },
            { text: 'FAQs', href: '/home/faq' },
            { text: 'Report an Issue', href: '/home/report' },
            { text: 'User Guide', href: '/home/guide' },
        ],
    },
    {
        label: 'Study Info',
        links: [
            { text: 'Study Protocol', href: '/home#about' },
            { text: 'JIPMER Website', href: 'https://jipmer.edu.in', external: true },
            { text: 'Ethics & Compliance', href: '/home#about' },
            { text: 'Publications', href: '/home/publications' },
            { text: 'Data Privacy', href: '/home/privacy' },
        ],
    },
    {
        label: 'Contact',
        lines: [
            'Principal Investigator, JIPMER',
            'Dhanvantri Nagar, Puducherry',
            'India — 605 006',
            'puducan@jipmer.edu.in',
            'Mon–Fri, 09:00–17:00 IST',
        ],
    },
]

export default function Footer() {
    const [sheetsSaved, setSheetsSaved] = useState<number | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
            if (user) {
                getPaperSavedCount().then((count) => {
                    if (count > 0) setSheetsSaved(calculateSheetsSaved(count))
                })
            } else {
                setSheetsSaved(null)
            }
        })
        return () => unsubscribe()
    }, [])

    return (
        <footer className="border-border bg-card/30 border-t backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
                {/* Top — brand + tagline */}
                <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-foreground text-xl font-extrabold tracking-tight">
                            PUDUCAN
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            A JIPMER Collaborative Oncology Initiative
                        </p>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-right">
                        Improving lives through data-driven cancer care.
                    </p>
                </div>

                {/* Columns */}
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {FOOTER_COLUMNS.map((col) => (
                        <div key={col.label}>
                            <p className="text-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
                                {col.label}
                            </p>

                            {col.links && (
                                <ul className="space-y-2">
                                    {col.links.map((link) => (
                                        <li key={link.text}>
                                            {link.external ? (
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150"
                                                >
                                                    {link.text} ↗
                                                </a>
                                            ) : (
                                                <Link
                                                    href={link.href}
                                                    className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-150"
                                                >
                                                    {link.text}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {col.lines && (
                                <ul className="space-y-2">
                                    {col.lines.map((line) => (
                                        <li key={line} className="text-muted-foreground text-sm">
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>

                {/* Badges */}
                <div className="text-muted-foreground mt-10 flex flex-wrap gap-3 text-xs">
                    <a
                        href="https://www.websitecarbon.com/website/cancer-tracker-jipmer-vercel-app-home/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors duration-150"
                    >
                        🌿 93% cleaner than other websites
                    </a>

                    {sheetsSaved !== null && sheetsSaved > 0 && (
                        <>
                            <span>·</span>
                            <span>🌿 {sheetsSaved.toLocaleString()} sheets saved</span>
                        </>
                    )}
                </div>

                {/* Bottom bar */}
                <div className="border-border text-muted-foreground mt-8 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} PUDUCAN · JIPMER. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link
                            href="/home/privacy"
                            className="hover:text-foreground transition-colors duration-150"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/home/terms"
                            className="hover:text-foreground transition-colors duration-150"
                        >
                            Terms of Use
                        </Link>
                        <Link
                            href="/home#about"
                            className="hover:text-foreground transition-colors duration-150"
                        >
                            Ethics
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
