'use client'
import { LabelList } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from './StatCard'
import {
    Users, Heart, Skull, HelpCircle,
    UserCheck, UserX, Activity,
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    LineChart, Line,
} from 'recharts'

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

interface PatientStats {
    total: number; alive: number; deceased: number; notAvailable: number
    male: number; female: number; other: number
    withAsha: number; withoutAsha: number
    diseaseData: { name: string; value: number }[]
    stageData: { name: string; value: number }[]
    insuranceData: { name: string; value: number }[]
    rationData: { name: string; value: number }[]
    registrationTrend: { month: string; count: number }[]
    statusData: { name: string; value: number }[]
    genderData: { name: string; value: number }[]
}

export function PatientStatsSection({ stats, role }: { stats: PatientStats; role: string }) {
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

            {/* ── Row 2: Disease bar + Stage bar ─────────────────── */}
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

            {/* ── Row 3: Insurance donut + Ration card bar ───────── */}
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

            {/* ── Registration trend ─────────────────────────────── */}
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
