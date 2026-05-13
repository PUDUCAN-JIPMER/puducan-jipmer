import HeroSection from '@/components/home/HeroSection'
import ProjectOverview from '@/components/home/ProjectOverview'
import MetricsSection from '@/components/home/MetricsSection'

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <ProjectOverview />
            <MetricsSection />
        </div>
    )
}
