'use client'

import type { Variants } from 'framer-motion'

// Shared animation configuration for the dashboard
export const DEFAULT_EASING = [0.22, 1, 0.36, 1] as const
export const DEFAULT_DURATION = 0.48
// Use a slight negative bottom margin so elements animate as they enter from below
export const VIEWPORT = { once: true, amount: 0.2, margin: '0px 0px -10% 0px' } as const

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

// Modern reveal: subtle springy/soft scale and lift for polished feel
export const modernRevealVariant: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 160, damping: 26, mass: 0.9 },
  },
}

// Modern item variant (KPI tiles)
export const modernItemVariant: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 220, damping: 28, mass: 0.85 },
  },
}

// Backwards-compat small fadeUp variants for minimal motion contexts
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: DEFAULT_DURATION, ease: DEFAULT_EASING } },
}

export const fadeUpItemVariant: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.36, ease: DEFAULT_EASING } },
}

export default {}
