import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Table Header */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: 6 }).map((_, row) => (
       <div
           key={row}
           className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        > 
          {Array.from({ length: 5 }).map((_, col) => (
            <Skeleton key={col} className="h-10 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}