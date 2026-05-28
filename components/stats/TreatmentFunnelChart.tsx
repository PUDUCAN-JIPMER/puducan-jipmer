'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    FunnelChart,
    Funnel,
    Tooltip,
    LabelList,
    ResponsiveContainer,
} from 'recharts'

const FUNNEL_COLORS = ['#4ade80', '#34d399', '#fbbf24', '#f97316', '#60a5fa']

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const current = payload[0].payload

    return (
        <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
            <p className="font-semibold mb-1">{current.name}</p>
            <p>Patients: <span className="font-bold">{current.value}</span></p>
            {current.dropOff !== null && (
                <p className="text-red-400">
                    ↓ {current.dropOff}% drop-off from previous stage
                </p>
            )}
        </div>
    )
}

interface FunnelEntry {
    name: string
    value: number
}

interface Props {
    data: FunnelEntry[]
}

export function TreatmentFunnelChart({ data }: Props) {
    // attach drop-off % to each entry
    const enriched = data.map((entry, i) => {
        const prev = data[i - 1]
        const dropOff =
            i === 0 || !prev || prev.value === 0
                ? null
                : Math.round(((prev.value - entry.value) / prev.value) * 100)
        return { ...entry, dropOff, fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }
    })

    const isEmpty = data.every(d => d.value === 0)

    return (
        <Card>
            <CardHeader className="px-4 py-3">
                <CardTitle className="text-sm font-semibold">
                    Treatment Outcome Funnel
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
                {isEmpty ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                        No data yet
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <FunnelChart>
                            <Tooltip content={<CustomTooltip />} />
                            <Funnel
                                dataKey="value"
                                data={enriched}
                                isAnimationActive
                            >
                                <LabelList
                                    position="right"
                                    fill="currentColor"
                                    stroke="none"
                                    dataKey="name"
                                    className="text-xs fill-muted-foreground"
                                />
                            </Funnel>
                        </FunnelChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}