# Task 1-2-3: Setup Auth Backend, Schema, and API Routes

## Agent: main

## Summary
Successfully implemented vendor authentication backend for the Royal Market application.

## What was done:
1. Updated Prisma schema with 4 new models: User, Account, Session, VerificationToken, Favorite
2. Added User→Merchant relation and Favorite→Product/User relations
3. Installed bcryptjs, @types/bcryptjs, @next-auth/prisma-adapter
4. Created NextAuth.js v4 configuration with Google + Credentials providers
5. Created all API routes: auth, register, session, favorites, merchant products
6. Updated .env with NEXTAUTH_SECRET, NEXTAUTH_URL, Google placeholders
7. Updated seed API to create 5 test merchant accounts
8. Lint passes, db:push successful, dev server running fine

## Key files created/modified:
- `prisma/schema.prisma` - Added User, Account, Session, VerificationToken, Favorite models
- `src/lib/auth.ts` - NextAuth config with JWT + Prisma adapter
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `src/app/api/auth/register/route.ts` - Phone + password registration
- `src/app/api/auth/session/route.ts` - Session retrieval
- `src/app/api/favorites/route.ts` - GET/POST for favorites toggle
- `src/app/api/merchants/[id]/products/route.ts` - GET/PATCH merchant products
- `src/app/api/seed/route.ts` - Added test user accounts
- `.env` - Added NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID/SECRET

## Test accounts created by seed:
- +33600000001 / marchand1 → Maison de Beaumont
- +33600000002 / marchand2 → Poissonnerie du Dauphin
- +33600000003 / marchand3 → Jardins du Soleil
- +33600000004 / marchand4 → Cave du Château
- +33600000005 / marchand5 → Rucher du Moine

## Notes:
- Database needs to be re-seeded to create test user accounts (existing data won't be affected)
- Google OAuth is configured but needs GOOGLE_CLIENT_ID/SECRET in .env to work
- The schema now has 8 models total (4 auth + 4 business)
