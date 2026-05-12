'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'

function useBreakpoint() {
    const [width, setWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 1280
    )
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    return width
}

const TAB_LABELS = ['Personal', 'Medical', 'Diagnosis', 'Treatment', 'Follow-ups']

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
    const isDesktop = width >= 1280
    const isTablet = width >= 768 && width < 1280
    const isMobile = width < 768

    // Filter out null/undefined columns
    const validColumns = columns.filter(col => col !== null)
    const validTabs = TAB_LABELS.map((label, i) => ({
        label,
        i,
        col: columns[i],
    })).filter(({ col }) => col !== null)

    // DESKTOP: Show all columns in a grid
    if (isDesktop) {
        return (
            <section className="w-full">
                <div className="grid grid-cols-5 gap-6">
                    {columns.map((col, idx) => (
                        col && (
                            <div key={idx} className="space-y-3">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b">
                                    {TAB_LABELS[idx]}
                                </h3>
                                <div className="space-y-4">
                                    {col}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </section>
        )
    }

    // TABLET: Show tabs with current column
    if (isTablet) {
        return (
            <section className="w-full">
                <div className="flex overflow-x-auto border-b border-border mb-6 scrollbar-none">
                    {validTabs.map(({ label, i }) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setActiveIndex(i)}
                            className={clsx(
                                'shrink-0 px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
                                activeIndex === i
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="w-full">
                    {validColumns[activeIndex]}
                </div>
                <div className="mt-6 flex items-center justify-center gap-2">
                    {validTabs.map(({ i }) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setActiveIndex(i)}
                            className={clsx(
                                'rounded-full transition-all duration-200',
                                i === activeIndex
                                    ? 'h-2 w-5 bg-primary'
                                    : 'h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                            )}
                        />
                    ))}
                </div>
            </section>
        )
    }

    // MOBILE: Single column with navigation
    return (
        <section className="w-full">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                {TAB_LABELS[activeIndex]}
            </p>
            <div className="w-full">
                {validColumns[activeIndex]}
            </div>
            <div className="mt-6 flex items-center justify-center gap-2">
                {validTabs.map(({ i }) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        className={clsx(
                            'rounded-full transition-all duration-200',
                            i === activeIndex
                                ? 'h-2 w-5 bg-primary'
                                : 'h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        )}
                    />
                ))}
            </div>
            <div className="mt-3 flex justify-between px-1">
                <button
                    type="button"
                    onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                    disabled={activeIndex === 0}
                    className="text-sm text-primary disabled:text-muted-foreground/40 disabled:cursor-not-allowed"
                >
                    ← Previous
                </button>
                <button
                    type="button"
                    onClick={() =>
                        setActiveIndex(Math.min(validTabs[validTabs.length - 1]?.i ?? 0, activeIndex + 1))
                    }
                    disabled={activeIndex === validTabs[validTabs.length - 1]?.i}
                    className="text-sm text-primary disabled:text-muted-foreground/40 disabled:cursor-not-allowed"
                >
                    Next →
                </button>
            </div>
        </section>
    )
}