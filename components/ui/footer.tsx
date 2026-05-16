'use client'

import { FOOTER_GROUPS } from '@/constants/footer'
import { useEffect, useState } from 'react'
import { getPaperSavedLabel } from '@/lib/papersaved'

export default function Footer() {
    const [paperLabel, setPaperLabel] = useState<string>('🌿 Calculating...')

    useEffect(() => {
        getPaperSavedLabel().then(setPaperLabel)
    }, [])

    return (
        <footer className="dark:bg-accent border-t border-gray-200 bg-gray-100 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-1 md:flex-row md:gap-2">
                    {FOOTER_GROUPS.map((group, groupIdx) => (
                        <div key={group.label} className="flex items-center gap-2">
                            {groupIdx > 0 && (
                                <span aria-hidden="true" className="hidden text-gray-400 md:inline">
                                    •
                                </span>
                            )}
                            <p>
                                {group.label}{' '}
                                {group.links.map((link, linkIdx) => (
                                    <span key={link.href}>
                                        {linkIdx > 0 && ' and '}
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={link.title}
                                            className="font-bold italic hover:underline hover:underline-offset-2"
                                        >
                                            {link.text}
                                        </a>
                                    </span>
                                ))}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-3 flex justify-center items-center gap-3">
                    <a
                        href="https://www.websitecarbon.com/website/cancer-tracker-jipmer-vercel-app-home/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-xs text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300"
                    >
                        🌿 93% cleaner than other websites
                    </a>

                    <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-xs text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
                        {paperLabel}
                    </span>
                </div>

                <div className="mt-2 border-t border-gray-200 pt-2 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-100">
                    &copy; {new Date().getFullYear()} PUDUCAN. All rights reserved.
                </div>
            </div>
        </footer>
    )
}




