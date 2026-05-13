'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, Loader2, HeartPulse, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FirebaseError } from 'firebase/app'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import Link from 'next/link'

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, { message: 'Email is required.' })
        .email({ message: 'Please enter a valid email address.' }),
    password: z
        .string()
        .min(1, { message: 'Password is required.' })
        .min(6, 'Password must be at least 6 characters long.'),
})

type LoginFormInputs = z.infer<typeof loginSchema>

const roleConfig: Record<string, { title: string; subtitle: string }> = {
    doctor: { title: 'Doctor Portal', subtitle: 'Access patient records and clinical data' },
    nurse: { title: 'Nurse Access', subtitle: 'Manage care coordination and monitoring' },
    asha: { title: 'ASHA Navigation Portal', subtitle: 'Connect patients with resources' },
    admin: { title: 'Administrator Dashboard', subtitle: 'Oversee platform operations' },
}

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { user, role, isLoadingAuth } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const roleParam = searchParams.get('role') as keyof typeof roleConfig | null

    useEffect(() => {
        if (!isLoadingAuth && user && role) {
            const roleRoutes: Record<string, string> = {
                admin: '/PuduCan/admin',
                asha: '/PuduCan/asha',
                nurse: '/PuduCan/nurse',
                doctor: '/PuduCan/doctor',
            }

            const targetRoute = roleRoutes[role] || '/dashboard'
            router.push(targetRoute)
        }
    }, [user, role, isLoadingAuth, router])

    const roleDisplay = roleParam && roleConfig[roleParam] ? roleConfig[roleParam] : null

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormInputs) => {
        try {
            setLoading(true)

            await signInWithEmailAndPassword(auth, data.email.toLowerCase(), data.password)

            reset()
        } catch (error) {
            console.error('Login error:', error)

            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        toast.error('Invalid email or password. Please try again.')
                        break
                    case 'auth/invalid-email':
                        toast.error('The email address is not valid.')
                        break
                    case 'auth/user-disabled':
                        toast.error('Your account has been disabled. Please contact support.')
                        break
                    case 'auth/too-many-requests':
                        toast.error('Too many failed login attempts. Please try again later.')
                        break
                    default:
                        toast.error('Login failed. Please check your Internet Connection.')
                        break
                }
            } else {
                toast.error('An unexpected error occurred. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="min-h-screen w-full flex flex-col">
            {/* Header */}
            <div className="border-b border-border bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 py-4 flex items-center gap-3">
                    <Image
                        src="/jipmer-logo.png"
                        alt="JIPMER"
                        width={40}
                        height={40}
                        className="object-contain"
                    />
                    <div>
                        <div className="text-sm font-medium text-muted">JIPMER</div>
                        <div className="text-lg font-bold text-primary">PuduCan</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 bg-background">
                <div className="w-full max-w-md">
                    {/* Role Context */}
                    {roleDisplay && (
                        <div className="mb-8 p-4 rounded-lg bg-accent/5 border border-accent/20">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 mb-3">
                                <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                                    {roleParam}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-primary mb-1">
                                {roleDisplay.title}
                            </h1>
                            <p className="text-sm text-muted">
                                {roleDisplay.subtitle}
                            </p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Heading */}
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-primary">
                                Welcome to PuduCan
                            </h2>
                            <p className="text-muted">
                                Sign in with your credentials to continue
                            </p>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-primary">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                                />
                                <Input
                                    placeholder="you@example.com"
                                    type="email"
                                    {...register('email')}
                                    className="h-11 pl-10 border-border bg-white dark:bg-slate-900 focus-visible:ring-2 focus-visible:ring-accent/50"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-primary">
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                                />
                                <Input
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className="h-11 pl-10 pr-10 border-border bg-white dark:bg-slate-900 focus-visible:ring-2 focus-visible:ring-accent/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-11 w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Signing In...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        {/* Footer */}
                        <div className="space-y-3 border-t border-border pt-6">
                            <Link href="/home" className="block">
                                <p className="text-center text-sm text-muted hover:text-accent transition-colors">
                                    Back to home
                                </p>
                            </Link>
                            <p className="text-center text-xs text-muted/60">
                                Secured by Firebase Authentication
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}
