import Link from 'next/link'
import Image from 'next/image'
import {
    Activity,
    ArrowRight,
    HeartPulse,
    FileText,
    Users,
    PhoneCall,
    Sparkles,
    ShieldAlert,
    BookmarkCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import bgImage from '@/assets/homepage-1.jpg'

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
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="rounded-md border-white/30 text-white transition-colors duration-200 hover:bg-white/10"
                            >
                                <Link href="/home/about">About PuduCan</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
