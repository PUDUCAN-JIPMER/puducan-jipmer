import Link from 'next/link'
import { Mail, MapPin, Phone, Code, ExternalLink } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinkClass = 'text-text-600 dark:text-text-500 hover:text-color-green transition-colors'
    const footerMutedClass = 'text-text-600 dark:text-text-500'

    return (
        <footer className="relative bg-white dark:bg-text-900 border-t border-base-200 text-text-900 dark:text-white">
            {/* Main footer content */}
            <div className="container mx-auto px-6 lg:px-16 xl:px-24 py-16">
                {/* Top section - Brand + Columns */}
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-color-blue mb-1">PuduCan</h2>
                            <p className="text-sm text-text-600 dark:text-text-500">
                                JIPMER, Puducherry
                            </p>
                            <p className="text-xs text-text-500 dark:text-text-600 mt-2">
                                Research-driven platform improving coordinated cancer care.
                            </p>
                        </div>
                    </div>

                    {/* About Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-color-green">About</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/home/about" className={footerLinkClass}>
                                    About PuduCan
                                </Link>
                            </li>
                            <li>
                                <span className={footerMutedClass}>
                                    Research Framework
                                </span>
                            </li>
                            <li>
                                <span className={footerMutedClass}>
                                    Implementation
                                </span>
                            </li>
                            <li>
                                <Link href="/home/reports" className={footerLinkClass}>
                                    Reports & Data
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-color-green">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <span className={footerMutedClass}>
                                    Documentation
                                </span>
                            </li>
                            <li>
                                <a href="https://github.com/puducan" target="_blank" rel="noopener noreferrer" className={`${footerLinkClass} flex items-center gap-2`}>
                                    <Code size={14} />
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <span className={footerMutedClass}>
                                    Contributing
                                </span>
                            </li>
                            <li>
                                <span className={footerMutedClass}>
                                    License
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-color-green">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-2 text-text-600 dark:text-text-500">
                                <MapPin size={16} className="flex-shrink-0 mt-0.5 text-color-blue" />
                                <div>
                                    <p className="font-semibold text-text-900 dark:text-white">JIPMER</p>
                                    <p className="text-xs">Puducherry, India</p>
                                </div>
                            </li>
                            <li className="flex gap-2 text-text-600 dark:text-text-500">
                                <Mail size={16} className="flex-shrink-0 mt-0.5 text-color-blue" />
                                <a href="mailto:puducan@jipmer.edu.in" className="hover:text-color-green transition-colors">
                                    puducan@jipmer.edu.in
                                </a>
                            </li>
                            <li className="flex gap-2 text-text-600 dark:text-text-500">
                                <Phone size={16} className="flex-shrink-0 mt-0.5 text-color-blue" />
                                <a href="tel:+914133296000" className="hover:text-color-green transition-colors">
                                    +91-413-3296000
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Team & Sponsorship Section */}
                <div className="bg-base-50 dark:bg-text-900/50 border border-base-200 dark:border-text-700 rounded-lg p-6 mb-8">
                    <div className="grid md:grid-cols-2 gap-8 text-sm">
                        <div className="space-y-2">
                            <p className="text-text-700 dark:text-text-600">
                                <span className="font-semibold text-text-900 dark:text-white">Built By:</span> Department of Community Medicine, JIPMER Health IT Lab
                            </p>
                            <p className="text-text-700 dark:text-text-600">
                                <span className="font-semibold text-text-900 dark:text-white">Partners:</span>
                                <a href="https://www.jipmer.edu.in" target="_blank" rel="noopener noreferrer" className="text-color-blue hover:underline"> JIPMER</a>
                                <span className="text-text-500 dark:text-text-600 mx-1">•</span>
                                <a href="https://www.icmr.gov.in" target="_blank" rel="noopener noreferrer" className="text-color-blue hover:underline">ICMR</a>
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-text-700 dark:text-text-600">
                                <span className="font-semibold text-text-900 dark:text-white">Sponsored By:</span> Indian Council of Medical Research (ICMR)
                            </p>
                            <p className="text-text-700 dark:text-text-600">
                                <span className="font-semibold text-text-900 dark:text-white">Implementation:</span> State Health Departments of Tamil Nadu & Puducherry
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-base-200 dark:bg-text-700 mb-8"></div>

                {/* Footer bottom */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="text-xs text-text-500 dark:text-text-600 space-y-1">
                        <p>&copy; {currentYear} PuduCan • JIPMER Puducherry</p>
                        <p>Building coordinated cancer care infrastructure for India</p>
                    </div>
                    <div className="flex flex-wrap gap-6 text-xs">
                        <span className="text-text-500 dark:text-text-600">
                            Privacy Policy
                        </span>
                        <span className="text-text-500 dark:text-text-600">
                            Terms of Service
                        </span>
                        <span className="text-text-500 dark:text-text-600">
                            Security
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}