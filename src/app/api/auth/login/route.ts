import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { merchant: true },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Verify password with bcrypt
    let isValid = false
    try {
      isValid = await compare(password, user.password)
    } catch {
      // Fallback to direct comparison
      isValid = password === user.password
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      merchantId: user.merchantId,
      merchantName: user.merchant?.name || null,
    })
  } catch (error) {
    console.error('Login error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion'
    if (errorMessage.includes('P1001') || errorMessage.includes('P1002') || errorMessage.includes('P1003')) {
      return NextResponse.json(
        { error: 'Base de données non disponible. Veuillez réessayer dans quelques secondes.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: 'Erreur de connexion. Veuillez réessayer.' }, { status: 500 })
  }
}
