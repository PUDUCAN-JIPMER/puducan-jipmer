'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { user, role, isLoadingAuth } = useAuth()
    const router = useRouter()

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
        <section className="relative min-h-screen w-full overflow-hidden">
            <Image
                src="/login-bg.jpg"
                alt="Login background"
                fill
                priority
                className="z-0 object-cover"
            />

            <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900/70 via-slate-900/55 to-emerald-900/55" />

            <div className="relative z-20 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
                <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl md:grid-cols-2">
                    <div className="hidden flex-col justify-between p-10 text-white md:flex">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/jipmer-logo.png"
                                alt="JIPMER"
                                width={48}
                                height={48}
                                className="rounded-md bg-white/90 p-1"
                            />
                            <div>
                                <p className="text-sm font-medium tracking-wide text-emerald-200">
                                    JIPMER · Puducherry
                                </p>
                                <p className="text-xl font-bold">PuduCan</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-200">
                                <HeartPulse size={20} />
                                <span className="text-sm font-medium tracking-widest uppercase">
                                    Care, organised.
                                </span>
                            </div>
                            <h2 className="text-3xl leading-tight font-bold">
                                Welcome back to the patient management portal.
                            </h2>
                            <p className="text-sm text-slate-200/90">
                                Sign in with your hospital credentials to access patient records,
                                screenings, and follow-ups across admin, doctor, nurse, and ASHA
                                roles.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-200/80">
                            <ShieldCheck size={14} />
                            <span>Secured by Firebase Authentication</span>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-background/95 space-y-5 p-8 backdrop-blur-sm md:p-10"
                    >
                        <div className="space-y-2 text-center md:hidden">
                            <Image
                                src="/jipmer-logo.png"
                                alt="JIPMER"
                                width={56}
                                height={56}
                                className="mx-auto rounded-md bg-white p-1 shadow-sm"
                            />
                        </div>

                        <div className="space-y-1 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">
                                <span className="text-emerald-600">JIPMER</span>{' '}
                                <span className="text-foreground">LOGIN</span>
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Enter your credentials to continue
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                                />
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    {...register('email')}
                                    className="h-11 border-gray-300 bg-gray-50 pl-9 focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-800/60"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="relative">
                                <Lock
                                    size={16}
                                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                                />
                                <Input
                                    placeholder="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className="h-11 border-gray-300 bg-gray-50 pr-10 pl-9 focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-800/60"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-11 w-full cursor-pointer rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
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

                        <Link href="/home" className="block">
                            <p className="cursor-pointer text-center text-sm text-gray-500 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400">
                                Click to go home
                            </p>
                        </Link>

                        <p className="text-muted-foreground border-t pt-4 text-center text-[11px]">
                            Secured by Firebase Auth · PuduCan v1.1.0
                        </p>
                    </form>
                </div>
            </div>
        </section>
    )
}
