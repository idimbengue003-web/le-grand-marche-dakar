import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const subscription = await db.subscription.findUnique({
      where: { userId },
    })

    return NextResponse.json(subscription || { plan: 'gratuit', active: false })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { plan } = await req.json()

    if (!['premium', 'premium_plus'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Create or update subscription
    const subscription = await db.subscription.upsert({
      where: { userId },
      update: { plan, active: true },
      create: { userId, plan, active: true },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
