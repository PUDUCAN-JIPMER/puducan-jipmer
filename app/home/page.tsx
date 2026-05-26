import Link from 'next/link'
import { 
    Activity, 
    ArrowRight, 
    HeartPulse, 
    FileText, 
    Users, 
    PhoneCall, 
    Sparkles, 
    ShieldAlert,
    BookmarkCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-12 text-foreground bg-background">
            
            {/* HERO BANNER */}
            <section className="relative rounded-3xl overflow-hidden border border-border bg-card/40 p-6 sm:p-10 text-center backdrop-blur shadow-md">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--color-blue-500)_0,_transparent_35%)] opacity-5 dark:opacity-10" />
                
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4 border border-blue-500/10">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    JIPMER Collaborative Initiative
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl max-w-2xl mx-auto leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400 dark:from-blue-400 dark:to-sky-300">
                    Welcome to PuduCan
                </h1>
                
                <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                    A national oncology implementation study led by JIPMER, focused on improving patient outcomes across the cancer care continuum.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                    <Button asChild size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors duration-200">
                        <Link href="/login" className="flex items-center gap-1.5 px-1">
                            Access Dashboard
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="rounded-full border-border hover:bg-muted/50 transition-colors duration-200">
                        <Link href="/home/about">
                            About PuduCan
                        </Link>
                    </Button>
                </div>
            </section>

            {/* PORTAL ACTIONS GRID */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Data Entry */}
                <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Activity className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold mb-1 transition-colors duration-200">
                        Data Entry
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Register and manage patient clinical records.
                    </p>
                </div>

                {/* Reports */}
                <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                        <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold mb-1 transition-colors duration-200">
                        Reports
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Access statistical summaries and trends.
                    </p>
                </div>

                {/* About */}
                <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                        <Users className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold mb-1 transition-colors duration-200">
                        About
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Learn about scientific study guidelines.
                    </p>
                </div>

                {/* Support */}
                <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                        <PhoneCall className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold mb-1 transition-colors duration-200">
                        Support
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Contact us for assistance and training.
                    </p>
                </div>
            </section>

            {/* ROLE GUIDE STRIP */}
            <section className="rounded-2xl border border-border bg-card/20 p-5 shadow-sm backdrop-blur">
                <div className="grid gap-4 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                    {/* Doctors */}
                    <div className="space-y-1.5 md:pr-4 pt-3 md:pt-0">
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                            <HeartPulse className="h-4 w-4" />
                            <h4 className="font-bold text-sm">Doctors</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Diagnose cases, input biopsy records, and configure specialized therapies.
                        </p>
                    </div>

                    {/* Nurses */}
                    <div className="space-y-1.5 md:px-6 pt-4 md:pt-0">
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                            <BookmarkCheck className="h-4 w-4" />
                            <h4 className="font-bold text-sm">Nurses</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Log routine checks, coordinate hospital visits, and review active cases.
                        </p>
                    </div>

                    {/* ASHAs */}
                    <div className="space-y-1.5 md:pl-6 pt-4 md:pt-0">
                        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                            <ShieldAlert className="h-4 w-4" />
                            <h4 className="font-bold text-sm">ASHAs</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Conduct localized patient surveys and map GPS coordinates during home visits.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
