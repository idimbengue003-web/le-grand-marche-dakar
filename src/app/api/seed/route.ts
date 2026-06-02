import { db } from '@/lib/db'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

const CATEGORIES = [
  { name: 'Viandes', slug: 'viandes', icon: '🥩', description: 'Viandes fraîches et de qualité', color: '#8B0000' },
  { name: 'Poissons', slug: 'poissons', icon: '🐟', description: 'Poissons et fruits de mer de nos côtes', color: '#1E90FF' },
  { name: 'Fruits', slug: 'fruits', icon: '🍎', description: 'Fruits frais du marché', color: '#FF6347' },
  { name: 'Légumes', slug: 'legumes', icon: '🥬', description: 'Légumes frais des jardins', color: '#2E8B57' },
  { name: 'Épices', slug: 'epices', icon: '🌶️', description: 'Épices et condiments', color: '#FF8C00' },
  { name: 'Miel & Confitures', slug: 'miel-confitures', icon: '🍯', description: 'Miel et confitures artisanales', color: '#DAA520' },
  { name: 'Fromages', slug: 'fromages', icon: '🧀', description: 'Fromages locaux et importés', color: '#FFD700' },
  { name: 'Boulangerie', slug: 'boulangerie', icon: '🍞', description: 'Pains et pâtisseries', color: '#D2691E' },
  { name: 'Boissons', slug: 'boissons', icon: '🍷', description: 'Boissons et jus naturels', color: '#722F37' },
  { name: 'Herbes Aromatiques', slug: 'herbes', icon: '🌿', description: 'Herbes fraîches et séchées', color: '#3CB371' },
  { name: 'Citrons & Agrumes', slug: 'citrons-agrumes', icon: '🍋', description: 'Agrumes frais', color: '#FFD700' },
  { name: 'Volailles', slug: 'volailles', icon: '🐔', description: 'Volailles fermières', color: '#CD853F' },
]

// Merchants with Dakar, Senegal coordinates
const MERCHANTS = [
  {
    name: 'Boucherie Al Baraka',
    slug: 'boucherie-albaraka',
    description: 'Viandes halal de qualité supérieure, fraîcheur garantie chaque jour.',
    image: '🥩',
    rating: 4.9,
    location: 'Almadies, Dakar',
    address: '45 Rue des Almadies, Dakar',
    latitude: 14.7167,
    longitude: -17.5167,
    specialty: 'Viandes & Volailles',
    banner: '#8B0000',
  },
  {
    name: 'Poissonnerie Ndiagane',
    slug: 'poissonnerie-ndiagane',
    description: 'Poissons frais pêchés chaque matin à Soumbedioune.',
    image: '🐟',
    rating: 4.7,
    location: 'Soumbedioune, Dakar',
    address: '12 Quai de Soumbedioune, Dakar',
    latitude: 14.6850,
    longitude: -17.4483,
    specialty: 'Poissons & Fruits de mer',
    banner: '#1E90FF',
  },
  {
    name: 'Jardin du Sahel',
    slug: 'jardin-sahel',
    description: 'Fruits et légumes cultivés dans la région de Dakar.',
    image: '☀️',
    rating: 4.8,
    location: 'Plateau, Dakar',
    address: '8 Avenue Lamine Gueye, Dakar',
    latitude: 14.6720,
    longitude: -17.4380,
    specialty: 'Fruits & Légumes',
    banner: '#FF6347',
  },
  {
    name: 'Épices Teranga',
    slug: 'epices-teranga',
    description: 'Épices et mélanges traditionnels sénégalais.',
    image: '🌶️',
    rating: 4.6,
    location: 'Sandaga, Dakar',
    address: 'Marché Sandaga, Dakar',
    latitude: 14.6640,
    longitude: -17.4320,
    specialty: 'Épices & Condiments',
    banner: '#FF8C00',
  },
  {
    name: 'Rucher du Saloum',
    slug: 'rucher-saloum',
    description: 'Miel naturel récolté dans la région du Sine-Saloum.',
    image: '🍯',
    rating: 4.9,
    location: 'Médina, Dakar',
    address: '22 Boulevard de la Médina, Dakar',
    latitude: 14.6940,
    longitude: -17.4530,
    specialty: 'Miel & Confitures',
    banner: '#DAA520',
  },
  {
    name: 'Fromagerie Ndar',
    slug: 'fromagerie-ndar',
    description: 'Fromages locaux et importés, affinés avec soin.',
    image: '🧀',
    rating: 4.8,
    location: 'Fann, Dakar',
    address: '30 Rue Carnot, Dakar',
    latitude: 14.6880,
    longitude: -17.4640,
    specialty: 'Fromages & Produits laitiers',
    banner: '#FFD700',
  },
  {
    name: 'Boulangerie Touba',
    slug: 'boulangerie-touba',
    description: 'Pains et pâtisseries traditionnels sénégalais.',
    image: '🍞',
    rating: 4.7,
    location: 'Point E, Dakar',
    address: '15 Rue de Point E, Dakar',
    latitude: 14.7060,
    longitude: -17.4650,
    specialty: 'Pains & Pâtisseries',
    banner: '#D2691E',
  },
  {
    name: 'Cave Dakar',
    slug: 'cave-dakar',
    description: 'Boissons, jus naturels et sélections importées.',
    image: '🍷',
    rating: 4.9,
    location: 'Mermoz, Dakar',
    address: '7 Rue Mermoz, Dakar',
    latitude: 14.6990,
    longitude: -17.4730,
    specialty: 'Boissons & Jus',
    banner: '#722F37',
  },
  {
    name: 'Herboristerie Khady',
    slug: 'herboristerie-khady',
    description: 'Herbes médicinales et aromatiques traditionnelles.',
    image: '🌿',
    rating: 4.5,
    location: 'Grand Yoff, Dakar',
    address: '50 Avenue Cheikh Anta Diop, Dakar',
    latitude: 14.7200,
    longitude: -17.4750,
    specialty: 'Herbes & Remèdes',
    banner: '#3CB371',
  },
  {
    name: 'Orangerie Casamance',
    slug: 'orangerie-casamance',
    description: 'Agrumes frais de Casamance et produits tropicaux.',
    image: '🍊',
    rating: 4.6,
    location: 'Ouakam, Dakar',
    address: '3 Route de Ouakam, Dakar',
    latitude: 14.7270,
    longitude: -17.4870,
    specialty: 'Citrons & Agrumes',
    banner: '#FFD700',
  },
]

interface ProductSeed {
  name: string
  description: string
  price: number
  unit: string
  image: string
  inStock: boolean
  featured: boolean
  categorySlug: string
  merchantSlug: string
}

// All prices in FCFA
const PRODUCTS: ProductSeed[] = [
  // === VIANDES (Boucherie Al Baraka) ===
  { name: 'Bœuf Premium', description: 'Viande bovine de première qualité, fraîcheur du jour', price: 6500, unit: 'kg', image: '🥩', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Agneau Entier', description: 'Agneau frais, idéal pour les grandes occasions', price: 8500, unit: 'kg', image: '🍖', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Mouton Thieboudienne', description: 'Mouton coupé pour thieboudienne, portions généreuses', price: 5500, unit: 'kg', image: '🥓', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Veau Fermier', description: 'Veau de qualité, tendre et savoureux', price: 7500, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Dibi Chèvre', description: 'Chèvre pour dibi, coupure spéciale grillade', price: 4500, unit: 'kg', image: '🍖', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },

  // === VOLAILLES (Boucherie Al Baraka) ===
  { name: 'Poulet Fermier', description: 'Poulet fermier élevé en liberté', price: 3500, unit: 'pièce', image: '🐔', inStock: true, featured: true, categorySlug: 'volailles', merchantSlug: 'boucherie-albaraka' },
  { name: 'Pintade', description: 'Pintade fraîche, goût authentique', price: 5000, unit: 'pièce', image: '🐦', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'boucherie-albaraka' },

  // === POISSONS (Poissonnerie Ndiagane) ===
  { name: 'Thiof (Mérou)', description: 'Thiof frais pêché du jour, le poisson roi du Sénégal', price: 8000, unit: 'kg', image: '🐠', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Dorade Royale', description: 'Dorade fraîche, parfaite pour le grillage', price: 5500, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Carpe', description: 'Carpe fraîche du fleuve Sénégal', price: 3000, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Huîtres Mangroves', description: 'Huîtres des mangroves de Casamance', price: 5000, unit: 'douzaine', image: '🦪', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Crevettes Tigre', description: 'Crevettes tigre géantes, fraîches du jour', price: 12000, unit: 'kg', image: '🦐', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },

  // === FRUITS (Jardin du Sahel) ===
  { name: 'Mangues Kent', description: 'Mangues Kent juteuses du Casamance', price: 1500, unit: 'kg', image: '🥭', inStock: true, featured: true, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Papayes', description: 'Papayes mûres et sucrées', price: 800, unit: 'pièce', image: '🍈', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Bananes Plantain', description: 'Bananes plantain pour friture ou purée', price: 1000, unit: 'régime', image: '🍌', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Oranges Sénégal', description: 'Oranges juteuses de la région de Thiès', price: 1200, unit: 'kg', image: '🍊', inStock: true, featured: true, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Ananas', description: 'Ananas frais de la Petite Côte', price: 1500, unit: 'pièce', image: '🍍', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },

  // === LÉGUMES (Jardin du Sahel) ===
  { name: 'Tomates', description: 'Tomates fraîches et charnues', price: 800, unit: 'kg', image: '🍅', inStock: true, featured: true, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Oignons', description: 'Oignons violets de la région', price: 600, unit: 'kg', image: '🧅', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Manioc', description: 'Manioc frais, base de la cuisine sénégalaise', price: 500, unit: 'kg', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Niébé', description: 'Niébé (haricots) de qualité', price: 1200, unit: 'kg', image: '🫘', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },

  // === ÉPICES (Épices Teranga) ===
  { name: 'Poivre de Penja', description: 'Poivre noir de Penja, le meilleur d\'Afrique', price: 8000, unit: '100g', image: '🌶️', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Mélange Kolda', description: 'Mélange d\'épices traditionnel de Kolda', price: 3500, unit: '100g', image: '🏺', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Piment Capsicum', description: 'Piment fort séché, pour les amateurs', price: 2000, unit: '50g', image: '🌶️', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Sel de Guérande', description: 'Sel fin importé, qualité supérieure', price: 1500, unit: '500g', image: '🧂', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'epices-teranga' },

  // === MIEL (Rucher du Saloum) ===
  { name: 'Miel du Saloum', description: 'Miel naturel du Sine-Saloum, pur et parfumé', price: 5000, unit: 'pot 500g', image: '🍯', inStock: true, featured: true, categorySlug: 'miel-confitures', merchantSlug: 'rucher-saloum' },
  { name: 'Miel de Palme', description: 'Miel de palme traditionnel', price: 3500, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'rucher-saloum' },
  { name: 'Confiture de Baobab', description: 'Confiture artisanale au fruit de baobab', price: 2500, unit: 'pot 300g', image: '🫙', inStock: true, featured: true, categorySlug: 'miel-confitures', merchantSlug: 'rucher-saloum' },

  // === FROMAGES (Fromagerie Ndar) ===
  { name: 'Fromage Wagashi', description: 'Fromage traditionnel du Sénégal', price: 2000, unit: 'pièce', image: '🧀', inStock: true, featured: true, categorySlug: 'fromages', merchantSlug: 'fromagerie-ndar' },
  { name: 'Fromage Frais', description: 'Fromage frais local, crémeux', price: 1500, unit: 'pièce', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'fromagerie-ndar' },

  // === BOULANGERIE (Boulangerie Touba) ===
  { name: 'Pain Complet', description: 'Pain complet au levain naturel', price: 300, unit: 'pièce', image: '🍞', inStock: true, featured: true, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Baguette', description: 'Baguette traditionnelle croustillante', price: 150, unit: 'pièce', image: '🥖', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Croissant', description: 'Croissant au beurre, doré et croustillant', price: 200, unit: 'pièce', image: '🥐', inStock: true, featured: true, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },

  // === BOISSONS (Cave Dakar) ===
  { name: 'Jus de Bissap', description: 'Jus de bissap frais maison', price: 500, unit: 'bouteille 1L', image: '🍷', inStock: true, featured: true, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Jus de Bouye', description: 'Jus de bouye (pain de singe) traditionnel', price: 600, unit: 'bouteille 1L', image: '🍹', inStock: true, featured: true, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Jus de Gingembre', description: 'Jus de gingembre pimenté, rafraîchissant', price: 500, unit: 'bouteille 1L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Ataya (Thé)', description: 'Thé à la menthe traditionnel sénégalais', price: 300, unit: 'sachet', image: '🍵', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },

  // === HERBES (Herboristerie Khady) ===
  { name: 'Kinkéliba', description: 'Kinkéliba séché, plante médicinale traditionnelle', price: 1000, unit: 'sachet 50g', image: '🌿', inStock: true, featured: true, categorySlug: 'herbes', merchantSlug: 'herboristerie-khady' },
  { name: 'Moringa', description: 'Moringa en poudre, super-aliment sénégalais', price: 2500, unit: 'sachet 100g', image: '🍃', inStock: true, featured: true, categorySlug: 'herbes', merchantSlug: 'herboristerie-khady' },
  { name: 'Bouquet Garni', description: 'Mélange d\'herbes fraîches pour la cuisine', price: 500, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'herboristerie-khady' },

  // === CITRONS (Orangerie Casamance) ===
  { name: 'Citrons Verts', description: 'Citrons verts frais pour la cuisine et les jus', price: 800, unit: 'kg', image: '🍋', inStock: true, featured: true, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-casamance' },
  { name: 'Tangerines', description: 'Tangerines de Casamance, sucrées et juteuses', price: 1500, unit: 'kg', image: '🍊', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-casamance' },

  // === Cross-merchant COMPETITION products (same product, different prices) ===
  { name: 'Bœuf Premium', description: 'Viande bovine de qualité, maturée', price: 6000, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'jardin-sahel' },
  { name: 'Bœuf Premium', description: 'Bœuf de première qualité, coupé sur commande', price: 7000, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boulangerie-touba' },

  { name: 'Thiof (Mérou)', description: 'Thiof frais du jour, qualité supérieure', price: 9000, unit: 'kg', image: '🐠', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'cave-dakar' },

  { name: 'Mangues Kent', description: 'Mangues Kent bio, très juteuses', price: 1800, unit: 'kg', image: '🥭', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'rucher-saloum' },
  { name: 'Oranges Sénégal', description: 'Oranges douces de Thiès', price: 1000, unit: 'kg', image: '🍊', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'epices-teranga' },

  { name: 'Miel du Saloum', description: 'Miel naturel pur, récolté artisanalement', price: 5500, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'jardin-sahel' },
  { name: 'Miel de Palme', description: 'Miel de palme de la Casamance', price: 4000, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'herboristerie-khady' },

  { name: 'Tomates', description: 'Tomates fraîches du marché', price: 700, unit: 'kg', image: '🍅', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Jus de Bissap', description: 'Bissap rouge frais et naturel', price: 450, unit: 'bouteille 1L', image: '🍷', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'herboristerie-khady' },
  { name: 'Jus de Bouye', description: 'Bouye traditionnel, goût authentique', price: 500, unit: 'bouteille 1L', image: '🍹', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'orangerie-casamance' },
  { name: 'Citrons Verts', description: 'Citrons verts pour assaisonnement', price: 1000, unit: 'kg', image: '🍋', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'herboristerie-khady' },
  { name: 'Baguette', description: 'Baguette tradition, croustillante', price: 200, unit: 'pièce', image: '🥖', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'cave-dakar' },
  { name: 'Moringa', description: 'Poudre de moringa bio', price: 3000, unit: 'sachet 100g', image: '🍃', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'jardin-sahel' },
]

export async function POST() {
  try {
    const existingCategories = await db.category.count()
    if (existingCategories > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: { categories: existingCategories } })
    }

    // Create categories
    const categoryMap: Record<string, string> = {}
    for (const cat of CATEGORIES) {
      const created = await db.category.create({ data: cat })
      categoryMap[cat.slug] = created.id
    }

    // Create merchants
    const merchantMap: Record<string, string> = {}
    for (const merch of MERCHANTS) {
      const created = await db.merchant.create({ data: merch })
      merchantMap[merch.slug] = created.id
    }

    // Create products
    let productCount = 0
    for (const prod of PRODUCTS) {
      const categoryId = categoryMap[prod.categorySlug]
      const merchantId = merchantMap[prod.merchantSlug]
      if (!categoryId || !merchantId) continue

      await db.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          unit: prod.unit,
          image: prod.image,
          inStock: prod.inStock,
          featured: prod.featured,
          categoryId,
          merchantId,
        },
      })
      productCount++
    }

    // Create test vendor accounts with subscriptions
    const testAccounts = [
      { email: 'albaraka@marche.sn', password: 'vendeur1', name: 'Boucherie Al Baraka', merchantSlug: 'boucherie-albaraka', plan: 'premium_plus' },
      { email: 'ndiagane@marche.sn', password: 'vendeur2', name: 'Poissonnerie Ndiagane', merchantSlug: 'poissonnerie-ndiagane', plan: 'premium' },
      { email: 'sahel@marche.sn', password: 'vendeur3', name: 'Jardin du Sahel', merchantSlug: 'jardin-sahel', plan: 'gratuit' },
      { email: 'teranga@marche.sn', password: 'vendeur4', name: 'Épices Teranga', merchantSlug: 'epices-teranga', plan: 'premium' },
      { email: 'saloum@marche.sn', password: 'vendeur5', name: 'Rucher du Saloum', merchantSlug: 'rucher-saloum', plan: 'gratuit' },
    ]

    for (const account of testAccounts) {
      const merchantId = merchantMap[account.merchantSlug]
      if (!merchantId) continue

      const hashedPassword = await hash(account.password, 12)
      const user = await db.user.create({
        data: {
          email: account.email,
          password: hashedPassword,
          name: account.name,
          merchantId,
        },
      })

      // Create subscription
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: account.plan,
          active: true,
        },
      })
    }

    return NextResponse.json({
      message: 'Marché Royal ensemencé avec succès !',
      count: {
        categories: CATEGORIES.length,
        merchants: MERCHANTS.length,
        products: productCount,
        users: testAccounts.length,
      },
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
