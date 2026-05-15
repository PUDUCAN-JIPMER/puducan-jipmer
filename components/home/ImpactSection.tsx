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
        <section className="relative py-12 lg:py-16 bg-gradient-to-b from-white via-blue-50/30 to-white border-b border-base-200">
            {/* Atmospheric accents */}
            <div className="absolute inset-0 -z-10 opacity-60">
                <div className="absolute left-0 top-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 via-transparent to-transparent rounded-full blur-3xl"></div>
                <div className="absolute right-0 bottom-0 w-96 h-96 bg-gradient-to-tl from-green-400/10 via-transparent to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 lg:px-16 xl:px-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Left Column - Text Content */}
                    <div>
                        {/* Label */}
                        <div className="flex items-center gap-3 mb-6">
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
                        <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-text-900 leading-tight mb-6">
                            Fragmented pathways create barriers to care
                        </h2>

                        <div className="space-y-4 text-base text-text-600 leading-relaxed">
                            <p>
                                When cancer patients navigate fragmented healthcare systems—disconnected between community health centers, primary care, and hospitals—outcomes suffer. Delayed diagnoses, lost follow-ups, and patient confusion increase.
                            </p>
                            
                            <p>
                                PuduCan bridges these gaps through coordinated patient navigation. By connecting ASHA workers, nurses, doctors, and administrators in real-time, we enable:
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Timeline */}
                    <div className="relative">
                        {/* Vertical connecting line - PROMINENT */}
                        <div className="absolute left-3.5 top-0 bottom-0 w-1.5 bg-gradient-to-b from-color-blue via-color-green to-accent-primary"></div>
                        
                        {/* Timeline items */}
                        <div className="space-y-16 pl-20">
                            {challenges.map((item, idx) => (
                                <div key={idx} className="relative group">
                                    {/* Numbered dot on line */}
                                    <div className="absolute -left-16 top-0">
                                        <div className={`w-8 h-8 rounded-full ${item.dotColor} border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-300 group-hover:scale-125 group-hover:shadow-xl relative z-10`}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                    
                                    {/* Content - no box */}
                                    <div className="transition-all duration-300 group-hover:pl-3">
                                        <h3 className="font-bold text-text-900 text-lg mb-2 group-hover:text-accent-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-text-600 text-sm leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
