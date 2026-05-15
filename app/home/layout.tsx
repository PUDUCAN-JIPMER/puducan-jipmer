import HomeNavbar from '@/components/home/HomeNavbar'
import NavigationLoading from './NavigationLoading'
import Footer from '@/components/ui/footer'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <HomeNavbar />
            <NavigationLoading />

            <main className="flex-1">{children}</main>

            <Footer />
        </div>
    )
}
