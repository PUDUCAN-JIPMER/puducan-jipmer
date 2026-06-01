import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: number | string
    subtitle?: string
    trend?: string
    trendLabel?: string
    icon: LucideIcon
    iconClassName?: string
}

export function StatCard({
    title,
    value,
    subtitle,
    trend,
    trendLabel,
    icon: Icon,
    iconClassName,
}: StatCardProps) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between px-4 py-4">
                {/* Left Content */}
                <div className="min-w-0 flex-1 space-y-2">
                    {/* Title */}
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {title}
                    </p>

                    {/* Main Value */}
                    <p className="text-2xl font-semibold leading-none">
                        {value}
                    </p>

                    {/* Trend BELOW value */}
                    {trend && (
                        <p className="text-xs font-medium text-muted-foreground">
                            {trend}
                        </p>
                    )}

                    {/* Subtitle */}
                    {(subtitle || trendLabel) && (
                        <p className="text-xs text-muted-foreground/80">
                            {subtitle} {trendLabel}
                        </p>
                    )}
                </div>

                {/* Icon */}
                <div
                    className={cn(
                        'shrink-0 rounded-lg bg-muted p-2',
                        iconClassName
                    )}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </CardContent>
        </Card>
    )
}