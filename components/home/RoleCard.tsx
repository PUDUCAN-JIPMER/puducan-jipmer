'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoleCardProps {
    role: string
    description: string
    icon: LucideIcon
    href: string
}

export default function RoleCard({ role, description, icon: Icon, href }: RoleCardProps) {
    return (
        <Link href={href}>
            <div className="group relative p-6 rounded-lg border border-border bg-card hover:border-accent hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-accent/5">
                {/* Background accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-transparent to-accent/0 group-hover:from-accent/5 group-hover:to-accent/5 rounded-lg transition-all" />

                {/* Content */}
                <div className="relative space-y-4">
                    {/* Icon */}
                    <div className="inline-flex p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <Icon size={24} className="text-accent" />
                    </div>

                    {/* Role Title */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors">
                            {role}
                        </h3>
                        <p className="text-sm text-muted mt-1">{description}</p>
                    </div>

                    {/* CTA */}
                    <div className="pt-2">
                        <div className="inline-flex items-center text-sm font-medium text-accent group-hover:translate-x-1 transition-transform">
                            Continue
                            <span className="ml-1">→</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
