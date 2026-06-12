import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import bgImage from '@/assets/homepage-1.jpg'

import {
  TypographyH1,
  TypographyH2,
  TypographyMuted,
  TypographyP,
} from '@/components/ui/typography'

export default function HomePage() {
    return (
        <div>
            {/* HERO — full viewport with bg image */}
            <section className="relative flex min-h-screen items-center justify-center">
                <Image
                    src={bgImage}
                    alt="PuduCan hero background"
                    fill
                    className="object-cover object-center"
                    priority
                />

                {/* dark overlay */}
                <div className="absolute inset-0 z-10 bg-black/55" />

                {/* hero content — push to left */}
                <div className="z-20 max-w-6xl w-full py-8 mx-auto flex items-center sm:justify-start justify-center">
                    <div className="max-w-2/3">
                        <h1 className="text-4xl font-extrabold text-white sm:text-6xl">
                            Welcome To PuduCan
                        </h1>
                        <p className="mt-3 ml-1 text-sm leading-relaxed text-white/75 sm:text-base">
                            A national oncology implementation study led by JIPMER. <br />
                            Bridging the gap between early detection and effective cancer care{' '}
                            <br />
                            across Puducherry and beyond.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-b-sm bg-pink-600/15 text-white shadow-sm transition-colors duration-200 hover:bg-pink-600/30"
                            >
                                <Link
                                    href="/login"
                                    className="flex items-center gap-1.5 px-1 tracking-wide"
                                >
                                    Access Dashboard
                                    {/* <ArrowRight className="h-3.5 w-3.5" /> */}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
            <section id="about" className="bg-background px-6 py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        Healthcare Initiative : JIPMER
                    </p>

                    <TypographyH2 className="mb-6 text-4xl font-bold tracking-tight">
                        About PuduCan
                    </TypographyH2>

                    <TypographyP className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
                        Building a patient-centered cancer navigation system designed to
                        improve accessibility, coordination, and support across the
                        healthcare journey in India.
                    </TypographyP>
                    </div>

                    <div className="space-y-10">
                    <section className="rounded-2xl border bg-background p-8 shadow-sm">
                        <TypographyH2 className="mb-4 text-xl font-semibold">
                        What is PuduCan?
                        </TypographyH2>

                        <TypographyP className="leading-8 text-muted-foreground">
                        The PuduCan project aims to improve patient-reported outcomes and
                        care experiences across the cancer care continuum in India through
                        a Community-Oriented Model of Patient Navigation System.
                        </TypographyP>
                    </section>

                    <section className="rounded-2xl border bg-background p-8 shadow-sm">
                        <TypographyH2 className="mb-4 text-xl font-semibold">
                        The Study
                        </TypographyH2>

                        <TypographyP className="leading-8 text-muted-foreground">
                        The project integrates community and hospital navigators into the
                        healthcare system to create smoother patient navigation
                        experiences.
                        </TypographyP>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border bg-muted/30 p-5">
                            <h3 className="mb-2 font-semibold">
                            Community Navigators
                            </h3>

                            <TypographyMuted>
                            Trained lay workers providing informational and emotional
                            support.
                            </TypographyMuted>
                        </div>

                        <div className="rounded-2xl border bg-muted/30 p-5">
                            <h3 className="mb-2 font-semibold">
                            Hospital Navigators
                            </h3>

                            <TypographyMuted>
                            Junior nurses or social workers helping coordinate treatment
                            and decision-making.
                            </TypographyMuted>
                        </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-blue-200 bg-blue-50/50 p-8">
                        <TypographyH2 className="mb-4 text-xl font-semibold text-blue-900">
                        Our Mission
                        </TypographyH2>

                        <TypographyP className="leading-8 text-blue-900/80">
                        PuduCan exists to bridge gaps in the cancer care pathway—from
                        screening and diagnosis to treatment, survivorship, and palliative
                        care—while emphasizing empathy, accessibility, and coordinated
                        healthcare experiences.
                        </TypographyP>
                    </section>
                    </div>
                </div>
            </section>
        </div>
    )
}
