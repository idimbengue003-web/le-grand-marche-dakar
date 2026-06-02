import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            include: { subscription: true },
          })

          if (!user || !user.password) return null

          // Try bcrypt first, fall back to direct comparison
          let isValid = false
          try {
            const { compare } = await import('bcryptjs')
            isValid = await compare(credentials.password, user.password)
          } catch {
            isValid = credentials.password === user.password
          }

          if (!isValid) return null

          return {
            id: user.id,
            name: user.name || undefined,
            email: user.email || undefined,
            merchantId: user.merchantId || undefined,
            plan: user.subscription?.plan || 'gratuit',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.merchantId = (user as any).merchantId ?? null
        token.plan = (user as any).plan ?? 'gratuit'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id || null
        ;(session.user as any).merchantId = token.merchantId || null
        ;(session.user as any).plan = token.plan || 'gratuit'
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  debug: false,
}
