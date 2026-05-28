'use client'

import type { Variants } from 'framer-motion'

// Shared animation configuration for the dashboard
export const DEFAULT_EASING = [0.22, 1, 0.36, 1] as const
export const DEFAULT_DURATION = 0.48
export const VIEWPORT = { once: true, amount: 0.2 } as const

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.06,
    },
  },
}

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DEFAULT_DURATION, ease: DEFAULT_EASING },
  },
}

// Slightly quicker item variant for KPI tiles
export const fadeUpItemVariant: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: DEFAULT_EASING },
  },
}

export default {}
