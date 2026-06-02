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
    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true, merchant: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 })
    }

    // Check if already favorited
    const existing = await db.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    })

    if (existing) {
      // Remove favorite
      await db.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    } else {
      // Add favorite
      await db.favorite.create({
        data: { userId, productId },
      })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 })
  }
}
