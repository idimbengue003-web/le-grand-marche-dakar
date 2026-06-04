import { create } from 'zustand'

export type ViewMode = 'merchant' | 'product'
export type SortField = 'price' | 'name'
export type SortOrder = 'asc' | 'desc'
export type AuthMode = 'login' | 'register'
export type PageView = 'market' | 'shop' | 'electronics' | 'alimentaire'

interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  image: string
  inStock: boolean
  featured: boolean
  categoryId: string
  merchantId: string
  category: {
    id: string
    name: string
    slug: string
    icon: string
    description: string
    color: string
    _count: { products: number }
  }
  merchant: {
    id: string
    name: string
    slug: string
    description: string
    image: string
    rating: number
    location: string
    address: string
    latitude: number
    longitude: number
    specialty: string
    banner: string
    _count: { products: number }
  }
}

interface MarketState {
  // Filters
  selectedCategoryId: string | null
  searchQuery: string
  viewMode: ViewMode
  sortField: SortField
  sortOrder: SortOrder

  // Auth UI
  authModalOpen: boolean
  authMode: AuthMode

  // Product detail
  selectedProduct: Product | null

  // Merchant dashboard
  merchantDashboardOpen: boolean

  // Favorites panel
  favoritesOpen: boolean

  // Premium plans dialog
  premiumPlansOpen: boolean

  // Buyer features
  buyerSettingsOpen: boolean
  authRole: 'acheteur' | 'vendeur'

  // Navigation - page views
  pageView: PageView
  viewingMerchantId: string | null

  // Actions
  setSelectedCategoryId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: ViewMode) => void
  setSortField: (field: SortField) => void
  setSortOrder: (order: SortOrder) => void
  setSort: (field: SortField, order: SortOrder) => void
  setAuthModalOpen: (open: boolean) => void
  setAuthMode: (mode: AuthMode) => void
  setSelectedProduct: (product: Product | null) => void
  setMerchantDashboardOpen: (open: boolean) => void
  setFavoritesOpen: (open: boolean) => void
  setPremiumPlansOpen: (open: boolean) => void
  setBuyerSettingsOpen: (open: boolean) => void
  setAuthRole: (role: 'acheteur' | 'vendeur') => void
  setPageView: (view: PageView) => void
  setViewingMerchantId: (id: string | null) => void
  navigateToShop: (merchantId: string) => void
  navigateToMarket: () => void
  navigateToElectronics: () => void
  navigateToAlimentaire: () => void
}

export const useMarketStore = create<MarketState>((set) => ({
  selectedCategoryId: null,
  searchQuery: '',
  viewMode: 'product',
  sortField: 'name',
  sortOrder: 'asc',

  authModalOpen: false,
  authMode: 'login',
  selectedProduct: null,
  merchantDashboardOpen: false,
  favoritesOpen: false,
  premiumPlansOpen: false,

  buyerSettingsOpen: false,
  authRole: 'acheteur',

  pageView: 'market',
  viewingMerchantId: null,

  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortField: (field) => set({ sortField: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setSort: (field, order) => set({ sortField: field, sortOrder: order }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAuthMode: (mode) => set({ authMode: mode }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setMerchantDashboardOpen: (open) => set({ merchantDashboardOpen: open }),
  setFavoritesOpen: (open) => set({ favoritesOpen: open }),
  setPremiumPlansOpen: (open) => set({ premiumPlansOpen: open }),
  setBuyerSettingsOpen: (open) => set({ buyerSettingsOpen: open }),
  setAuthRole: (role) => set({ authRole: role }),
  setPageView: (view) => set({ pageView: view }),
  setViewingMerchantId: (id) => set({ viewingMerchantId: id }),
  navigateToShop: (merchantId) => set({ pageView: 'shop', viewingMerchantId: merchantId, selectedProduct: null }),
  navigateToMarket: () => set({ pageView: 'market', viewingMerchantId: null, selectedProduct: null }),
  navigateToElectronics: () => set({ pageView: 'electronics', viewingMerchantId: null, selectedProduct: null }),
  navigateToAlimentaire: () => set({ pageView: 'alimentaire', viewingMerchantId: null, selectedProduct: null }),
}))
