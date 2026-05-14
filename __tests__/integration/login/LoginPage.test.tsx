import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import LoginPage from '@/app/login/page'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import userEvent from '@testing-library/user-event'

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
    useSearchParams: vi.fn(() => ({
        get: vi.fn((key) => (key === 'role' ? null : undefined)),
    })),
}))

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}))

describe('LoginPage (Integration)', () => {
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

    it('validates required fields', async () => {
        render(<LoginPage />)
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))
        expect(await screen.findByText(/Email is required/i)).toBeInTheDocument()
        expect(await screen.findByText(/Password is required/i)).toBeInTheDocument()
    })

    it('submits with correct email and password', async () => {
        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText('Email Address'), {
            target: { value: 'test@example.com' },
        })
        fireEvent.change(screen.getByLabelText('Password'), {
            target: { value: 'secret123' },
        })

        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'test@example.com',
                'secret123'
            )
        })
    })

    // it('shows toast error on Firebase error', async () => {
    //     const mockedSignIn = signInWithEmailAndPassword as unknown as Mock
    //     mockedSignIn.mockRejectedValueOnce({ code: 'auth/wrong-password' })

    //     const toastErrorSpy = toast.error as Mock

    //     render(<LoginPage />)

    //     // Fill in the form
    //     fireEvent.change(screen.getByPlaceholderText(/Email/i), {
    //         target: { value: 'test@example.com' },
    //     })
    //     fireEvent.change(screen.getByPlaceholderText(/Password/i), {
    //         target: { value: 'wrong' },
    //     })

    //     // Submit the form instead of just clicking the button
    //     const form = screen.getByRole('form')
    //     fireEvent.submit(form)

    //     await waitFor(() => {
    //         expect(toastErrorSpy).toHaveBeenCalledWith(
    //             'Invalid email or password. Please try again.'
    //         )
    //     })
    // })

    it('redirects logged in user based on role', () => {
        ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: { uid: '123' },
            role: 'doctor',
            isLoadingAuth: false,
        })

        render(<LoginPage />)

        expect(push).toHaveBeenCalledWith('/PuduCan/doctor')
    })
})
