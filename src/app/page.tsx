'use client'

import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutGrid,
  Store,
  Star,
  MapPin,
  ArrowUpDown,
  X,
  Crown,
  Sparkles,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useMarketStore, type ViewMode } from '@/store/market-store'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  color: string
  _count: { products: number }
}

interface Merchant {
  id: string
  name: string
  slug: string
  description: string
  image: string
  rating: number
  location: string
  specialty: string
  banner: string
  _count: { products: number }
}

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
  category: Category
  merchant: Merchant
}

// ─── API Fetchers ────────────────────────────────────────────────────────────

async function seedDatabase(): Promise<void> {
  const res = await fetch('/api/seed', { method: 'POST' })
  if (!res.ok) throw new Error('Seed failed')
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

async function fetchMerchants(): Promise<Merchant[]> {
  const res = await fetch('/api/merchants')
  if (!res.ok) throw new Error('Failed to fetch merchants')
  return res.json()
}

async function fetchProducts(params: {
  categoryId?: string | null
  search?: string
  sort?: string
  order?: string
}): Promise<Product[]> {
  const searchParams = new URLSearchParams()
  if (params.categoryId) searchParams.set('categoryId', params.categoryId)
  if (params.search) searchParams.set('search', params.search)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.order) searchParams.set('order', params.order)

  const res = await fetch(`/api/products?${searchParams.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

// ─── Ornamental Components ───────────────────────────────────────────────────

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#DAA520]/50 to-transparent" />
      <span className="text-[#DAA520] text-lg">⚜</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#DAA520]/50 to-transparent" />
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-3.5 ${
            star <= Math.floor(rating)
              ? 'fill-[#FFD700] text-[#FFD700]'
              : star - 0.5 <= rating
                ? 'fill-[#FFD700]/50 text-[#FFD700]'
                : 'text-[#DAA520]/30'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-[#8B4513]/70 font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function HeroSection({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string
  onSearchChange: (q: string) => void
}) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-[#2C1810] via-[#3D1F1A] to-[#FFF8DC]">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-8 text-4xl text-[#FFD700]">❋</div>
        <div className="absolute top-12 right-12 text-3xl text-[#FFD700]">✦</div>
        <div className="absolute bottom-16 left-16 text-2xl text-[#FFD700]">❊</div>
        <div className="absolute bottom-8 right-8 text-3xl text-[#FFD700]">☙</div>
        <div className="absolute top-20 left-1/3 text-2xl text-[#FFD700]">⚜</div>
        <div className="absolute top-8 left-1/2 text-4xl text-[#FFD700]">⚜</div>
        <div className="absolute bottom-12 right-1/3 text-2xl text-[#FFD700]">❋</div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-10 pb-8 text-center">
        {/* Crown ornament */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-3"
        >
          <span className="text-5xl">👑</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl font-bold text-[#FFD700] tracking-wide drop-shadow-lg"
        >
          Le Grand Marché Royal
        </motion.h1>

        {/* Decorative line under title */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-3 flex items-center justify-center gap-2"
        >
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#DAA520] sm:w-24" />
          <span className="text-[#DAA520]">⚜</span>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#DAA520] sm:w-24" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-3 font-[family-name:var(--font-playfair)] text-base sm:text-lg text-[#FAEBD7]/80 italic"
        >
          Découvrez les trésors de notre marché séculaire
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mx-auto mt-6 max-w-xl"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8B4513]/50" />
            <Input
              type="text"
              placeholder="Chercher un produit, un marchand..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 w-full rounded-full border-[#DAA520]/30 bg-[#FFF8DC]/90 pl-10 pr-10 text-[#3D1F1A] placeholder:text-[#8B4513]/40 focus-visible:border-[#DAA520] focus-visible:ring-[#DAA520]/30 shadow-lg backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B4513]/50 hover:text-[#8B4513] transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Castle emoji */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-4"
        >
          <span className="text-2xl">🏰</span>
        </motion.div>
      </div>

      {/* Bottom ornamental border */}
      <div className="relative h-3 bg-gradient-to-r from-[#8B0000] via-[#DAA520] to-[#8B0000]">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-[#FFF8DC]">✦ ✦ ✦</span>
        </div>
      </div>
    </header>
  )
}

// ─── Category Filter Bar ─────────────────────────────────────────────────────

function CategoryFilterBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: {
  categories: Category[]
  selectedCategoryId: string | null
  onSelectCategory: (id: string | null) => void
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-[#DAA520]/20 bg-[#FFF8DC]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-1">
            {/* "Toutes" button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(null)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap border ${
                selectedCategoryId === null
                  ? 'bg-[#8B0000] text-[#FFD700] border-[#DAA520] shadow-lg shadow-[#DAA520]/20'
                  : 'bg-[#FAEBD7]/60 text-[#8B4513] border-[#DAA520]/30 hover:bg-[#FAEBD7] hover:border-[#DAA520]/50'
              }`}
            >
              <Sparkles className="size-3.5" />
              Toutes
            </motion.button>

            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  onSelectCategory(selectedCategoryId === cat.id ? null : cat.id)
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap border ${
                  selectedCategoryId === cat.id
                    ? 'text-white border-transparent shadow-lg'
                    : 'bg-[#FAEBD7]/60 text-[#8B4513] border-[#DAA520]/30 hover:bg-[#FAEBD7] hover:border-[#DAA520]/50'
                }`}
                style={
                  selectedCategoryId === cat.id
                    ? { backgroundColor: cat.color, borderColor: cat.color, boxShadow: `0 4px 14px ${cat.color}40` }
                    : undefined
                }
              >
                <span className="text-base">{cat.icon}</span>
                {cat.name}
                <span className="text-xs opacity-60">({cat._count.products})</span>
              </motion.button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}

// ─── Product Card (By Product view) ──────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-[#DAA520]/20 bg-[#FFF8DC]/50 hover:border-[#DAA520]/50 hover:shadow-xl hover:shadow-[#DAA520]/10 transition-all duration-300">
        {/* Featured badge */}
        {product.featured && (
          <div className="absolute right-2 top-2 z-10">
            <Badge className="bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-[#3D1F1A] border-0 font-semibold shadow-md">
              ⭐ Coup de Cœur
            </Badge>
          </div>
        )}

        {/* Merchant banner accent */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: product.merchant.banner }}
        />

        <CardContent className="p-4 pt-3">
          {/* Product emoji + info */}
          <div className="flex items-start gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#FAEBD7] text-3xl shadow-inner">
              {product.image}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-[family-name:var(--font-playfair)] text-base font-semibold text-[#3D1F1A] leading-tight line-clamp-2">
                {product.name}
              </h3>
              <p className="mt-0.5 text-xs text-[#8B4513]/60 line-clamp-1">
                {product.description}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#8B0000]">
              {product.price.toFixed(2)} €
            </span>
            <span className="text-xs text-[#8B4513]/50">/ {product.unit}</span>
          </div>

          {/* Merchant & Category info */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="gap-1 border-0 text-xs font-medium px-2 py-0"
              style={{
                backgroundColor: `${product.merchant.banner}15`,
                color: product.merchant.banner,
                borderColor: `${product.merchant.banner}30`,
              }}
            >
              <span>{product.merchant.image}</span>
              {product.merchant.name}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 text-xs px-2 py-0"
              style={{
                backgroundColor: `${product.category.color}10`,
                color: product.category.color,
                borderColor: `${product.category.color}25`,
              }}
            >
              <span>{product.category.icon}</span>
              {product.category.name}
            </Badge>
          </div>

          {/* Stock indicator */}
          {!product.inStock && (
            <div className="mt-2 text-xs text-red-600 font-medium">
              Rupture de stock
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Merchant Card (By Merchant view) ────────────────────────────────────────

function MerchantCard({
  merchant,
  products,
}: {
  merchant: Merchant
  products: Product[]
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-[#DAA520]/20 bg-[#FFF8DC]/50 hover:shadow-lg hover:shadow-[#DAA520]/10 transition-all duration-300">
        {/* Banner header */}
        <div
          className="relative px-5 py-4"
          style={{ backgroundColor: `${merchant.banner}15` }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ backgroundColor: merchant.banner }}
          />

          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/80 text-2xl shadow-md border border-[#DAA520]/20">
              {merchant.image}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#3D1F1A]">
                {merchant.name}
              </h3>
              <p className="mt-0.5 text-xs text-[#8B4513]/60 line-clamp-1">
                {merchant.description}
              </p>
            </div>
          </div>

          {/* Rating, Location, Specialty */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <StarRating rating={merchant.rating} />
            <div className="flex items-center gap-1 text-[#8B4513]/70">
              <MapPin className="size-3" />
              {merchant.location}
            </div>
            <Badge
              variant="outline"
              className="text-xs px-2 py-0"
              style={{
                backgroundColor: `${merchant.banner}10`,
                color: merchant.banner,
                borderColor: `${merchant.banner}25`,
              }}
            >
              {merchant.specialty}
            </Badge>
          </div>
        </div>

        <Separator className="bg-[#DAA520]/15" />

        {/* Products list */}
        <CardContent className="p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8B4513]/50">
            Leurs produits ({products.length})
          </h4>
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-[#FAEBD7]/60"
              >
                <span className="text-lg shrink-0">{product.image}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-[#3D1F1A] truncate">
                      {product.name}
                    </span>
                    {product.featured && (
                      <span className="text-[#DAA520] text-xs">⭐</span>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 mt-0.5"
                    style={{
                      backgroundColor: `${product.category.color}10`,
                      color: product.category.color,
                      borderColor: `${product.category.color}20`,
                    }}
                  >
                    {product.category.icon} {product.category.name}
                  </Badge>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-[family-name:var(--font-playfair)] text-sm font-bold text-[#8B0000]">
                    {product.price.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-[#8B4513]/50 block">
                    /{product.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function HomePage() {
  const queryClient = useQueryClient()
  const {
    selectedCategoryId,
    searchQuery,
    viewMode,
    sortField,
    sortOrder,
    setSelectedCategoryId,
    setSearchQuery,
    setViewMode,
    setSort,
  } = useMarketStore()

  // Seed database on mount
  const seedMutation = useMutation({
    mutationFn: seedDatabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['merchants'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  useEffect(() => {
    seedMutation.mutate()
  }, [])

  // Fetch data
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: merchants = [], isLoading: merchantsLoading } = useQuery({
    queryKey: ['merchants'],
    queryFn: fetchMerchants,
  })

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', selectedCategoryId, searchQuery, sortField, sortOrder],
    queryFn: () =>
      fetchProducts({
        categoryId: selectedCategoryId,
        search: searchQuery || undefined,
        sort: sortField,
        order: sortOrder,
      }),
  })

  const isLoading = categoriesLoading || merchantsLoading || productsLoading

  // Group products by merchant for merchant view
  const productsByMerchant = useCallback(() => {
    const map = new Map<string, Product[]>()
    for (const product of products) {
      const existing = map.get(product.merchantId) || []
      existing.push(product)
      map.set(product.merchantId, existing)
    }
    return map
  }, [products])

  const merchantProductMap = productsByMerchant()

  // Filtered merchants (only those with products in current filter)
  const filteredMerchants = merchants.filter(
    (m) => (merchantProductMap.get(m.id)?.length || 0) > 0
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF8DC]">
      {/* Hero */}
      <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Category filter */}
      <CategoryFilterBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Controls bar */}
      <div className="border-b border-[#DAA520]/15 bg-[#FFF8DC]/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <TabsList className="bg-[#FAEBD7] border border-[#DAA520]/20">
                <TabsTrigger
                  value="product"
                  className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-[#FFD700] gap-1.5"
                >
                  <LayoutGrid className="size-3.5" />
                  <span className="hidden sm:inline">Par Produit</span>
                  <span className="sm:hidden">Produits</span>
                </TabsTrigger>
                <TabsTrigger
                  value="merchant"
                  className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-[#FFD700] gap-1.5"
                >
                  <Store className="size-3.5" />
                  <span className="hidden sm:inline">Par Marchand</span>
                  <span className="sm:hidden">Marchands</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Sort & count */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8B4513]/50 hidden sm:inline">
              {products.length} produit{products.length !== 1 ? 's' : ''}
            </span>
            <Select
              value={`${sortField}-${sortOrder}`}
              onValueChange={(val) => {
                const [field, order] = val.split('-') as [typeof sortField, typeof sortOrder]
                setSort(field, order)
              }}
            >
              <SelectTrigger className="h-8 w-auto gap-1.5 border-[#DAA520]/30 bg-[#FAEBD7]/50 text-[#8B4513] text-xs">
                <ArrowUpDown className="size-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="name-asc">Nom A-Z</SelectItem>
                <SelectItem value="name-desc">Nom Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {isLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-[#DAA520]/10 bg-[#FAEBD7]/30">
                  <div className="h-1.5 bg-[#DAA520]/10" />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="size-14 rounded-xl bg-[#DAA520]/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-[#DAA520]/10" />
                        <div className="h-3 w-1/2 rounded bg-[#DAA520]/10" />
                      </div>
                    </div>
                    <div className="mt-3 h-6 w-1/3 rounded bg-[#DAA520]/10" />
                    <div className="mt-2 flex gap-2">
                      <div className="h-5 w-20 rounded-full bg-[#DAA520]/10" />
                      <div className="h-5 w-16 rounded-full bg-[#DAA520]/10" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-6xl mb-4">🏰</span>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#3D1F1A]">
                Aucun produit trouvé
              </h3>
              <p className="mt-2 text-sm text-[#8B4513]/60 max-w-md">
                {searchQuery
                  ? `Aucun résultat pour "${searchQuery}". Essayez un autre terme de recherche.`
                  : 'Aucun produit dans cette catégorie pour le moment.'}
              </p>
              {(searchQuery || selectedCategoryId) && (
                <Button
                  variant="outline"
                  className="mt-4 border-[#DAA520]/30 text-[#8B4513] hover:bg-[#FAEBD7]"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategoryId(null)
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : viewMode === 'product' ? (
            // Product grid view
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            // Merchant view
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-1 gap-6 lg:grid-cols-2"
              >
                {filteredMerchants.map((merchant) => (
                  <MerchantCard
                    key={merchant.id}
                    merchant={merchant}
                    products={merchantProductMap.get(merchant.id) || []}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DAA520]/20 bg-gradient-to-b from-[#3D1F1A] to-[#2C1810]">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center">
          <OrnamentalDivider />
          <p className="font-[family-name:var(--font-playfair)] text-sm text-[#FFD700]/70 mt-2">
            👑 Le Grand Marché Royal © 2025 👑
          </p>
          <p className="mt-1 text-xs text-[#FAEBD7]/30">
            ☙ Tous les trésors du royaume en un marché ✦
          </p>
        </div>
      </footer>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #DAA52040;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #DAA52080;
        }
      `}</style>
    </div>
  )
}
