import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const products = await db.product.findMany({
      where: { merchantId: id },
      include: { category: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching merchant products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { productId, ...data } = body

    if (productId) {
      // Update a specific product
      const product = await db.product.update({
        where: { id: productId, merchantId: id },
        data,
      })
      return NextResponse.json(product)
    }

    return NextResponse.json({ error: 'productId requis' }, { status: 400 })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
