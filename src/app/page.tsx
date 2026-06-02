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
  Plus,
  Trash2,
  Crown,
  Diamond,
  Zap,
  Check,
  ShoppingCart,
  ArrowLeft,
  Settings,
  Phone,
  MapPinPlus,
  Clock,
  Bell,
  Shield,
  Edit,
  Save,
  PlusCircle,
  Home,
  Building2,
  Trash,
  EyeOff,
  Package,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

function getQuartier(location: string): string {
  // Extract quartier name from "Quartier, Ville" format
  const parts = location.split(',').map(s => s.trim())
  return parts[0] || location
}

function getPlanBadge(plan: string) {
  if (plan === 'premium_plus') {
    return (
      <Badge className="bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-[#3D1F1A] border-0 text-[10px] px-1.5 py-0 ml-1 font-semibold">
        <Diamond className="size-3 mr-0.5" />
        Premium+
      </Badge>
    )
  }
  if (plan === 'premium') {
    return (
      <Badge className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-[#FFD700] border-0 text-[10px] px-1.5 py-0 ml-1 font-semibold">
        <Crown className="size-3 mr-0.5" />
        Premium
      </Badge>
    )
  }
  return null
}

function getPlanLimit(plan: string): number {
  if (plan === 'premium_plus') return Infinity
  if (plan === 'premium') return 50
  return 5
}

function getPlanLabel(plan: string): string {
  if (plan === 'premium_plus') return 'Premium+'
  if (plan === 'premium') return 'Premium'
  return 'Gratuit'
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

async function createMerchantProduct(merchantId: string, data: {
  name: string; description: string; price: number; unit: string;
  image: string; categoryId: string; inStock: boolean;
}): Promise<Product> {
  const res = await fetch(`/api/merchants/${merchantId}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create product')
  return res.json()
}

async function deleteMerchantProduct(merchantId: string, productId: string): Promise<void> {
  const res = await fetch(`/api/merchants/${merchantId}/products?productId=${productId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete product')
}

async function subscribePlan(plan: string): Promise<{ plan: string; active: boolean }> {
  const res = await fetch('/api/subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  if (!res.ok) throw new Error('Failed to subscribe')
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
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, authRole, setAuthRole } = useMarketStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
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
    setPhone('')
    setSelectedMerchantId('')
    setError('')
    setLoading(false)
  }

  const isValidSenegalesePhone = (p: string) => {
    return /^\+221\d{9}$/.test(p) || /^(77|78|76|75|70)\d{7}$/.test(p)
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
    if (authRole === 'acheteur' && !name) {
      setError('Le nom est requis pour les acheteurs')
      return
    }
    if (authRole === 'acheteur' && phone && !isValidSenegalesePhone(phone)) {
      setError('Format téléphone invalide. Utilisez +221 XX XXX XX XX ou 77/78/76/75/70 XXX XX XX')
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
          phone: phone || undefined,
          role: authRole,
          merchantId: authRole === 'vendeur' && selectedMerchantId ? selectedMerchantId : undefined,
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
            Acheteurs et vendeurs, connectez-vous au Marché Royal
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
                {/* Role selector */}
                <div className="space-y-2">
                  <Label className="text-[#8B4513]">Je suis...</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthRole('acheteur')}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                        authRole === 'acheteur'
                          ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000] shadow-sm'
                          : 'border-[#DAA520]/20 bg-white/50 text-[#8B4513]/60 hover:border-[#DAA520]/40'
                      }`}
                    >
                      🛒 Acheteur
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole('vendeur')}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                        authRole === 'vendeur'
                          ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000] shadow-sm'
                          : 'border-[#DAA520]/20 bg-white/50 text-[#8B4513]/60 hover:border-[#DAA520]/40'
                      }`}
                    >
                      🏪 Vendeur
                    </button>
                  </div>
                </div>

                {authRole === 'acheteur' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-[#8B4513]">Nom *</Label>
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
                      <Label htmlFor="reg-email" className="text-[#8B4513]">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8B4513]/40" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="acheteur@marche.sn"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] focus-visible:ring-[#DAA520]/30 pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="text-[#8B4513]">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8B4513]/40" />
                        <Input
                          id="reg-phone"
                          type="tel"
                          placeholder="+221 77 123 45 67"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] focus-visible:ring-[#DAA520]/30 pl-9"
                        />
                      </div>
                      <p className="text-[10px] text-[#8B4513]/50">Format : +221 XX XXX XX XX</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-[#8B4513]">Mot de passe *</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Minimum 6 caractères"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] focus-visible:ring-[#DAA520]/30"
                      />
                    </div>
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
                  </>
                )}
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] font-semibold"
                >
                  {loading ? 'Inscription...' : 'S\'inscrire'}
                </Button>
              </>
            )}

            {authMode === 'login' && (
              <div className="space-y-1">
                <p className="text-center text-xs text-[#8B4513]/50">
                  Vendeur test : albaraka@marche.sn / vendeur1
                </p>
                <p className="text-center text-xs text-[#8B4513]/50">
                  Acheteur test : acheteur@marche.sn / buyer1
                </p>
              </div>
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
  const { setAuthModalOpen, setFavoritesOpen, setMerchantDashboardOpen, setPremiumPlansOpen, setBuyerSettingsOpen } = useMarketStore()
  const { toast } = useToast()
  const merchantId = (session?.user as Record<string, unknown>)?.merchantId as string | undefined
  const plan = ((session?.user as Record<string, unknown>)?.plan as string) || 'gratuit'
  const role = ((session?.user as Record<string, unknown>)?.role as string) || 'acheteur'
  const isBuyer = role === 'acheteur'

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
          <span className="text-sm">{isBuyer ? '🛒' : '🏪'}</span>
          {(plan === 'premium' || plan === 'premium_plus') && (
            <span className="text-[#DAA520]">
              {plan === 'premium_plus' ? <Diamond className="size-3" /> : <Crown className="size-3" />}
            </span>
          )}
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#FFF8DC] border-[#DAA520]/30" align="end">
        <DropdownMenuLabel className="font-[family-name:var(--font-playfair)] text-[#3D1F1A] flex items-center gap-1.5">
          {session.user.name || 'Utilisateur'}
          <span className="text-sm">{isBuyer ? '🛒' : '🏪'}</span>
          {getPlanBadge(plan)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#DAA520]/20" />
        {isBuyer ? (
          <>
            <DropdownMenuItem
              onClick={() => setBuyerSettingsOpen(true)}
              className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
            >
              <Settings className="mr-2 size-4" />
              Mon Profil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFavoritesOpen(true)}
              className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
            >
              <Heart className="mr-2 size-4" />
              Mes Favoris
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setBuyerSettingsOpen(true)}
              className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
            >
              <Package className="mr-2 size-4" />
              Mes Commandes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setBuyerSettingsOpen(true)}
              className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
            >
              <MapPinPlus className="mr-2 size-4" />
              Mes Adresses
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setBuyerSettingsOpen(true)}
              className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
            >
              <Bell className="mr-2 size-4" />
              Mes Notifications
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => setFavoritesOpen(true)}
              className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
            >
              <Heart className="mr-2 size-4" />
              Mes Favoris
            </DropdownMenuItem>
            {merchantId && (
              <>
                <DropdownMenuItem
                  onClick={() => setMerchantDashboardOpen(true)}
                  className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
                >
                  <Store className="mr-2 size-4" />
                  Mon Échoppe
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPremiumPlansOpen(true)}
                  className="text-[#8B4513] focus:bg-[#FAEBD7] focus:text-[#3D1F1A] cursor-pointer"
                >
                  <Diamond className="mr-2 size-4 text-[#DAA520]" />
                  Abonnement
                </DropdownMenuItem>
              </>
            )}
          </>
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

// ─── Premium Plans Dialog ────────────────────────────────────────────────────

function PremiumPlansDialog() {
  const { premiumPlansOpen, setPremiumPlansOpen } = useMarketStore()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const currentPlan = ((session?.user as Record<string, unknown>)?.plan as string) || 'gratuit'

  const subscribeMutation = useMutation({
    mutationFn: (plan: string) => subscribePlan(plan),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast({
        title: 'Abonnement activé !',
        description: `Votre plan ${data.plan === 'premium_plus' ? 'Premium+' : 'Premium'} est maintenant actif.`,
      })
      // Refresh session to get new plan
      window.location.reload()
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de modifier l\'abonnement', variant: 'destructive' })
    },
  })

  const plans = [
    {
      key: 'gratuit',
      name: 'Gratuit',
      price: '0 FCFA',
      period: '',
      icon: <Zap className="size-6 text-[#8B4513]/60" />,
      features: ['5 produits maximum', 'Liste basique', 'Sans badge'],
      color: '#8B4513',
      bgColor: '#FAEBD7',
    },
    {
      key: 'premium',
      name: 'Premium',
      price: '5 000 FCFA',
      period: '/mois',
      icon: <Crown className="size-6 text-[#DAA520]" />,
      features: ['50 produits maximum', 'Badge ⭐ Premium', 'Statistiques de base', 'Liste améliorée'],
      color: '#8B4513',
      bgColor: '#FFF8DC',
      popular: true,
    },
    {
      key: 'premium_plus',
      name: 'Premium+',
      price: '10 000 FCFA',
      period: '/mois',
      icon: <Diamond className="size-6 text-[#8B0000]" />,
      features: ['Produits illimités', 'Produits vedettes', 'Liste prioritaire', 'Statistiques avancées', 'Bannière personnalisée'],
      color: '#8B0000',
      bgColor: '#FFF8DC',
    },
  ]

  return (
    <Dialog open={premiumPlansOpen} onOpenChange={setPremiumPlansOpen}>
      <DialogContent className="sm:max-w-2xl bg-[#FFF8DC] border-[#DAA520]/30 max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)] text-[#3D1F1A] text-center text-xl">
            ⚜ Abonnements Marché Royal ⚜
          </DialogTitle>
          <DialogDescription className="text-center text-[#8B4513]/70">
            Choisissez le plan adapté à votre échoppe
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.key
            const isDowngrade = (plan.key === 'gratuit' && (currentPlan === 'premium' || currentPlan === 'premium_plus')) ||
              (plan.key === 'premium' && currentPlan === 'premium_plus')

            return (
              <div
                key={plan.key}
                className={`relative rounded-xl border-2 p-4 transition-all ${
                  isCurrent
                    ? 'border-[#DAA520] bg-[#FAEBD7]/50 shadow-lg shadow-[#DAA520]/10'
                    : plan.popular
                      ? 'border-[#DAA520]/50 bg-white/50 hover:border-[#DAA520] hover:shadow-md'
                      : 'border-[#DAA520]/20 bg-white/30 hover:border-[#DAA520]/50 hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#DAA520] to-[#FFD700] text-[#3D1F1A] border-0 text-[10px] font-semibold px-2">
                      Populaire
                    </Badge>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">{plan.icon}</div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#3D1F1A]">
                    {plan.name}
                  </h3>
                  <div className="mt-1">
                    <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: plan.color }}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-[#8B4513]/50">{plan.period}</span>
                    )}
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-[#8B4513] w-full">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="size-3.5 shrink-0" style={{ color: plan.color }} />
                        <span className="text-left">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-4"
                    disabled={isCurrent || subscribeMutation.isPending}
                    variant={isCurrent ? 'outline' : 'default'}
                    style={
                      isCurrent
                        ? undefined
                        : { backgroundColor: plan.color, color: '#FFD700' }
                    }
                    onClick={() => {
                      if (plan.key !== 'gratuit') {
                        subscribeMutation.mutate(plan.key)
                      }
                    }}
                  >
                    {isCurrent ? 'Plan actuel' : isDowngrade ? 'Choisir' : 'Choisir'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Product Detail Modal ────────────────────────────────────────────────────

function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct, navigateToShop } = useMarketStore()
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
            <div className="flex items-center gap-3 bg-[#FAEBD7]/80 rounded-lg px-4 py-3 border border-[#DAA520]/20">
              <Navigation className="size-5 text-[#8B0000] shrink-0" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#8B0000]">
                    {formatDistance(distance)}
                  </span>
                  <span className="text-xs text-[#8B4513]/50">de vous</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="size-3.5 text-[#8B0000]/70" />
                  <span className="text-sm font-semibold text-[#8B0000]">
                    Quartier {getQuartier(selectedProduct.merchant.location)}
                  </span>
                  <span className="text-xs text-[#8B4513]/50">•</span>
                  <span className="text-xs text-[#8B4513]/50">
                    {selectedProduct.merchant.address || selectedProduct.merchant.location}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#8B0000]">
              {formatPrice(selectedProduct.price)}
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
                              {formatDistance(offerDistance)} — Quartier {getQuartier(offer.merchant.location)}
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
                            {formatPrice(offer.price)}
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
              {lowestPrice !== undefined && lowestPrice < selectedProduct.price && (
                <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                  <TrendingDown className="size-3" />
                  Meilleur prix : {formatPrice(lowestPrice)} — économisez {formatPrice(selectedProduct.price - lowestPrice)}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            {/* Acheter button - green, prominent */}
            <Button
              className="w-full gap-2 bg-green-700 hover:bg-green-800 text-white font-bold text-base py-6 shadow-lg"
              onClick={() => {
                toast({
                  title: '🛒 Produit ajouté au panier',
                  description: `${selectedProduct.name} — ${formatPrice(selectedProduct.price)}`,
                })
              }}
            >
              <ShoppingCart className="size-5" />
              Acheter — {formatPrice(selectedProduct.price)}
            </Button>

            {/* Voir la Boutique button */}
            <Button
              variant="outline"
              className="w-full gap-2 border-[#8B4513]/30 text-[#8B4513] hover:bg-[#FAEBD7] hover:border-[#8B4513]/50 font-semibold py-5"
              onClick={() => {
                navigateToShop(selectedProduct.merchant.id)
              }}
            >
              <Store className="size-4" />
              🏪 Voir la Boutique
            </Button>

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
                      {formatPrice(fav.product.price)} / {fav.product.unit}
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
  const { merchantDashboardOpen, setMerchantDashboardOpen, setPremiumPlansOpen } = useMarketStore()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const merchantId = (session?.user as Record<string, unknown>)?.merchantId as string | undefined
  const plan = ((session?.user as Record<string, unknown>)?.plan as string) || 'gratuit'

  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    image: '📦',
    categoryId: '',
    inStock: true,
  })

  const { data: merchants = [] } = useQuery({
    queryKey: ['merchants'],
    queryFn: fetchMerchants,
  })

  const merchant = merchants.find((m) => m.id === merchantId)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['merchant-products', merchantId],
    queryFn: () => fetchMerchantProducts(merchantId!),
    enabled: !!merchantId && merchantDashboardOpen,
  })

  const planLimit = getPlanLimit(plan)
  const productCount = products.length
  const canAddMore = productCount < planLimit

  const updateMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: { inStock?: boolean; featured?: boolean } }) =>
      updateMerchantProduct(merchantId!, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-products', merchantId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string; description: string; price: number; unit: string;
      image: string; categoryId: string; inStock: boolean;
    }) => createMerchantProduct(merchantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-products', merchantId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({ title: 'Produit ajouté !', description: 'Votre produit est maintenant en ligne.' })
      setNewProduct({ name: '', description: '', price: '', unit: 'kg', image: '📦', categoryId: '', inStock: true })
      setShowAddForm(false)
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteMerchantProduct(merchantId!, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-products', merchantId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({ title: 'Produit supprimé', description: 'Le produit a été retiré de votre échoppe.' })
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de supprimer le produit', variant: 'destructive' })
    },
  })

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId) {
      toast({ title: 'Champs requis', description: 'Nom, prix et catégorie sont obligatoires', variant: 'destructive' })
      return
    }
    createMutation.mutate({
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      unit: newProduct.unit,
      image: newProduct.image,
      categoryId: newProduct.categoryId,
      inStock: newProduct.inStock,
    })
  }

  const EMOJI_OPTIONS = ['📦', '🥩', '🍖', '🐟', '🐠', '🦐', '🥭', '🍎', '🍊', '🍋', '🍌', '🍍', '🍅', '🧅', '🥬', '🌶️', '🧂', '🍯', '🫙', '🧀', '🍞', '🥖', '🥐', '🍷', '🍹', '🥤', '🍵', '🌿', '🍃', '🐔', '🐦', '🦪', '🫘']

  if (!merchantId || !merchant) return null

  return (
    <Dialog open={merchantDashboardOpen} onOpenChange={setMerchantDashboardOpen}>
      <DialogContent className="sm:max-w-xl bg-[#FFF8DC] border-[#DAA520]/30 max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)] text-[#3D1F1A] flex items-center gap-3">
            <span className="text-3xl">{merchant.image}</span>
            <div>
              <div className="flex items-center gap-2">
                {merchant.name}
                {getPlanBadge(plan)}
              </div>
              <div className="text-xs font-normal text-[#8B4513]/60">{merchant.specialty} — Quartier {getQuartier(merchant.location)}</div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-[#8B4513]/70">
            Gérez vos produits : stock, vedettes et ajouts
          </DialogDescription>
        </DialogHeader>

        {/* Merchant banner accent */}
        <div
          className="h-1.5 w-full rounded-full"
          style={{ backgroundColor: merchant.banner }}
        />

        {/* Plan info + Add product button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5"
              style={{
                backgroundColor: plan === 'premium_plus' ? '#8B000010' : plan === 'premium' ? '#8B451310' : '#8B451305',
                color: plan === 'premium_plus' ? '#8B0000' : plan === 'premium' ? '#8B4513' : '#8B4513/60',
                borderColor: plan === 'premium_plus' ? '#8B000030' : plan === 'premium' ? '#8B451330' : '#8B451320',
              }}
            >
              {plan === 'premium_plus' ? <Diamond className="size-3 mr-1" /> : plan === 'premium' ? <Crown className="size-3 mr-1" /> : <Zap className="size-3 mr-1" />}
              {productCount}{planLimit === Infinity ? '' : `/${planLimit}`} produits ({getPlanLabel(plan)})
            </Badge>
          </div>
          <Button
            onClick={() => {
              if (!canAddMore) {
                setPremiumPlansOpen(true)
                return
              }
              setShowAddForm(!showAddForm)
            }}
            size="sm"
            className="bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] gap-1"
          >
            <Plus className="size-4" />
            Ajouter un produit
          </Button>
        </div>

        {/* Add product form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-[#DAA520]/30 bg-[#FAEBD7]/40 p-4 space-y-3">
                <h4 className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#3D1F1A]">
                  ➕ Nouveau produit
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8B4513]">Nom *</Label>
                    <Input
                      placeholder="Nom du produit"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="h-8 text-sm border-[#DAA520]/30 bg-white/70"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8B4513]">Prix (FCFA) *</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="h-8 text-sm border-[#DAA520]/30 bg-white/70"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#8B4513]">Description</Label>
                  <Input
                    placeholder="Description du produit"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="h-8 text-sm border-[#DAA520]/30 bg-white/70"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8B4513]">Unité</Label>
                    <Select value={newProduct.unit} onValueChange={(v) => setNewProduct({ ...newProduct, unit: v })}>
                      <SelectTrigger className="h-8 text-sm border-[#DAA520]/30 bg-white/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="pièce">pièce</SelectItem>
                        <SelectItem value="botte">botte</SelectItem>
                        <SelectItem value="sachet">sachet</SelectItem>
                        <SelectItem value="pot">pot</SelectItem>
                        <SelectItem value="bouteille">bouteille</SelectItem>
                        <SelectItem value="douzaine">douzaine</SelectItem>
                        <SelectItem value="100g">100g</SelectItem>
                        <SelectItem value="500g">500g</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8B4513]">Catégorie *</Label>
                    <Select value={newProduct.categoryId} onValueChange={(v) => setNewProduct({ ...newProduct, categoryId: v })}>
                      <SelectTrigger className="h-8 text-sm border-[#DAA520]/30 bg-white/70">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8B4513]">Image</Label>
                    <Select value={newProduct.image} onValueChange={(v) => setNewProduct({ ...newProduct, image: v })}>
                      <SelectTrigger className="h-8 text-sm border-[#DAA520]/30 bg-white/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="grid grid-cols-8 gap-1 p-1">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <SelectItem key={emoji} value={emoji} className="text-center text-lg justify-center">
                              {emoji}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8B4513]">
                    <input
                      type="checkbox"
                      checked={newProduct.inStock}
                      onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                      className="rounded border-[#DAA520]/30"
                    />
                    En stock
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAddProduct}
                    disabled={createMutation.isPending}
                    size="sm"
                    className="bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] gap-1"
                  >
                    {createMutation.isPending ? 'Ajout...' : 'Ajouter'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="text-[#8B4513]/60"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!canAddMore && !showAddForm && (
          <div className="rounded-lg bg-[#DAA520]/10 border border-[#DAA520]/20 p-3 text-center">
            <p className="text-sm text-[#8B4513] font-medium">
              ⬆ Limite atteinte ! Passez en {plan === 'gratuit' ? 'Premium' : 'Premium+'} pour plus de produits
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 border-[#DAA520]/30 text-[#8B0000] hover:bg-[#FAEBD7]"
              onClick={() => setPremiumPlansOpen(true)}
            >
              <Diamond className="size-3 mr-1" />
              Voir les abonnements
            </Button>
          </div>
        )}

        <ScrollArea className="max-h-[40vh]">
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
                      <span className="text-xs font-semibold text-[#8B0000]">{formatPrice(product.price)}</span>
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
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Stock toggle */}
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
                          <span className="hidden sm:inline">Stock</span>
                        </>
                      ) : (
                        <>
                          <PackageX className="size-3.5" />
                          <span className="hidden sm:inline">Rupture</span>
                        </>
                      )}
                    </Button>

                    {/* Featured toggle - only for premium+ */}
                    {plan === 'premium_plus' ? (
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
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs h-8 px-2 text-[#8B4513]/30 cursor-not-allowed"
                        disabled
                        title="Passez en Premium+ pour mettre en avant"
                      >
                        <Star className="size-3.5" />
                        <span className="hidden sm:inline">⬆ Premium+</span>
                      </Button>
                    )}

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Supprimer "${product.name}" ?`)) {
                          deleteMutation.mutate(product.id)
                        }
                      }}
                      className="gap-1 text-xs h-8 px-2 text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
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

// ─── Buyer Settings Dialog ───────────────────────────────────────────────────

interface AddressItem {
  id: string
  label: string
  address: string
  city: string
  phone: string | null
  isDefault: boolean
  latitude: number
  longitude: number
}

interface OrderItem {
  id: string
  status: string
  total: number
  createdAt: string
  address: AddressItem | null
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      image: string
      unit: string
      merchant: { id: string; name: string }
    }
  }[]
}

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

function BuyerSettingsDialog() {
  const { buyerSettingsOpen, setBuyerSettingsOpen } = useMarketStore()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state - initialized from profile data
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileAvatar, setProfileAvatar] = useState('👤')
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    label: '',
    address: '',
    city: 'Dakar',
    phone: '',
    isDefault: false,
  })

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Expanded orders
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/auth/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      return res.json()
    },
    enabled: buyerSettingsOpen && !!session,
  })

  // Update profile form when data loads - use a callback approach
  const handleProfileData = useCallback(() => {
    if (profile && !profileLoaded) {
      setProfileName(profile.name || '')
      setProfilePhone(profile.phone || '')
      setProfileAvatar(profile.image || '👤')
      setProfileLoaded(true)
    }
  }, [profile, profileLoaded])

  // Trigger profile data update on the next render cycle
  if (profile && !profileLoaded) {
    // Queue the state updates for the next render
    Promise.resolve().then(handleProfileData)
  }

  // Fetch addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await fetch('/api/addresses')
      if (!res.ok) throw new Error('Failed to fetch addresses')
      return res.json() as Promise<AddressItem[]>
    },
    enabled: buyerSettingsOpen && !!session,
  })

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json() as Promise<OrderItem[]>
    },
    enabled: buyerSettingsOpen && !!session,
  })

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json() as Promise<NotificationItem[]>
    },
    enabled: buyerSettingsOpen && !!session,
  })

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string; image: string }) => {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast({ title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées.' })
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le profil', variant: 'destructive' })
    },
  })

  // Address mutations
  const addressCreateMutation = useMutation({
    mutationFn: async (data: typeof addressForm) => {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create address')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast({ title: 'Adresse ajoutée', description: 'Votre adresse a été enregistrée.' })
      setShowAddressForm(false)
      setAddressForm({ label: '', address: '', city: 'Dakar', phone: '', isDefault: false })
      setEditingAddressId(null)
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter l\'adresse', variant: 'destructive' })
    },
  })

  const addressUpdateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof addressForm }) => {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update address')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast({ title: 'Adresse mise à jour', description: 'Votre adresse a été modifiée.' })
      setShowAddressForm(false)
      setAddressForm({ label: '', address: '', city: 'Dakar', phone: '', isDefault: false })
      setEditingAddressId(null)
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de modifier l\'adresse', variant: 'destructive' })
    },
  })

  const addressDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete address')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast({ title: 'Adresse supprimée', description: 'L\'adresse a été retirée.' })
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'adresse', variant: 'destructive' })
    },
  })

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to change password')
      }
      return res.json()
    },
    onSuccess: () => {
      toast({ title: 'Mot de passe modifié', description: 'Votre mot de passe a été changé avec succès.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })

  // Notification mutations
  const markReadMutation = useMutation({
    mutationFn: async (data: { notificationId?: string; markAll?: boolean }) => {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to mark as read')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const AVATAR_OPTIONS = ['👤', '🧑', '👨', '👩', '🧔', '👨‍🦱', '👩‍🦱', '🧑‍🦰', '👴', '👵', '🧕', '👳‍♂️']

  function getStatusBadge(status: string) {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      en_attente: { label: 'En attente', color: '#92400e', bg: '#fef3c7' },
      confirmee: { label: 'Confirmée', color: '#1e40af', bg: '#dbeafe' },
      en_preparation: { label: 'En préparation', color: '#9a3412', bg: '#ffedd5' },
      livree: { label: 'Livrée', color: '#166534', bg: '#dcfce7' },
      annulee: { label: 'Annulée', color: '#991b1b', bg: '#fee2e2' },
    }
    const s = map[status] || map.en_attente
    return (
      <Badge className="border-0 text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color }}>
        {s.label}
      </Badge>
    )
  }

  const handleSaveProfile = () => {
    profileMutation.mutate({ name: profileName, phone: profilePhone, image: profileAvatar })
  }

  const handleSaveAddress = () => {
    if (!addressForm.label || !addressForm.address) {
      toast({ title: 'Champs requis', description: 'Le libellé et l\'adresse sont obligatoires', variant: 'destructive' })
      return
    }
    if (editingAddressId) {
      addressUpdateMutation.mutate({ id: editingAddressId, data: addressForm })
    } else {
      addressCreateMutation.mutate(addressForm)
    }
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Champs requis', description: 'Remplissez tous les champs', variant: 'destructive' })
      return
    }
    if (newPassword.length < 6) {
      toast({ title: 'Erreur', description: 'Le nouveau mot de passe doit contenir au moins 6 caractères', variant: 'destructive' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' })
      return
    }
    passwordMutation.mutate({ currentPassword, newPassword })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Dialog open={buyerSettingsOpen} onOpenChange={setBuyerSettingsOpen}>
      <DialogContent className="sm:max-w-2xl bg-[#FFF8DC] border-[#DAA520]/30 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-playfair)] text-[#3D1F1A] flex items-center gap-2">
            ⚜ Mon Espace Acheteur ⚜
          </DialogTitle>
          <DialogDescription className="text-[#8B4513]/70">
            Gérez votre profil, adresses, commandes et plus
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="flex flex-wrap gap-1 bg-[#FAEBD7] border border-[#DAA520]/20 h-auto p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-[#FFD700] text-xs gap-1">
              <Settings className="size-3" /> Profil
            </TabsTrigger>
            <TabsTrigger value="addresses" className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-[#FFD700] text-xs gap-1">
              <MapPinPlus className="size-3" /> Adresses
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-[#FFD700] text-xs gap-1">
              <Package className="size-3" /> Commandes
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-[#FFD700] text-xs gap-1">
              <Shield className="size-3" /> Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-[#8B0000] data-[state=active]:text-[#FFD700] text-xs gap-1 relative">
              <Bell className="size-3" /> Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B0000] text-[#FFD700] text-[9px] rounded-full size-4 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 min-h-0">
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-[#8B4513] text-sm">Avatar</Label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setProfileAvatar(emoji)}
                      className={`text-2xl rounded-lg border-2 p-1.5 transition-all ${
                        profileAvatar === emoji
                          ? 'border-[#8B0000] bg-[#8B0000]/10 shadow-sm'
                          : 'border-[#DAA520]/20 hover:border-[#DAA520]/40'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#8B4513] text-sm">Nom</Label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Votre nom"
                  className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8B4513] text-sm">Email</Label>
                <Input
                  value={profile?.email || ''}
                  readOnly
                  className="border-[#DAA520]/20 bg-[#FAEBD7]/40 text-[#8B4513]/60 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#8B4513] text-sm">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8B4513]/40" />
                  <Input
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+221 77 123 45 67"
                    className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] pl-9"
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={profileMutation.isPending}
                className="bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] gap-2"
              >
                <Save className="size-4" />
                {profileMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B4513]/70">{addresses.length} adresse{addresses.length !== 1 ? 's' : ''}</span>
                <Button
                  onClick={() => {
                    setEditingAddressId(null)
                    setAddressForm({ label: '', address: '', city: 'Dakar', phone: '', isDefault: false })
                    setShowAddressForm(!showAddressForm)
                  }}
                  size="sm"
                  className="bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] gap-1"
                >
                  <PlusCircle className="size-3.5" />
                  Ajouter
                </Button>
              </div>

              {showAddressForm && (
                <div className="rounded-lg border border-[#DAA520]/30 bg-[#FAEBD7]/40 p-4 space-y-3">
                  <h4 className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#3D1F1A]">
                    {editingAddressId ? '✏️ Modifier l\'adresse' : '➕ Nouvelle adresse'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#8B4513]">Libellé *</Label>
                      <Input
                        placeholder="Maison, Bureau..."
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        className="h-8 text-sm border-[#DAA520]/30 bg-white/70"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#8B4513]">Ville</Label>
                      <Input
                        placeholder="Dakar"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="h-8 text-sm border-[#DAA520]/30 bg-white/70"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8B4513]">Adresse *</Label>
                    <Input
                      placeholder="12 Rue Carnot, Dakar"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="h-8 text-sm border-[#DAA520]/30 bg-white/70"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#8B4513]">Téléphone</Label>
                    <Input
                      placeholder="+221 77 123 45 67"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="h-8 text-sm border-[#DAA520]/30 bg-white/70"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8B4513]">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="rounded border-[#DAA520]/30"
                    />
                    Adresse par défaut
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSaveAddress}
                      disabled={addressCreateMutation.isPending || addressUpdateMutation.isPending}
                      size="sm"
                      className="bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] gap-1"
                    >
                      {addressCreateMutation.isPending || addressUpdateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddressForm(false)} className="text-[#8B4513]/60">
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {addressesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-[#DAA520]/10" />
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPinPlus className="size-10 text-[#DAA520]/30 mx-auto mb-2" />
                  <p className="text-sm text-[#8B4513]/60">Aucune adresse enregistrée</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        addr.isDefault
                          ? 'border-[#DAA520]/40 bg-[#FAEBD7]/60'
                          : 'border-[#DAA520]/20 bg-white/30 hover:bg-[#FAEBD7]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#3D1F1A]">
                              {addr.label === 'Maison' ? <Home className="inline size-3.5 mr-1" /> : <Building2 className="inline size-3.5 mr-1" />}
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <Badge className="bg-[#DAA520]/20 text-[#8B4513] border-0 text-[10px]">Par défaut</Badge>
                            )}
                          </div>
                          <p className="text-xs text-[#8B4513]/60 mt-0.5">{addr.address}, {addr.city}</p>
                          {addr.phone && <p className="text-xs text-[#8B4513]/50 mt-0.5">📞 {addr.phone}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAddressId(addr.id)
                              setAddressForm({
                                label: addr.label,
                                address: addr.address,
                                city: addr.city,
                                phone: addr.phone || '',
                                isDefault: addr.isDefault,
                              })
                              setShowAddressForm(true)
                            }}
                            className="size-7 p-0 text-[#8B4513] hover:bg-[#FAEBD7]"
                          >
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Supprimer "${addr.label}" ?`)) {
                                addressDeleteMutation.mutate(addr.id)
                              }
                            }}
                            className="size-7 p-0 text-red-500 hover:bg-red-50"
                          >
                            <Trash className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-0 space-y-3">
              {ordersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-[#DAA520]/10" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="size-10 text-[#DAA520]/30 mx-auto mb-2" />
                  <p className="text-sm text-[#8B4513]/60">Aucune commande pour le moment</p>
                  <p className="text-xs text-[#8B4513]/40 mt-1">Vos achats apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-[#DAA520]/20 bg-white/30 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="w-full p-3 flex items-center justify-between hover:bg-[#FAEBD7]/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#3D1F1A]">
                                #{order.id.slice(-8)}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-xs text-[#8B4513]/50 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                              {' · '}
                              {order.items.length} article{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-[family-name:var(--font-playfair)] text-sm font-bold text-[#8B0000]">
                            {formatPrice(order.total)}
                          </span>
                          <ChevronDown className={`size-3.5 text-[#8B4513]/40 ml-1 inline transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {expandedOrderId === order.id && (
                        <div className="border-t border-[#DAA520]/15 p-3 bg-[#FAEBD7]/20">
                          {order.address && (
                            <p className="text-xs text-[#8B4513]/60 mb-2 flex items-center gap-1">
                              <MapPin className="size-3" />
                              {order.address.label} — {order.address.address}, {order.address.city}
                            </p>
                          )}
                          <div className="space-y-1.5">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span>{item.product.image}</span>
                                  <span className="text-[#3D1F1A]">{item.product.name}</span>
                                  <span className="text-[#8B4513]/40">x{item.quantity}</span>
                                </div>
                                <span className="font-medium text-[#8B0000]">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0 space-y-4">
              <div className="rounded-lg border border-[#DAA520]/20 bg-white/30 p-4 space-y-3">
                <h4 className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#3D1F1A] flex items-center gap-2">
                  <Shield className="size-4 text-[#8B0000]" />
                  Changer le mot de passe
                </h4>
                <div className="space-y-2">
                  <Label className="text-xs text-[#8B4513]">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••"
                      className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B4513]/40 hover:text-[#8B4513]"
                    >
                      {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-[#8B4513]">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B4513]/40 hover:text-[#8B4513]"
                    >
                      {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-[#8B4513]">Confirmer le mot de passe</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez le nouveau mot de passe"
                    className="border-[#DAA520]/30 bg-white/70 focus-visible:border-[#DAA520]"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={passwordMutation.isPending}
                  size="sm"
                  className="bg-[#8B0000] hover:bg-[#6B0000] text-[#FFD700] gap-1"
                >
                  <Shield className="size-3.5" />
                  {passwordMutation.isPending ? 'Modification...' : 'Changer le mot de passe'}
                </Button>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B4513]/70">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  {unreadCount > 0 && ` · ${unreadCount} non lue${unreadCount !== 1 ? 's' : ''}`}
                </span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markReadMutation.mutate({ markAll: true })}
                    className="text-xs text-[#8B0000] hover:bg-[#FAEBD7] gap-1"
                  >
                    <Check className="size-3" />
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
              {notificationsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-[#DAA520]/10" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="size-10 text-[#DAA520]/30 mx-auto mb-2" />
                  <p className="text-sm text-[#8B4513]/60">Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        notif.read
                          ? 'border-[#DAA520]/10 bg-white/20'
                          : 'border-[#DAA520]/25 bg-[#FAEBD7]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {!notif.read && <span className="size-2 rounded-full bg-[#8B0000] shrink-0" />}
                            <span className={`text-sm ${notif.read ? 'text-[#8B4513]/70' : 'font-semibold text-[#3D1F1A]'}`}>
                              {notif.title}
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${notif.read ? 'text-[#8B4513]/50' : 'text-[#8B4513]/70'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-[#8B4513]/40 mt-1 flex items-center gap-1">
                            <Clock className="size-2.5" />
                            {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markReadMutation.mutate({ notificationId: notif.id })}
                            className="text-xs text-[#8B0000] hover:bg-[#FAEBD7] shrink-0 h-7 px-2"
                          >
                            <Eye className="size-3 mr-1" />
                            Lu
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
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
          Le marché de Dakar, à portée de main
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
              {formatPrice(product.price)}
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

          {/* Distance + Stock + Action buttons */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {distance !== null && (
                <span className="text-xs text-[#8B4513]/70 flex items-center gap-1">
                  <MapPin className="size-3" />
                  {formatDistance(distance)} · Quartier {getQuartier(product.merchant.location)}
                </span>
              )}
              {!product.inStock ? (
                <span className="text-xs text-red-600 font-medium">Rupture</span>
              ) : (
                <span className="text-xs text-green-700/70">En stock</span>
              )}
            </div>
            <div className="flex items-center gap-1">
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
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedProduct(product)
                }}
                className="gap-1 bg-green-700 hover:bg-green-800 text-white h-7 px-2 text-xs font-semibold"
              >
                <ShoppingCart className="size-3" />
                Acheter
              </Button>
            </div>
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
  plan,
}: {
  merchant: Merchant
  products: Product[]
  plan?: string
}) {
  const { setSelectedProduct, navigateToShop } = useMarketStore()
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
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#3D1F1A] flex items-center gap-2">
                {merchant.name}
                {plan && plan !== 'gratuit' && getPlanBadge(plan)}
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
              Quartier {getQuartier(merchant.location)}
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

          {/* Voir la Boutique button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToShop(merchant.id)}
            className="mt-3 gap-1.5 border-[#8B4513]/30 text-[#8B4513] hover:bg-[#FAEBD7] hover:border-[#8B4513]/50 text-xs font-semibold"
          >
            <Store className="size-3.5" />
            🏪 Voir la Boutique
          </Button>
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
                    {formatPrice(product.price)}
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

// ─── Merchant Shop Page ──────────────────────────────────────────────────────

function MerchantShopPage() {
  const { viewingMerchantId, navigateToMarket, setSelectedProduct } = useMarketStore()
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

  const { data: merchants = [], isLoading: merchantsLoading } = useQuery({
    queryKey: ['merchants'],
    queryFn: fetchMerchants,
  })

  const merchant = merchants.find((m) => m.id === viewingMerchantId)

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['merchant-products', viewingMerchantId],
    queryFn: () => fetchMerchantProducts(viewingMerchantId!),
    enabled: !!viewingMerchantId,
  })

  const distance = (merchant && userLocation)
    ? haversineDistance(userLocation.lat, userLocation.lng, merchant.latitude, merchant.longitude)
    : null

  const isLoading = merchantsLoading || productsLoading

  return (
    <div className="min-h-screen bg-[#FFF8DC]">
      {/* Shop header with banner */}
      <div className="relative overflow-hidden">
        {/* Banner background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: merchant?.banner || '#8B0000' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2C1810]/90 via-[#3D1F1A]/80 to-[#FFF8DC]" />

        {/* Back button */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 pt-4">
          <Button
            variant="ghost"
            onClick={navigateToMarket}
            className="gap-2 text-[#FFD700]/90 hover:text-[#FFD700] hover:bg-white/10 font-medium"
          >
            <ArrowLeft className="size-4" />
            Retour au marché
          </Button>
        </div>

        {/* Merchant info */}
        {merchant && (
          <div className="relative z-10 mx-auto max-w-5xl px-4 pt-2 pb-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Merchant avatar */}
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-white/90 text-4xl shadow-xl border-2 border-[#DAA520]/40">
                {merchant.image}
              </div>

              {/* Merchant name */}
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#FFD700] tracking-wide drop-shadow-lg">
                {merchant.name}
              </h1>

              {/* Ornamental divider */}
              <div className="mx-auto mt-2 flex items-center justify-center gap-2">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#DAA520] sm:w-20" />
                <span className="text-[#DAA520]">⚜</span>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#DAA520] sm:w-20" />
              </div>

              {/* Description */}
              <p className="mt-3 font-[family-name:var(--font-playfair)] text-base text-[#FAEBD7]/80 italic max-w-xl mx-auto">
                {merchant.description}
              </p>

              {/* Rating, Distance, Location, Specialty badges */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1.5">
                  <StarRating rating={merchant.rating} />
                </div>
                {distance !== null && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-[#FFD700] font-semibold">
                    <Navigation className="size-3.5" />
                    {formatDistance(distance)} · Quartier {getQuartier(merchant.location)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-[#FAEBD7]/80">
                  <MapPin className="size-3.5" />
                  {merchant.address || merchant.location}
                </div>
                <Badge
                  className="font-medium"
                  style={{
                    backgroundColor: `${merchant.banner}30`,
                    color: '#FFD700',
                    borderColor: `${merchant.banner}50`,
                  }}
                >
                  {merchant.specialty}
                </Badge>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bottom border */}
        <div className="relative h-3 bg-gradient-to-r from-[#8B0000] via-[#DAA520] to-[#8B0000]" />
      </div>

      {/* Products section */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#3D1F1A] flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            Nos Produits
            <Badge variant="outline" className="text-xs font-normal border-[#DAA520]/30 text-[#8B4513]">
              {products.length} produit{products.length !== 1 ? 's' : ''}
            </Badge>
          </h2>
        </div>

        <OrnamentalDivider />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
            <span className="text-6xl mb-4">🏪</span>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#3D1F1A]">
              Aucun produit disponible
            </h3>
            <p className="mt-2 text-sm text-[#8B4513]/60">
              Ce marchand n&apos;a pas encore de produits en ligne.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
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
    </div>
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
    pageView,
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

  const currentMerchantId = (session?.user as Record<string, unknown>)?.merchantId as string | undefined

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

  // Render shop page
  if (pageView === 'shop') {
    return (
      <>
        <MerchantShopPage />
        {/* Shared modals */}
        <AuthModal />
        <ProductDetailModal />
        <FavoritesPanel />
        <MerchantDashboard />
        <PremiumPlansDialog />
        <BuyerSettingsDialog />
      </>
    )
  }

  // Render market page (default)
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
                    plan={merchant.id === currentMerchantId ? (((session?.user as Record<string, unknown>)?.plan as string) || 'gratuit') : undefined}
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
      <PremiumPlansDialog />
      <BuyerSettingsDialog />
    </div>
  )
}
