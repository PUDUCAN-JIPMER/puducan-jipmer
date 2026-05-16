import { act, renderHook, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { it, describe, expect, vi, beforeEach } from "vitest";
import { useBulkSelectionStore } from "@/store/bulk-selection-store";



// firebase functions are mocked to avoid actual database operations during tests
vi.mock('@/firestore', ()=>({ db: {}}))
vi.mock("firebase/firestore", () => ({
    deleteDoc: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn(),
    serverTimestamp: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

// store
describe('useBulkSelectionStore', () => { 
    beforeEach(() => {
        useBulkSelectionStore.getState().clearSelection() // reset store before each test
    })

    it('select a row and check if it is selected', () => {
        const { result } = renderHook(() => useBulkSelectionStore())
        act(() => { result.current.toggleRow('row1') })
        expect(result.current.isSelected('row1')).toBe(true)
    })

    it('deselect an already selected row', () => {
        const { result } = renderHook(() => useBulkSelectionStore())
        act(() =>{ result.current.toggleRow('row1') })
        act(() =>{ result.current.toggleRow('row1') })
        expect(result.current.isSelected('row1')).toBe(false)
    })

    it('does not affect other rows when toggling one row', () => {
        const { result } = renderHook(() => useBulkSelectionStore())
        act(() =>{ result.current.toggleRow('row1') })
        act(() =>{ result.current.toggleRow('row2') })
        act(() =>{ result.current.toggleRow('row1') }) // deselect row1, row2 should remain selected
        expect(result.current.isSelected('row1')).toBe(false)
        expect(result.current.isSelected('row2')).toBe(true)
    })

    it('selectAll select current page ids' , () => {
        const { result } = renderHook(() => useBulkSelectionStore())
        act(() =>{ result.current.selectAll(['row1', 'row2', 'row3']) })
        expect(result.current.selectionCount()).toBe(3)
    })

    it('selectAll deselects all rows already selected', () => {
        const { result } = renderHook(() => useBulkSelectionStore())
        act(() =>{ result.current.selectAll(['row1', 'row2', 'row3']) })
        act(() =>{ result.current.selectAll(['row1', 'row2', 'row3']) })
        expect(result.current.selectionCount()).toBe(0)
    })

    it('clearSelection clears all selected rows', () => {
        const { result } = renderHook(() => useBulkSelectionStore())
        act(() =>{ result.current.selectAll(['row1', 'row2', 'row3']) })
        act(() =>{ result.current.clearSelection() })
        expect(result.current.selectionCount()).toBe(0)
    })

    it('selectedIds returns ids as an array', () => {
        const { result } = renderHook(() => useBulkSelectionStore())
        act(() =>{ result.current.selectAll(['row1', 'row2', 'row3']) })
        expect(result.current.selectedIdsArray()).toEqual(expect.arrayContaining(['row1', 'row2', 'row3']))
    })
})



