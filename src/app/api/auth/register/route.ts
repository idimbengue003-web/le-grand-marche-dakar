import { db } from '@/lib/db'
import { hash } from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, merchantId } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà enregistré' }, { status: 409 })
    }

    const hashedPassword = await hash(password, 12)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        merchantId: merchantId || null,
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, merchantId: user.merchantId })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'inscription' }, { status: 500 })
  }
}
