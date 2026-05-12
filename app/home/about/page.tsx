import { TypographyH2, TypographyMuted, TypographyP } from '@/components/ui/typography'
import { Suspense } from 'react'

export default function AboutPage() {
    return (
        <div className="mx-auto mt-10 max-w-[1400px]">
            <TypographyH2 className="mb-4 text-2xl font-bold">About PuduCan</TypographyH2>

            <div className="mb-8">
                <TypographyH2 className="mb-2 text-lg font-semibold">What is PuduCan</TypographyH2>
                <TypographyMuted>
                    The PuduCan project aims to improve patient-reported outcomes and care experiences
                    across the cancer care continuum in India through a Community-Oriented Model of
                    Patient Navigation System. This hybrid implementation study addresses the rising
                    cancer burden in India, where fragmented care pathways and late diagnoses contribute
                    to high mortality rates.
                </TypographyMuted>
            </div>

            <div className="mb-8">
                <TypographyH2 className="mb-2 text-lg font-semibold">The Study</TypographyH2>
                <TypographyP>
                    The project&apos;s core concept involves introducing and integrating both community
                    and hospital navigators to create a conducive environment for patient navigation
                    through the health care system.
                </TypographyP>
            </div>

            <div className="mb-8">
                <TypographyH2 className="mb-2 text-lg font-semibold">How it Works</TypographyH2>
                <TypographyP>
                    Community navigators will be trained lay workers providing informational and
                    emotional support, while hospital navigators will be junior nurses or social workers
                    coordinating care and decision making. This dual approach aims to bridge gaps in
                    the cancer care pathway from screening to survivorship and palliative care.
                </TypographyP>
            </div>
        </div>
    )
}
