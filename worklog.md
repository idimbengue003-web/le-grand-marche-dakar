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

---
Task ID: 2
Agent: Main
Task: Remove all fake listings/announcements, prepare for deployment with real vendors

Work Log:
- Rewrote seed route to only seed categories (36 categories), removed all MERCHANTS, PRODUCTS, test accounts
- Cleared database and re-seeded with categories only (0 merchants, 0 products)
- Updated vendor registration form: replaced "select existing échoppe" with "Créer votre boutique" form
  - Fields: shop name (required), description, quartier (10 Dakar neighborhoods), phone, address
  - Existing échoppe selection moved to a collapsible "details" section
- Updated register API to support creating a merchant/shop during registration
  - Added slugify function for URL-safe merchant slugs
  - Auto-assigns banner color from 10 preset colors
  - Defaults to Dakar coordinates for the selected quartier
  - Validates shop phone number (Senegalese format)
- Removed test credentials from login form (albaraka@marche.sn, acheteur@marche.sn)
- Improved empty state UI on main page: "Le marché s'installe..." with "Devenir vendeur" button
- Improved empty state UI on electronics page: contextual message about vendors arriving soon
- Added validation: vendors must create a shop name or select an existing échoppe
- Lint passes, dev server runs successfully with empty marketplace

Stage Summary:
- Database contains only categories (36), no fake merchants or products
- Vendors can now create their own shop during registration
- Empty state is welcoming and encourages vendor sign-up
- Ready for deployment with real vendors
