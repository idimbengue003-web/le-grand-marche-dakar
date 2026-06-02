'use client'

import { useEffect, useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession, signIn, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutGrid,
  Store,
  Star,
  MapPin,
  ArrowUpDown,
  X,
  Sparkles,
  Heart,
  LogIn,
  LogOut,
  User,
  Eye,
  PackageCheck,
  PackageX,
  ChevronDown,
  Navigation,
  TrendingDown,
  Trophy,
  Mail,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

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
  address: string
  latitude: number
  longitude: number
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

interface FavoriteItem {
  id: string
  productId: string
  product: Product
}

// ─── Distance Calculator ─────────────────────────────────────────────────────

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
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

async function fetchCompetitors(params: {
  name: string
  excludeMerchantId?: string
}): Promise<Product[]> {
  const searchParams = new URLSearchParams()
  searchParams.set('name', params.name)
  if (params.excludeMerchantId) searchParams.set('excludeMerchantId', params.excludeMerchantId)

  const res = await fetch(`/api/products/compare?${searchParams.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch competitors')
  return res.json()
}

async function fetchFavorites(): Promise<FavoriteItem[]> {
  const res = await fetch('/api/favorites')
  if (!res.ok) throw new Error('Failed to fetch favorites')
  return res.json()
}

async function toggleFavorite(productId: string): Promise<{ favorited: boolean }> {
  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  })
  if (!res.ok) throw new Error('Failed to toggle favorite')
  return res.json()
}

async function fetchMerchantProducts(merchantId: string): Promise<Product[]> {
  const res = await fetch(`/api/merchants/${merchantId}/products`)
  if (!res.ok) throw new Error('Failed to fetch merchant products')
  return res.json()
}

async function updateMerchantProduct(
  merchantId: string,
  productId: string,
  data: { inStock?: boolean; featured?: boolean }
): Promise<Product> {
  const res = await fetch(`/api/merchants/${merchantId}/products`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, ...data }),
  })
  if (!res.ok) throw new Error('Failed to update product')
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

// ─── Auth Modal ──────────────────────────────────────────────────────────────

function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode } = useMarketStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedMerchantId, setSelectedMerchantId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: merchants = [] } = useQuery({
    queryKey: ['merchants'],
    queryFn: fetchMerchants,
  })

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setSelectedMerchantId('')
    setError('')
    setLoading(false)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    setError('')
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const loginData = await loginRes.json()
      if (!loginRes.ok) {
        setError(loginData.error || 'Email ou mot de passe incorrect')
        return
      }
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        window.location.reload()
        return
      }
      toast({ title: 'Connexion réussie', description: `Bienvenue${loginData.merchantName ? ', ' + loginData.merchantName : ' au Marché Royal'} !` })
      setAuthModalOpen(false)
      resetForm()
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Email et mot de passe requis')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
          merchantId: selectedMerchantId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'inscription')
        return
      }
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Inscription réussie mais erreur de connexion automatique')
      } else {
        toast({ title: 'Inscription réussie', description: 'Bienvenue au Marché Royal !' })
        setAuthModalOpen(false)
        resetForm()
      }
    } catch {
      setError('Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <Dialog open={authModalOpen} onOpenChange={(open) => {
      setAuthModalOpen(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="sm:max-w-md bg-[#FFF8DC] border-[#DAA520]/30">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)] text-[#3D1F1A] text-center text-xl">
            ⚜ Accès au Marché ⚜
          </DialogTitle>
          <DialogDescription className="text-center text-[#8B4513]/70">
            Connectez-vous pour accéder à vos favoris et votre échoppe
          </DialogDescription>
        </DialogHeader>

        <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#FAEBD7] border border-[#DAA520]/20">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-[#FFD700]"
            >
              Connexion
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-[#FFD700]"
            >
              Inscription
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {authMode === 'login' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-[#8B4513]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8B4513]/40" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="vendeur@marche.sn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] focus-visible:ring-[#DAA520]/30 pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-[#8B4513]">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] focus-visible:ring-[#DAA520]/30"
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] font-semibold"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-[#8B4513]">Nom (optionnel)</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Votre nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] focus-visible:ring-[#DAA520]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-[#8B4513]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8B4513]/40" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="vendeur@marche.sn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] focus-visible:ring-[#DAA520]/30 pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-[#8B4513]">Mot de passe</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] focus-visible:ring-[#DAA520]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-merchant" className="text-[#8B4513]">Échoppe (optionnel)</Label>
                  <Select value={selectedMerchantId} onValueChange={setSelectedMerchantId}>
                    <SelectTrigger className="border-[#DAA520]/30 bg-white/70">
                      <SelectValue placeholder="Sélectionnez votre échoppe" />
                    </SelectTrigger>
                    <SelectContent>
                      {merchants.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.image} {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] font-semibold"
                >
                  {loading ? 'Inscription...' : 'S\'inscrire'}
                </Button>
              </>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#DAA520]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#FFF8DC] px-2 text-[#8B4513]/50">ou</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full border-[#DAA520]/30 text-[#8B4513] hover:bg-[#FAEBD7]"
            >
              <svg className="mr-2 size-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </Button>

            {authMode === 'login' && (
              <p className="text-center text-xs text-[#8B4513]/50">
                Comptes test : beaumont@marche.sn / marchand1
              </p>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// ─── User Menu ───────────────────────────────────────────────────────────────

function UserMenu() {
  const { data: session } = useSession()
  const { setAuthModalOpen, setFavoritesOpen, setMerchantDashboardOpen } = useMarketStore()
  const { toast } = useToast()
  const merchantId = (session?.user as any)?.merchantId

  if (!session) {
    return (
      <Button
        onClick={() => setAuthModalOpen(true)}
        className="bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] gap-2 shadow-md"
        size="sm"
      >
        <LogIn className="size-4" />
        <span className="hidden sm:inline">Connexion</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-[#DAA520]/30 bg-[#FAEBD7]/80 text-[#3D1F1A] hover:bg-[#FAEBD7] gap-2 shadow-md"
          size="sm"
        >
          <User className="size-4" />
          <span className="max-w-[120px] truncate">{session.user.name || 'Utilisateur'}</span>
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#FFF8DC] border-[#DAA520]/30" align="end">
        <DropdownMenuLabel className="font-[family-name:var(--font-playfair)] text-[#3D1F1A]">
          {session.user.name || 'Utilisateur'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#DAA520]/20" />
        <DropdownMenuItem
          onClick={() => setFavoritesOpen(true)}
          className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
        >
          <Heart className="mr-2 size-4" />
          Mes Favoris
        </DropdownMenuItem>
        {merchantId && (
          <DropdownMenuItem
            onClick={() => setMerchantDashboardOpen(true)}
            className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
          >
            <Store className="mr-2 size-4" />
            Mon Échoppe
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-[#DAA520]/20" />
        <DropdownMenuItem
          onClick={() => {
            signOut({ callbackUrl: '/' })
            toast({ title: 'Déconnexion', description: 'À bientôt au Marché Royal !' })
          }}
          className="text-red-700 focus:bg-red-50 focus:text-red-800 cursor-pointer"
        >
          <LogOut className="mr-2 size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Product Detail Modal ────────────────────────────────────────────────────

function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct } = useMarketStore()
  const { data: session } = useSession()
  const { setAuthModalOpen } = useMarketStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get user's geolocation
  useEffect(() => {
    if (selectedProduct && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          // If denied, use Dakar center as default
          setUserLocation({ lat: 14.6937, lng: -17.4441 })
        },
        { timeout: 5000 }
      )
    }
  }, [selectedProduct])

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: !!session,
  })

  const isFavorited = selectedProduct
    ? favorites.some((f) => f.productId === selectedProduct.id)
    : false

  const toggleMutation = useMutation({
    mutationFn: () => toggleFavorite(selectedProduct!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      toast({
        title: data.favorited ? 'Ajouté aux favoris' : 'Retiré des favoris',
        description: data.favorited
          ? `${selectedProduct?.name} est dans vos favoris`
          : `${selectedProduct?.name} a été retiré de vos favoris`,
      })
    },
  })

  // Fetch competitor prices
  const { data: competitors = [] } = useQuery({
    queryKey: ['competitors', selectedProduct?.name, selectedProduct?.merchantId],
    queryFn: () =>
      fetchCompetitors({
        name: selectedProduct!.name,
        excludeMerchantId: selectedProduct!.merchantId,
      }),
    enabled: !!selectedProduct,
  })

  // Calculate distance to this merchant
  const distance = selectedProduct && userLocation
    ? haversineDistance(userLocation.lat, userLocation.lng, selectedProduct.merchant.latitude, selectedProduct.merchant.longitude)
    : null

  // All offers (current + competitors), sorted by price
  const allOffers = selectedProduct
    ? [
        {
          id: selectedProduct.id,
          price: selectedProduct.price,
          merchant: selectedProduct.merchant,
          inStock: selectedProduct.inStock,
          isCurrent: true,
        },
        ...competitors.map((c) => ({
          id: c.id,
          price: c.price,
          merchant: c.merchant,
          inStock: c.inStock,
          isCurrent: false,
        })),
      ].sort((a, b) => a.price - b.price)
    : []

  const lowestPrice = allOffers.length > 0 ? allOffers[0].price : selectedProduct?.price

  if (!selectedProduct) return null

  return (
    <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
      <DialogContent className="sm:max-w-lg bg-[#FFF8DC] border-[#DAA520]/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)] text-[#3D1F1A] flex items-center gap-3">
            <span className="text-4xl">{selectedProduct.image}</span>
            <span>{selectedProduct.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Merchant banner accent */}
          <div
            className="h-1.5 w-full rounded-full"
            style={{ backgroundColor: selectedProduct.merchant.banner }}
          />

          {/* Description */}
          <p className="text-[#8B4513]/80 text-sm leading-relaxed">
            {selectedProduct.description}
          </p>

          {/* DISTANCE - Most important info */}
          {distance !== null && (
            <div className="flex items-center gap-2 bg-[#FAEBD7]/80 rounded-lg px-4 py-3 border border-[#DAA520]/20">
              <Navigation className="size-5 text-[#8B0000] shrink-0" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#8B0000]">
                    {formatDistance(distance)}
                  </span>
                  <span className="text-xs text-[#8B4513]/50">de vous</span>
                </div>
                <p className="text-xs text-[#8B4513]/60 mt-0.5">
                  {selectedProduct.merchant.address || selectedProduct.merchant.location}
                </p>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#8B0000]">
              {selectedProduct.price.toFixed(2)} €
            </span>
            <span className="text-sm text-[#8B4513]/50">/ {selectedProduct.unit}</span>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className="gap-1 border-0 font-medium"
              style={{
                backgroundColor: `${selectedProduct.merchant.banner}15`,
                color: selectedProduct.merchant.banner,
              }}
            >
              <span>{selectedProduct.merchant.image}</span>
              {selectedProduct.merchant.name}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1"
              style={{
                backgroundColor: `${selectedProduct.category.color}10`,
                color: selectedProduct.category.color,
                borderColor: `${selectedProduct.category.color}25`,
              }}
            >
              <span>{selectedProduct.category.icon}</span>
              {selectedProduct.category.name}
            </Badge>
            {selectedProduct.featured && (
              <Badge className="bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-[#3D1F1A] border-0 font-semibold">
                ⭐ Coup de Cœur
              </Badge>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {selectedProduct.inStock ? (
              <div className="flex items-center gap-1.5 text-green-700">
                <PackageCheck className="size-4" />
                <span className="text-sm font-medium">En stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-600">
                <PackageX className="size-4" />
                <span className="text-sm font-medium">Rupture de stock</span>
              </div>
            )}
          </div>

          {/* COMPETITOR PRICES - Show competition */}
          {allOffers.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#3D1F1A]">
                <TrendingDown className="size-4 text-[#8B0000]" />
                Comparaison des prix ({allOffers.length} vendeurs)
              </div>
              <div className="space-y-1.5">
                {allOffers.map((offer) => {
                  const offerDistance = userLocation
                    ? haversineDistance(userLocation.lat, userLocation.lng, offer.merchant.latitude, offer.merchant.longitude)
                    : null
                  const isLowest = offer.price === lowestPrice

                  return (
                    <div
                      key={offer.id}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 border transition-colors ${
                        offer.isCurrent
                          ? 'bg-[#8B0000]/5 border-[#8B0000]/20'
                          : 'bg-white/50 border-[#DAA520]/15 hover:bg-[#FAEBD7]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{offer.merchant.image}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-medium truncate ${offer.isCurrent ? 'text-[#8B0000]' : 'text-[#3D1F1A]'}`}>
                              {offer.merchant.name}
                            </span>
                            {offer.isCurrent && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-[#8B0000]/10 text-[#8B0000] border-0">
                                Ce vendeur
                              </Badge>
                            )}
                          </div>
                          {offerDistance !== null && (
                            <div className="flex items-center gap-1 text-xs text-[#8B4513]/50 mt-0.5">
                              <MapPin className="size-3" />
                              {formatDistance(offerDistance)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isLowest && (
                          <Trophy className="size-4 text-[#DAA520]" />
                        )}
                        <div className="text-right">
                          <span className={`font-[family-name:var(--font-playfair)] text-base font-bold ${isLowest ? 'text-green-700' : 'text-[#8B0000]'}`}>
                            {offer.price.toFixed(2)} €
                          </span>
                          <span className="text-[10px] text-[#8B4513]/50 block">
                            /{selectedProduct.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {lowestPrice < selectedProduct.price && (
                <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                  <TrendingDown className="size-3" />
                  Meilleur prix : {lowestPrice.toFixed(2)} € — économisez {(selectedProduct.price - lowestPrice).toFixed(2)} €
                </p>
              )}
            </div>
          )}

          {/* Favorite button */}
          <Button
            onClick={() => {
              if (!session) {
                setAuthModalOpen(true)
                return
              }
              toggleMutation.mutate()
            }}
            variant={isFavorited ? 'default' : 'outline'}
            className={`w-full gap-2 ${
              isFavorited
                ? 'bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700]'
                : 'border-[#8B0000]/30 text-[#8B0000] hover:bg-[#8B0000]/5'
            }`}
          >
            <Heart className={`size-4 ${isFavorited ? 'fill-current' : ''}`} />
            {isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Favorites Panel ─────────────────────────────────────────────────────────

function FavoritesPanel() {
  const { favoritesOpen, setFavoritesOpen } = useMarketStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: favoritesOpen,
  })

  const toggleMutation = useMutation({
    mutationFn: (productId: string) => toggleFavorite(productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      toast({
        title: data.favorited ? 'Ajouté aux favoris' : 'Retiré des favoris',
      })
    },
  })

  return (
    <Dialog open={favoritesOpen} onOpenChange={setFavoritesOpen}>
      <DialogContent className="sm:max-w-md bg-[#FFF8DC] border-[#DAA520]/30 max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)] text-[#3D1F1A] flex items-center gap-2">
            <Heart className="size-5 text-[#8B0000] fill-[#8B0000]" />
            Mes Favoris
          </DialogTitle>
          <DialogDescription className="text-[#8B4513]/70">
            {favorites.length} produit{favorites.length !== 1 ? 's' : ''} favori{favorites.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          {isLoading ? (
            <div className="space-y-3 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-[#DAA520]/10" />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Heart className="size-12 text-[#DAA520]/30 mb-3" />
              <p className="text-[#8B4513]/60 text-sm">Aucun favori pour le moment</p>
              <p className="text-[#8B4513]/40 text-xs mt-1">
                Cliquez sur le cœur d&apos;un produit pour l&apos;ajouter
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-1">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-[#FAEBD7]/60"
                >
                  <span className="text-2xl shrink-0">{fav.product.image}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#3D1F1A] truncate">{fav.product.name}</p>
                    <p className="text-xs text-[#8B4513]/50">
                      {fav.product.price.toFixed(2)} € / {fav.product.unit}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMutation.mutate(fav.productId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// ─── Merchant Dashboard ──────────────────────────────────────────────────────

function MerchantDashboard() {
  const { merchantDashboardOpen, setMerchantDashboardOpen } = useMarketStore()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const merchantId = (session?.user as any)?.merchantId

  const { data: merchants = [] } = useQuery({
    queryKey: ['merchants'],
    queryFn: fetchMerchants,
  })

  const merchant = merchants.find((m) => m.id === merchantId)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['merchant-products', merchantId],
    queryFn: () => fetchMerchantProducts(merchantId!),
    enabled: !!merchantId && merchantDashboardOpen,
  })

  const updateMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: { inStock?: boolean; featured?: boolean } }) =>
      updateMerchantProduct(merchantId!, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-products', merchantId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  if (!merchantId || !merchant) return null

  return (
    <Dialog open={merchantDashboardOpen} onOpenChange={setMerchantDashboardOpen}>
      <DialogContent className="sm:max-w-xl bg-[#FFF8DC] border-[#DAA520]/30 max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)] text-[#3D1F1A] flex items-center gap-3">
            <span className="text-3xl">{merchant.image}</span>
            <div>
              <div>{merchant.name}</div>
              <div className="text-xs font-normal text-[#8B4513]/60">{merchant.specialty} — {merchant.location}</div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-[#8B4513]/70">
            Gérez vos produits : stock et produits vedettes
          </DialogDescription>
        </DialogHeader>

        {/* Merchant banner accent */}
        <div
          className="h-1.5 w-full rounded-full"
          style={{ backgroundColor: merchant.banner }}
        />

        <ScrollArea className="max-h-[55vh]">
          {isLoading ? (
            <div className="space-y-3 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-[#DAA520]/10" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 p-1">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg border border-[#DAA520]/15 p-3 transition-colors hover:bg-[#FAEBD7]/30"
                >
                  <span className="text-2xl shrink-0">{product.image}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-[#3D1F1A] truncate">{product.name}</span>
                      {product.featured && <span className="text-[#DAA520] text-xs">⭐</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-[#8B0000]">{product.price.toFixed(2)} €</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                        style={{
                          backgroundColor: `${product.category.color}10`,
                          color: product.category.color,
                          borderColor: `${product.category.color}20`,
                        }}
                      >
                        {product.category.icon} {product.category.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateMutation.mutate({
                          productId: product.id,
                          data: { inStock: !product.inStock },
                        })
                        toast({
                          title: product.inStock ? 'Rupture de stock' : 'Remis en stock',
                          description: product.name,
                        })
                      }}
                      className={`gap-1 text-xs h-8 px-2 ${
                        product.inStock
                          ? 'text-green-700 hover:bg-green-50 hover:text-green-800'
                          : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      {product.inStock ? (
                        <>
                          <PackageCheck className="size-3.5" />
                          <span className="hidden sm:inline">En stock</span>
                        </>
                      ) : (
                        <>
                          <PackageX className="size-3.5" />
                          <span className="hidden sm:inline">Rupture</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateMutation.mutate({
                          productId: product.id,
                          data: { featured: !product.featured },
                        })
                        toast({
                          title: product.featured ? 'Retiré des vedettes' : 'Produit vedette',
                          description: product.name,
                        })
                      }}
                      className={`gap-1 text-xs h-8 px-2 ${
                        product.featured
                          ? 'text-[#DAA520] hover:bg-[#DAA520]/10'
                          : 'text-[#8B4513]/40 hover:bg-[#FAEBD7] hover:text-[#8B4513]'
                      }`}
                    >
                      {product.featured ? (
                        <>
                          <Star className="size-3.5 fill-current" />
                          <span className="hidden sm:inline">Vedette</span>
                        </>
                      ) : (
                        <>
                          <Star className="size-3.5" />
                          <span className="hidden sm:inline">Normal</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
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
      {/* Top bar: logo + user menu */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <span className="font-[family-name:var(--font-playfair)] text-sm text-[#FFD700]/80 font-semibold hidden sm:inline">
              Le Grand Marché Royal
            </span>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Title area */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-4 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-2"
        >
          <span className="text-5xl">👑</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl font-bold text-[#FFD700] tracking-wide drop-shadow-lg"
        >
          Le Grand Marché Royal
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-2 flex items-center justify-center gap-2"
        >
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#DAA520] sm:w-24" />
          <span className="text-[#DAA520]">⚜</span>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#DAA520] sm:w-24" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-2 font-[family-name:var(--font-playfair)] text-base sm:text-lg text-[#FAEBD7]/80 italic"
        >
          Découvrez les trésors de notre marché séculaire
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mx-auto mt-5 max-w-xl"
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
      </div>

      {/* Bottom border */}
      <div className="relative h-3 bg-gradient-to-r from-[#8B0000] via-[#DAA520] to-[#8B0000]" />
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

// ─── Product Card ────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession()
  const { setAuthModalOpen, setSelectedProduct } = useMarketStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 14.6937, lng: -17.4441 }),
        { timeout: 5000 }
      )
    }
  }, [])

  const distance = userLocation
    ? haversineDistance(userLocation.lat, userLocation.lng, product.merchant.latitude, product.merchant.longitude)
    : null

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: !!session,
  })

  const isFavorited = favorites.some((f) => f.productId === product.id)

  const toggleMutation = useMutation({
    mutationFn: () => toggleFavorite(product.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      toast({
        title: data.favorited ? 'Ajouté aux favoris' : 'Retiré des favoris',
        description: product.name,
      })
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de modifier les favoris', variant: 'destructive' })
    },
  })

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session) {
      setAuthModalOpen(true)
      return
    }
    toggleMutation.mutate()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="group relative overflow-hidden border-[#DAA520]/20 bg-[#FFF8DC]/50 hover:border-[#DAA520]/50 hover:shadow-xl hover:shadow-[#DAA520]/10 transition-all duration-300 cursor-pointer"
        onClick={() => setSelectedProduct(product)}
      >
        {/* Favorite button - top left */}
        <button
          onClick={handleFavoriteClick}
          className="absolute left-2 top-2 z-10 rounded-full p-1.5 bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:bg-white hover:shadow-md"
          aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            className={`size-4 transition-colors ${
              isFavorited
                ? 'fill-[#8B0000] text-[#8B0000]'
                : 'text-[#8B4513]/40 hover:text-[#8B0000]'
            }`}
          />
        </button>

        {/* Featured badge - top right */}
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

          {/* Merchant, Category, Distance info */}
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

          {/* Distance + Stock + View button */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {distance !== null && (
                <span className="text-xs text-[#8B4513]/70 flex items-center gap-1">
                  <MapPin className="size-3" />
                  {formatDistance(distance)}
                </span>
              )}
              {!product.inStock ? (
                <span className="text-xs text-red-600 font-medium">Rupture</span>
              ) : (
                <span className="text-xs text-green-700/70">En stock</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedProduct(product)
              }}
              className="gap-1 text-[#8B4513] hover:text-[#3D1F1A] hover:bg-[#FAEBD7] h-7 px-2 text-xs"
            >
              <Eye className="size-3" />
              Voir
            </Button>
          </div>
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
  const { setSelectedProduct } = useMarketStore()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 14.6937, lng: -17.4441 }),
        { timeout: 5000 }
      )
    }
  }, [])

  const distance = userLocation
    ? haversineDistance(userLocation.lat, userLocation.lng, merchant.latitude, merchant.longitude)
    : null

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

          {/* Rating, Distance, Specialty */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <StarRating rating={merchant.rating} />
            {distance !== null && (
              <div className="flex items-center gap-1 text-[#8B0000] font-semibold">
                <Navigation className="size-3" />
                {formatDistance(distance)}
              </div>
            )}
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
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-[#FAEBD7]/60 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
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

  const { data: session } = useSession()

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

  // Fetch favorites if logged in
  useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: !!session,
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

      {/* Modals */}
      <AuthModal />
      <ProductDetailModal />
      <FavoritesPanel />
      <MerchantDashboard />
    </div>
  )
}
