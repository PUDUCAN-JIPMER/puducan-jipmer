// Updated
'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'

function useBreakpoint() {
    const [width, setWidth] = useState<number | null>(null) // Start with null to avoid hydration mismatch

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth)
        handleResize() // Set initial value after mount
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return width
}

// Generate tab labels dynamically based on column count and type
const getTabLabels = (columns: React.ReactNode[]) => {
    const labels = ['Personal', 'Medical', 'Diagnosis', 'Treatment', 'Follow-ups']
    return columns.map((_, idx) => labels[idx] || `Step ${idx + 1}`)
}

export default function SwipeableColumns({
    columns,
    activeIndex,
    setActiveIndex,
}: {
    columns: React.ReactNode[]
    activeIndex: number
    setActiveIndex: (i: number) => void
}) {
    const width = useBreakpoint()
    const isDesktop = width !== null && width >= 1280
    const isTablet = width !== null && width >= 768 && width < 1280
    const isMobile = width !== null && width < 768

    // Filter out both null and undefined consistently
    const validColumns = columns.filter((col): col is React.ReactNode => col !== null && col !== undefined)
    const validTabLabels = getTabLabels(validColumns)

    // Create valid tabs array with original indices mapping
    const validTabs = columns
        .map((col, idx) => ({ col, originalIdx: idx, label: getTabLabels(columns)[idx] }))
        .filter((tab) => tab.col !== null && tab.col !== undefined)

    // Ensure activeIndex is within valid range
    const safeActiveIndex = Math.min(activeIndex, validTabs.length - 1)

    // Handle navigation with filtered tabs
    const handleNext = () => {
        if (safeActiveIndex < validTabs.length - 1) {
            setActiveIndex(validTabs[safeActiveIndex + 1].originalIdx)
        }
    }

    const handlePrevious = () => {
        if (safeActiveIndex > 0) {
            setActiveIndex(validTabs[safeActiveIndex - 1].originalIdx)
        }
    }

    const goToStep = (originalIdx: number) => {
        setActiveIndex(originalIdx)
    }

    // Don't render until after mount to avoid hydration mismatch
    if (width === null) {
        return <div className="w-full min-h-[200px]" />
    }

    //  DESKTOP: Dynamic grid based on actual number of valid columns
    if (isDesktop) {
        const gridCols = {
            1: 'grid-cols-1',
            2: 'grid-cols-2',
            3: 'grid-cols-3',
            4: 'grid-cols-4',
            5: 'grid-cols-5',
        }[validColumns.length] || 'grid-cols-5'

        return (
            <section className="w-full">
                <div className={`grid ${gridCols} gap-6`}>
                    {validColumns.map((col, idx) => (
                        <div key={idx} className="space-y-3">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b">
                                {validTabLabels[idx]}
                            </h3>
                            <div className="space-y-4">
                                {col}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    // ✅ TABLET: Tab navigation with filtered tabs
    if (isTablet) {
        return (
            <section className="w-full">
                {/* Tab Bar */}
                <div className="flex overflow-x-auto border-b border-border mb-6 scrollbar-none">
                    {validTabs.map((tab, idx) => (
                        <button
                            key={tab.originalIdx}
                            type="button"
                            onClick={() => goToStep(tab.originalIdx)}
                            className={clsx(
                                'shrink-0 px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
                                safeActiveIndex === idx
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Current Column Content */}
                <div className="w-full">
                    {validTabs[safeActiveIndex]?.col}
                </div>

                {/* Dot Indicators */}
                <div className="mt-6 flex items-center justify-center gap-2">
                    {validTabs.map((tab, idx) => (
                        <button
                            key={tab.originalIdx}
                            type="button"
                            onClick={() => goToStep(tab.originalIdx)}
                            className={clsx(
                                'rounded-full transition-all duration-200',
                                safeActiveIndex === idx
                                    ? 'h-2 w-5 bg-primary'
                                    : 'h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                            )}
                        />
                    ))}
                </div>
            </section>
        )
    }

    // ✅ MOBILE: Single column with navigation
    return (
        <section className="w-full">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                {validTabs[safeActiveIndex]?.label}
            </p>

            <div className="w-full">
                {validTabs[safeActiveIndex]?.col}
            </div>

            {/* Dot Indicators */}
            <div className="mt-6 flex items-center justify-center gap-2">
                {validTabs.map((tab, idx) => (
                    <button
                        key={tab.originalIdx}
                        type="button"
                        onClick={() => goToStep(tab.originalIdx)}
                        className={clsx(
                            'rounded-full transition-all duration-200',
                            safeActiveIndex === idx
                                ? 'h-2 w-5 bg-primary'
                                : 'h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        )}
                    />
                ))}
            </div>

            {/* Previous/Next Buttons */}
            <div className="mt-3 flex justify-between px-1">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={safeActiveIndex === 0}
                    className="text-sm text-primary disabled:text-muted-foreground/40 disabled:cursor-not-allowed"
                >
                    ← Previous
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={safeActiveIndex === validTabs.length - 1}
                    className="text-sm text-primary disabled:text-muted-foreground/40 disabled:cursor-not-allowed"
                >
                    Next →
                </button>
            </div>
        </section>
    )
}
