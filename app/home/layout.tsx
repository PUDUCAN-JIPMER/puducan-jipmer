import HomeNavbar from '@/components/home/HomeNavbar'
import NavigationLoading from './NavigationLoading'
import Footer from '@/components/ui/footer'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <HomeNavbar />
            <NavigationLoading />

            <main className="flex-1 p-4">
                {children}
            </main>

            <Footer />
        </div>
    )
}