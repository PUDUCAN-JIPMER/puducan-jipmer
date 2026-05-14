'use client'

export default function ImpactSection() {
    const challenges = [
        {
            title: 'Earlier detection',
            desc: 'through coordinated community screening',
            dotColor: 'bg-color-blue',
            borderColor: 'border-l-4 border-color-blue',
        },
        {
            title: 'Seamless pathways',
            desc: 'from PHC centers to hospital care',
            dotColor: 'bg-color-green',
            borderColor: 'border-l-4 border-color-green',
        },
        {
            title: 'Continuity of care',
            desc: 'throughout the cancer journey',
            dotColor: 'bg-color-yellow',
            borderColor: 'border-l-4 border-color-yellow',
        },
        {
            title: 'Better outcomes',
            desc: 'through coordinated clinical decision-making',
            dotColor: 'bg-accent-primary',
            borderColor: 'border-l-4 border-accent-primary',
        },
    ]

    return (
        <section className="relative py-20 sm:py-28 lg:py-32 bg-gradient-to-b from-white via-blue-50/30 to-white border-b border-base-200">
            {/* Atmospheric accents */}
            <div className="absolute inset-0 -z-10 opacity-60">
                <div className="absolute left-0 top-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 via-transparent to-transparent rounded-full blur-3xl"></div>
                <div className="absolute right-0 bottom-0 w-96 h-96 bg-gradient-to-tl from-green-400/10 via-transparent to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 lg:px-16 xl:px-24">
                <div className="max-w-4xl">
                    {/* Label */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        </div>
                        <p className="text-xs font-semibold tracking-widest text-accent-primary uppercase">
                            The Challenge
                        </p>
                    </div>

                    {/* Core message */}
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-900 leading-tight mb-8">
                        Fragmented pathways create barriers to care
                    </h2>

                    <div className="space-y-6 text-lg text-text-600 leading-relaxed mb-12">
                        <p>
                            When cancer patients navigate fragmented healthcare systems—disconnected between community health centers, primary care, and hospitals—outcomes suffer. Delayed diagnoses, lost follow-ups, and patient confusion increase.
                        </p>
                        
                        <p>
                            PuduCan bridges these gaps through coordinated patient navigation. By connecting ASHA workers, nurses, doctors, and administrators in real-time, we enable:
                        </p>
                    </div>

                    {/* Solution cards - unified surface with surgical color accents */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {challenges.map((item, idx) => (
                            <div
                                key={idx}
                                className={`${item.borderColor} bg-white/70 backdrop-blur-sm border border-base-200 p-5 rounded-lg transition-all hover:shadow-lg hover:bg-white/90 group`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${item.dotColor} flex-shrink-0 mt-0.5`}></div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-text-900 text-base mb-1">
                                            {item.title}
                                        </p>
                                        <p className="text-sm text-text-600">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
