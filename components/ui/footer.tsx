'use client'

import { Button } from '@/components/ui/button'
import { Link as LinkIcon, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-800 dark:bg-accent dark:text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-between space-y-8 md:flex-row md:items-center md:space-y-0">
                    {/* Left Section */}
                    <div className="flex flex-col space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-100">
                            Supported by{' '}
                            <span className="font-bold italic">
                                <a
                                    href="https://www.icmr.gov.in/"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="ICMR Official Website link"
                                >
                                    ICMR
                                </a>
                            </span>{' '}
                            and{' '}
                            <span className="font-bold italic">
                                <a
                                    href="https://puducherry-dt.gov.in/"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Pondicherry Government Official Website link"
                                >
                                    Pondicherry Government
                                </a>
                            </span>
                        </p>

                        <p className="text-sm text-gray-600 dark:text-gray-100">
                            Architectured with{' '}
                            <a
                                href="https://ptuniv.edu.in/"
                                target="_blank"
                                rel="noreferrer"
                                title="Puducherry Technological University Official Website link"
                            >
                                <span className="font-bold italic">
                                    Puducherry Technological University
                                </span>
                            </a>
                        </p>
                    </div>

                    {/* Right Section - Contact */}
                    <div className="flex flex-col sm:items-end">
                        <span className="text-sm text-gray-600 dark:text-gray-100">
                            Contact Developer
                        </span>
                        <div className="flex space-x-2">
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                aria-label="Developer LinkedIn"
                                title="Click to view developer LinkedIn"
                            >
                                <Link
                                    href="https://www.linkedin.com/in/lourduradjou/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                   <LinkIcon className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                aria-label="Email Developer"
                                title="Click to email developer"
                            >
                                <Link
                                    href="mailto:rajlourdu15@gmail.com"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Mail className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Line */}
                <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-100">
                    &copy; {new Date().getFullYear()} PUDUCAN. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
