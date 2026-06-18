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
            {/* HERO SECTION with id="home" */}
            <section id="home" className="relative flex min-h-screen items-center justify-center">
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
                                </Link>
                            </Button>
                            <Button
                                    asChild
                                    size="lg"
                                    className="rounded-md border border-white/30 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20">
                                    <Link href="/home/about">About PuduCan</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT SECTION with id="about" - Updated Grid Layout */}
            <section id="about" className="relative bg-[#371625] px-6 py-24 lg:py-32">
                <div className="mx-auto max-w-7xl">
                    {/* Header Area */}
                    <div className="mx-auto max-w-2xl text-center mb-16 lg:mb-24">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-pink-300">
                            Healthcare Initiative : JIPMER
                        </p>
                        <TypographyH2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                            About PuduCan
                        </TypographyH2>
                        <TypographyP className="mt-6 text-lg leading-relaxed text-pink-50/80">
                            Building a patient-centered cancer navigation system designed to
                            improve accessibility, coordination, and support across the
                            healthcare journey in India.
                        </TypographyP>
                    </div>

                    {/* Professional Grid Layout */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        
                        {/* 1. Context Card (Spans all 3 columns) */}
                        <div className="flex flex-col rounded-2xl border border-pink-200/50 bg-pink-50 p-8 shadow-lg shadow-pink-200/50 transition-all hover:shadow-xl hover:shadow-pink-200/60 lg:col-span-3">
                            <TypographyH2 className="mb-4 text-2xl font-semibold text-rose-950">
                                Project Context & Overview
                            </TypographyH2>
                            <TypographyP className="mb-4 text-base leading-relaxed text-rose-900/90">
                                <b>What is this project about? PuduCan is a comprehensive initiative aimed at reshaping how oncology care is navigated, bridging critical gaps between early diagnosis and treatment.</b>
                            </TypographyP>
                            <TypographyP className="text-base leading-relaxed text-rose-900/70">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. (Dummy paragraph - to be updated by admin later).
                            </TypographyP>
                        </div>

                        {/* 2. FIX: Changed "What is PuduCan?" to "Our Approach" */}
                        <div className="flex flex-col justify-between rounded-2xl border border-pink-200/50 bg-pink-50 p-8 shadow-lg shadow-pink-200/50 transition-all hover:shadow-xl hover:shadow-pink-200/60 lg:col-span-1">
                            <div>
                                <TypographyH2 className="mb-4 text-xl font-semibold text-rose-950">
                                    Our Approach
                                </TypographyH2>
                                <TypographyP className="text-base leading-relaxed text-rose-900/80">
                                    <b>We focus on improving patient-reported outcomes and
                                    care experiences across the cancer care continuum through
                                    a Community-Oriented Model of Patient Navigation System.</b>
                                </TypographyP>
                            </div>
                        </div>

                        {/* 3. The Study (Spans 2 columns) */}
                        <div className="flex flex-col rounded-2xl border border-pink-200/50 bg-pink-50 p-8 shadow-lg shadow-pink-200/50 transition-all hover:shadow-xl hover:shadow-pink-200/60 lg:col-span-2">
                            <TypographyH2 className="mb-4 text-xl font-semibold text-rose-950">
                                The Study
                            </TypographyH2>
                            <TypographyP className="mb-8 text-base leading-relaxed text-rose-900/80 max-w-3xl">
                                <b>The project integrates community and hospital navigators into the
                                healthcare system to create smoother patient navigation
                                experiences.</b>
                            </TypographyP>

                            {/* Nested grid for the navigators */}
                            <div className="mt-auto grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-pink-100">
                                    <h3 className="mb-2 text-base font-semibold text-rose-950">
                                        Community Navigators
                                    </h3>
                                    <p className="text-sm leading-relaxed text-rose-900/70">
                                        <b>Trained lay workers providing informational and emotional
                                        support directly to patients.</b>
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-pink-100">
                                    <h3 className="mb-2 text-base font-semibold text-rose-950">
                                        Hospital Navigators
                                    </h3>
                                    <p className="text-sm leading-relaxed text-rose-900/70">
                                        <b>Junior nurses or social workers helping coordinate treatment
                                        and critical decision-making.</b>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Mission (Spans full width at the bottom) */}
                        <div className="rounded-2xl border border-pink-200/50 bg-pink-100/90 p-8 shadow-lg shadow-pink-200/50 transition-all hover:shadow-xl hover:shadow-pink-200/60 lg:col-span-3 lg:p-12 text-center">
                            <TypographyH2 className="mb-4 text-2xl font-semibold text-rose-950">
                                Our Mission
                            </TypographyH2>
                            <TypographyP className="mx-auto max-w-4xl text-base leading-relaxed text-rose-900/80">
                                <b>PuduCan exists to bridge gaps in the cancer care pathway—from
                                screening and diagnosis to treatment, survivorship, and palliative
                                care—while emphasizing empathy, accessibility, and coordinated
                                healthcare experiences.</b>
                            </TypographyP>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    )
}