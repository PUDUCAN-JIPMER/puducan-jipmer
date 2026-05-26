import { TypographyH2, TypographyMuted, TypographyP } from '@/components/ui/typography'
import { FileBarChart, Activity, Users, MapPin } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  return (
    <div className="mx-auto mt-12 max-w-6xl px-4 pb-16">
      
      <div className="text-center mb-16 space-y-4">
        <TypographyH2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#007AFF] dark:text-[#5BB4FF]">
          Project Reports
        </TypographyH2>
        <TypographyMuted className="text-base md:text-lg max-w-2xl mx-auto">
          Access statistical summaries, clinical trends, and field worker data submissions across the care continuum.
        </TypographyMuted>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <Link href="/dashboard/doctor" className="group block h-full">
          <div className="bg-card h-full p-6 rounded-[24px] border border-border shadow-sm transition-all hover:border-blue-500/50 hover:shadow-md">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl w-fit mb-4">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Clinical Records</h3>
            <p className="text-sm text-muted-foreground">View patient vitals, biopsy records, and active therapies.</p>
          </div>
        </Link>

        {/* Card 2 */}
        <Link href="/dashboard/nurse" className="group block h-full">
          <div className="bg-card h-full p-6 rounded-[24px] border border-border shadow-sm transition-all hover:border-green-500/50 hover:shadow-md">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl w-fit mb-4">
              <FileBarChart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Hospital Visits</h3>
            <p className="text-sm text-muted-foreground">Track routine checks and hospital navigation metrics.</p>
          </div>
        </Link>

        {/* Card 3 */}
        <Link href="/dashboard/asha" className="group block h-full">
          <div className="bg-card h-full p-6 rounded-[24px] border border-border shadow-sm transition-all hover:border-purple-500/50 hover:shadow-md">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl w-fit mb-4">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Field Surveys</h3>
            <p className="text-sm text-muted-foreground">Access community health screening and drop-out rates.</p>
          </div>
        </Link>

        {/* Card 4 */}
        <Link href="/reports/geospatial" className="group block h-full">
          <div className="bg-card h-full p-6 rounded-[24px] border border-border shadow-sm transition-all hover:border-orange-500/50 hover:shadow-md">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl w-fit mb-4">
              <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">GPS Mapping</h3>
            <p className="text-sm text-muted-foreground">View localized patient clusters mapped during home visits.</p>
          </div>
        </Link>

      </div>
    </div>
  )
}