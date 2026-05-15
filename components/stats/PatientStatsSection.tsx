'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './StatCard'
import {
    Users, Heart, Skull, HelpCircle,
    UserCheck, UserX, Activity,
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { RegistrationAnalytics } from '@/components/analytics/RegistrationAnalytics'
import type { Patient } from '@/schema/patient'

const COLORS = [
    '#4ade80', '#22d3ee', '#f97316', '#a78bfa',
    '#fb7185', '#fbbf24', '#34d399', '#60a5fa',
    '#f472b6', '#e879f9',
]
const STATUS_COLORS: Record<string, string> = {
    Alive: '#4ade80', 'Not Alive': '#f87171', 'Not Available': '#94a3b8',
}
const GENDER_COLORS: Record<string, string> = {
    Male: '#60a5fa', Female: '#f472b6', Other: '#94a3b8',
}

interface TooltipPayload {
    name?: string
    value?: number | string
    color?: string
    fill?: string
}

const CustomTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean
    payload?: TooltipPayload[]
    label?: string | number
}) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
            {label && <p className="font-medium mb-1">{label}</p>}
            {payload.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                    <p>
                        {e.name}: <span className="font-semibold">{e.value}</span>
                    </p>
                </div>
            ))}
        </div>
    )
}

const RADIAN = Math.PI / 180

interface PieLabelProps {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
}

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) => {
    if (percent < 0.06) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
            fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

interface PatientStats {
    total: number; alive: number; deceased: number; notAvailable: number
    male: number; female: number; other: number
    withAsha: number; withoutAsha: number
    diseaseData: { name: string; value: number }[]
    stageData: { name: string; value: number }[]
    insuranceData: { name: string; value: number }[]
    rationData: { name: string; value: number }[]
    statusData: { name: string; value: number }[]
    genderData: { name: string; value: number }[]
}

export function PatientStatsSection({ stats, patients }: { stats: PatientStats; patients: Patient[] }) {
    const pct = (n: number) => stats.total ? `${((n / stats.total) * 100).toFixed(0)}%` : '0%'

    return (
        <div className="space-y-4">
            {/* ── 8 KPI cards — 2 rows × 4 cols ─────────────────── */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatCard title="Total Patients"  value={stats.total}        icon={Users}      iconClassName="text-primary" />
                <StatCard title="Alive"           value={stats.alive}        icon={Heart}      iconClassName="text-green-500"   subtitle={`${pct(stats.alive)} of total`} />
                <StatCard title="Deceased"        value={stats.deceased}     icon={Skull}      iconClassName="text-red-500"     subtitle={`${pct(stats.deceased)} of total`} />
                <StatCard title="Not Available"   value={stats.notAvailable} icon={HelpCircle} iconClassName="text-slate-500" />
                <StatCard title="Male Patients"   value={stats.male}         icon={Activity}   iconClassName="text-blue-500" />
                <StatCard title="Female Patients" value={stats.female}       icon={Activity}   iconClassName="text-pink-500" />
                <StatCard title="ASHA Assigned"   value={stats.withAsha}     icon={UserCheck}  iconClassName="text-emerald-500" subtitle={`${pct(stats.withAsha)} coverage`} />
                <StatCard title="No ASHA Yet"     value={stats.withoutAsha}  icon={UserX}      iconClassName="text-orange-500" />
            </div>

            {/* ── Row 1: Status pie + Gender pie ─────────────────── */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ChartCard title="Patient Status">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={stats.statusData} cx="50%" cy="50%" outerRadius={80}
                                dataKey="value" labelLine={false} label={PieLabel}>
                                {stats.statusData.map((e) => (
                                    <Cell key={e.name} fill={STATUS_COLORS[e.name] ?? '#94a3b8'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Gender Distribution">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={stats.genderData} cx="50%" cy="50%" outerRadius={80}
                                dataKey="value" labelLine={false} label={PieLabel}>
                                {stats.genderData.map((e) => (
                                    <Cell key={e.name} fill={GENDER_COLORS[e.name] ?? '#94a3b8'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <RegistrationAnalytics patients={patients} />

            {/* ── Row 2: Disease bar + Stage bar ─────────────────── */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ChartCard title="Disease Distribution" empty={!stats.diseaseData.length}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={stats.diseaseData} layout="vertical" margin={{ left: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Patients" radius={[0, 4, 4, 0]}>
                                {stats.diseaseData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Cancer Stage" empty={!stats.stageData.length}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={stats.stageData} margin={{ bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Patients" radius={[4, 4, 0, 0]}>
                                {stats.stageData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ── Row 3: Insurance donut + Ration card bar ───────── */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ChartCard title="Insurance Coverage">
                    <ResponsiveContainer width="100%" height={210}>
                        <PieChart>
                            <Pie data={stats.insuranceData} cx="50%" cy="50%"
                                innerRadius={50} outerRadius={80}
                                dataKey="value" labelLine={false} label={PieLabel}>
                                {stats.insuranceData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Ration Card Type">
                    <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={stats.rationData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Patients" radius={[4, 4, 0, 0]}>
                                <Cell fill="#f87171" />
                                <Cell fill="#fbbf24" />
                                <Cell fill="#94a3b8" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

        </div>
    )
}

// ── tiny wrapper to keep JSX above clean ──────────────────────────
function ChartCard({
    title, children, empty = false,
}: {
    title: string; children: React.ReactNode; empty?: boolean
}) {
    return (
        <Card>
            <CardHeader className="px-4 py-3">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
                {empty ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">No data yet</p>
                ) : children}
            </CardContent>
        </Card>
    )
}
