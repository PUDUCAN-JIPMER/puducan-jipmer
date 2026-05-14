'use client'

import { Moon, Sun, Sunrise, Sunset } from 'lucide-react'
import { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

type UserData = {
    name?: string
    role?: string
}

export default function WelcomeBanner() {
    const [userData, setUserData] = useState<UserData>({})

    const getGreeting = () => {
        const formatter = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })

        const hour = Number(formatter.format(new Date()))

        if (hour < 12) return 'Good Morning'
        if (hour < 17) return 'Good Afternoon'
        if (hour < 21) return 'Good Evening'

        return 'Good Night'
    }

    const getGreetingIcon = () => {
        const hour = new Date().getHours()

        if (hour < 12) {
            return <Sunrise className="h-8 w-8 text-yellow-400" />
        }

        if (hour < 17) {
            return <Sun className="h-8 w-8 text-yellow-400" />
        }

        if (hour < 21) {
            return <Sunset className="h-8 w-8 text-orange-400" />
        }

        return <Moon className="h-8 w-8 text-blue-400" />
    }

    const [greeting] = useState(getGreeting())

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = auth.currentUser

                if (!currentUser?.email) return

                const email = currentUser.email.trim().toLowerCase()

                const q = query(
                    collection(db, 'users'),
                    where('email', '==', email)
                )

                const querySnapshot = await getDocs(q)

                if (!querySnapshot.empty) {
                    const user = querySnapshot.docs[0].data()

                    setUserData({
                        name: user.name || user.fullName || 'User',
                        role: user.role || '',
                    })
                }
            } catch (error) {
                console.error(error)
            }
        }

        fetchUser()
    }, [])

    return (
    <div className="mb-6 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                    {greeting},{' '}
                    <span className="text-green-500">
                        {userData?.name || 'User'}
                    </span>
                </h1>

                <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                    Hope you&apos;re having a productive day at PuduCan ✨
                </p>

                {userData?.role && (
                    <div className="mt-2 inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-green-400">
                        {userData.role}
                    </div>
                )}
            </div>

            <div className="hidden sm:flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/70 p-4">
                {getGreetingIcon()}
            </div>
        </div>
    </div>
)
}