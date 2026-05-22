import React from "react";
import {  render, screen, waitFor } from "@testing-library/react";
import { it, describe, expect, vi, beforeEach } from "vitest";
import {  getDocs, updateDoc } from "firebase/firestore";
import { BulkAssignDialog } from "@/components/dialogs/BulkAssignDialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


// firebase functions are mocked to avoid actual database operations during tests
vi.mock('@/firebase', ()=>({ db: {}}))
vi.mock("firebase/firestore", () => ({
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    doc: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({ orgId: 'testOrg' })
}))

//fake ASHA data for testing
const mockAshas = [
    {id: 'asha-1', name: 'Asha 1', email: 'asha1@example.com', phoneNumber: '1234567890'},
    {id: 'asha-2', name: 'Asha 2', email: 'asha2@example.com', phoneNumber: '0987654321'},
    {id: 'asha-3', name: 'Asha 3', email: 'asha3@example.com', phoneNumber: '1112223333'}
]

function wrapper ({children}: {children: React.ReactNode}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false
            }
        },
    })
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

//firestore getDocs mock to return fake ASHA data
const getMockGetDocs = (ashas: typeof mockAshas) => {
    return {
        docs: ashas.map(asha => ({
            id: asha.id,
            data: () => ({ name: asha.name, email: asha.email, phoneNumber: asha.phoneNumber })
        }))
    }
}


// store
describe('BulkAssignDialog', () => { 
    beforeEach(() => {
        vi.clearAllMocks() // reset mocks before each test
        vi.mocked(getDocs).mockResolvedValue(getMockGetDocs(mockAshas) as any) // mock getDocs to return fake ASHA data
        vi.mocked(updateDoc).mockResolvedValue(undefined) 
        
    })

    it('renders correct patient count in title', async() => {
        render (
            <BulkAssignDialog open={true} ids={['p1', 'p2', 'p3']} onClose={vi.fn()}/>, {wrapper} )

        expect(screen.getByText('Assign ASHA to 3 patients')).toBeInTheDocument()
    })
     
    it('render singular label for one patient', async () => {
        render(<BulkAssignDialog open={true} ids={['p1']} onClose={vi.fn()} />, {wrapper})
        
        expect(screen.getByText('Assign ASHA to 1 patient')).toBeInTheDocument()
    })

    it('render the ASHA list beofre fetching', async() => {
        render(<BulkAssignDialog open={true} ids={['p1']} onClose={vi.fn()} />, {wrapper})
        await waitFor( () => {
            expect(screen.getByText('Asha 1')).toBeInTheDocument()
            expect(screen.getByText('Asha 2')).toBeInTheDocument()
            expect(screen.getByText('Asha 3')).toBeInTheDocument()
        })
    })

    it('render unassign option when no ASHA is selected', async () => {
        render(<BulkAssignDialog open={true} ids={['p1']} onClose={vi.fn()} />, {wrapper})
        await waitFor(() => {
            expect(screen.getByText('Unassign ASHA')).toBeInTheDocument()
        })
    })

    it('does not fetch ASHAs when dialog is closed', async () => {
        render(<BulkAssignDialog open={false} ids={['p1']} onClose={vi.fn()} />, {wrapper})
        expect(getDocs).not.toHaveBeenCalled()
    })
   
})



