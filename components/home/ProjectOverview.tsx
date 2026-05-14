'use client'

import { Navigation, Stethoscope, TrendingUp } from 'lucide-react'

export default function ProjectOverview() {
    return (
        <section className="py-16 sm:py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
                        Platform Pillars
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        Designed to improve patient outcomes through integrated care coordination
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Navigation}
                        title="Community Navigation"
                        description="Streamlined patient pathways and resource coordination across primary care centers."
                        color="green"
                    />
                    <FeatureCard
                        icon={Stethoscope}
                        title="Hospital Coordination"
                        description="Seamless integration between community and hospital-based care delivery systems."
                        color="blue"
                    />
                    <FeatureCard
                        icon={TrendingUp}
                        title="Continuum Care Tracking"
                        description="Real-time monitoring and outcomes measurement throughout the cancer care journey."
                        color="yellow"
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
    color,
}: {
    icon: React.ComponentType<{ size: number; className: string }>
    title: string
    description: string
    color: 'green' | 'blue' | 'yellow'
}) {
    const colorMap = {
        green: { icon: 'text-primary', title: 'text-primary', accent: 'from-green-100/30 to-green-50/30' },
        blue: { icon: 'text-accent', title: 'text-accent', accent: 'from-blue-100/30 to-blue-50/30' },
        yellow: { icon: 'text-warning', title: 'text-warning', accent: 'from-yellow-100/30 to-yellow-50/30' },
    }
    const c = colorMap[color]

    return (
        <div className={`group p-6 rounded-lg bg-gradient-to-br ${c.accent} hover:shadow-md transition-all`}>
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-white/40 to-white/20 dark:from-white/10 dark:to-white/5 mb-4 group-hover:from-white/60 group-hover:to-white/40 transition-all">
                <Icon size={24} className={c.icon} />
            </div>
            <h3 className={`text-lg font-bold ${c.title} mb-2`}>{title}</h3>
            <p className="text-sm text-muted leading-relaxed">{description}</p>
        </div>
    )
}
