'use client'

import { FOOTER_GROUPS } from '@/constants/footer'
import { auth } from '@/firebase'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { getPaperSavedCount, calculateSheetsSaved } from '@/lib/papersaved'

export default function Footer() {
    const [sheetsSaved, setSheetsSaved] = useState<number | null>(null)

    useEffect(() => {
        // Only run the aggregation query once we know there is an
        // authenticated user to avoid Firestore permission-denied errors.
        const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
            if (user) {
                getPaperSavedCount().then((count) => {
                    if (count > 0) {
                        setSheetsSaved(calculateSheetsSaved(count))
                    }
                })
            } else {
                setSheetsSaved(null)
            }
        })
        return () => unsubscribe()
    }, [])

    return (
        <footer className="border-t border-gray-200 bg-gradient-to-b from-gray-100 to-gray-50 text-sm text-gray-700 dark:border-gray-800 dark:from-[#111827] dark:to-[#0f172a] dark:text-gray-200">
            <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">

                {/* Top Links Section */}
                <div className="flex flex-col items-center justify-center gap-4 text-center md:flex-row md:flex-wrap md:gap-6">
                    {FOOTER_GROUPS.map((group, groupIdx) => (
                        <div
                            key={group.label}
                            className="flex flex-col items-center gap-1 md:flex-row md:items-center"
                        >
                            {groupIdx > 0 && (
                                <span
                                    aria-hidden="true"
                                    className="hidden text-gray-400 md:inline"
                                >
                                    •
                                </span>
                            )}

                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                <span className="font-medium">
                                    {group.label}
                                </span>{' '}
                                {group.links.map((link, linkIdx) => (
                                    <span key={link.href}>
                                        {linkIdx > 0 && ' and '}
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={link.title}
                                            className="ml-1 inline-block font-semibold italic text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:text-blue-500 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            {link.text}
                                        </a>
                                    </span>
                                ))}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Badges */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <a
                        href="https://www.websitecarbon.com/website/cancer-tracker-jipmer-vercel-app-home/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs font-medium text-green-700 transition-all duration-200 hover:scale-105 dark:border-green-700 dark:bg-green-950 dark:text-green-300"
                    >
                        🌿 93% cleaner than other websites
                    </a>

                    {sheetsSaved !== null && sheetsSaved > 0 && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs font-medium text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
                            🌿 {sheetsSaved.toLocaleString()} sheets saved
                        </span>
                    )}
                </div>

                {/* Bottom Section */}
                <div className="mt-6 border-t border-gray-300 pt-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <p>
                        &copy; {new Date().getFullYear()} PUDUCAN. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}