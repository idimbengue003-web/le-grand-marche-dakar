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
    // PrismaLibSql accepts a config object, NOT an existing client
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoAuth,
    })
    return new PrismaClient({ adapter })
  }

  // Local SQLite — development
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.db ?? createDb()

if (process.env.NODE_ENV !== 'production') globalForPrisma.db = db
