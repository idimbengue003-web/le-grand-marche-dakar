import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const merchants = await db.merchant.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { rating: 'desc' },
    })
    return NextResponse.json(merchants)
  } catch (error) {
    console.error('Error fetching merchants:', error)
    return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 })
  }
}
