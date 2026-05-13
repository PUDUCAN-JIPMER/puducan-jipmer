'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Stethoscope, Users, Heart, Shield } from 'lucide-react'
import RoleCard from './RoleCard'

export default function HeroSection() {
    return (
        <section className="py-12 sm:py-20 lg:py-24 bg-gradient-to-b from-white dark:from-slate-950 to-background">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                            <Shield size={16} />
                            <span className="text-sm font-medium">JIPMER • Puducherry</span>
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-3">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                                Improving patient-reported outcomes through connected cancer care systems.
                            </h1>
                            <p className="text-lg text-muted max-w-lg leading-relaxed">
                                Supporting the Hybrid II Implementation Study led by JIPMER. A human-centered platform designed to enhance care coordination and patient experiences along the cancer continuum.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Link href="/home/reports">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
                                >
                                    Explore Reports
                                </Button>
                            </Link>
                            <Link href="/home/about">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto border-accent text-accent hover:bg-accent/10"
                                >
                                    Learn About Study
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column - Role Cards */}
                    <div className="space-y-4">
                        <div className="text-sm font-semibold text-muted mb-6">Choose your role to get started</div>
                        <div className="space-y-3">
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
                </div>
            </div>
        </section>
    )
}
