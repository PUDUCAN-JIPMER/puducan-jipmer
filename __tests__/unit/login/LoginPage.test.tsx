import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import LoginPage from '@/app/login/page'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'sonner'
import { FirebaseError } from 'firebase/app'

// Mock dependencies
vi.mock('firebase/auth', () => {
    return {
        getAuth: vi.fn(() => ({
            useDeviceLanguage: vi.fn(), // mock it so your code doesn't crash
        })),
        signInWithEmailAndPassword: vi.fn(),
    }
})

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}))

describe('LoginPage (Unit)', () => {
    const push = vi.fn()

    beforeEach(() => {
        ;(useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ push })
        ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: null,
            role: null,
            isLoadingAuth: false,
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('renders email and password inputs', () => {
        render(<LoginPage />)

        expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument()
    })

    it('toggles password visibility', () => {
        render(<LoginPage />)
        const passwordInput = screen.getByPlaceholderText(/Password/i)
        const toggleButton = screen.getByRole('button', { name: '' })

        expect(passwordInput).toHaveAttribute('type', 'password')
        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('shows error when email is empty', async () => {
        render(<LoginPage />)
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
        expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    })

    it('shows error when email is invalid', async () => {
        render(<LoginPage />)
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'notanemail' } })
        fireEvent.change(screen.getByPlaceholderText(/password/i), {
            target: { value: 'password123' },
        })
        fireEvent.submit(screen.getByRole('form'))
        expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument()
    })

    it('shows error when password is empty', async () => {
        render(<LoginPage />)
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
        expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
    })

    it('shows error when password is less than 6 characters', async () => {
        render(<LoginPage />)
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: '123' } })
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
        expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument()
    })

    it('redirects to admin route when role is admin', () => {
        ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: { uid: '123' },
            role: 'admin',
            isLoadingAuth: false,
        })
        render(<LoginPage />)
        expect(push).toHaveBeenCalledWith('/PuduCan/admin')
    })

    it('redirects to doctor route when role is doctor', () => {
        ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: { uid: '123' },
            role: 'doctor',
            isLoadingAuth: false,
        })
        render(<LoginPage />)
        expect(push).toHaveBeenCalledWith('/PuduCan/doctor')
    })

    it('redirects to doctor route when role is nurse', () => {
        ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: { uid: '123' },
            role: 'nurse',
            isLoadingAuth: false,
        })
        render(<LoginPage />)
        expect(push).toHaveBeenCalledWith('/PuduCan/nurse')
    })

    it('redirects to doctor route when role is asha', () => {
        ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: { uid: '123' },
            role: 'asha',
            isLoadingAuth: false,
        })
        render(<LoginPage />)
        expect(push).toHaveBeenCalledWith('/PuduCan/asha')
    })

    it('has a link to go home', () => {
        render(<LoginPage />)
        const link = screen.getByRole('link', { name: /click to go home/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/home')
    })

    it('does not redirect while auth is loading', () => {
        ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: null,
            role: null,
            isLoadingAuth: true,
        })
        render(<LoginPage />)
        expect(push).not.toHaveBeenCalled()
    })

    it('shows invalid credential error on wrong password', async () => {
        ;(signInWithEmailAndPassword as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new FirebaseError('auth/invalid-credential', 'Invalid credential')
        )
        render(<LoginPage />)
        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: 'test@test.com' },
        })
        fireEvent.change(screen.getByPlaceholderText(/password/i), {
            target: { value: 'password123' },
        })
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid email or password. Please try again.')
        })
    })

    it('shows too many requests error', async () => {
        ;(signInWithEmailAndPassword as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new FirebaseError('auth/too-many-requests', 'Too many requests')
        )
        render(<LoginPage />)
        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: 'test@test.com' },
        })
        fireEvent.change(screen.getByPlaceholderText(/password/i), {
            target: { value: 'password123' },
        })
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Too many failed login attempts. Please try again later.'
            )
        })
    })

    it('shows signing in text while loading', async () => {
        ;(signInWithEmailAndPassword as ReturnType<typeof vi.fn>).mockImplementationOnce(
            () => new Promise(() => {}) // never resolves — simulates loading
        )
        render(<LoginPage />)
        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: 'test@test.com' },
        })
        fireEvent.change(screen.getByPlaceholderText(/password/i), {
            target: { value: 'password123' },
        })
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
        expect(await screen.findByText(/signing in/i)).toBeInTheDocument()
    })
})
