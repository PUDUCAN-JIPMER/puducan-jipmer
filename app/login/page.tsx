'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
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

// Infer the type from the schema for type safety
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

            // Perform Firebase Authentication
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
        <section className="relative min-h-screen w-full">
            {/* Background Image */}
            <Image
                src="/login-bg.jpg"
                alt="Login background"
                layout="fill"
                objectFit="cover"
                priority
                className="z-0"
            />

            {/* Overlay */}
            <div className="absolute inset-0 z-10 bg-black/30"></div>

            {/* Form Container */}
            <div className="relative z-20 flex min-h-screen items-center justify-center px-4">
                <form
                    aria-label="login form"
                    onSubmit={handleSubmit(onSubmit)} // Use handleSubmit from react-hook-form
                    className="bg-background w-full max-w-md space-y-6 rounded-lg p-6 opacity-90 shadow-md backdrop-blur-sm"
                >
                    <h1 className="text-center text-2xl font-bold">
                        <div>
                            <span className="text-green-600">JIPMER</span> LOGIN
                        </div>
                    </h1>

                    {/* Email Input */}
                    <div>
                        <Input
                            placeholder="Email"
                            type="email"
                            {...register('email')}
                            className="border border-gray-300 bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                            // disabled={loading}
                        />
                        {/* Display validation error if any */}
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <Input
                            placeholder="Password"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')} // Register the password input
                            className="border border-gray-300 bg-gray-100 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                            // disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            disabled={loading}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {/* Display validation error if any */}
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit" // Important: Set type to submit for form submission
                        className="w-full cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        // disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>

                    <Link href="/home">
                        <p className="cursor-pointer text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            Click to go home
                        </p>
                    </Link>
                </form>
            </div>
        </section>
    )
}
