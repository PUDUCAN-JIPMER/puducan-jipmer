'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './StatCard'
import { Building2, Stethoscope, Syringe, User2, ShieldCheck } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#4ade80', '#22d3ee', '#f97316', '#a78bfa', '#fb7185', '#fbbf24']

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
            {label && <p className="font-medium mb-1">{label}</p>}
            {payload.map((e: any, i: number) => (
                <p key={i} style={{ color: e.color ?? e.fill }}>
                    {e.name}: <span className="font-semibold">{e.value}</span>
                </p>
            ))}
        </div>
    )
}

const RADIAN = Math.PI / 180
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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

interface AdminStats {
    totalHospitals: number; totalStaff: number
    doctors: number; nurses: number; ashas: number; admins: number
    patientsPerHospital: { name: string; patients: number }[]
    staffRoleData: { name: string; value: number }[]
    ashaCoverageData: { name: string; covered: number; uncovered: number }[]
}

function ChartCard({ title, children, empty = false }: {
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

export function AdminStatsSection({ stats }: { stats: AdminStats }) {
    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-2 border-b pb-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">Hospital &amp; Staff Overview</h2>
            </div>

            {/* ── 5 KPI cards in one tight row ─────────────────── */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard title="Hospitals"   value={stats.totalHospitals} icon={Building2}   iconClassName="text-cyan-500" />
                <StatCard title="Doctors"     value={stats.doctors}        icon={Stethoscope} iconClassName="text-blue-500" />
                <StatCard title="Nurses"      value={stats.nurses}         icon={Syringe}     iconClassName="text-pink-500" />
                <StatCard title="ASHAs"       value={stats.ashas}          icon={User2}       iconClassName="text-emerald-500" />
                <StatCard title="Total Staff" value={stats.totalStaff}     icon={User2}       iconClassName="text-violet-500" />
            </div>

            {/* ── Staff pie + Patients-per-hospital bar ─────────── */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ChartCard title="Staff by Role" empty={!stats.staffRoleData.length}>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={stats.staffRoleData} cx="50%" cy="50%" outerRadius={80}
                                dataKey="value" labelLine={false} label={PieLabel}>
                                {stats.staffRoleData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Patients per Hospital" empty={!stats.patientsPerHospital.length}>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.patientsPerHospital} layout="vertical" margin={{ left: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="patients" name="Patients" radius={[0, 4, 4, 0]}>
                                {stats.patientsPerHospital.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ── ASHA coverage stacked bar ─────────────────────── */}
            {stats.ashaCoverageData.length > 0 && (
                <ChartCard title="ASHA Coverage by Hospital">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.ashaCoverageData} margin={{ bottom: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20}
                                textAnchor="end" interval={0} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="covered"   name="ASHA Assigned" stackId="a" fill="#4ade80" />
                            <Bar dataKey="uncovered" name="No ASHA"       stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}
        </div>
    )
}
