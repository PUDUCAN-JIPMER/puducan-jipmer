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
            <section id="about" className="relative bg-[#371625] px-6 py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                    <p className="mb-2 text-sm font-medium uppercase tracking-wide text-white/100">
                        Healthcare Initiative : JIPMER
                    </p>

                    <TypographyH2 className="mb-6 text-4xl font-bold tracking-tight text-white/100">
                        About PuduCan
                    </TypographyH2>

                    <TypographyP className="mx-auto max-w-2xl text-lg leading-8 text-white/100">
                        Building a patient-centered cancer navigation system designed to
                        improve accessibility, coordination, and support across the
                        healthcare journey in India.
                    </TypographyP>
                    </div>

                    <div className="space-y-8">
                    <section className="rounded-3xl border border-pink-200 bg-pink-100/90 p-8 shadow-lg shadow-pink-200/50 transition hover:shadow-xl">
                        <TypographyH2 className="mb-4 text-2xl font-semibold text-rose-950">
                        What is PuduCan?
                        </TypographyH2>

                        <TypographyP className="leading-8 text-rose-900">
                        The PuduCan project aims to improve patient-reported outcomes and
                        care experiences across the cancer care continuum in India through
                        a Community-Oriented Model of Patient Navigation System.
                        </TypographyP>
                    </section>

                    <section className="rounded-3xl border border-pink-200 bg-pink-100/90 p-8 shadow-lg shadow-pink-200/50 transition hover:shadow-xl">
                        <TypographyH2 className="mb-4 text-2xl font-semibold text-rose-950">
                        The Study
                        </TypographyH2>

                        <TypographyP className="leading-8 text-rose-900">
                        The project integrates community and hospital navigators into the
                        healthcare system to create smoother patient navigation
                        experiences.
                        </TypographyP>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-pink-200 bg-pink-50 p-5 transition hover:bg-pink-50/80">
                            <h3 className="mb-2 text-lg font-semibold text-rose-950">
                            Community Navigators
                            </h3>

                            <p className="text-sm text-rose-900/80">
                            Trained lay workers providing informational and emotional
                            support.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-pink-200 bg-pink-50 p-5 transition hover:bg-pink-50/80">
                            <h3 className="mb-2 text-lg font-semibold text-rose-950">
                            Hospital Navigators
                            </h3>

                            <p className="text-sm text-rose-900/80">
                            Junior nurses or social workers helping coordinate treatment
                            and decision-making.
                            </p>
                        </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-pink-200 bg-pink-100/90 p-8 shadow-lg shadow-pink-200/50 transition hover:shadow-xl">
                        <TypographyH2 className="mb-4 text-2xl font-semibold text-rose-950">
                        Our Mission
                        </TypographyH2>

                        <TypographyP className="leading-8 text-rose-900">
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
