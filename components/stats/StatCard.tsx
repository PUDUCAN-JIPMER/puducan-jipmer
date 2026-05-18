import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: number | string
    subtitle?: string
    icon: LucideIcon
    iconClassName?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, iconClassName }: StatCardProps) {
    return (
        <Card>
            <CardContent className="flex items-center gap-3 px-4 py-3">
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
    )
}
