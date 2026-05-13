'use client'

import { Building2, Ambulance, Users, BarChart3 } from 'lucide-react'

export default function MetricsSection() {
    return (
        <section className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-t border-border">
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
                    />
                    <MetricCard
                        icon={Ambulance}
                        label="PHC Centers"
                        value="50+"
                        description="Primary health centers networked"
                    />
                    <MetricCard
                        icon={Users}
                        label="Care Workers"
                        value="200+"
                        description="Active community health workers"
                    />
                    <MetricCard
                        icon={BarChart3}
                        label="Reports Generated"
                        value="5000+"
                        description="Patient data insights tracked"
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
}: {
    icon: React.ComponentType<{ size: number; className: string }>
    label: string
    value: string
    description: string
}) {
    return (
        <div className="text-center p-6 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-all">
            <div className="flex justify-center mb-3">
                <div className="inline-flex p-3 rounded-lg bg-accent/10">
                    <Icon size={24} className="text-accent" />
                </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{value}</div>
            <div className="text-sm font-semibold text-muted mb-1">{label}</div>
            <p className="text-xs text-muted/70 leading-snug">{description}</p>
        </div>
    )
}
