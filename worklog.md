---
Task ID: 1
Agent: Main
Task: Remove cart/panier, add blurred vendor phone numbers, add payment disclaimer

Work Log:
- Added `phone` field (String, default "") to Merchant model in Prisma schema
- Ran `db:push` to sync schema
- Added Senegalese phone numbers (+221 77/78/76 XXX XX XX) to all 18 merchants in seed data
- Removed `ShoppingCart` import from page.tsx
- Replaced "Acheter" (cart) button in ProductDetailModal with "Contacter le vendeur" section
- Added blurred phone number display: `blur-sm` CSS with `group-hover:blur-0` to reveal on hover
- Added payment disclaimer below phone number: "Ce site n'est pas responsable si vous envoyez votre argent. Tout paiement se fait porte à porte."
- Replaced "Acheter" button in product cards with "Contacter" button (opens product detail)
- Added blurred phone number + disclaimer to MerchantCard component
- Added blurred phone number + disclaimer to MerchantShopPage
- Added payment disclaimers to all 4 footers: main page, merchant shop, alimentaire, électronique
- Updated Merchant TypeScript interface to include `phone: string`
- Re-seeded database with phone numbers
- Lint passes, dev server runs successfully

Stage Summary:
- Cart/panier completely removed from the app
- Vendor phone numbers displayed blurred (hover to reveal) in product detail, merchant cards, and shop pages
- Payment disclaimer ("porte à porte", site not responsible) visible in product modal and all footers
- All 18 merchants now have Senegalese phone numbers in the database
