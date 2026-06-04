import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES ONLY — No fake merchants or products.
// Vendors will create their own shops and listings after registration.
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  // --- RAYON FRAIS ---
  { name: 'Viandes', slug: 'viandes', icon: '🥩', description: 'Viandes fraîches et de qualité', color: '#8B0000' },
  { name: 'Poissons', slug: 'poissons', icon: '🐟', description: 'Poissons et fruits de mer de nos côtes', color: '#1E90FF' },
  { name: 'Fruits', slug: 'fruits', icon: '🍎', description: 'Fruits frais du marché', color: '#FF6347' },
  { name: 'Légumes', slug: 'legumes', icon: '🥬', description: 'Légumes frais des jardins', color: '#2E8B57' },
  { name: 'Produits Laitiers', slug: 'produits-laitiers', icon: '🥛', description: 'Lait, yaourt, beurre et fromages', color: '#F0E68C' },
  { name: 'Boulangerie', slug: 'boulangerie', icon: '🍞', description: 'Pains et pâtisseries', color: '#D2691E' },
  { name: 'Charcuterie', slug: 'charcuterie', icon: '🥓', description: 'Charcuteries et préparations', color: '#CD5C5C' },
  { name: 'Volailles', slug: 'volailles', icon: '🐔', description: 'Volailles fermières', color: '#CD853F' },
  // --- RAYON ÉPICERIE ---
  { name: 'Épices', slug: 'epices', icon: '🌶️', description: 'Épices et condiments', color: '#FF8C00' },
  { name: 'Riz & Céréales', slug: 'riz-cereales', icon: '🌾', description: 'Riz, mil, maïs et céréales', color: '#DAA520' },
  { name: 'Huiles & Graisses', slug: 'huiles', icon: '🫒', description: 'Huiles de cuisine et graisses', color: '#9ACD32' },
  { name: 'Conserves', slug: 'conserves', icon: '🥫', description: 'Conserves et bocaux', color: '#B8860B' },
  { name: 'Sauces & Condiments', slug: 'sauces', icon: '🧴', description: 'Sauces, moutarde, ketchup', color: '#DC143C' },
  { name: 'Sucres & Confiseries', slug: 'sucres', icon: '🍬', description: 'Sucre, bonbons et chocolats', color: '#FF69B4' },
  { name: 'Café & Thé', slug: 'cafe-the', icon: '☕', description: 'Café, thé et infusions', color: '#4A2C2A' },
  // --- RAYON BOISSONS ---
  { name: 'Boissons', slug: 'boissons', icon: '🍷', description: 'Boissons et jus naturels', color: '#722F37' },
  { name: 'Eau', slug: 'eau', icon: '💧', description: 'Eaux minérales et gazeuses', color: '#4682B4' },
  // --- RAYON SPÉCIALITÉS ---
  { name: 'Miel & Confitures', slug: 'miel-confitures', icon: '🍯', description: 'Miel et confitures artisanales', color: '#DAA520' },
  { name: 'Herbes Aromatiques', slug: 'herbes', icon: '🌿', description: 'Herbes fraîches et séchées', color: '#3CB371' },
  { name: 'Citrons & Agrumes', slug: 'citrons-agrumes', icon: '🍋', description: 'Agrumes frais', color: '#FFD700' },
  { name: 'Fromages', slug: 'fromages', icon: '🧀', description: 'Fromages locaux et importés', color: '#FFD700' },
  // --- RAYON SURGELÉ ---
  { name: 'Surgelés', slug: 'surgeles', icon: '🧊', description: 'Produits surgelés', color: '#87CEEB' },
  // --- RAYON HYGIÈNE & BEAUTÉ ---
  { name: 'Hygiène & Beauté', slug: 'hygiene-beaute', icon: '🧴', description: 'Soins, shampoings, cosmétiques', color: '#DDA0DD' },
  // --- RAYON PRODUITS MÉNAGERS ---
  { name: 'Produits Ménagers', slug: 'produits-menagers', icon: '🧹', description: 'Nettoyants et lessives', color: '#708090' },
  // --- RAYON BÉBÉ ---
  { name: 'Bébé & Puériculture', slug: 'bebe', icon: '🍼', description: 'Laits, couches et soins bébé', color: '#FFB6C1' },
  // --- RAYON ANIMAUX ---
  { name: 'Animaux', slug: 'animaux', icon: '🐾', description: 'Alimentation et accessoires animaux', color: '#D2B48C' },
  // --- RAYON SNACKS ---
  { name: 'Snacks & Biscuits', slug: 'snacks', icon: '🍪', description: 'Biscuits, chips et en-cas', color: '#FF6347' },
  // --- RAYON ÉLECTRONIQUE ---
  { name: 'Téléphones & Tablettes', slug: 'telephones-tablettes', icon: '📱', description: 'Smartphones, tablettes et accessoires', color: '#1a1a2e' },
  { name: 'Ordinateurs & Accessoires', slug: 'ordinateurs-accessoires', icon: '💻', description: 'PC portables, bureautique et périphériques', color: '#16213e' },
  { name: 'Audio & Casques', slug: 'audio-casques', icon: '🎧', description: 'Casques, enceintes et son', color: '#0f3460' },
  { name: 'TV & Écrans', slug: 'tv-ecrans', icon: '📺', description: 'Téléviseurs, moniteurs et projecteurs', color: '#533483' },
  { name: 'Appareils Photo & Vidéo', slug: 'photo-video', icon: '📷', description: 'Appareils photo, caméras et drones', color: '#e94560' },
  { name: 'Gaming & Consoles', slug: 'gaming-consoles', icon: '🎮', description: 'Consoles, jeux et accessoires gaming', color: '#541690' },
  { name: 'Électroménager', slug: 'electromenager', icon: '🔌', description: 'Électroménager et appareils ménagers', color: '#2b2d42' },
  { name: 'Chargeurs & Câbles', slug: 'chargeurs-cables', icon: '🔋', description: 'Chargeurs, câbles et batteries', color: '#8d99ae' },
  { name: 'Stockage & Mémoires', slug: 'stockage-memoires', icon: '💾', description: 'Clés USB, disques durs et cartes mémoire', color: '#2b2d42' },
]

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'

    const existingCategories = await db.category.count()
    if (existingCategories > 0 && !force) {
      return NextResponse.json({ message: 'Database already seeded. Use ?force=true to re-seed.', count: { categories: existingCategories } })
    }

    // If force, delete all existing data in correct order
    if (force) {
      await db.notification.deleteMany()
      await db.orderItem.deleteMany()
      await db.order.deleteMany()
      await db.address.deleteMany()
      await db.favorite.deleteMany()
      await db.subscription.deleteMany()
      await db.account.deleteMany()
      await db.session.deleteMany()
      await db.user.deleteMany()
      await db.product.deleteMany()
      await db.merchant.deleteMany()
      await db.category.deleteMany()
    }

    // Create categories only — vendors will create their own shops and products
    let categoryCount = 0
    for (const cat of CATEGORIES) {
      await db.category.create({ data: cat })
      categoryCount++
    }

    return NextResponse.json({
      message: 'Categories seeded successfully. Vendors can now register and create their shops.',
      count: { categories: categoryCount, merchants: 0, products: 0 },
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
