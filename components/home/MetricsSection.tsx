'use client'

export default function MetricsSection() {
    return (
        <section className="relative py-24 sm:py-32 lg:py-40 bg-gradient-to-b from-blue-50/30 via-white to-green-50/30 border-y border-base-200">
            {/* Atmospheric beach-inspired elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-blue-400/12 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute left-0 bottom-0 w-96 h-96 bg-gradient-to-tr from-yellow-400/12 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute right-1/2 top-1/2 w-96 h-96 bg-gradient-to-l from-green-400/12 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 lg:px-16 xl:px-24">
                {/* Section header */}
                <div className="mb-16 space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        </div>
                        <p className="text-xs font-semibold tracking-widest text-accent-secondary uppercase">
                            Implementation Scale
                        </p>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold text-text-900">
                        Building research infrastructure at national scale
                    </h2>
                </div>

                {/* Editorial credentials grid */}
                <div className="space-y-12">
                    {/* Primary metrics - unified surfaces with surgical color accents */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                        <div className="space-y-3 p-6 rounded-lg border-l-4 border-color-blue bg-white/70 backdrop-blur-sm border border-base-200 transition-all hover:shadow-lg hover:bg-white/90">
                            <div className="flex items-baseline gap-3">
                                <span className="text-6xl sm:text-7xl font-bold text-text-900">8+</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-color-blue"></div>
                                    <span className="text-sm text-text-600 uppercase tracking-wide font-semibold">Hospitals</span>
                                </div>
                            </div>
                            <p className="text-base text-text-600 leading-relaxed">
                                Participating healthcare institutions across Tamil Nadu and Puducherry are implementing coordinated cancer care protocols through PuduCan.
                            </p>
                        </div>

                        <div className="space-y-3 p-6 rounded-lg border-l-4 border-color-yellow bg-white/70 backdrop-blur-sm border border-base-200 transition-all hover:shadow-lg hover:bg-white/90">
                            <div className="flex items-baseline gap-3">
                                <span className="text-6xl sm:text-7xl font-bold text-text-900">50+</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-color-yellow"></div>
                                    <span className="text-sm text-text-600 uppercase tracking-wide font-semibold">PHC Centers</span>
                                </div>
                            </div>
                            <p className="text-base text-text-600 leading-relaxed">
                                Primary health centers are networked into coordinated care workflows, enabling seamless patient navigation from community screening to institutional care.
                            </p>
                        </div>
                    </div>

                    {/* Secondary metrics */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                        <div className="space-y-3 p-6 rounded-lg border-l-4 border-color-green bg-white/70 backdrop-blur-sm border border-base-200 transition-all hover:shadow-lg hover:bg-white/90">
                            <div className="flex items-baseline gap-3">
                                <span className="text-6xl sm:text-7xl font-bold text-text-900">200+</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-color-green"></div>
                                    <span className="text-sm text-text-600 uppercase tracking-wide font-semibold">Care Workers</span>
                                </div>
                            </div>
                            <p className="text-base text-text-600 leading-relaxed">
                                ASHA workers and community health workers actively use PuduCan for patient identification, navigation, and family support coordination.
                            </p>
                        </div>

                        <div className="space-y-3 p-6 rounded-lg border-l-4 border-accent-primary bg-white/70 backdrop-blur-sm border border-base-200 transition-all hover:shadow-lg hover:bg-white/90">
                            <div className="flex items-baseline gap-3">
                                <span className="text-6xl sm:text-7xl font-bold text-text-900">5000+</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-accent-primary"></div>
                                    <span className="text-sm text-text-600 uppercase tracking-wide font-semibold">Patient Journeys</span>
                                </div>
                            </div>
                            <p className="text-base text-text-600 leading-relaxed">
                                Real-time tracking of patient outcomes and care pathways across the entire cancer care continuum generates actionable institutional insights.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Institutional attribution */}
                <div className="mt-16 pt-12 border-t border-base-300">
                    <p className="text-sm text-text-600">
                        <span className="font-semibold text-accent-primary">Implementation Leadership</span>
                        <span className="mx-2 text-text-400">•</span>
                        JIPMER, Puducherry
                        <span className="mx-2 text-text-400">•</span>
                        <span className="font-semibold text-accent-secondary">Research Support</span>
                        <span className="mx-2 text-text-400">•</span>
                        ICMR
                    </p>
                </div>
            </div>
        </section>
    )
}
