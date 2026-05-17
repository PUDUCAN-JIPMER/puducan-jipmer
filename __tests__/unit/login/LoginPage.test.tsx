import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import LoginPage from '@/app/login/page'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'sonner'
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
}))

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}))

describe('LoginPage (Unit)', () => {
    const push = vi.fn()
    const signInMock = signInWithEmailAndPassword as unknown as ReturnType<typeof vi.fn>
    const toastErrorMock = toast.error as unknown as ReturnType<typeof vi.fn>

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
        const toggleButton = screen.getByRole('button', { name: /show password/i })
        
        expect(passwordInput).toHaveAttribute('type', 'password')
        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')
    })

    it('submits valid credentials with the normalized email and password', async () => {
        const user = userEvent.setup()
        signInMock.mockResolvedValueOnce({})

        render(<LoginPage />)

        await user.type(screen.getByPlaceholderText(/Email/i), 'Doctor@Example.com')
        await user.type(screen.getByPlaceholderText(/Password/i), 'secret123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(signInMock).toHaveBeenCalledWith(
                expect.anything(),
                'doctor@example.com',
                'secret123'
            )
        })
    })

    it('does not submit when required fields are empty', async () => {
        const user = userEvent.setup()

        render(<LoginPage />)

        await user.click(screen.getByRole('button', { name: /sign in/i }))

        expect(await screen.findByText(/Email is required/i)).toBeInTheDocument()
        expect(await screen.findByText(/Password is required/i)).toBeInTheDocument()
        expect(signInMock).not.toHaveBeenCalled()
    })

    it('shows an error toast when login fails', async () => {
        const user = userEvent.setup()
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        signInMock.mockRejectedValueOnce(new Error('Network unavailable'))

        render(<LoginPage />)

        await user.type(screen.getByPlaceholderText(/Email/i), 'doctor@example.com')
        await user.type(screen.getByPlaceholderText(/Password/i), 'secret123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(toastErrorMock).toHaveBeenCalledWith(
                'An unexpected error occurred. Please try again.'
            )
        })
        expect(consoleErrorSpy).toHaveBeenCalledWith('Login error:', expect.any(Error))
        consoleErrorSpy.mockRestore()
    })

    it('clears the form after a successful login request', async () => {
        const user = userEvent.setup()
        signInMock.mockResolvedValueOnce({})

        render(<LoginPage />)

        const emailInput = screen.getByPlaceholderText(/Email/i)
        const passwordInput = screen.getByPlaceholderText(/Password/i)

        await user.type(emailInput, 'doctor@example.com')
        await user.type(passwordInput, 'secret123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(signInMock).toHaveBeenCalledTimes(1)
        })
        await waitFor(() => {
            expect(emailInput).toHaveValue('')
            expect(passwordInput).toHaveValue('')
        })
        expect(toastErrorMock).not.toHaveBeenCalled()
    })

    it('redirects an authenticated user to the route for their role', () => {
        ;(useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: { uid: 'doctor-1' },
            role: 'doctor',
            isLoadingAuth: false,
        })

        render(<LoginPage />)

        expect(push).toHaveBeenCalledWith('/PuduCan/doctor')
    })
})
