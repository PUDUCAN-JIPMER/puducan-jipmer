import { vi } from 'vitest'

// __mocks__/@/firebase.ts
export const db = {}
export const auth = { useDeviceLanguage: vi.fn() }
export const app = {}
