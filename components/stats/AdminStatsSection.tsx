/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './StatCard'
import { Building2, Stethoscope, Syringe, User2, ShieldCheck } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'

// Theme colors for chart consistency
const PRIMARY_COLOR = '#3b82f6' // Blue-500
const PRIMARY_COLOR_LIGHT = '#60a5fa' // Blue-400

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

// Custom Y-axis label to truncate long names with an ellipsis and provide a hover tooltip
const TruncatedLabel = ({ x, y, payload, maxLength = 15 }: any) => {
    const fullName = payload.value
    const truncated = fullName.length > maxLength 
        ? `${fullName.substring(0, maxLength)}...` 
        : fullName
    
    return (
        <g>
            <title>{fullName}</title>
            <text 
                x={x} 
                y={y} 
                dy={4} 
                textAnchor="end" 
                fill="#666" 
                fontSize={11}
            >
                {truncated}
            </text>
        </g>
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
    // Pre-process data: remove zero-value entries and sort descending for better scanability
    const filteredAndSortedStaffData = stats.staffRoleData
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
    
    const filteredAndSortedHospitalData = stats.patientsPerHospital
        .filter(item => item.patients > 0)
        .sort((a, b) => b.patients - a.patients)

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2 border-b pb-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">Hospital &amp; Staff Overview</h2>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard title="Hospitals"   value={stats.totalHospitals} icon={Building2}   iconClassName="text-cyan-500" />
                <StatCard title="Doctors"     value={stats.doctors}        icon={Stethoscope} iconClassName="text-blue-500" />
                <StatCard title="Nurses"      value={stats.nurses}         icon={Syringe}     iconClassName="text-pink-500" />
                <StatCard title="ASHAs"       value={stats.ashas}          icon={User2}       iconClassName="text-emerald-500" />
                <StatCard title="Total Staff" value={stats.totalStaff}     icon={User2}       iconClassName="text-violet-500" />
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Staff Distribution Bar Chart */}
                <ChartCard title="Staff by Role" empty={!filteredAndSortedStaffData.length}>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart 
                            data={filteredAndSortedStaffData} 
                            layout="vertical" 
                            margin={{ top: 5, right: 20, bottom: 20, left: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                type="number" 
                                allowDecimals={false} 
                                tick={{ fontSize: 11 }} 
                            />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                width={70}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                                dataKey="value" 
                                name="Staff Count" 
                                fill={PRIMARY_COLOR}
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Patient Distribution by Hospital Chart */}
                <ChartCard title="Patients per Hospital" empty={!filteredAndSortedHospitalData.length}>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart 
                            data={filteredAndSortedHospitalData} 
                            layout="vertical" 
                            margin={{ left: 4 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis 
                                type="number" 
                                allowDecimals={false} 
                                tick={{ fontSize: 11 }} 
                            />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                width={120} 
                                tick={<TruncatedLabel maxLength={15} />}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                                dataKey="patients" 
                                name="Patients" 
                                fill={PRIMARY_COLOR_LIGHT}
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ASHA Coverage Stacked Bar Chart */}
            {stats.ashaCoverageData.length > 0 && (
                <ChartCard title="ASHA Coverage by Hospital">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart 
                            data={stats.ashaCoverageData.filter(d => (d.covered + d.uncovered) > 0)} 
                            margin={{ bottom: 16 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 11 }} 
                                angle={-20}
                                textAnchor="end" 
                                interval={0} 
                            />
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