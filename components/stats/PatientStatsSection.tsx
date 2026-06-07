'use client'
import { memo } from 'react'
import { LabelList } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './StatCard'
import {
    Users,
    Heart,
    Activity,
    ShieldCheck,
    UserCheck,
} from 'lucide-react'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts/types/polar/Pie'



const COLORS = [
    '#4ade80',
    '#22d3ee',
    '#f97316',
    '#a78bfa',
    '#fb7185',
    '#fbbf24',
    '#34d399',
    '#60a5fa',
    '#f472b6',
    '#e879f9',
]

const STATUS_COLORS: Record<string, string> = {
    Alive: '#4ade80',
    'Not Alive': '#f87171',
    'Not Available': '#94a3b8',
}

const GENDER_COLORS: Record<string, string> = {
    Male: '#60a5fa',
    Female: '#f472b6',
    Other: '#94a3b8',
}
const CHART_COLORS = {
    axis: '#94a3b8',
}
const RADIAN = Math.PI / 180
const normalizeMedicalTerm = (value: string) => value
interface CustomXAxisTickProps {
    x?: number
    y?: number
    payload?: {
        value: string
    }
    maxWidth?: number
    fontSize?: number
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
        <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
            {label && <p className="mb-1 font-medium">{label}</p>}

            {payload.map((e: any, i: number) => (
                <p key={i} style={{ color: e.color ?? e.fill }}>
                    {e.name}:{' '}
                    <span className="font-semibold">{e.value}</span>
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

const PieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
}: any) => {
    if (percent < 0.06) return null

    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
};
type DataPoint = {
    name: string
    value: number
}

interface DonutChartProps {
    data: DataPoint[]
    colorFn: (name: string, index: number) => string
    innerRadius?: number
    outerRadius?: number
    height?: number
}

interface PatientStats {
    total: number
    alive: number
    deceased: number
    notAvailable: number

    male: number
    female: number
    other: number

    withAsha: number
    withoutAsha: number

    diseaseData: { name: string; value: number }[]
    stageData: { name: string; value: number }[]
    insuranceData: { name: string; value: number }[]
    rationData: { name: string; value: number }[]

    registrationTrend: { month: string; count: number }[]

    statusData: { name: string; value: number }[]
    genderData: { name: string; value: number }[]
}

export function PatientStatsSection({
    stats,
    role,
}: {
    stats: PatientStats
    role: string
}) {
    const pct = (n: number) =>
        stats.total
            ? `${((n / stats.total) * 100).toFixed(0)}%`
            : '0%'

    // ── Patient Trend ─────────────────────────────
    const trendLength = stats.registrationTrend.length
    const lastMonthPatients =
        stats.registrationTrend[trendLength - 2]?.count || 0

    const previousToLastMonthPatients =
        stats.registrationTrend[trendLength - 3]?.count || 0

    const patientTrendPercent =
        previousToLastMonthPatients > 0
            ? (
                  ((lastMonthPatients -
                      previousToLastMonthPatients) /
                      previousToLastMonthPatients) *
                  100
              ).toFixed(0)
            : '0'

    const patientTrendDirection =
        lastMonthPatients >= previousToLastMonthPatients
            ? '↑'
            : '↓'

    const patientTrendMonth =
        stats.registrationTrend[trendLength - 2]?.month || ''

    // ── Insurance Trend ───────────────────────────
    const latestInsurance =
        stats.insuranceData[0]?.value || 0

    const previousInsurance =
        stats.insuranceData[1]?.value || 0

    const insuranceTrendPercent =
        previousInsurance > 0
            ? (
                  ((latestInsurance - previousInsurance) /
                      previousInsurance) *
                  100
              ).toFixed(0)
            : '0'

    const insuranceTrendDirection =
        latestInsurance >= previousInsurance
            ? '↑'
            : '↓'

    const previousMonthLabel =
        stats.registrationTrend[trendLength - 2]?.month ||
        'Previous Month'

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">
                Executive Summary
            </h2>

            {/* ── KPI Cards ───────────────────────── */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    title="Total Patients"
                    value={stats.total}
                    icon={Users}
                    iconClassName="text-primary"
                    trend={`${patientTrendDirection} ${patientTrendPercent}% in ${patientTrendMonth}`}
                />

                {/* Patient Status */}
                <Card>
                    <CardContent className="space-y-4 px-4 py-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Patient Status
                            </p>

                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Active
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {pct(stats.alive)}
                                    </p>
                                </div>

                                <p className="text-lg font-semibold">
                                    {stats.alive}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Deceased
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {pct(stats.deceased)}
                                    </p>
                                </div>

                                <p className="text-lg font-semibold">
                                    {stats.deceased}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gender Distribution */}
                <Card>
                    <CardContent className="space-y-4 px-4 py-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Gender Distribution
                            </p>

                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Male
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {pct(stats.male)}
                                    </p>
                                </div>

                                <p className="text-lg font-semibold">
                                    {stats.male}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Female
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {pct(stats.female)}
                                    </p>
                                </div>

                                <p className="text-lg font-semibold">
                                    {stats.female}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ASHA Coverage */}
                <Card>
                    <CardContent className="space-y-4 px-4 py-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                ASHA Coverage
                            </p>

                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Assigned
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {pct(stats.withAsha)}
                                    </p>
                                </div>

                                <p className="text-lg font-semibold">
                                    {stats.withAsha}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">
                                        Unassigned
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {pct(stats.withoutAsha)}
                                    </p>
                                </div>

                                <p className="text-lg font-semibold">
                                    {stats.withoutAsha}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Insurance */}
                <StatCard
                    title="Insurance Coverage"
                    value={`${pct(latestInsurance)}`}
                    icon={ShieldCheck}
                    iconClassName="text-cyan-500"
                    trend={`${insuranceTrendDirection} ${insuranceTrendPercent}% in ${previousMonthLabel}`}
                />
            </div>

            {/* ── Row 1 ───────────────────────────── */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ChartCard title="Patient Status">
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">

        {/* Donut */}
        <div className="h-[250px] w-full md:w-[45%]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <defs>
                        <linearGradient id="statusGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1e3a8a" />
                        </linearGradient>
                    </defs>

                    <Pie
                        data={stats.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {stats.statusData.map((_, index) => (
                            <Cell
                                key={index}
                                fill={
                                    index === 0
                                        ? 'url(#statusGradient)'
                                        : index === 1
                                            ? '#64748b'
                                            : '#cbd5e1'
                                }
                            />
                        ))}
                    </Pie>

                    {/* Center Content */}
                    <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="currentColor"
                        fontSize="34"
                        fontWeight="700"
                    >
                        {stats.total}
                    </text>

                    <text
                        x="50%"
                        y="60%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#94a3b8"
                        fontSize="13"
                    >
                        Total
                    </text>

                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>

        {/* Status Summary */}
        <div className="w-full space-y-2 md:w-[50%]">
            {stats.statusData.map((item, index) => {
                const percentage = stats.total
                    ? ((item.value / stats.total) * 100).toFixed(1)
                    : '0'

                const dotColor =
                    index === 0
                        ? '#2563eb'
                        : index === 1
                            ? '#64748b'
                            : '#cbd5e1'

                return (
                    <div
                        key={item.name}
                        className="
                            flex items-center justify-between
                            rounded-xl border
                            px-4 py-3
                            transition-all duration-200
                            hover:border-primary/40
                            hover:bg-muted/30
                            hover:shadow-sm
                        "
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: dotColor }}
                            />

                            <span className="font-medium">
                                {item.name}
                            </span>
                        </div>

                        <div className="text-right">
                            <div className="font-semibold">
                                {item.value}
                            </div>

                            <div className="text-xs text-muted-foreground">
                                {percentage}%
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
</ChartCard>

                <ChartCard title="Gender Distribution">
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">

        {/* Donut */}
        <div className="h-[250px] w-full md:w-[45%]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <defs>
                        <linearGradient id="genderGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                    </defs>

                    <Pie
                        data={stats.genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {stats.genderData.map((_, index) => (
                            <Cell
                                key={index}
                                fill={
                                    index === 0
                                        ? 'url(#genderGradient)'
                                        : '#93c5fd'
                                }
                            />
                        ))}
                    </Pie>

                    <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="currentColor"
                        fontSize="34"
                        fontWeight="700"
                    >
                        {stats.male + stats.female + stats.other}
                    </text>

                    <text
                        x="50%"
                        y="60%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#94a3b8"
                        fontSize="13"
                    >
                        Total
                    </text>

                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>

        {/* Breakdown */}
        <div className="w-full space-y-2 md:w-[50%]">
            {stats.genderData.map((item, index) => {
                const percentage =
                    stats.total > 0
                        ? ((item.value / stats.total) * 100).toFixed(1)
                        : '0'

                const color =
                    index === 0
                        ? '#2563eb'
                        : '#93c5fd'

                return (
                    <div
                        key={item.name}
                        className="
                            flex items-center justify-between
                            rounded-xl border
                            px-4 py-3
                            transition-all duration-200
                            hover:border-primary/40
                            hover:bg-muted/30
                            hover:shadow-sm
                        "
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: color }}
                            />

                            <span className="font-medium">
                                {item.name}
                            </span>
                        </div>

                        <div className="text-right">
                            <div className="font-semibold">
                                {item.value}
                            </div>

                            <div className="text-xs text-muted-foreground">
                                {percentage}%
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
</ChartCard>
            </div>

            {/* ── Row 2 ───────────────────────────── */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ChartCard title="Disease Distribution" empty={!stats.diseaseData.length}>
    <ResponsiveContainer width="100%" height={300}>
        <BarChart
            data={[...stats.diseaseData].sort((a, b) => b.value - a.value)}
            layout="vertical"
            margin={{ top: 10, right: 60, left: 10, bottom: 10 }}
        >
            <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                strokeOpacity={0.3}
            />

            <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11 }}
            />

            <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11 }}
            />

            <Tooltip
          formatter={(value: any) => {
            const percentage = stats.total
              ? ((Number(value) / stats.total) * 100).toFixed(1)
              : "0";
            return [`${value} patients (${percentage}%)`, "Patients"];
          }}
        />
            <Bar
                dataKey="value"
                name="Patients"
                radius={[0, 8, 8, 0]}
            >
                {stats.diseaseData.map((_, index) => (
            <Cell key={index} fill="#1e3a8a" /> // dark blue bars
          ))}

                <LabelList
  dataKey="value"
  position="right"
  content={(props) => {
    const { value, x, y, width } = props;
    const percentage = stats.total
      ? ((Number(value) / stats.total) * 100).toFixed(1)
      : "0";
    return (
      <text
        x={Number(x) + Number(width) + 12} // push label outside bar
        y={Number(y) + 12}                 // center vertically
        fill="#64748b"
        fontSize={12}
        fontWeight={600}
        textAnchor="start"                 // align text to left edge
      >
        {`${value} (${percentage}%)`}
      </text>
    );
  }}
/>




                
            </Bar>
        </BarChart>
    </ResponsiveContainer>
</ChartCard>
                <ChartCard title="Cancer Stage" empty={!stats.stageData.length}>
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={stats.stageData} margin={{ bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />

      <XAxis
        dataKey="name"
        tick={{ fontSize: 11 }}
        angle={-25}
        textAnchor="end"
        interval={0}
      />
      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

      <Tooltip
        formatter={(value: any) => {
          const percentage = stats.total
            ? ((Number(value) / stats.total) * 100).toFixed(1)
            : "0";
          return [`${value} patients (${percentage}%)`, "Patients"];
        }}
      />

      <Bar dataKey="value" name="Patients" radius={[4, 4, 0, 0]} fill="#3b82f6">
        <LabelList
          dataKey="value"
          position="top"
          content={(props) => {
            const { value, x, y } = props;
            const percentage = stats.total
              ? ((Number(value) / stats.total) * 100).toFixed(1)
              : "0";
            return (
              <text
                x={Number(x) + 20}
                y={Number(y) - 4}
                fill="#1e40af"
                fontSize={11}
                fontWeight={600}
                textAnchor="middle"
              >
                {`${value} (${percentage}%)`}
              </text>
            );
          }}
        />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</ChartCard>


            </div>

            {/* ── Row 3 ───────────────────────────── */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ChartCard title="Insurance Coverage">
  <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">

    {/* Donut */}
    <div className="h-[250px] w-full md:w-[45%]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="insuranceGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>

          <Pie
            data={stats.insuranceData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={105}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {stats.insuranceData.map((item, index) => (
              <Cell
                key={index}
                fill={
                  index === 0
                    ? 'url(#insuranceGradient)' // Government
                    : index === 1
                      ? '#60a5fa' // None
                      : '#93c5fd' // Private
                }
              />
            ))}
          </Pie>

          {/* Center Content */}
          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            fontSize="34"
            fontWeight="700"
          >
            {stats.total}
          </text>

          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize="13"
          >
            Total
          </text>

          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Coverage Summary */}
    <div className="w-full space-y-2 md:w-[50%]">
      {stats.insuranceData.map((item, index) => {
        const percentage = stats.total
          ? ((item.value / stats.total) * 100).toFixed(1)
          : '0'

        const dotColor =
          index === 0
            ? '#2563eb' // Government
            : index === 1
              ? '#60a5fa' // None
              : '#93c5fd' // Private

        return (
          <div
            key={item.name}
            className="
              flex items-center justify-between
              rounded-xl border
              px-4 py-3
              transition-all duration-200
              hover:border-primary/40
              hover:bg-muted/30
              hover:shadow-sm
            "
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: dotColor }}
              />

              <span className="font-medium">
                {item.name}
              </span>
            </div>

            <div className="text-right">
              <div className="font-semibold">
                {item.value}
              </div>

              <div className="text-xs text-muted-foreground">
                {percentage}%
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </div>
</ChartCard>





                <ChartCard title="Ration Card Type">
  <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">

    {/* Donut */}
    <div className="h-[250px] w-full md:w-[45%]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="rationGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />   {/* Blue gradient start */}
              <stop offset="100%" stopColor="#1e3a8a" /> {/* Blue gradient end */}
            </linearGradient>
          </defs>

          <Pie
            data={stats.rationData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={105}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {stats.rationData.map((item, index) => (
              <Cell
                key={index}
                fill={
                  index === 0
                    ? 'url(#rationGradient)' // First category
                    : index === 1
                      ? '#60a5fa'           // Second category
                      : '#93c5fd'           // Third category
                }
              />
            ))}
          </Pie>

          {/* Center Content */}
          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            fontSize="34"
            fontWeight="700"
          >
            {stats.total}
          </text>

          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize="13"
          >
            Total
          </text>

          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Ration Card Summary */}
    <div className="w-full space-y-2 md:w-[50%]">
      {stats.rationData.map((item, index) => {
        const percentage = stats.total
          ? ((item.value / stats.total) * 100).toFixed(1)
          : '0'

        const dotColor =
          index === 0
            ? '#3b82f6' // Gradient blue
            : index === 1
              ? '#60a5fa' // Light blue
              : '#93c5fd' // Lighter blue

        return (
          <div
            key={item.name}
            className="
              flex items-center justify-between
              rounded-xl border
              px-4 py-3
              transition-all duration-200
              hover:border-primary/40
              hover:bg-muted/30
              hover:shadow-sm
            "
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: dotColor }}
              />

              <span className="font-medium">
                {item.name}
              </span>
            </div>

            <div className="text-right">
              <div className="font-semibold">
                {item.value}
              </div>

              <div className="text-xs text-muted-foreground">
                {percentage}%
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </div>
</ChartCard>

            </div>

            {/* ── Registration Trend ─────────────── */}
            <ChartCard title="New Registrations – Last 12 Months">
  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={stats.registrationTrend} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

      <Tooltip content={<CustomTooltip />} />

      {/* Blue gradient for line */}
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      <Line
        type="monotone"
        dataKey="count"
        name="Registrations"
        stroke="url(#lineGradient)"
        strokeWidth={2}
        dot={{ fill: '#3b82f6', r: 3 }}
        activeDot={{ r: 6, stroke: '#1e3a8a', strokeWidth: 2 }}
      >
        {/* Labels at each point with larger, bold font */}
        <LabelList
          dataKey="count"
          position="top"
          style={{
            fontSize: 16,          // bigger font
            fontWeight: 700,       // bold
            fill: "#ffffff",       // white text for contrast
            stroke: "#1e3a8a",     // dark blue outline
            strokeWidth: 2,        // outline thickness
          }}
        />
      </Line>
    </LineChart>
  </ResponsiveContainer>
</ChartCard>


        </div>
    )
}

// ── Chart Card Wrapper ─────────────────────────
function ChartCard({
    title,
    children,
    empty = false,
}: {
    title: string
    children: React.ReactNode
    empty?: boolean
}) {
    return (
        <Card>
            <CardHeader className="px-4 py-3">
                <CardTitle className="text-sm font-semibold">
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-0">
                {empty ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                        No data yet
                    </p>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    )
}