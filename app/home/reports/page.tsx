'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTableData } from '../../../hooks/table/useTableData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypographyH2, TypographyMuted } from '@/components/ui/typography'
import {
    Bar,
    BarChart,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6']

export default function ReportsPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const patientsQuery = useTableData({ requiredData: 'patients', enabled: true }) as any
    const ashasQuery = useTableData({ requiredData: 'ashas', enabled: true }) as any
    const doctorsQuery = useTableData({ requiredData: 'doctors', enabled: true }) as any
    const nursesQuery = useTableData({ requiredData: 'nurses', enabled: true }) as any

    const isLoading =
        patientsQuery?.isLoading ||
        ashasQuery?.isLoading ||
        doctorsQuery?.isLoading ||
        nursesQuery?.isLoading

    const isError =
        patientsQuery?.isError ||
        ashasQuery?.isError ||
        doctorsQuery?.isError ||
        nursesQuery?.isError

    const aggregatedData = useMemo(() => {
        if (!patientsQuery?.data) return null

        const patients = patientsQuery.data
        const totalPatients = patients.length

        let activePatients = 0
        let deadCount = 0
        let unknownPatients = 0
        const cancerTypeMap: Record<string, number> = {}

        patients.forEach((p: any) => {
            const status = (p.patientStatus || '').toLowerCase().trim()
            if (status === 'alive') {
                activePatients++
            } else if (status === 'not alive' || status === 'deceased' || status === 'dead') {
                deadCount++
            } else {
                unknownPatients++
            }

            const diseaseList = Array.isArray(p.diseases) ? p.diseases : []
            if (diseaseList.length === 0) {
                cancerTypeMap['Others'] = (cancerTypeMap['Others'] || 0) + 1
            } else {
                diseaseList.forEach((disease: any) => {
                    if (disease) {
                        const formatted = String(disease).trim()
                        cancerTypeMap[formatted] = (cancerTypeMap[formatted] || 0) + 1
                    }
                })
            }
        })

        const statusData = [
            { name: 'Alive', value: activePatients },
            { name: 'Not Alive', value: deadCount },
            { name: 'Unknown', value: unknownPatients },
        ]

        const cancerData = Object.entries(cancerTypeMap).map(([name, count]) => ({
            name,
            count,
        }))

        const doctorCount = doctorsQuery?.data?.length || 0
        const nurseCount = nursesQuery?.data?.length || 0
        const ashaCount = ashasQuery?.data?.length || 0

        const roleData = [
            { name: 'Doctor', entries: doctorCount },
            { name: 'Nurse', entries: nurseCount },
            { name: 'ASHA', entries: ashaCount },
        ]

        return {
            totalPatients,
            activePatients,
            totalSystemEntries: totalPatients + doctorCount + nurseCount + ashaCount,
            statusData,
            cancerData,
            roleData,
        }
    }, [patientsQuery?.data, doctorsQuery?.data, nursesQuery?.data, ashasQuery?.data])

    if (!mounted || isLoading) {
        return (
            <div className="flex h-64 items-center justify-center p-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
        )
    }

    if (isError || !aggregatedData) {
        return (
            <div className="p-4 text-center">
                <TypographyMuted>Failed to fetch metrics from Firestore records.</TypographyMuted>
            </div>
        )
    }

    // Check if all status values are zero
    const hasStatusData = aggregatedData.statusData.some((item) => item.value > 0)

    // Check if there's any role data
    const hasRoleData = aggregatedData.roleData.some((item) => item.entries > 0)

    return (
        <div className="w-full space-y-6 p-4">
            <div>
                <TypographyH2 className="mb-2 text-2xl font-bold">
                    Reports & Dashboards
                </TypographyH2>
                <TypographyMuted>
                    High-level summary statistics aggregated from Firestore records.
                </TypographyMuted>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Patients Registered
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{aggregatedData.totalPatients}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">
                            {aggregatedData.activePatients}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total System Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {aggregatedData.totalSystemEntries}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Patients by Cancer Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative h-64 w-full flex-1">
                        {aggregatedData.cancerData.length === 0 ? (
                            <div className="flex h-full w-full items-center justify-center">
                                <TypographyMuted>No data available</TypographyMuted>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={aggregatedData.cancerData}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <XAxis
                                        dataKey="name"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Patient Vital Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative h-64 w-full flex-1">
                        {!hasStatusData ? (
                            <div className="flex h-full w-full items-center justify-center">
                                <TypographyMuted>No data available</TypographyMuted>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={aggregatedData.statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {aggregatedData.statusData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex flex-col md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Entry Count by Medical Staff Role
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative h-64 w-full flex-1">
                        {!hasRoleData ? (
                            <div className="flex h-full w-full items-center justify-center">
                                <TypographyMuted>No data available</TypographyMuted>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={aggregatedData.roleData}
                                    layout="vertical"
                                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                >
                                    <XAxis
                                        type="number"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="entries"
                                        fill="#8b5cf6"
                                        radius={[0, 4, 4, 0]}
                                        name="Entries"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
