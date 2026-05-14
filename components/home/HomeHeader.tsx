// components/HomeHeader.tsx
import Image from 'next/image'
import { ModeToggle } from '../ui/toggle'

export default function HomeHeader() {
    return (
        <header className="w-full bg-white dark:bg-text-900 border-b border-base-200 dark:border-base-300">
            <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                {/* Logo & Title */}
                <div className="flex items-center space-x-3">
                    <Image
                        src="/jipmer-logo.png"
                        alt="JIPMER Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                    />

                    <div className="leading-tight">
                        <h1 className="text-lg font-semibold text-text-900 dark:text-white">
                            PuduCan
                        </h1>
                        <p className="hidden text-xs text-text-500 dark:text-white/60 sm:block">
                            Cancer Care Coordination
                        </p>
                    </div>
                </div>

                {/* Theme Toggle */}
                <div className="text-foreground">
                    <ModeToggle />
                </div>
            </div>
        </header>
    )
}
