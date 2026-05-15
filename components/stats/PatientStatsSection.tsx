'use client'

import { memo, useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './StatCard'
import {
    Users, Heart, Skull, HelpCircle,
    UserCheck, UserX, Activity,
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    LineChart, Line, LabelList,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { PieLabelRenderProps } from 'recharts/types/polar/Pie'

// ── Color Configuration ──────────────────────────────────────────────────────

/**
 * Central color palette for the healthcare dashboard.
 * Uses muted, professional tones — no neon or high-saturation hues.
 */
const CHART_COLORS = {
    // Sequential palette for generic categorical charts (disease, insurance, ration)
    categorical: [
        '#4a90a4', // steel teal
        '#6a9fb5', // sky slate
        '#7aab8a', // sage green
        '#8fa3b1', // cool blue-gray
        '#a0b4a0', // muted sage
        '#b0c4cc', // pale steel
        '#9ab0b8', // dusty blue
        '#7d9fa8', // slate teal
        '#8aaa96', // fern
        '#a8bfc4', // silver teal
    ],

    // Semantic colors for patient status
    status: {
        Alive: '#5a9e7a',         // calm green
        'Not Alive': '#b07070',   // muted rose-red
        'Not Available': '#9aa3ad', // cool gray
    } as Record<string, string>,

    // Semantic colors for gender
    gender: {
        Male: '#5a84b0',    // steel blue
        Female: '#a07898',  // dusty mauve
        Other: '#8fa3a8',   // neutral slate
    } as Record<string, string>,

    /**
     * Semantic stage colors — convey clinical progression clearly.
     * Light/hopeful → dark/serious as stage advances.
     */
    stage: {
        'Stage I': '#6aab7e', // soft green  — early, good prognosis
        'Stage Ii': '#4a9aaa', // teal        — moderate
        'Stage Iii': '#c08840', // amber        — advanced
        'Stage Iv': '#b06060', // soft rose-red — metastatic
        // fallback keys for alternate input capitalizations
        'Stage 1': '#6aab7e',
        'Stage 2': '#4a9aaa',
        'Stage 3': '#c08840',
        'Stage 4': '#b06060',
    } as Record<string, string>,

    stageFallback: '#8fa3ad', // cool gray for Unknown/Other

    // Trend line
    trendLine: '#4a90a4',

    // Grid & axis
    grid: '#e8edf0',
    axis: '#7a8c96',
} as const

// ── Utility ──────────────────────────────────────────────────────────────────

/** Convert any string to Title Case */
const toTitleCase = (str: string): string =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())

/** Pick a stage color; fall back to gray for unknown stages */
const getStageColor = (name: string): string =>
    CHART_COLORS.stage[name] ?? CHART_COLORS.stageFallback

/** Pick a categorical palette color by index */
const getCategoricalColor = (index: number): string =>
    CHART_COLORS.categorical[index % CHART_COLORS.categorical.length]

// ── TypeScript Interfaces ─────────────────────────────────────────────────────

interface DataPoint {
    name: string
    value: number
}

interface TrendPoint {
    month: string
    count: number
}

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

interface TooltipEntry {
    name: string
    value: number
    color?: string
    fill?: string
}



// ── Shared Chart Primitives ───────────────────────────────────────────────────

const RADIAN = Math.PI / 180

/**
 * Renders a count label inside pie/donut slices.
 * Skips slices smaller than 6% to avoid overlap.
 * Must be a plain function (not memo) so Recharts accepts it as the `label` prop.
 */
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
        <text
            x={x} y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
        >
            {value}
        </text>
    )
}

/** Shared tooltip rendered by Recharts on hover */
interface ChartTooltipProps {
    active?: boolean
    payload?: Array<{ name: string; value: number; color?: string; fill?: string }>
    label?: string | number
}

const ChartTooltip = memo(({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md text-xs">
            {label != null && <p className="font-semibold text-foreground mb-1">{String(label)}</p>}
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color ?? entry.fill ?? CHART_COLORS.axis }}>
                    {toTitleCase(entry.name)}:{' '}
                    <span className="font-bold">{entry.value}</span>
                </p>
            ))}
        </div>
    )
})
ChartTooltip.displayName = 'ChartTooltip'

/** Shared axis tick styles to avoid repetition */
const AXIS_TICK = { fontSize: 11, fill: CHART_COLORS.axis } as const
const GRID_DASH = '3 3' as const

// ── Reusable Chart Wrappers ───────────────────────────────────────────────────

interface VerticalBarChartProps {
    data: DataPoint[]
    colorFn?: (name: string, index: number) => string
    height?: number
    yAxisWidth?: number
}

/**
 * Horizontal (layout="vertical") bar chart for long category names.
 * Renders each bar in a given color and shows the value label at the end.
 * Tooltip ONLY shows when hovering the actual bar.
 */
const HorizontalBarChart = memo(({
    data,
    colorFn = (_, i) => getCategoricalColor(i),
    height = 260,
    yAxisWidth = 120,
}: VerticalBarChartProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tooltipData, setTooltipData] = useState<{ name: string; value: number; x: number; y: number } | null>(null);

    // Custom tooltip component that shows on bar hover only
    const CustomFloatingTooltip = () => {
        if (!tooltipData) return null;

        return (
            <div
                className="fixed rounded-lg border bg-background p-2 shadow-md text-xs z-50"
                style={{
                    left: tooltipData.x + 10,
                    top: tooltipData.y - 30,
                    pointerEvents: 'none',
                }}
            >
                <p className="font-medium mb-1">{tooltipData.name}</p>
                <p className="font-semibold">Patients: {tooltipData.value}</p>
            </div>
        );
    };

    // Empty component to disable default tooltip (FIX: use a function, not JSX)
    const EmptyTooltip = () => null;

    return (
        <>
            <CustomFloatingTooltip />
            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 4, right: 40, bottom: 4, left: 4 }}
                    barCategoryGap={8}
                >
                    <CartesianGrid strokeDasharray={GRID_DASH} horizontal={false} stroke={CHART_COLORS.grid} />
                    <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={yAxisWidth}
                        tick={AXIS_TICK}
                        tickFormatter={toTitleCase}
                        axisLine={false}
                        tickLine={false}
                    />
                    {/* 
                        FIXED: content expects a component function, not JSX.
                        Use EmptyTooltip component to completely hide default tooltip
                    */}
                    <Tooltip content={EmptyTooltip} cursor={{ fill: 'transparent' }} active={false} />

                    <Bar
                        dataKey="value"
                        name="Patients"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={22}
                    >
                        {data.map((entry, i) => {
                            const originalColor = colorFn(entry.name, i);
                            const isHovered = hoveredIndex === i;
                            const hoverColor = isHovered ? darkenColor(originalColor, 0.2) : originalColor;

                            return (
                                <Cell
                                    key={entry.name}
                                    fill={hoverColor}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                    onMouseEnter={(event) => {
                                        setHoveredIndex(i);
                                        // Get mouse position for custom tooltip
                                        const rect = (event.target as SVGGElement).getBoundingClientRect();
                                        setTooltipData({
                                            name: entry.name,
                                            value: entry.value,
                                            x: rect.right,
                                            y: rect.top,
                                        });
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredIndex(null);
                                        setTooltipData(null);
                                    }}
                                />
                            );
                        })}
                        <LabelList
                            dataKey="value"
                            position="right"
                            style={{ fontSize: 11, fill: CHART_COLORS.axis, fontWeight: 600 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </>
    );
});
HorizontalBarChart.displayName = 'HorizontalBarChart';

// Helper function to darken/lighten colors
const darkenColor = (color: string, percent: number): string => {
    // Handle hex colors
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        const darkenedR = Math.floor(r * (1 - percent));
        const darkenedG = Math.floor(g * (1 - percent));
        const darkenedB = Math.floor(b * (1 - percent));

        return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
    }

    // Handle rgb/rgba colors
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);

        const darkenedR = Math.floor(r * (1 - percent));
        const darkenedG = Math.floor(g * (1 - percent));
        const darkenedB = Math.floor(b * (1 - percent));

        return `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
    }

    // Fallback: return original color
    return color;
};

interface VerticalBarProps {
    data: DataPoint[]
    colorFn?: (name: string, index: number) => string
    height?: number
}

/**
 * Vertical bar chart for shorter category names (stages, ration cards, etc.).
 * Rotates X-axis labels to prevent overlap and adds top value labels.
 */
const VerticalBarChart = memo(({
    data,
    colorFn = (_, i) => getCategoricalColor(i),
    height = 260,
}: VerticalBarProps) => (
    <ResponsiveContainer width="100%" height={height}>
        <BarChart
            data={data}
            margin={{ top: 24, right: 12, bottom: 36, left: 4 }}
        >
            <CartesianGrid strokeDasharray={GRID_DASH} vertical={false} stroke={CHART_COLORS.grid} />
            <XAxis
                dataKey="name"
                tick={AXIS_TICK}
                angle={-30}
                textAnchor="end"
                interval={0}
                tickFormatter={toTitleCase}
                axisLine={false}
                tickLine={false}
                height={52}
            />
            <YAxis
                allowDecimals={false}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="Patients" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((entry, i) => (
                    <Cell key={entry.name} fill={colorFn(entry.name, i)} />
                ))}
                <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fontSize: 11, fill: CHART_COLORS.axis, fontWeight: 600 }}
                />
            </Bar>
        </BarChart>
    </ResponsiveContainer>
))
VerticalBarChart.displayName = 'VerticalBarChart'

interface DonutChartProps {
    data: DataPoint[]
    colorFn: (name: string, index: number) => string
    innerRadius?: number
    outerRadius?: number
    height?: number
}

/**
 * Pie / donut chart with inline value labels and a legend.
 * `innerRadius > 0` renders a donut; `0` renders a full pie.
 */
const DonutChart = memo(({
    data,
    colorFn,
    innerRadius = 0,
    outerRadius = 80,
    height = 220,
}: DonutChartProps) => (
    <ResponsiveContainer width="100%" height={height}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                dataKey="value"
                labelLine={false}
                label={PiePercentLabel}
                nameKey="name"
            >
                {data.map((entry, i) => (
                    <Cell key={entry.name} fill={colorFn(entry.name, i)} />
                ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
                formatter={(value) => toTitleCase(String(value))}
                wrapperStyle={{ fontSize: 12, color: CHART_COLORS.axis }}
                iconType="circle"
                iconSize={8}
            />
        </PieChart>
    </ResponsiveContainer>
))
DonutChart.displayName = 'DonutChart'

interface TrendLineChartProps {
    data: TrendPoint[]
    height?: number
}

/** Sparkline-style line chart for registration trend */
const TrendLineChart = memo(({ data, height = 200 }: TrendLineChartProps) => (
    <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 16, right: 16, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray={GRID_DASH} vertical={false} stroke={CHART_COLORS.grid} />
            <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line
                type="monotone"
                dataKey="count"
                name="Registrations"
                stroke={CHART_COLORS.trendLine}
                strokeWidth={2.5}
                dot={{ fill: CHART_COLORS.trendLine, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
            >
                <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fontSize: 10, fill: CHART_COLORS.axis, fontWeight: 600 }}
                />
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
    role: string
}

export function PatientStatsSection({ stats }: PatientStatsSectionProps) {
    const pct = useCallback(
        (n: number) => (stats.total ? `${((n / stats.total) * 100).toFixed(0)}%` : '0%'),
        [stats.total],
    )

    // Color resolvers passed to wrappers
    const statusColorFn = useCallback(
        (name: string) => CHART_COLORS.status[name] ?? CHART_COLORS.stageFallback,
        [],
    )
    const genderColorFn = useCallback(
        (name: string) => CHART_COLORS.gender[name] ?? CHART_COLORS.stageFallback,
        [],
    )
    const stageColorFn = useCallback(
        (name: string) => getStageColor(toTitleCase(name)),
        [],
    )

    return (
        <div className="space-y-5">

            {/* ── KPI Cards — 2 rows × 4 cols ───────────────────── */}
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

            {/* ── Row 1: Status pie + Gender pie ────────────────── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ChartCard title="Patient Status">
                    <DonutChart
                        data={stats.statusData}
                        colorFn={statusColorFn}
                        height={230}
                    />
                </ChartCard>

                <ChartCard title="Gender Distribution">
                    <DonutChart
                        data={stats.genderData}
                        colorFn={genderColorFn}
                        height={230}
                    />
                </ChartCard>
            </div>

            {/* ── Row 2: Disease bar + Stage bar ────────────────── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ChartCard title="Disease Distribution" empty={!stats.diseaseData.length}>
                    <HorizontalBarChart
                        data={stats.diseaseData}
                        colorFn={(_, i) => getCategoricalColor(i)}
                        height={270}
                        yAxisWidth={120}
                    />
                </ChartCard>

                <ChartCard title="Cancer Stage" empty={!stats.stageData.length}>
                    <VerticalBarChart
                        data={stats.stageData}
                        colorFn={stageColorFn}
                        height={270}
                    />
                </ChartCard>
            </div>

            {/* ── Row 3: Insurance donut + Ration card bar ──────── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ChartCard title="Insurance Coverage">
                    <DonutChart
                        data={stats.insuranceData}
                        colorFn={(_, i) => getCategoricalColor(i + 3)}
                        innerRadius={52}
                        outerRadius={82}
                        height={220}
                    />
                </ChartCard>

                <ChartCard title="Ration Card Type">
                    <VerticalBarChart
                        data={stats.rationData}
                        colorFn={(_, i) => getCategoricalColor(i + 1)}
                        height={220}
                    />
                </ChartCard>
            </div>

            {/* ── Registration trend ────────────────────────────── */}
            <ChartCard title="New Registrations — Last 12 Months">
                <TrendLineChart data={stats.registrationTrend} height={210} />
            </ChartCard>

        </div>
    )
}