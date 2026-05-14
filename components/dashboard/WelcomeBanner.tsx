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
            return <Sunrise className="h-5 w-5 text-yellow-400" />
        }

        if (hour < 17) {
            return <Sun className="h-5 w-5 text-yellow-400" />
        }

        if (hour < 21) {
            return <Sunset className="h-5 w-5 text-orange-400" />
        }

        return <Moon className="h-5 w-5 text-blue-400" />
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
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
        <span className="text-xs sm:text-sm font-medium text-zinc-300">
            {greeting},{' '}
            <span className="text-green-500">
                {userData?.name || 'User'}
            </span>
        </span>

        <span>{getGreetingIcon()}</span>
    </div>
)
}