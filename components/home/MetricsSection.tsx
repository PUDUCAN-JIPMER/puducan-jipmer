'use client'

import { Building2, Ambulance, Users, BarChart3 } from 'lucide-react'

export default function MetricsSection() {
    return (
        <section className="py-16 sm:py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
                        Building Trust at Scale
                    </h2>
                    <p className="text-muted max-w-2xl mx-auto">
                        A nationwide implementation study transforming cancer care delivery
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MetricCard
                        icon={Building2}
                        label="Hospitals"
                        value="8+"
                        description="Participating healthcare institutions"
                        color="green"
                    />
                    <MetricCard
                        icon={Ambulance}
                        label="PHC Centers"
                        value="50+"
                        description="Primary health centers networked"
                        color="blue"
                    />
                    <MetricCard
                        icon={Users}
                        label="Care Workers"
                        value="200+"
                        description="Active community health workers"
                        color="yellow"
                    />
                    <MetricCard
                        icon={BarChart3}
                        label="Reports Generated"
                        value="5000+"
                        description="Patient data insights tracked"
                        color="green"
                    />
                </div>
            </div>
        </section>
    )
}

function MetricCard({
    icon: Icon,
    label,
    value,
    description,
    color,
}: {
    icon: React.ComponentType<{ size: number; className: string }>
    label: string
    value: string
    description: string
    color: 'green' | 'blue' | 'yellow'
}) {
    const colorMap = {
        green: { icon: 'text-primary', value: 'text-primary', accent: 'from-green-100/20 to-green-50/20' },
        blue: { icon: 'text-accent', value: 'text-accent', accent: 'from-blue-100/20 to-blue-50/20' },
        yellow: { icon: 'text-warning', value: 'text-warning', accent: 'from-yellow-100/20 to-yellow-50/20' },
    }
    const c = colorMap[color]

    return (
        <div className={`text-center p-6 rounded-lg bg-gradient-to-br ${c.accent} hover:shadow-md transition-all group`}>
            <div className="flex justify-center mb-3">
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-white/40 to-white/20 dark:from-white/10 dark:to-white/5 group-hover:from-white/60 group-hover:to-white/40 transition-all">
                    <Icon size={24} className={c.icon} />
                </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${c.value} mb-1`}>{value}</div>
            <div className="text-sm font-semibold text-muted mb-1">{label}</div>
            <p className="text-xs text-muted/70 leading-snug">{description}</p>
        </div>
    )
}
