'use client'

import { Navigation, Stethoscope, TrendingUp } from 'lucide-react'

export default function ProjectOverview() {
    return (
        <section className="relative py-24 sm:py-32 lg:py-40 bg-gradient-to-b from-transparent via-blue-50/20 to-transparent border-y border-base-200">
            {/* Atmospheric depth with beach colors */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-0 top-20 w-96 h-96 bg-gradient-to-r from-green-400/8 via-blue-400/8 to-transparent blur-3xl rounded-full"></div>
                <div className="absolute right-0 bottom-10 w-96 h-96 bg-gradient-to-l from-yellow-400/8 to-transparent blur-3xl rounded-full"></div>
            </div>

            <div className="container mx-auto px-6 lg:px-16 xl:px-24">
                {/* Section header with intentional spacing */}
                <div className="mb-24 space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        </div>
                        <p className="text-xs font-semibold tracking-widest text-accent-primary uppercase">
                            Care Coordination Framework
                        </p>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-text-900">
                        How PuduCan transforms cancer care delivery
                    </h2>
                    <p className="text-lg text-text-600">
                        Three integrated systems working together to create seamless patient navigation across the care continuum.
                    </p>
                </div>

                {/* Editorial Grid - Asymmetric composition with progressive density */}
                <div className="space-y-32">
                    {/* Pillar 1 - Community Foundation */}
                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-center">
                        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                            <div className="flex items-center gap-3">
                                <span className="text-5xl font-bold text-green-500/20">01</span>
                                <h3 className="text-3xl sm:text-4xl font-bold text-text-900">
                                    Community Foundation
                                </h3>
                            </div>
                            <p className="text-lg text-text-600 leading-relaxed max-w-xl">
                                ASHA workers and community health networks form the detection layer. PuduCan streamlines patient identification, resource coordination, and initial navigation into the formal healthcare system. Real-time connectivity enables community leaders to connect patients with appropriate primary care centers.
                            </p>
                            <ul className="space-y-3 text-text-600">
                                <li className="flex gap-3">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>ASHA-led screening and patient identification</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Resource navigation and family support</span>
                                </li>
                            </ul>
                        </div>
                        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-green-600/10 rounded-2xl blur-2xl"></div>
                                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 backdrop-blur border-2 border-green-400 flex items-center justify-center h-48 w-48">
                                    <div className="text-center">
                                        <Navigation size={56} className="text-green-600 mb-3 mx-auto" />
                                        <p className="text-sm font-semibold text-green-900">Community Navigation</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pillar 2 - Coordinated Care */}
                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-center">
                        <div className="flex justify-center lg:justify-start">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-blue-600/10 rounded-2xl blur-2xl"></div>
                                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur border-2 border-blue-400 flex items-center justify-center h-48 w-48">
                                    <div className="text-center">
                                        <Stethoscope size={56} className="text-blue-600 mb-3 mx-auto" />
                                        <p className="text-sm font-semibold text-blue-900">Clinical Coordination</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-5xl font-bold text-blue-500/20">02</span>
                                <h3 className="text-3xl sm:text-4xl font-bold text-text-900">
                                    Coordinated Care Delivery
                                </h3>
                            </div>
                            <p className="text-lg text-text-600 leading-relaxed max-w-xl">
                                Doctors and nurses use PuduCan to coordinate across hospital and primary health center boundaries. Clinical decision-making is informed by community context. Treatment plans are visible to all care team members, enabling seamless handoffs and continuity of care.
                            </p>
                            <ul className="space-y-3 text-text-600">
                                <li className="flex gap-3">
                                    <span className="text-blue-600 font-bold">✓</span>
                                    <span>Cross-institutional clinical visibility</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-blue-600 font-bold">✓</span>
                                    <span>Integrated treatment planning and coordination</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Pillar 3 - Outcomes Intelligence */}
                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-center">
                        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                            <div className="flex items-center gap-3">
                                <span className="text-5xl font-bold text-yellow-500/20">03</span>
                                <h3 className="text-3xl sm:text-4xl font-bold text-text-900">
                                    Continuum Intelligence
                                </h3>
                            </div>
                            <p className="text-lg text-text-600 leading-relaxed max-w-xl">
                                Real-time outcomes tracking across the entire patient journey. Administrators gain institutional intelligence about care quality, patient progress, and system performance. Data informs continuous improvement at JIPMER and across the implementation network.
                            </p>
                            <ul className="space-y-3 text-text-600">
                                <li className="flex gap-3">
                                    <span className="text-yellow-600 font-bold">✓</span>
                                    <span>Longitudinal patient outcome measurement</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-yellow-600 font-bold">✓</span>
                                    <span>System-wide performance analytics and insights</span>
                                </li>
                            </ul>
                        </div>
                        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-amber-600/10 rounded-2xl blur-2xl"></div>
                                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 backdrop-blur border-2 border-yellow-400 flex items-center justify-center h-48 w-48">
                                    <div className="text-center">
                                        <TrendingUp size={56} className="text-yellow-600 mb-3 mx-auto" />
                                        <p className="text-sm font-semibold text-yellow-900">Continuum Tracking</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
