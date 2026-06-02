import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                unit: true,
                merchant: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { items, addressId } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'La commande doit contenir au moins un article' },
        { status: 400 }
      )
    }

    // Validate items structure
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Chaque article doit avoir un productId et une quantité valide' },
          { status: 400 }
        )
      }
    }

    // Verify address belongs to user if provided
    if (addressId) {
      const address = await db.address.findUnique({
        where: { id: addressId },
      })
      if (!address || address.userId !== userId) {
        return NextResponse.json(
          { error: 'Adresse de livraison invalide' },
          { status: 400 }
        )
      }
    }

    // Fetch all products to calculate total
    const productIds = items.map((item: { productId: string }) => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Un ou plusieurs produits sont introuvables' },
        { status: 400 }
      )
    }

    // Create a map for quick product lookup
    const productMap = new Map(products.map((p) => [p.id, p]))

    // Calculate total and prepare order items
    let total = 0
    const orderItemsData = items.map(
      (item: { productId: string; quantity: number }) => {
        const product = productMap.get(item.productId)
        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }
        const price = product.price
        total += price * item.quantity
        return {
          productId: item.productId,
          quantity: item.quantity,
          price,
        }
      }
    )

    // Create the order with items
    const order = await db.order.create({
      data: {
        userId,
        status: 'en_attente',
        total,
        addressId: addressId || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                unit: true,
                merchant: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        address: true,
      },
    })

    // Create a notification for the order
    await db.notification.create({
      data: {
        userId,
        title: 'Commande créée',
        message: `Votre commande #${order.id.slice(-8)} a été créée avec succès. Total: ${total.toLocaleString('fr-FR')} FCFA`,
        type: 'commande',
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
