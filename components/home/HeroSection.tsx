'use client'

import Link from 'next/link'
import { Stethoscope, Users, Heart, Shield } from 'lucide-react'
import RoleCard from './RoleCard'

export default function HeroSection() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Trust Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-accent/10 to-accent/5 text-accent mb-8">
                    <Shield size={16} />
                    <span className="text-sm font-medium">JIPMER • Puducherry</span>
                </div>

                {/* PRIMARY: Role Cards Grid (now featured) */}
                <div className="mb-12 sm:mb-16">
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Get Started</h2>
                        <p className="text-muted text-sm sm:text-base mt-2">Choose your role to access the platform</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <RoleCard
                            role="Doctor"
                            description="Manage patient diagnoses, treatments, and clinical outcomes"
                            icon={Stethoscope}
                            href="/PuduCan/doctor"
                        />
                        <RoleCard
                            role="Nurse"
                            description="Coordinate care and track patient progress"
                            icon={Heart}
                            href="/PuduCan/nurse"
                        />
                        <RoleCard
                            role="ASHA Worker"
                            description="Connect patients with care resources and support"
                            icon={Users}
                            href="/PuduCan/asha"
                        />
                        <RoleCard
                            role="Administrator"
                            description="Oversee platform operations and reporting"
                            icon={Shield}
                            href="/PuduCan/admin"
                        />
                    </div>
                </div>

                {/* SECONDARY: Project Overview (moved down, smaller) */}
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground">About PuduCan</h3>
                        <p className="text-sm sm:text-base text-muted leading-relaxed">
                            Improving patient-reported outcomes through connected cancer care systems.
                        </p>
                        <p className="text-sm text-muted leading-relaxed">
                            Supporting the Hybrid II Implementation Study led by JIPMER. A human-centered platform designed to enhance care coordination and patient experiences along the cancer continuum.
                        </p>
                    </div>

                    {/* Minimal CTAs */}
                    <div className="space-y-3">
                        <Link href="/home/reports" className="block text-sm font-medium text-primary hover:text-accent transition-colors">
                            Explore Reports →
                        </Link>
                        <Link href="/home/about" className="block text-sm font-medium text-accent hover:text-primary transition-colors">
                            Learn About Study →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
