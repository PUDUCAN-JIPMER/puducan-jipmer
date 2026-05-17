'use client'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
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
    isLoading?: boolean
}
function getPageRange(current: number, total: number, delta = 2): (number | '...')[] {
    const range: (number | '...')[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push('...');
    if (total > 1) range.push(total);

    return range;
}


export function GenericPagination({
    currentPage,
    totalPages,
    onPageChange,
    stats,
    isPatientTab,
    isLoading
}: GenericPaginationProps) {
    const pages = getPageRange(currentPage, totalPages);
    return (
        <section className="">
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                {/* Stats Section */}
    {isLoading ? (
    <div className="flex w-full flex-wrap gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />

        {isPatientTab && (
            <>
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
            </>
        )}
    </div>
) : (
                stats && (
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
                )
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

                        {pages.map((page, i) =>
                            page === '...' ? (
                                <PaginationItem key={`ellipsis-${i}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            ) : (
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
                            )
                        )}


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
