'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignOutButton({ className }: { className?: string }) {
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            // Clear server-side session cookie first
            await fetch('/api/auth/session', { method: 'DELETE' })
        } catch (err) {
            console.warn('Failed to clear session cookie', err)
            // Continue with sign-out anyway: Firebase Auth being signed out is more important than the cookie being cleared
        }
        await signOut(auth)
        await fetch('/api/auth/session', { method: 'DELETE' })
        router.push('/login')
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className={`flex items-center gap-2 ${className}`}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You'll be redirected to the login page.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
