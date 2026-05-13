'use client'

import { Navigation, Stethoscope, TrendingUp } from 'lucide-react'

export default function ProjectOverview() {
    return (
        <section className="py-16 sm:py-20 bg-background border-t border-border">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
                        Platform Pillars
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        Designed to improve patient outcomes through integrated care coordination
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    <FeatureCard
                        icon={Navigation}
                        title="Community Navigation"
                        description="Streamlined patient pathways and resource coordination across primary care centers."
                    />
                    <FeatureCard
                        icon={Stethoscope}
                        title="Hospital Coordination"
                        description="Seamless integration between community and hospital-based care delivery systems."
                    />
                    <FeatureCard
                        icon={TrendingUp}
                        title="Continuum Care Tracking"
                        description="Real-time monitoring and outcomes measurement throughout the cancer care journey."
                    />
                </div>
            </div>
        </section>
    )
}

function FeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ size: number; className: string }>
    title: string
    description: string
}) {
    return (
        <div className="p-6 rounded-lg border border-border bg-white dark:bg-slate-900 hover:border-accent/50 hover:shadow-sm transition-all">
            <div className="inline-flex p-3 rounded-lg bg-accent/10 mb-4">
                <Icon size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
            <p className="text-sm text-muted leading-relaxed">{description}</p>
        </div>
    )
}
