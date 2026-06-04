import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

// Senegalese phone validation:
// +221 followed by 9 digits, or 77/78/76/75/70 followed by 7 digits
function isValidSenegalesePhone(phone: string): boolean {
  const withCountryCode = /^\+221\d{9}$/
  const localFormat = /^(77|78|76|75|70)\d{7}$/
  return withCountryCode.test(phone) || localFormat.test(phone)
}

// Generate a URL-safe slug from a name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Banner colors for new shops
const BANNER_COLORS = ['#8B0000', '#1E90FF', '#FF6347', '#FF8C00', '#DAA520', '#228B22', '#722F37', '#3CB371', '#533483', '#0f3460']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, role, merchantId, shopName, shopDescription, shopLocation, shopPhone, shopAddress } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Validate role
    const userRole = role || 'acheteur'
    if (userRole !== 'acheteur' && userRole !== 'vendeur') {
      return NextResponse.json(
        { error: 'Le rôle doit être "acheteur" ou "vendeur"' },
        { status: 400 }
      )
    }

    // Validate Senegalese phone format if provided
    if (phone && !isValidSenegalesePhone(phone)) {
      return NextResponse.json(
        {
          error: 'Numéro de téléphone invalide. Format attendu: +221 suivi de 9 chiffres ou 77/78/76/75/70 suivi de 7 chiffres',
        },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await hash(password, 12)

    // For vendors: create a new shop or link to existing one
    let userMerchantId: string | null = null

    if (userRole === 'vendeur') {
      if (merchantId) {
        // Link to existing merchant
        const merchant = await db.merchant.findUnique({
          where: { id: merchantId },
        })
        if (!merchant) {
          return NextResponse.json(
            { error: 'Commerçant introuvable' },
            { status: 400 }
          )
        }
        userMerchantId = merchantId
      } else if (shopName) {
        // Create a new shop for the vendor
        const shopPhoneValue = shopPhone || phone || ''
        
        // Validate shop phone if provided
        if (shopPhoneValue && !isValidSenegalesePhone(shopPhoneValue)) {
          return NextResponse.json(
            { error: 'Numéro de téléphone de la boutique invalide. Format: +221 XXX XX XX XX' },
            { status: 400 }
          )
        }

        const slug = slugify(shopName) + '-' + Date.now().toString(36)
        const bannerColor = BANNER_COLORS[Math.floor(Math.random() * BANNER_COLORS.length)]
        
        // Default Dakar coordinates
        const dakarLocations = [
          { location: 'Plateau, Dakar', lat: 14.6720, lng: -17.4380 },
          { location: 'Almadies, Dakar', lat: 14.7167, lng: -17.5167 },
          { location: 'Médina, Dakar', lat: 14.6940, lng: -17.4530 },
          { location: 'Sandaga, Dakar', lat: 14.6640, lng: -17.4320 },
          { location: 'Mermoz, Dakar', lat: 14.6990, lng: -17.4730 },
          { location: 'Sacré-Cœur, Dakar', lat: 14.7100, lng: -17.4700 },
          { location: 'Ouakam, Dakar', lat: 14.7270, lng: -17.4870 },
          { location: 'Fann, Dakar', lat: 14.6880, lng: -17.4640 },
          { location: 'Point E, Dakar', lat: 14.7060, lng: -17.4650 },
          { location: 'Grand Yoff, Dakar', lat: 14.7200, lng: -17.4750 },
        ]
        const loc = dakarLocations.find(l => l.location === shopLocation) || dakarLocations[0]

        const merchant = await db.merchant.create({
          data: {
            name: shopName,
            slug,
            description: shopDescription || `Bienvenue chez ${shopName}`,
            image: '🏪',
            rating: 0,
            location: shopLocation || loc.location,
            address: shopAddress || '',
            latitude: loc.lat,
            longitude: loc.lng,
            specialty: shopDescription ? shopDescription.substring(0, 30) : shopName,
            banner: bannerColor,
            phone: shopPhoneValue,
          },
        })
        userMerchantId = merchant.id
      }
    }

    // Create the user
    const userData: Record<string, unknown> = {
      name: name || null,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: userRole,
    }

    if (userMerchantId) {
      userData.merchantId = userMerchantId
    }

    const user = await db.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        merchantId: true,
        createdAt: true,
      },
    })

    // Create a free subscription for the user
    await db.subscription.create({
      data: {
        userId: user.id,
        plan: 'gratuit',
      },
    })

    // Create a welcome notification
    const welcomeMsg = userRole === 'vendeur'
      ? `Bienvenue${name ? ` ${name}` : ''}! Votre boutique a été créée. Commencez à ajouter vos produits et offres!`
      : `Bienvenue${name ? ` ${name}` : ''}! Découvrez les offres des vendeurs de Dakar.`

    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Bienvenue sur le Marché de DAKAR! 👑',
        message: welcomeMsg,
        type: 'systeme',
      },
    })

    return NextResponse.json(
      { message: 'Compte créé avec succès', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Handle Prisma connection errors
    if (errorMessage.includes('P1001') || errorMessage.includes('P1002') || errorMessage.includes('P1003') || errorMessage.includes('not configured') || errorMessage.includes('TURSO')) {
      return NextResponse.json(
        { error: 'Base de données non configurée. Vérifiez les variables TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sur Vercel.' },
        { status: 503 }
      )
    }

    if (errorMessage.includes('unique') || errorMessage.includes('UNIQUE')) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.', debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    )
  }
}
