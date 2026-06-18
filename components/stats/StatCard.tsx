import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'framer-motion'
import { modernItemVariant } from './animations'

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
    const reduce = useReducedMotion()

    return (
        <motion.div
            className="h-full"
            variants={reduce ? undefined : modernItemVariant}
            whileHover={
                reduce
                    ? undefined
                    : { scale: 1.02, y: -3, boxShadow: '0 8px 26px rgba(15,23,42,0.08)' }
            }
            transition={{ duration: 0.18 }}
            style={{ display: 'block' }}
        >
            <Card className="h-full">
                <CardContent className="flex items-start justify-between px-4 py-4">
                    <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {title}
                        </p>

                        <p className="text-2xl font-semibold leading-none">{value}</p>

                        {trend && (
                            <p className="text-xs font-medium text-muted-foreground">{trend}</p>
                        )}

                        {(subtitle || trendLabel) && (
                            <p className="text-xs text-muted-foreground/80">
                                {subtitle} {trendLabel}
                            </p>
                        )}
                    </div>

                    <div className={cn('shrink-0 rounded-lg bg-muted p-2', iconClassName)}>
                        <Icon className="h-4 w-4" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}