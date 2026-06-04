---
Task ID: 1
Agent: Main
Task: Fix sandbox errors and remove demo data for deployment

Work Log:
- Fixed cross-origin warning in next.config.ts by adding allowedDevOrigins for space-z.ai and z-ai.dev domains
- Deleted the old database (db/custom.db) and recreated it fresh with `prisma db push`
- Verified seed route only creates categories (no fake merchants or products)
- Updated the seed auto-trigger in HomePage component: now only seeds when categories.length === 0 AND !categoriesLoading
- Fixed variable ordering issue: moved useQuery for categories BEFORE the useEffect that references categories.length
- Improved empty state UI for the main market page: shows "Le Marché ouvre bientôt!" with a "Devenir Vendeur" CTA button when there are no products and no merchants
- Improved empty state UI for the electronics page: shows "Rayon Électronique — Bientôt disponible" with vendor sign-up CTA
- Alimentaire page empty state already had good messaging ("Le marché s'installe...")
- Ran lint check - all clean (0 errors, 0 warnings)
- Verified APIs: Products returns [], Merchants returns [], Categories returns 36 categories, Page returns 200

Stage Summary:
- App is now clean for deployment with no demo/fake product listings
- Empty state shows encouraging "coming soon" messages with "Devenir Vendeur" call-to-action
- Categories are auto-seeded on first load (36 categories covering food, electronics, etc.)
- All APIs working correctly, page renders with 200 status
- Cross-origin configuration added for sandbox preview compatibility
