import Navbar from '@/components/layout/Navbar'
import { ReactNode } from 'react'

export const metadata = {
    title: 'PuduCan - JIPMER',
    description:
        'PuduCan - Jipmer pondy is an app designed to handle, care and help cancer patients.',
}

export default function PuduCanLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <Navbar />
            {children}
        </div>
    )
}
