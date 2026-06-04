import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const diag: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || 'not set',
      TURSO_URL_SET: !!process.env.TURSO_DATABASE_URL,
      TURSO_TOKEN_SET: !!process.env.TURSO_AUTH_TOKEN,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
    },
  }

  try {
    const catCount = await db.category.count()
    const userCount = await db.user.count()
    diag.database = { status: 'connected', categories: catCount, users: userCount }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    diag.database = { status: 'ERROR', error: message }
  }

  return NextResponse.json(diag, { status: diag.database?.status === 'ERROR' ? 503 : 200 })
}
