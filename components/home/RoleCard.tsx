'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface RoleCardProps {
    role: string
    description: string
    icon: LucideIcon
    href: string
}

export default function RoleCard({ role, description, icon: Icon, href }: RoleCardProps) {
    const roleKeyMap: Record<string, 'doctor' | 'nurse' | 'asha' | 'admin'> = {
        Doctor: 'doctor',
        Nurse: 'nurse',
        'ASHA Worker': 'asha',
        Administrator: 'admin',
    }
    const roleKey = roleKeyMap[role] ?? 'doctor'
    const loginPath = href || `/login?role=${roleKey}`

    const colors: Record<'doctor' | 'nurse' | 'asha' | 'admin', { bg: string; icon: string; text: string }> = {
        doctor: { bg: 'from-green-50 to-green-50/50 dark:from-green-950/30 dark:to-green-950/10', icon: 'text-primary', text: 'text-primary' },
        nurse: { bg: 'from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/10', icon: 'text-accent', text: 'text-accent' },
        asha: { bg: 'from-yellow-50 to-yellow-50/50 dark:from-yellow-950/30 dark:to-yellow-950/10', icon: 'text-warning', text: 'text-warning' },
        admin: { bg: 'from-slate-50 to-slate-50/50 dark:from-slate-900/20 dark:to-slate-900/10', icon: 'text-primary', text: 'text-primary' },
    }
    const color = colors[roleKey]

    return (
        <Link href={loginPath}>
            <div className={`group flex flex-col items-start gap-4 p-6 rounded-lg bg-gradient-to-br ${color.bg} hover:shadow-md transition-all duration-300 cursor-pointer h-full`}>
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-white/40 to-white/20 dark:from-white/10 dark:to-white/5 group-hover:from-white/60 group-hover:to-white/40 transition-all">
                    <Icon size={24} className={color.icon} />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className={`text-lg font-bold ${color.text} group-hover:opacity-90 transition-opacity`}>{role}</h3>
                    <p className="text-sm text-muted mt-2 leading-relaxed">{description}</p>
                </div>

                {/* CTA Arrow */}
                <div className={`text-sm font-bold ${color.text} opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all self-end`}>→</div>
            </div>
        </Link>
    )
}
