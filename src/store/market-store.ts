import { create } from 'zustand'

export type ViewMode = 'merchant' | 'product'
export type SortField = 'price' | 'name'
export type SortOrder = 'asc' | 'desc'

interface MarketState {
  // Filters
  selectedCategoryId: string | null
  searchQuery: string
  viewMode: ViewMode
  sortField: SortField
  sortOrder: SortOrder

  // Actions
  setSelectedCategoryId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: ViewMode) => void
  setSortField: (field: SortField) => void
  setSortOrder: (order: SortOrder) => void
  setSort: (field: SortField, order: SortOrder) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  selectedCategoryId: null,
  searchQuery: '',
  viewMode: 'product',
  sortField: 'name',
  sortOrder: 'asc',

  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortField: (field) => set({ sortField: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setSort: (field, order) => set({ sortField: field, sortOrder: order }),
}))
