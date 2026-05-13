'use client'

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
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800 p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {greeting},{' '}
                <span className="text-green-500">
                    {userData?.name || 'User'}
                </span>{' '}
                👋
            </h1>

            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                Hope you&apos;re having a productive day at PuduCan ✨
            </p>

            {userData?.role && (
                <div className="mt-3 inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-green-400">
                    {userData.role}
                </div>
            )}
        </div>
    )
}