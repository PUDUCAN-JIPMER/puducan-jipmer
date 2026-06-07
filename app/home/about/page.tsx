import {
    TypographyH1,
    TypographyH2,
    TypographyMuted,
    TypographyP,
} from '@/components/ui/typography'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
            <div className="mx-auto max-w-5xl px-6 py-14">
                {/* Hero */}
                <div className="mb-16 text-center">
                    <div className="mb-4 inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-1 text-sm font-medium text-red-700">
                        Healthcare Initiative : JIPMER
                    </div>

                    <TypographyH1 className="mb-6 text-4xl font-bold tracking-tight">
                        About PuduCan
                    </TypographyH1>

                    <TypographyP className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
                        Building a patient-centered cancer navigation system
                        designed to improve accessibility, coordination, and
                        support across the healthcare journey in India.
                    </TypographyP>
                </div>

                {/* Main Content */}
                <div className="space-y-10">
                    <section className="rounded-2xl border bg-background p-8 shadow-sm">
                        <TypographyH2 className="mb-4 text-1xl font-semibold">
                            What is PuduCan?
                        </TypographyH2>

                        <TypographyP className="leading-8 text-muted-foreground">
                            The PuduCan project aims to improve patient-reported
                            outcomes and care experiences across the cancer care
                            continuum in India through a Community-Oriented
                            Model of Patient Navigation System. This hybrid implementation 
                            study addresses the rising cancer burden in India, where fragmented care
                            pathways and delayed diagnoses contribute to higher
                            mortality rates.
                        </TypographyP>
                    </section>

                    <section className="rounded-2xl border bg-background p-8 shadow-sm">
                        <TypographyH2 className="mb-4 text-1xl font-semibold">
                            The Study
                        </TypographyH2>

                        <TypographyP className="leading-8 text-muted-foreground">
                            The project focuses on integrating community and
                            hospital navigators into the healthcare system to
                            create smoother patient navigation experiences.
                        </TypographyP>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border bg-muted/30 p-5">
                                <h3 className="mb-2 font-semibold">
                                    Community Navigators
                                </h3>

                                <TypographyMuted>
                                    Trained lay workers providing informational
                                    and emotional support.
                                </TypographyMuted>
                            </div>

                            <div className="rounded-2xl border bg-muted/30 p-5">
                                <h3 className="mb-2 font-semibold">
                                    Hospital Navigators
                                </h3>

                                <TypographyMuted>
                                    Junior nurses or social workers helping
                                    coordinate treatment and decision-making.
                                </TypographyMuted>
                            </div>
                        </div>
                    </section>

                    {/* Philosophy Block */}
                    <section className="rounded-2xl border border-blue-200 bg-blue-50/50 p-8">
                        <TypographyH2 className="mb-4 text-1xl font-semibold text-blue-900">
                            Our Mission
                        </TypographyH2>

                        <TypographyP className="leading-8 text-blue-900/80">
                            PuduCan exists to bridge gaps in the cancer care
                            pathway: from screening and diagnosis to treatment,
                            survivorship, and palliative care. The initiative emphasizes empathy, accessibility,
                            and coordinated healthcare experiences for patients
                            navigating complex medical systems.
                        </TypographyP>
                    </section>
                </div>
            </div>
        </div>
    )
}