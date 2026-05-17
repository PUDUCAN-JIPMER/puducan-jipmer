
import { create } from "zustand";

interface BulkSelectionState {
    selectedIds: Set<string>;

    isSelected: (id: string) => boolean;
    selectionCount: () => number; // returns the count of selected rows
    selectedIdsArray: () => string[];

    toggleRow: (id: string) => void;
    selectAll: (ids: string[]) => void; // accepts all IDs on the current page
    clearSelection: () => void;
}

export const useBulkSelectionStore = create<BulkSelectionState>((set, get) => ({

    selectedIds: new Set(),

    isSelected: (id) => get().selectedIds.has(id),

    selectionCount: () => get().selectedIds.size,

    selectedIdsArray: () => Array.from(get().selectedIds),

    toggleRow: (id) => set((state) => {
        const next = new Set(state.selectedIds)
        if(next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }
        return { selectedIds: next }
    }),

    selectAll: (ids) => set((state) => {
        const currentPageIds = new Set(ids);
        const AllCurrentSelected = ids.every((id) => state.selectedIds.has(id));

        if (AllCurrentSelected) {
            // Deselect all if all are currently selected
            const next = new Set(state.selectedIds)
            currentPageIds.forEach((id) => next.delete(id));
            return { selectedIds: next };
        }

        //  select all current page rows
        const next = new Set(state.selectedIds);
        ids.forEach((id) => next.add(id));
        return { selectedIds: next };
    }),

    clearSelection: () => set({ selectedIds: new Set() })
}))
