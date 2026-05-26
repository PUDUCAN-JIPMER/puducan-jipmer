import { TypographyH2, TypographyMuted, TypographyP } from '@/components/ui/typography'
import { ShieldPlus, HeartHandshake } from 'lucide-react'
import { Suspense } from 'react'

export default function AboutPage() {
    return (
        <div className="mx-auto mt-12 max-w-5xl px-4 pb-16">
            {/* Hero Section */}
            <div className="text-center mb-16 space-y-6">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4">
                    <span className="mr-1">✨</span> Scientific Guidelines
                </div>
                <TypographyH2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#007AFF] dark:text-[#5BB4FF]">
                    About PuduCan
                </TypographyH2>
                <div className="max-w-3xl mx-auto">
                    <TypographyMuted className="text-base md:text-lg leading-relaxed mt-4">
                        The PuduCan project aims to improve patient-reported outcomes and care experiences
                        across the cancer care continuum in India through a Community-Oriented Model of
                        Patient Navigation System. This hybrid implementation study addresses the rising
                        cancer burden in India, where fragmented care pathways and late diagnoses contribute
                        to high mortality rates.
                    </TypographyMuted>
                </div>
            </div>

            {/* Grid Section - Styled to match homepage cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* The Study Card */}
                <div className="bg-card p-8 rounded-[24px] border border-border shadow-sm transition-colors hover:bg-accent/10">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl w-fit mb-6">
                        <ShieldPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <TypographyH2 className="mb-3 text-xl font-bold">
                        The Study
                    </TypographyH2>
                    <TypographyP className="leading-relaxed text-muted-foreground text-sm md:text-base">
                        The project&apos;s core concept involves introducing and integrating both community
                        and hospital navigators to create a conducive environment for patient navigation
                        through the health care system.
                    </TypographyP>
                </div>

                {/* How it Works Card */}
                <div className="bg-card p-8 rounded-[24px] border border-border shadow-sm transition-colors hover:bg-accent/10">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl w-fit mb-6">
                        <HeartHandshake className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <TypographyH2 className="mb-3 text-xl font-bold">
                        How it Works
                    </TypographyH2>
                    <TypographyP className="leading-relaxed text-muted-foreground text-sm md:text-base">
                        Community navigators will be trained lay workers providing informational and
                        emotional support, while hospital navigators will be junior nurses or social workers
                        coordinating care and decision making. This dual approach aims to bridge gaps in
                        the cancer care pathway from screening to survivorship and palliative care.
                    </TypographyP>
                </div>

            </div>
        </div>
    )
}