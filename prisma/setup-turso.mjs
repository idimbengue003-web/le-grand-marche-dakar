// Push schema to Turso using libSQL client
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env file if not on Vercel (where env vars are injected automatically)
if (!process.env.VERCEL) {
  try {
    const envPath = resolve(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const match = trimmed.match(/^([^=]+)=(.*)$/)
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim()
      }
    }
  } catch {
    // .env file not found, that's ok
  }
}

const TURSO_URL = process.env.TURSO_DATABASE_URL || ''
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

async function main() {
  if (!TURSO_URL || !TURSO_TOKEN) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN')
    process.exit(1)
  }

  const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  })

  console.log('Creating tables in Turso...')

  // Create tables
  const tables = [
    `CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      emailVerified DATETIME,
      image TEXT,
      phone TEXT,
      password TEXT,
      role TEXT NOT NULL DEFAULT 'acheteur',
      merchantId TEXT UNIQUE,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS Account (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )`,

    `CREATE UNIQUE INDEX IF NOT EXISTS Account_provider_providerAccountId_key ON Account(provider, providerAccountId)`,

    `CREATE TABLE IF NOT EXISTS Session (
      id TEXT PRIMARY KEY NOT NULL,
      sessionToken TEXT NOT NULL UNIQUE,
      userId TEXT NOT NULL,
      expires DATETIME NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS VerificationToken (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires DATETIME NOT NULL
    )`,

    `CREATE UNIQUE INDEX IF NOT EXISTS VerificationToken_identifier_token_key ON VerificationToken(identifier, token)`,

    `CREATE TABLE IF NOT EXISTS Category (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL,
      description TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS Merchant (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 0,
      location TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      latitude REAL NOT NULL DEFAULT 0,
      longitude REAL NOT NULL DEFAULT 0,
      specialty TEXT NOT NULL,
      banner TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      unit TEXT NOT NULL,
      image TEXT NOT NULL,
      images TEXT NOT NULL DEFAULT '[]',
      inStock BOOLEAN NOT NULL DEFAULT true,
      featured BOOLEAN NOT NULL DEFAULT false,
      categoryId TEXT NOT NULL,
      merchantId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES Category(id),
      FOREIGN KEY (merchantId) REFERENCES Merchant(id)
    )`,

    `CREATE TABLE IF NOT EXISTS Favorite (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    )`,

    `CREATE UNIQUE INDEX IF NOT EXISTS Favorite_userId_productId_key ON Favorite(userId, productId)`,

    `CREATE TABLE IF NOT EXISTS Subscription (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL DEFAULT 'gratuit',
      startDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      endDate DATETIME,
      active BOOLEAN NOT NULL DEFAULT true,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS Address (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      label TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Dakar',
      phone TEXT,
      isDefault BOOLEAN NOT NULL DEFAULT false,
      latitude REAL NOT NULL DEFAULT 0,
      longitude REAL NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS "Order" (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'en_attente',
      total REAL NOT NULL,
      addressId TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      FOREIGN KEY (addressId) REFERENCES Address(id)
    )`,

    `CREATE TABLE IF NOT EXISTS OrderItem (
      id TEXT PRIMARY KEY NOT NULL,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product(id)
    )`,

    `CREATE TABLE IF NOT EXISTS Notification (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      read BOOLEAN NOT NULL DEFAULT false,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )`,
  ]

  for (const sql of tables) {
    try {
      await client.execute(sql)
      console.log('✅', sql.substring(0, 60).replace(/\n/g, ' ') + '...')
    } catch (err) {
      console.error('❌ Error:', err.message?.substring(0, 100))
    }
  }

  // Seed categories
  const CATEGORIES = [
    { name: 'Viandes', slug: 'viandes', icon: '🥩', description: 'Viandes fraîches et de qualité', color: '#8B0000' },
    { name: 'Poissons', slug: 'poissons', icon: '🐟', description: 'Poissons et fruits de mer de nos côtes', color: '#1E90FF' },
    { name: 'Fruits', slug: 'fruits', icon: '🍎', description: 'Fruits frais du marché', color: '#FF6347' },
    { name: 'Légumes', slug: 'legumes', icon: '🥬', description: 'Légumes frais des jardins', color: '#2E8B57' },
    { name: 'Produits Laitiers', slug: 'produits-laitiers', icon: '🥛', description: 'Lait, yaourt, beurre et fromages', color: '#F0E68C' },
    { name: 'Boulangerie', slug: 'boulangerie', icon: '🍞', description: 'Pains et pâtisseries', color: '#D2691E' },
    { name: 'Charcuterie', slug: 'charcuterie', icon: '🥓', description: 'Charcuteries et préparations', color: '#CD5C5C' },
    { name: 'Volailles', slug: 'volailles', icon: '🐔', description: 'Volailles fermières', color: '#CD853F' },
    { name: 'Épices', slug: 'epices', icon: '🌶️', description: 'Épices et condiments', color: '#FF8C00' },
    { name: 'Riz & Céréales', slug: 'riz-cereales', icon: '🌾', description: 'Riz, mil, maïs et céréales', color: '#DAA520' },
    { name: 'Huiles & Graisses', slug: 'huiles', icon: '🫒', description: 'Huiles de cuisine et graisses', color: '#9ACD32' },
    { name: 'Conserves', slug: 'conserves', icon: '🥫', description: 'Conserves et bocaux', color: '#B8860B' },
    { name: 'Sauces & Condiments', slug: 'sauces', icon: '🧴', description: 'Sauces, moutarde, ketchup', color: '#DC143C' },
    { name: 'Sucres & Confiseries', slug: 'sucres', icon: '🍬', description: 'Sucre, bonbons et chocolats', color: '#FF69B4' },
    { name: 'Café & Thé', slug: 'cafe-the', icon: '☕', description: 'Café, thé et infusions', color: '#4A2C2A' },
    { name: 'Boissons', slug: 'boissons', icon: '🍷', description: 'Boissons et jus naturels', color: '#722F37' },
    { name: 'Eau', slug: 'eau', icon: '💧', description: 'Eaux minérales et gazeuses', color: '#4682B4' },
    { name: 'Miel & Confitures', slug: 'miel-confitures', icon: '🍯', description: 'Miel et confitures artisanales', color: '#DAA520' },
    { name: 'Herbes Aromatiques', slug: 'herbes', icon: '🌿', description: 'Herbes fraîches et séchées', color: '#3CB371' },
    { name: 'Citrons & Agrumes', slug: 'citrons-agrumes', icon: '🍋', description: 'Agrumes frais', color: '#FFD700' },
    { name: 'Fromages', slug: 'fromages', icon: '🧀', description: 'Fromages locaux et importés', color: '#FFD700' },
    { name: 'Surgelés', slug: 'surgeles', icon: '🧊', description: 'Produits surgelés', color: '#87CEEB' },
    { name: 'Hygiène & Beauté', slug: 'hygiene-beaute', icon: '🧴', description: 'Soins, shampoings, cosmétiques', color: '#DDA0DD' },
    { name: 'Produits Ménagers', slug: 'produits-menagers', icon: '🧹', description: 'Nettoyants et lessives', color: '#708090' },
    { name: 'Bébé & Puériculture', slug: 'bebe', icon: '🍼', description: 'Laits, couches et soins bébé', color: '#FFB6C1' },
    { name: 'Animaux', slug: 'animaux', icon: '🐾', description: 'Alimentation et accessoires animaux', color: '#D2B48C' },
    { name: 'Snacks & Biscuits', slug: 'snacks', icon: '🍪', description: 'Biscuits, chips et en-cas', color: '#FF6347' },
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

  // Check if categories already exist
  const existing = await client.execute('SELECT COUNT(*) as count FROM Category')
  if (existing.rows[0]?.count > 0) {
    console.log(`✅ ${existing.rows[0].count} categories already exist, skipping seed.`)
  } else {
    for (const cat of CATEGORIES) {
      const id = `cat_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`
      await client.execute({
        sql: 'INSERT INTO Category (id, name, slug, icon, description, color) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, cat.name, cat.slug, cat.icon, cat.description, cat.color],
      })
    }
    console.log(`✅ Seeded ${CATEGORIES.length} categories.`)
  }

  console.log('\n🎉 Turso database setup complete!')
  client.close()
}

main().catch(console.error)
