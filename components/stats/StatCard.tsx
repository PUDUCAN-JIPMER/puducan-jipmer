import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'framer-motion'
import { modernItemVariant } from './animations'

interface StatCardProps {
    title: string
    value: number | string
    subtitle?: string
    icon: LucideIcon
    iconClassName?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, iconClassName }: StatCardProps) {
    const reduce = useReducedMotion()
    return (
        <motion.div
            className="h-full"
            variants={reduce ? undefined : modernItemVariant}
            whileHover={reduce ? undefined : { scale: 1.02, y: -3, boxShadow: '0 8px 26px rgba(15,23,42,0.08)' }}
            transition={{ duration: 0.18 }}
            style={{ display: 'block' }}
        >
            <Card className="h-full">
                <CardContent className="h-full flex items-center gap-3 px-4 py-3">
                    <div className={cn('shrink-0 rounded-lg p-2 bg-muted', iconClassName)}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-muted-foreground">{title}</p>
                        <p className="text-xl font-bold leading-tight">{value}</p>
                        {subtitle && (
                            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
