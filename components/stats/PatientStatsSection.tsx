'use client'

import { memo, useCallback, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './StatCard'
import {
    Users, Heart, Skull, HelpCircle, Activity, UserCheck, UserX,
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    LineChart, Line, LabelList,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts/types/polar/Pie'
import { RegistrationAnalytics } from '@/components/analytics/RegistrationAnalytics'
import type { Patient } from '@/schema/patient'

// ── Updated Color Configuration ──────────────────────────────────────────────────────
// Professional healthcare palette with better differentiation

const CHART_COLORS = {
    categorical: [
        '#2E86AB',  // Stronger teal-blue (primary)
        '#D64933',  // Muted terracotta (high contrast)
        '#3C9E6D',  // Sage green (health-positive)
        '#9C5288',  // Dusty plum (distinct)
        '#F18F01',  // Warm amber (cautionary)
        '#577590',  // Steel blue (secondary)
        '#E06D53',  // Coral (warm accent)
        '#4B8B7C',  // Seaweed green
        '#C45C66',  // Rosewood
        '#5E6B8C',  // Periwinkle grey
    ],
    status: {
        Alive: '#3C9E6D',      // Vibrant sage (life/health)
        'Not Alive': '#C45C66', // Muted rose (dignified)
        'Not Available': '#8C919D', // Neutral grey
    } as Record<string, string>,
    gender: {
        Male: '#2E86AB',       // Medical blue (trust)
        Female: '#9C5288',     // Plum (professional)
        Other: '#577590',      // Steel blue (inclusive)
    } as Record<string, string>,
    // Clinically meaningful progression with better distinction
    stage: {
        'Stage I': '#3C9E6D',   // Green (early/less severe)
        'Stage II': '#4B8B7C',  // Teal (intermediate)
        'Stage III': '#F18F01', // Amber (warning/progression)
        'Stage IV': '#D64933',  // Terracotta (advanced/concerning)
    } as Record<string, string>,
    stageFallback: '#8C919D',
    trendLine: '#2E86AB',      // Consistent with primary
    grid: '#E8EDF0',
    axis: '#6B7280',           // Slightly darker for readability
    success: '#3C9E6D',
    warning: '#F18F01',
    danger: '#D64933',
} as const

// Keep legacy exports so any other file that imports COLORS / STATUS_COLORS /
// GENDER_COLORS doesn't break. Do NOT remove these.
export const COLORS = CHART_COLORS.categorical
export const STATUS_COLORS = CHART_COLORS.status
export const GENDER_COLORS = CHART_COLORS.gender

// ── Utility helpers ──────────────────────────────────────────────────────────

const toTitleCase = (str: string): string =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())

const getCategoricalColor = (index: number): string =>
    CHART_COLORS.categorical[index % CHART_COLORS.categorical.length]

const getStageColor = (name: string): string =>
    CHART_COLORS.stage[name] ?? CHART_COLORS.stageFallback

// ── Medical Terminology Normalization ────────────────────────────────────────
// Maps raw / abbreviated medical strings → canonical display form.
// Covers common short-forms used in Indian healthcare records.

const MEDICAL_TERM_MAP: Record<string, string> = {
    'ca': 'Carcinoma',
    'ca breast': 'Carcinoma Breast',
    'ca cervix': 'Carcinoma Cervix',
    'ca lung': 'Carcinoma Lung',
    'ca colon': 'Carcinoma Colon',
    'ca rectum': 'Carcinoma Rectum',
    'ca stomach': 'Carcinoma Stomach',
    'ca ovary': 'Carcinoma Ovary',
    'ca oral': 'Carcinoma Oral Cavity',
    'ca esophagus': 'Carcinoma Esophagus',
    'ca thyroid': 'Carcinoma Thyroid',
    'ca bladder': 'Carcinoma Bladder',
    'ca prostate': 'Carcinoma Prostate',
    'ca liver': 'Carcinoma Liver',
    'hcc': 'Hepatocellular Carcinoma',
    'nsclc': 'Non-Small Cell Lung Cancer',
    'sclc': 'Small Cell Lung Cancer',
    'crc': 'Colorectal Carcinoma',
    'aml': 'Acute Myeloid Leukemia',
    'all': 'Acute Lymphoblastic Leukemia',
    'cml': 'Chronic Myeloid Leukemia',
    'cll': 'Chronic Lymphocytic Leukemia',
    'nhl': 'Non-Hodgkin Lymphoma',
    'hl': "Hodgkin's Lymphoma",
    'mm': 'Multiple Myeloma',
    'rcc': 'Renal Cell Carcinoma',
    'gist': 'Gastrointestinal Stromal Tumor',
    'gbc': 'Gallbladder Carcinoma',
    'cca': 'Cholangiocarcinoma',
    'net': 'Neuroendocrine Tumor',
    'stage 0': 'Stage 0',
    'stage i': 'Stage I',
    'stage 1': 'Stage I',
    'stage ii': 'Stage II',
    'stage 2': 'Stage II',
    'stage iii': 'Stage III',
    'stage 3': 'Stage III',
    'stage iv': 'Stage IV',
    'stage 4': 'Stage IV',
    'apl': 'APL Card',
    'bpl': 'BPL Card',
    'aay': 'Antyodaya Card',
    'pmjay': 'PM-JAY (Ayushman)',
    'esi': 'ESI',
    'cghs': 'CGHS',
    'echs': 'ECHS',
    'na': 'Not Available',
    'n/a': 'Not Available',
}

export const normalizeMedicalTerm = (raw: string): string => {
    const trimmed = raw.trim()
    const lower = trimmed.toLowerCase()
    return MEDICAL_TERM_MAP[lower] ?? toTitleCase(trimmed)
}

// ── Deduplication ────────────────────────────────────────────────────────────

interface DataPoint { name: string; value: number }

export function dedupeData(data: DataPoint[]): DataPoint[] {
    const map = new Map<string, number>()
    for (const point of data) {
        const key = normalizeMedicalTerm(point.name)
        map.set(key, (map.get(key) ?? 0) + point.value)
    }
    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
}

// ── TypeScript Interfaces ─────────────────────────────────────────────────────

interface TrendPoint { month: string; count: number }

export interface PatientStats {
    total: number
    alive: number
    deceased: number
    notAvailable: number
    male: number
    female: number
    other: number
    withAsha: number
    withoutAsha: number
    diseaseData: DataPoint[]
    stageData: DataPoint[]
    insuranceData: DataPoint[]
    rationData: DataPoint[]
    registrationTrend: TrendPoint[]
    statusData: DataPoint[]
    genderData: DataPoint[]
}

// ── Shared primitives ─────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180
const GRID_DASH = '3 3' as const

const getAxisFontSize = (itemCount: number): number => {
    if (itemCount <= 5) return 12
    if (itemCount <= 10) return 11
    return 10
}

// ── Custom Axis Ticks (truncation + native SVG title tooltip) ─────────────────

interface CustomYAxisTickProps {
    x?: number; y?: number
    payload?: { value: string }
    maxWidth?: number; fontSize?: number
}

const CustomYAxisTick = memo(({
    x = 0, y = 0, payload, maxWidth = 116, fontSize = 11,
}: CustomYAxisTickProps) => {
    if (!payload) return null
    const label = normalizeMedicalTerm(payload.value)
    const charLimit = Math.floor(maxWidth / (fontSize * 0.62))
    const truncated = label.length > charLimit ? label.slice(0, charLimit - 1) + '…' : label
    return (
        <g transform={`translate(${x},${y})`}>
            <title>{label}</title>
            <text x={0} y={0} dy={4} textAnchor="end"
                fill={CHART_COLORS.axis} fontSize={fontSize}>
                {truncated}
            </text>
        </g>
    )
})
CustomYAxisTick.displayName = 'CustomYAxisTick'

interface CustomXAxisTickProps {
    x?: number; y?: number
    payload?: { value: string }
    maxWidth?: number; fontSize?: number
}

const CustomXAxisTick = memo(({
    x = 0, y = 0, payload, maxWidth = 60, fontSize = 11,
}: CustomXAxisTickProps) => {
    if (!payload) return null
    const label = normalizeMedicalTerm(payload.value)
    const charLimit = Math.floor(maxWidth / (fontSize * 0.6))
    const truncated = label.length > charLimit ? label.slice(0, charLimit - 1) + '…' : label
    return (
        <g transform={`translate(${x},${y})`}>
            <title>{label}</title>
            <text x={0} y={0} dy={12} textAnchor="end"
                fill={CHART_COLORS.axis} fontSize={fontSize}
                transform="rotate(-30)">
                {truncated}
            </text>
        </g>
    )
})
CustomXAxisTick.displayName = 'CustomXAxisTick'

// ── Pie percent label ─────────────────────────────────────────────────────────

function PiePercentLabel({
    cx = 0, cy = 0, midAngle = 0,
    innerRadius = 0, outerRadius = 0,
    percent = 0, value,
}: PieLabelRenderProps) {
    if (percent < 0.06) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = (cx as number) + r * Math.cos(-midAngle * RADIAN)
    const y = (cy as number) + r * Math.sin(-midAngle * RADIAN)
    return (
        <text x={x} y={y} fill="white" textAnchor="middle"
            dominantBaseline="central" fontSize={11} fontWeight={600}>
            {value}
        </text>
    )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface ChartTooltipProps {
    active?: boolean
    payload?: Array<{ name: string; value: number; color?: string; fill?: string }>
    label?: string | number
}

const ChartTooltip = memo(({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md text-xs">
            {label != null && (
                <p className="font-semibold text-foreground mb-1">{String(label)}</p>
            )}
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color ?? entry.fill ?? CHART_COLORS.axis }}>
                    {toTitleCase(entry.name)}: <span className="font-bold">{entry.value}</span>
                </p>
            ))}
        </div>
    )
})
ChartTooltip.displayName = 'ChartTooltip'

// ── Color helpers ─────────────────────────────────────────────────────────────

const darkenColor = (color: string, percent: number): string => {
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        return `#${Math.floor(r * (1 - percent)).toString(16).padStart(2, '0')}${Math.floor(g * (1 - percent)).toString(16).padStart(2, '0')}${Math.floor(b * (1 - percent)).toString(16).padStart(2, '0')}`
    }
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
    if (m) {
        return `rgb(${Math.floor(+m[1] * (1 - percent))}, ${Math.floor(+m[2] * (1 - percent))}, ${Math.floor(+m[3] * (1 - percent))})`
    }
    return color
}

// ── Reusable Chart Wrappers ───────────────────────────────────────────────────

interface HorizontalBarChartProps {
    data: DataPoint[]
    colorFn?: (name: string, index: number) => string
    height?: number
    yAxisWidth?: number
}

const HorizontalBarChart = memo(({
    data,
    colorFn = (_, i) => getCategoricalColor(i),
    height,
    yAxisWidth = 124,
}: HorizontalBarChartProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const computedHeight = height ?? Math.min(Math.max(data.length * 36 + 24, 200), 520)
    const fontSize = getAxisFontSize(data.length)

    return (
        <ResponsiveContainer width="100%" height={computedHeight}>
            <BarChart data={data} layout="vertical"
                margin={{ top: 4, right: 44, bottom: 4, left: 4 }}
                barCategoryGap={8}>
                <CartesianGrid strokeDasharray={GRID_DASH} horizontal={false}
                    stroke={CHART_COLORS.grid} />
                <XAxis type="number" allowDecimals={false}
                    tick={{ fontSize, fill: CHART_COLORS.axis }}
                    axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={yAxisWidth}
                    tick={<CustomYAxisTick maxWidth={yAxisWidth - 8} fontSize={fontSize} />}
                    axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" name="Patients"
                    radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
                    {data.map((entry, i) => {
                        const base = colorFn(normalizeMedicalTerm(entry.name), i)
                        const fill = hoveredIndex === i ? darkenColor(base, 0.2) : base
                        return (
                            <Cell key={entry.name} fill={fill}
                                style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)} />
                        )
                    })}
                    <LabelList dataKey="value" position="right"
                        style={{ fontSize: 11, fill: CHART_COLORS.axis, fontWeight: 600 }}
                        offset={5} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
})
HorizontalBarChart.displayName = 'HorizontalBarChart'

interface VerticalBarProps {
    data: DataPoint[]
    colorFn?: (name: string, index: number) => string
    height?: number
}

const VerticalBarChart = memo(({
    data,
    colorFn = (_, i) => getCategoricalColor(i),
    height = 270,
}: VerticalBarProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const fontSize = getAxisFontSize(data.length)
    const maxLabelLen = data.reduce((m, d) => Math.max(m, normalizeMedicalTerm(d.name).length), 0)
    const bottomMargin = Math.min(Math.max(maxLabelLen * 3.5, 36), 72)

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}
                margin={{ top: 24, right: 12, bottom: bottomMargin, left: 4 }}>
                <CartesianGrid strokeDasharray={GRID_DASH} vertical={false}
                    stroke={CHART_COLORS.grid} />
                <XAxis dataKey="name"
                    tick={<CustomXAxisTick fontSize={fontSize} />}
                    interval={0} axisLine={false} tickLine={false}
                    height={bottomMargin + 8} />
                <YAxis allowDecimals={false}
                    tick={{ fontSize, fill: CHART_COLORS.axis }}
                    axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" name="Patients"
                    radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false}>
                    {data.map((entry, i) => {
                        const base = colorFn(normalizeMedicalTerm(entry.name), i)
                        const fill = hoveredIndex === i ? darkenColor(base, 0.2) : base
                        return (
                            <Cell key={entry.name} fill={fill}
                                style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)} />
                        )
                    })}
                    <LabelList dataKey="value" position="top"
                        style={{ fontSize: 11, fill: CHART_COLORS.axis, fontWeight: 600 }}
                        offset={5} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
})
VerticalBarChart.displayName = 'VerticalBarChart'

interface DonutChartProps {
    data: DataPoint[]
    colorFn: (name: string, index: number) => string
    innerRadius?: number
    outerRadius?: number
    height?: number
}

const DonutChart = memo(({
    data, colorFn,
    innerRadius = 0, outerRadius = 80, height = 220,
}: DonutChartProps) => (
    <ResponsiveContainer width="100%" height={height}>
        <PieChart>
            <Pie data={data} cx="50%" cy="45%"
                innerRadius={innerRadius} outerRadius={outerRadius}
                dataKey="value" labelLine={false}
                label={PiePercentLabel} nameKey="name">
                {data.map((entry, i) => (
                    <Cell key={entry.name} fill={colorFn(normalizeMedicalTerm(entry.name), i)} />
                ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
                formatter={(value) => normalizeMedicalTerm(String(value))}
                wrapperStyle={{ fontSize: 12, color: CHART_COLORS.axis }}
                iconType="circle" iconSize={8} />
        </PieChart>
    </ResponsiveContainer>
))
DonutChart.displayName = 'DonutChart'

interface TrendLineChartProps { data: TrendPoint[]; height?: number }

const TrendLineChart = memo(({ data, height = 200 }: TrendLineChartProps) => (
    <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 16, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray={GRID_DASH} vertical={false}
                stroke={CHART_COLORS.grid} />
            <XAxis dataKey="month"
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false}
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="count" name="Registrations"
                stroke={CHART_COLORS.trendLine} strokeWidth={2.5}
                dot={{ fill: CHART_COLORS.trendLine, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}>
                <LabelList dataKey="count" position="top"
                    style={{ fontSize: 10, fill: CHART_COLORS.axis, fontWeight: 600 }} />
            </Line>
        </LineChart>
    </ResponsiveContainer>
))
TrendLineChart.displayName = 'TrendLineChart'

// ── ChartCard ─────────────────────────────────────────────────────────────────

interface ChartCardProps {
    title: string
    children: React.ReactNode
    empty?: boolean
    className?: string
}

const ChartCard = memo(({ title, children, empty = false, className }: ChartCardProps) => (
    <Card className={className}>
        <CardHeader className="px-5 py-4">
            <CardTitle className="text-sm font-semibold tracking-wide text-foreground/80">
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
            {empty ? (
                <p className="py-10 text-center text-xs text-muted-foreground">No data available</p>
            ) : children}
        </CardContent>
    </Card>
))
ChartCard.displayName = 'ChartCard'

// ── Main Component ────────────────────────────────────────────────────────────

interface PatientStatsSectionProps {
    stats: PatientStats
    patients: Patient[]
    // NOTE: `role` prop accepted but not used here — reserved for future
    // role-based visibility (e.g. hide financials from non-admin).
    role?: string
}

export function PatientStatsSection({ stats, patients }: PatientStatsSectionProps) {
    const pct = useCallback(
        (n: number) => (stats.total ? `${((n / stats.total) * 100).toFixed(0)}%` : '0%'),
        [stats.total],
    )

    // Deduplicate + normalize all categorical data — memoized for performance
    const diseaseData = useMemo(() => dedupeData(stats.diseaseData), [stats.diseaseData])
    const stageData = useMemo(() => {
        const deduped = dedupeData(stats.stageData).map(d => ({ ...d, name: normalizeMedicalTerm(d.name) }))
        const order = ['Stage 0', 'Stage I', 'Stage II', 'Stage III', 'Stage IV']
        return deduped.sort((a, b) => {
            const ia = order.indexOf(a.name) === -1 ? Number.MAX_SAFE_INTEGER : order.indexOf(a.name)
            const ib = order.indexOf(b.name) === -1 ? Number.MAX_SAFE_INTEGER : order.indexOf(b.name)
            if (ia !== ib) return ia - ib
            return b.value - a.value
        })
    }, [stats.stageData])
    const insuranceData = useMemo(() => dedupeData(stats.insuranceData), [stats.insuranceData])
    const rationData = useMemo(() => dedupeData(stats.rationData), [stats.rationData])

    // Stable color resolvers
    const statusColorFn = useCallback(
        (name: string) => CHART_COLORS.status[name] ?? CHART_COLORS.stageFallback, [],
    )
    const genderColorFn = useCallback(
        (name: string) => CHART_COLORS.gender[name] ?? CHART_COLORS.stageFallback, [],
    )
    const stageColorFn = useCallback(
        (name: string, index: number) => {
            const normalized = normalizeMedicalTerm(name)
            const mapped = CHART_COLORS.stage[normalized]
            if (mapped) return mapped
            return getCategoricalColor(index)
        }, [],
    )

    const progressiveRed: Record<string, string> = {
        'Stage 0': '#F2D0D0',
        'Stage I': '#E6A8A8',
        'Stage II': '#D47B7B',
        'Stage III': '#BD4B4B',
        'Stage IV': '#A12F2F'
    }
    const cancerStageColorFn = useCallback((name: string, _index: number) => {
        const raw = String(name || '').toLowerCase()
        const m = raw.match(/stage\s*(iv|iii|ii|i|0|[1-4])/) // capture roman, zero or number
        let key: string | undefined
        if (m) {
            const token = m[1]
            if (token === '0') key = 'Stage 0'
            else if (token === 'i' || token === '1') key = 'Stage I'
            else if (token === 'ii' || token === '2') key = 'Stage II'
            else if (token === 'iii' || token === '3') key = 'Stage III'
            else if (token === 'iv' || token === '4') key = 'Stage IV'
        }
        if (!key) {
            const normalized = normalizeMedicalTerm(name)
            if (normalized && progressiveRed[normalized]) key = normalized
        }
        return key ? progressiveRed[key] : CHART_COLORS.stageFallback
    }, [])

    const rationColorFn = useCallback((name: string) => {
        const normalized = normalizeMedicalTerm(name).toLowerCase()
        if (/yellow/.test(normalized)) return CHART_COLORS.warning
        if (/red/.test(normalized)) return CHART_COLORS.danger
        return CHART_COLORS.stageFallback
    }, [])

    return (
        <div className="space-y-5">

            {/* ── KPI Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard title="Total Patients" value={stats.total} icon={Users} iconClassName="text-primary" />
                <StatCard title="Alive" value={stats.alive} icon={Heart} iconClassName="text-emerald-600" subtitle={`${pct(stats.alive)} of total`} />
                <StatCard title="Deceased" value={stats.deceased} icon={Skull} iconClassName="text-rose-600" subtitle={`${pct(stats.deceased)} of total`} />
                <StatCard title="Not Available" value={stats.notAvailable} icon={HelpCircle} iconClassName="text-slate-500" />
                <StatCard title="Male Patients" value={stats.male} icon={Activity} iconClassName="text-blue-600" />
                <StatCard title="Female Patients" value={stats.female} icon={Activity} iconClassName="text-pink-600" />
                <StatCard title="ASHA Assigned" value={stats.withAsha} icon={UserCheck} iconClassName="text-teal-600" subtitle={`${pct(stats.withAsha)} coverage`} />
                <StatCard title="No ASHA Assigned" value={stats.withoutAsha} icon={UserX} iconClassName="text-amber-600" />
            </div>

            {/* ── Row 1: Status + Gender ────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ChartCard title="Patient Status" empty={!stats.statusData.length}>
                    <DonutChart data={stats.statusData} colorFn={statusColorFn} height={230} />
                </ChartCard>

                <ChartCard title="Gender Distribution" empty={!stats.genderData.length}>
                    <DonutChart data={stats.genderData} colorFn={genderColorFn} height={230} />
                </ChartCard>
            </div>

            {/* ── Registration Analytics (unchanged — owned by RegistrationAnalytics) ── */}
            <RegistrationAnalytics patients={patients} />

            {/* ── Row 2: Disease + Stage ────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ChartCard title="Disease Distribution" empty={!diseaseData.length}>
                    <HorizontalBarChart
                        data={diseaseData}
                        colorFn={(_, i) => getCategoricalColor(i)}
                        yAxisWidth={128}
                    />
                </ChartCard>

                <ChartCard title="Cancer Stage" empty={!stageData.length}>
                    <VerticalBarChart
                        data={stageData}
                        colorFn={cancerStageColorFn}
                        height={270}
                    />
                </ChartCard>
            </div>

            {/* ── Row 3: Insurance + Ration ─────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ChartCard title="Insurance Coverage" empty={!insuranceData.length}>
                    <DonutChart
                        data={insuranceData}
                        colorFn={(_, i) => getCategoricalColor(i + 3)}
                        innerRadius={52}
                        outerRadius={82}
                        height={220}
                    />
                </ChartCard>

                <ChartCard title="Ration Card Type" empty={!rationData.length}>
                    <VerticalBarChart
                        data={rationData}
                        colorFn={rationColorFn}
                        height={220}
                    />
                </ChartCard>
            </div>

            {/* ── Registration Trend ────────────────────────────────────── */}
            <ChartCard title="New Registrations — Last 12 Months">
                <TrendLineChart data={stats.registrationTrend} height={210} />
            </ChartCard>

        </div>
    )
}