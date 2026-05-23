'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './StatCard'
import { Building2, Stethoscope, Syringe, User2, ShieldCheck, Hospital } from 'lucide-react'
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

interface HospitalCoverage {
    name: string
    covered: number
    uncovered: number
    total: number
    percentage: number
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
    // Prepare table data
    const coverageData: HospitalCoverage[] = stats.ashaCoverageData
        .filter(item => (item.covered + item.uncovered) > 0)
        .map(item => {
            const total = item.covered + item.uncovered
            const percentage = total > 0 ? (item.covered / total) * 100 : 0
            return { ...item, total, percentage }
        })
        .sort((a, b) => b.total - a.total)

    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-2 border-b pb-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">Hospital &amp; Staff Overview</h2>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard title="Hospitals"   value={stats.totalHospitals} icon={Building2}   iconClassName="text-cyan-500" />
                <StatCard title="Doctors"     value={stats.doctors}        icon={Stethoscope} iconClassName="text-blue-500" />
                <StatCard title="Nurses"      value={stats.nurses}         icon={Syringe}     iconClassName="text-pink-500" />
                <StatCard title="ASHAs"       value={stats.ashas}          icon={User2}       iconClassName="text-emerald-500" />
                <StatCard title="Total Staff" value={stats.totalStaff}     icon={User2}       iconClassName="text-violet-500" />
            </div>

            {/* Staff pie + Patients per hospital */}
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

            {/* TABLE-BASED ASHA COVERAGE */}
            {coverageData.length > 0 && (
                <ChartCard title="ASHA Coverage by Hospital">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Hospital</th>
                                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Coverage</th>
                                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Assigned</th>
                                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                                 </tr>
                            </thead>
                            <tbody>
                                {coverageData.map((hospital, idx) => {
                                    const getStatus = () => {
                                        if (hospital.percentage >= 70) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' }
                                        if (hospital.percentage >= 30) return { label: 'Needs attention', color: 'text-yellow-600', bg: 'bg-yellow-100', dot: 'bg-yellow-500' }
                                        return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500' }
                                    }
                                    const status = getStatus()
                                    
                                    return (
                                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-2 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Hospital className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{hospital.name}</span>
                                                </div>
                                             </td>
                                            <td className="py-3 px-2 w-48">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary rounded-full transition-all"
                                                            style={{ width: `${hospital.percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-mono w-10">
                                                        {hospital.percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                             </td>
                                            <td className="py-3 px-2">
                                                <span className="font-medium">{hospital.covered}</span>
                                                <span className="text-muted-foreground">/{hospital.total}</span>
                                             </td>
                                            <td className="py-3 px-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                                    {status.label}
                                                </span>
                                             </td>
                                         </tr>
                                    )
                                })}
                            </tbody>
                         </table>
                    </div>
                    
                    {/* Summary row */}
                    <div className="mt-4 pt-3 border-t flex justify-between text-xs text-muted-foreground flex-wrap gap-2">
                        <span>📊 Total Hospitals: {coverageData.length}</span>
                        <span>✅ Good: {coverageData.filter(h => h.percentage >= 70).length}</span>
                        <span>⚠️ Needs attention: {coverageData.filter(h => h.percentage >= 30 && h.percentage < 70).length}</span>
                        <span>🔴 Critical: {coverageData.filter(h => h.percentage < 30).length}</span>
                        <span>📈 Avg Coverage: {(coverageData.reduce((sum, h) => sum + h.percentage, 0) / coverageData.length).toFixed(0)}%</span>
                    </div>
                </ChartCard>
            )}
        </div>
    )
}