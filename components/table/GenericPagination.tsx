'use client'

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'

type Stats = {
    total: number
    male: number
    female: number
    others: number
    assigned: number
    unassigned: number
    alive: number
    deceased: number
}

interface GenericPaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    stats?: Stats
    isPatientTab: boolean
}

export function GenericPagination({
    currentPage,
    totalPages,
    onPageChange,
    stats,
    isPatientTab,
}: GenericPaginationProps) {
    return (
        <section className="">
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                {/* Stats Section */}
                {stats && (
                    <div className="flex w-full flex-wrap justify-between gap-2 text-xs font-light sm:text-sm md:flex-row">
                        <section className="flex flex-wrap gap-2 text-center">
                            <div className="border px-2 py-1">Total: {stats.total}</div>
                            <div className="border px-2 py-1">Male: {stats.male}</div>
                            <div className="border px-2 py-1">Female: {stats.female}</div>
                            <div className="border px-2 py-1">Others: {stats.others}</div>
                        </section>
                        {isPatientTab && (
                            <section className="flex flex-wrap gap-2 text-center">
                                <div className="border px-2 py-1">Assigned: {stats.assigned}</div>
                                <div className="border px-2 py-1">
                                    Unassigned: {stats.unassigned}
                                </div>
                                <div className="border px-2 py-1">Alive: {stats.alive}</div>
                                <div className="border px-2 py-1">Not Alive: {stats.deceased}</div>
                            </section>
                        )}
                    </div>
                )}

                {/* Pagination UI */}
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    onPageChange(Math.max(currentPage - 1, 1))
                                }}
                                className={
                                    currentPage === 1 ? 'pointer-events-none opacity-50' : undefined
                                }
                            />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onPageChange(page)
                                    }}
                                    isActive={currentPage === page}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    onPageChange(Math.min(currentPage + 1, totalPages))
                                }}
                                className={
                                    currentPage === totalPages
                                        ? 'pointer-events-none opacity-50'
                                        : undefined
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </section>
    )
}
