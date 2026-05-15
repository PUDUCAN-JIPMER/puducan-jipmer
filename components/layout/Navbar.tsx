'use client'

import { auth, db } from '@/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { Menu, Sun, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ModeToggle } from '../ui/toggle'
import SignOutButton from './SignOutButton'
import { paperSavedLabel } from '@/lib/paperSaved'


export default function Navbar() {
    const [username, setUsername] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const fetchUsername = async () => {
            const user = auth.currentUser
            if (!user) return

            const q = query(
                collection(db, 'users'),
                where('email', '==', user.email!.trim().toLowerCase())
            )
            const snap = await getDocs(q)

            if (!snap.empty) {
                const userData = snap.docs[0].data()
                setUsername(userData.name || user.email)
            }
        }

        fetchUsername()
    }, [])

    
    return (
        <nav className="bg-background flex items-center justify-between border-b px-4 py-3 shadow md:px-8">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-green-600">
                PuduCan
            </Link>


            {/* ✅ Paper Saved Badge — visible on all screen sizes */}
            <span className="flex items-center gap-1 text-xs font-medium text-green-800 bg-green-100 border border-green-300 rounded-full px-3 py-1 dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                {paperSavedLabel}
            </span>


            {/* Hamburger */}
            <div className="md:hidden">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-gray-600 focus:outline-none"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
                <ModeToggle />
                {/* {username && (
                    <span className="flex items-center gap-2 text-foreground font-medium capitalize select-none">
                        <User className="h-4 w-4" /> {username}
                    </span>
                )} */}
                <SignOutButton />
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div className="absolute top-16 rounded-md right-0 z-50 min-w-[160px] bg-background border-t shadow-md md:hidden">
                    <div className="flex flex-col justify-center items-center p-4 gap-3">
                        <ModeToggle/>

                        {/* {username && (
                            <span className="flex items-center gap-2 text-foreground font-medium capitalize">
                                <User className="h-4 w-4" /> {username}
                            </span>
                        )} */}

                        <SignOutButton className="w-full" />
                    </div>
                </div>
            )}
        </nav>
    )
}
