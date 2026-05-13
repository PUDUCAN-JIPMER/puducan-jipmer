import { Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-border">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-1">PuduCan</h3>
                            <p className="text-sm text-muted">JIPMER Puducherry</p>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">
                            Improving patient-reported outcomes through connected cancer care systems.
                        </p>
                    </div>

                    {/* About */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-primary">About</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/home/about" className="text-muted hover:text-accent transition-colors">
                                    About PuduCan
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-muted hover:text-accent transition-colors">
                                    Research Study
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted hover:text-accent transition-colors">
                                    Publications
                                </a>
                            </li>
                            <li>
                                <Link href="/home/reports" className="text-muted hover:text-accent transition-colors">
                                    Reports
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-primary">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/home/contact" className="text-muted hover:text-accent transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-muted hover:text-accent transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted hover:text-accent transition-colors">
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/puducan" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-primary">Contact</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-accent mt-0.5 flex-shrink-0" />
                                <p className="text-muted">JIPMER<br />Puducherry, India</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-accent flex-shrink-0" />
                                <a href="mailto:support@puducan.org" className="text-muted hover:text-accent transition-colors">
                                    support@puducan.org
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Institution Info */}
                <div className="border-t border-border pt-8 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted">
                        <div>
                            <p className="font-semibold text-primary mb-2">Supported By</p>
                            <ul className="space-y-1">
                                <li>
                                    <a href="https://www.icmr.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                        ICMR
                                    </a>
                                </li>
                                <li>
                                    <a href="https://puducherry-dt.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                        Puducherry Government
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-primary mb-2">Architected By</p>
                            <ul className="space-y-1">
                                <li>
                                    <a href="https://www.jipmer.edu.in/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                        JIPMER
                                    </a>
                                </li>
                                <li>
                                    <a href="https://ptuniv.edu.in/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                        PTU
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-primary mb-2">Open Source</p>
                            <ul className="space-y-1">
                                <li>
                                    <a href="https://github.com/puducan/puducan-jipmer" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                        GitHub Repository
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-accent transition-colors">
                                        Contributing
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border bg-background/50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
                    <p>&copy; {currentYear} PuduCan. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-accent transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-accent transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="hover:text-accent transition-colors">
                            Security
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}