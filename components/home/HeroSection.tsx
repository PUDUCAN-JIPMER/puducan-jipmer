'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const personas = [
    {
        title: 'Doctor',
        description: 'Clinical coordination access',
        href: '/PuduCan/doctor',
        accentColor: 'text-blue-600',
        dotColor: 'bg-blue-500',
        glowColor: 'from-blue-500/20',
    },
    {
        title: 'Nurse',
        description: 'Patient tracking workflows',
        href: '/PuduCan/nurse',
        accentColor: 'text-green-600',
        dotColor: 'bg-green-500',
        glowColor: 'from-green-500/20',
    },
    {
        title: 'ASHA Worker',
        description: 'Community navigation tools',
        href: '/PuduCan/asha',
        accentColor: 'text-yellow-600',
        dotColor: 'bg-yellow-500',
        glowColor: 'from-yellow-500/20',
    },
    {
        title: 'Administrator',
        description: 'Operational insights & reporting',
        href: '/PuduCan/admin',
        accentColor: 'text-accent-primary',
        dotColor: 'bg-accent-primary',
        glowColor: 'from-accent-primary/20',
    },
]

export default function HeroSection() {
    return (
        <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden pt-32">
            {/* Atmospheric backgrounds */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-20 w-96 h-96 bg-gradient-to-br from-accent-secondary/12 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 w-96 h-96 bg-gradient-to-tl from-accent-primary/10 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 lg:px-16 xl:px-24">
                <div className="grid lg:grid-cols-3 gap-12 lg:gap-20 items-stretch">
                    {/* LEFT: Narrative - 2 columns */}
                    <div className="lg:col-span-2 space-y-10 flex flex-col justify-between">
                        {/* Institutional label */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-accent-primary"></div>
                                <p className="text-xs font-semibold tracking-widest text-accent-primary uppercase">
                                    JIPMER • Hybrid II Study
                                </p>
                            </div>
                            <div className="h-1 w-16 bg-gradient-to-r from-accent-primary to-accent-warm rounded-full"></div>
                        </div>

                        {/* Main headline */}
                        <h3 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-900">
                            Improving cancer care
                            <span className="block text-color-blue mt-1">through coordination</span>
                        </h3>

                        {/* Supporting paragraph */}
                        <p className="text-lg text-text-600 leading-relaxed max-w-lg">
                            A research-driven platform connecting doctors, nurses, ASHA workers, and administrators. Built at JIPMER to navigate patients seamlessly through coordinated cancer care—from community detection to hospital treatment to continuum tracking.
                        </p>

                        {/* Primary CTA */}
                        <div>
                            <Link
                                href="/PuduCan/doctor"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-primary-dark hover:shadow-lg hover:shadow-accent-primary/25 text-white font-semibold rounded-lg transition-all group"
                            >
                                Access Portal
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT: Unified Access Rail - Integrated connectivity system */}
                    <div className="relative">
                        <div className="sticky top-24 space-y-0 bg-white/80 backdrop-blur-sm rounded-xl border border-base-200 p-1 shadow-lg">
                            {/* Vertical connector line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-color-blue/30 via-color-green/30 to-color-yellow/30 rounded-full"></div>

                            {personas.map((persona, idx) => (
                                <div key={idx}>
                                    <Link
                                        href={persona.href}
                                        className="group block p-4 pl-6 relative transition-all duration-300 hover:bg-base-50/60"
                                    >
                                        {/* Subtle glow on hover */}
                                        <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${persona.glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>

                                        <div className="relative space-y-1">
                                            <div className="flex items-center gap-3">
                                                {/* Accent dot - minimal, surgical */}
                                                <div className={`w-2.5 h-2.5 rounded-full ${persona.dotColor} flex-shrink-0`}></div>
                                                <h3 className="font-semibold text-text-900 group-hover:translate-x-1 transition-transform">
                                                    {persona.title}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-text-500 pl-5.5">
                                                {persona.description}
                                            </p>
                                        </div>

                                        {/* Access indicator */}
                                        <div className={`mt-2 pl-5.5 text-xs font-semibold ${persona.accentColor} flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                            Access
                                            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </Link>

                                    {/* Divider between roles */}
                                    {idx < personas.length - 1 && (
                                        <div className="h-px bg-gradient-to-r from-transparent via-base-200 to-transparent mx-4"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
