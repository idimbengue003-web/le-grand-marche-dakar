import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productName = searchParams.get('name')
    const excludeMerchantId = searchParams.get('excludeMerchantId')

    if (!productName) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 })
    }

    // Find all products with the same name from different merchants
    const where: Record<string, unknown> = {
      name: { equals: productName },
    }

    if (excludeMerchantId) {
      where.merchantId = { not: excludeMerchantId }
    }

    const competitors = await db.product.findMany({
      where,
      include: {
        merchant: true,
        category: true,
      },
      orderBy: { price: 'asc' },
    })

    return NextResponse.json(competitors)
  } catch (error) {
    console.error('Error comparing products:', error)
    return NextResponse.json({ error: 'Failed to compare products' }, { status: 500 })
  }
}
