import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined
}

function createDb(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoAuth = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoAuth) {
    // Turso (libSQL) — production on Vercel
    console.log('[db] Connecting to Turso:', tursoUrl.substring(0, 30) + '...')
    try {
      const adapter = new PrismaLibSQL({
        url: tursoUrl,
        authToken: tursoAuth,
      })
      return new PrismaClient({ adapter })
    } catch (err) {
      console.error('[db] Turso adapter error:', err)
      throw err
    }
  }

  // Local SQLite — development only
  console.log('[db] Using local SQLite (development)')
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

let dbInstance: PrismaClient

try {
  dbInstance = globalForPrisma.db ?? createDb()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.db = dbInstance
} catch (err) {
  console.error('[db] FATAL: Could not create database client:', err)
  // Create a fallback that will throw clear errors
  dbInstance = new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === '$connect' || prop === '$disconnect') return async () => {}
      return () => { throw new Error('Database not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars.') }
    }
  })
}

export const db = dbInstance
