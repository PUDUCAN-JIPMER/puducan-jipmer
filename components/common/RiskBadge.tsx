'use client'

import { computePatientRisk } from '@/lib/patient/riskScoring'
import { Patient } from '@/schema/patient'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react'

export function RiskBadge({ patient }: { patient: Partial<Patient> }) {
    const { score, level, reasons } = computePatientRisk(patient)

    let badgeClass = ''
    let Icon = CheckCircle

    switch (level) {
        case 'High':
            badgeClass = 'bg-destructive/10 text-destructive border border-destructive/20'
            Icon = ShieldAlert
            break
        case 'Medium':
            badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            Icon = AlertTriangle
            break
        case 'Low':
            badgeClass = 'bg-primary/10 text-primary border border-primary/20'
            Icon = CheckCircle
            break
    }

    return (
        <TooltipProvider delayDuration={150}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium select-none cursor-help transition-all ${badgeClass}`}>
                        <Icon size={12} className="shrink-0" />
                        {level}
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3 space-y-2 text-xs bg-popover text-popover-foreground border border-border shadow-md rounded-lg">
                    <div className="font-semibold flex items-center justify-between border-b pb-1.5 border-border">
                        <span>Risk Score: {score}/10</span>
                        <span>{level} Risk</span>
                    </div>
                    {reasons.length > 0 ? (
                        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                            {reasons.map((r, idx) => (
                                <li key={idx} className="leading-relaxed">{r}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground italic">No elevated risk factors detected.</p>
                    )}
                    <div className="pt-1.5 border-t border-border text-[10px] text-muted-foreground/80 leading-normal italic">
                        * Local prioritize-aid only, not a clinical diagnosis.
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
