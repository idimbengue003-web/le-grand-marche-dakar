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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const merchantId = (session.user as any).merchantId
    const { id } = await params

    // Only allow creating products for your own merchant
    if (merchantId !== id) {
      return NextResponse.json({ error: 'Non autorisé pour ce marchand' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, price, unit, image, images, categoryId, inStock } = body

    if (!name || !price || !unit || !categoryId) {
      return NextResponse.json({ error: 'Nom, prix, unité et catégorie requis' }, { status: 400 })
    }

    // Check product limit based on plan
    const plan = (session.user as any).plan || 'gratuit'
    const existingCount = await db.product.count({ where: { merchantId: id } })

    if (plan === 'gratuit' && existingCount >= 5) {
      return NextResponse.json({ error: 'Limite atteinte (5 produits). Passez en Premium pour plus !' }, { status: 403 })
    }
    if (plan === 'premium' && existingCount >= 50) {
      return NextResponse.json({ error: 'Limite atteinte (50 produits). Passez en Premium+ pour illimité !' }, { status: 403 })
    }

    // Validate images count based on plan
    const maxImages = plan === 'premium_plus' ? 6 : 3
    let validatedImages: string[] = []
    if (images && Array.isArray(images)) {
      validatedImages = images.slice(0, maxImages)
    }

    const product = await db.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        unit,
        image: image || '📦',
        images: JSON.stringify(validatedImages),
        inStock: inStock !== undefined ? inStock : true,
        featured: false, // Only premium+ can feature
        categoryId,
        merchantId: id,
      },
      include: { category: true, merchant: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
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

    const merchantId = (session.user as any)?.merchantId
    const { id } = await params
    const body = await req.json()
    const { productId, ...data } = body

    if (productId) {
      // Only premium+ can set featured
      const plan = (session.user as any)?.plan || 'gratuit'
      if (data.featured && plan !== 'premium_plus') {
        delete data.featured
      }

      // Handle images validation if being updated
      if (data.images !== undefined) {
        const plan = (session.user as any)?.plan || 'gratuit'
        const maxImages = plan === 'premium_plus' ? 6 : 3
        const imgArr = Array.isArray(data.images) ? data.images : []
        data.images = JSON.stringify(imgArr.slice(0, maxImages))
      }

      // Allow price/description update for all
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const merchantId = (session.user as any)?.merchantId
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 })
    }

    if (merchantId !== id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await db.product.delete({ where: { id: productId, merchantId: id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
