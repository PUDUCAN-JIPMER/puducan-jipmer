import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useBulkExport } from "@/hooks/table/useBulkExport"

const mockClick           = vi.fn()
const mockSetAttribute    = vi.fn()
const mockCreateObjectURL = vi.fn((_blob: Blob) => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

const fakeLink = {
    href: '',
    click: mockClick,
    setAttribute: mockSetAttribute,
}

beforeEach(() => {
    vi.clearAllMocks()

    global.URL.createObjectURL = mockCreateObjectURL as typeof URL.createObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    const original = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
            // Create a REAL anchor element satisfies appendChild's Node requirement
            const realAnchor = original('a')
            
            realAnchor.click        = mockClick
            realAnchor.setAttribute = mockSetAttribute
            return realAnchor
        }
        return original(tag)
    })
})

afterEach(() => {
    vi.restoreAllMocks()
})


const headers = [
    { name: 'Name',  key: 'name'  },
    { name: 'Phone', key: 'phone' },
    { name: 'Age',   key: 'age'   },
]

const allData = [
    { id: 'asha-1', name: 'Asha 1', phone: '1234', age: 30 },
    { id: 'asha-2', name: 'Asha 2', phone: '5678', age: 25 },
    { id: 'asha-3', name: 'Asha 3', phone: '9012', age: 40 },
]


describe('useBulkExport', () => {

    it('does nothing when selectedIds is empty', () => {
        const { result } = renderHook(() => useBulkExport())
        result.current.exportSelected([], headers, 'patients', allData as any)
        expect(mockClick).not.toHaveBeenCalled()
    })

    it('does nothing when no rows match the selected ids', () => {
        const { result } = renderHook(() => useBulkExport())
        result.current.exportSelected(['does-not-exist'], headers, 'patients', allData as any)
        expect(mockClick).not.toHaveBeenCalled()
    })

    it('triggers a file download when ids are provided', () => {
        const { result } = renderHook(() => useBulkExport())
        result.current.exportSelected(['asha-1'], headers, 'patients', allData as any)
        expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('only exports rows matching selectedIds', () => {
        const { result } = renderHook(() => useBulkExport())

        let capturedBlob: Blob | undefined
        mockCreateObjectURL.mockImplementation((_blob: Blob) => {
            capturedBlob = _blob
            return 'blob:mock-url'
        })

        result.current.exportSelected(['asha-1', 'asha-3'], headers, 'patients', allData as any)

        return capturedBlob!.text().then((text) => {
            expect(text).toContain('Asha 1')
            expect(text).toContain('Asha 3')
            expect(text).not.toContain('Asha 2')
        })
    })

    it('includes correct CSV header row', () => {
        const { result } = renderHook(() => useBulkExport())

        let capturedBlob: Blob | undefined
        mockCreateObjectURL.mockImplementation((_blob: Blob) => {
            capturedBlob = _blob
            return 'blob:mock-url'
        })

        result.current.exportSelected(['asha-1'], headers, 'patients', allData as any)

        return capturedBlob!.text().then((text) => {
            const firstLine = text.split('\n')[0]
            expect(firstLine).toBe('Name,Phone,Age')
        })
    })

    it('uses correct filename format', () => {
        const { result } = renderHook(() => useBulkExport())
        result.current.exportSelected(['asha-1'], headers, 'patients', allData as any)

        const date = new Date().toISOString().split('T')[0]
        expect(mockSetAttribute).toHaveBeenCalledWith('download', `patients_export_${date}.csv`)
    })

    it('handles missing field values — uses empty string', () => {
        const { result } = renderHook(() => useBulkExport())
        const incompleteData = [{ id: 'asha-1', name: 'Asha 1' }]

        let capturedBlob: Blob | undefined
        mockCreateObjectURL.mockImplementation((_blob: Blob) => {
            capturedBlob = _blob
            return 'blob:mock-url'
        })

        result.current.exportSelected(['asha-1'], headers, 'patients', incompleteData as any)

        return capturedBlob!.text().then((text) => {
            expect(text).toContain('"Asha 1",""')
        })
    })

    it('revokes the object URL after download', () => {
        const { result } = renderHook(() => useBulkExport())
        result.current.exportSelected(['asha-1'], headers, 'patients', allData as any)
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
})