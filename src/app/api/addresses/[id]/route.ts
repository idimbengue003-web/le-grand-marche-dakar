import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { id } = await params

    // Verify the address belongs to the user
    const existingAddress = await db.address.findUnique({
      where: { id },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Adresse introuvable' }, { status: 404 })
    }

    if (existingAddress.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { label, address, city, phone, isDefault, latitude, longitude } = body

    // If setting as default, unset any other default
    if (isDefault && !existingAddress.isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const updateData: Record<string, unknown> = {}
    if (label !== undefined) updateData.label = label
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (phone !== undefined) updateData.phone = phone
    if (isDefault !== undefined) updateData.isDefault = isDefault
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude

    const updatedAddress = await db.address.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Address PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { id } = await params

    // Verify the address belongs to the user
    const existingAddress = await db.address.findUnique({
      where: { id },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Adresse introuvable' }, { status: 404 })
    }

    if (existingAddress.userId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await db.address.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Adresse supprimée avec succès' })
  } catch (error) {
    console.error('Address DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
