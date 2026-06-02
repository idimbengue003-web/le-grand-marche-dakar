import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const merchantId = searchParams.get('merchantId')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'name'
    const order = searchParams.get('order') || 'asc'

    const where: Record<string, unknown> = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (merchantId) {
      where.merchantId = merchantId
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const orderBy: Record<string, string> = {}
    if (sort === 'price') {
      orderBy.price = order
    } else if (sort === 'name') {
      orderBy.name = order
    } else if (sort === 'createdAt') {
      orderBy.createdAt = 'desc'
    } else {
      orderBy.name = 'asc'
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        merchant: true,
      },
      orderBy,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
