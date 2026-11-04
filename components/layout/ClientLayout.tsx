'use client'

import { useAuthStatus } from '@/hooks/auth/useAuthStatus'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import Navbar from './Navbar'

export default function ClientLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const { checking } = useAuthStatus() // 🔄 shared auth check

    if (checking) return null

    const hideNavbar = pathname === '/login' || pathname === '/' || pathname.startsWith('/home')

    return (
        <>
            {!hideNavbar && <Navbar />}
            {children}
        </>
    )
}

import { usePathname } from 'next/navigation';
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    {isMobile && <MobileNavbar />}
const MobileNavbar = () => {
    return <div>Mobile Navbar</div>;
};

import MobileNavbar from './MobileNavbar'

    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }, []);

      {isMobile && <MobileNavbar />}
