'use client'

/**
 * RiskScoreBadge — displays a patient's follow-up adherence risk score.
 *
 * Shows a colored badge (green/amber/red) with the risk tier label.
 * Hovering reveals a tooltip with the exact probability and top contributing
 * risk factors. This component uses only existing shadcn/ui primitives
 * (Tooltip) — no additional dependencies.
 */

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { RiskResult } from '@/lib/ml/types'

// Visual configuration for each risk tier
const TIER_STYLES = {
  Low: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    icon: '🟢',
  },
  Medium: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
    icon: '🟡',
  },
  High: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    icon: '🔴',
  },
} as const

interface RiskScoreBadgeProps {
  risk: RiskResult
}

export default function RiskScoreBadge({ risk }: RiskScoreBadgeProps) {
  const style = TIER_STYLES[risk.tier]
  const percentScore = Math.round(risk.score * 100)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          id="risk-score-badge"
          className={`inline-flex cursor-help items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
        >
          <span>{style.icon}</span>
          <span>{risk.tier} Risk</span>
          <span className="opacity-70">({percentScore}%)</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1.5 p-1">
          <p className="font-semibold">
            Follow-up Adherence Risk: {percentScore}%
          </p>
          {risk.factors.length > 0 && (
            <>
              <p className="text-xs opacity-80">Key contributing factors:</p>
              <ul className="list-inside list-disc text-xs">
                {risk.factors.map((factor, i) => (
                  <li key={i}>{factor}</li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-1 text-[10px] opacity-60">
            Based on demographic and treatment data. Not a clinical diagnosis.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
