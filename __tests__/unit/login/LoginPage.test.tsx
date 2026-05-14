import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import LoginPage from '@/app/login/page'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Mock dependencies
vi.mock("firebase/auth", () => {
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

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    render(<LoginPage />)
    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByRole('button', { name: '' })

    expect(passwordInput).toHaveAttribute('type', 'password')
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
