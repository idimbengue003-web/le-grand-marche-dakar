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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, role, merchantId } = body

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
          error:
            'Numéro de téléphone invalide. Format attendu: +221 suivi de 9 chiffres ou 77/78/76/75/70 suivi de 7 chiffres',
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

    // If role is vendeur and merchantId is provided, verify the merchant exists
    if (userRole === 'vendeur' && merchantId) {
      const merchant = await db.merchant.findUnique({
        where: { id: merchantId },
      })
      if (!merchant) {
        return NextResponse.json(
          { error: 'Commerçant introuvable' },
          { status: 400 }
        )
      }
    }

    // Hash the password
    const hashedPassword = await hash(password, 12)

    // Create the user
    const userData: Record<string, unknown> = {
      name: name || null,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: userRole,
    }

    if (userRole === 'vendeur' && merchantId) {
      userData.merchantId = merchantId
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
    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Bienvenue sur le Marché de DAKAR!',
        message: `Bienvenue${name ? ` ${name}` : ''}! Votre compte a été créé avec succès en tant que ${userRole === 'acheteur' ? 'acheteur' : 'vendeur'}.`,
        type: 'systeme',
      },
    })

    return NextResponse.json(
      { message: 'Compte créé avec succès', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
