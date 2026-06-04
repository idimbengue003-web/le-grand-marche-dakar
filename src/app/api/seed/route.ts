import { db } from '@/lib/db'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE CATEGORIES (Auchan-style variety)
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
  // --- RAYON SURI CONGELÉ ---
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

// ═══════════════════════════════════════════════════════════════════════════════
// MARCHÉS & ÉCHOPPES SÉNÉGALAIS
// ═══════════════════════════════════════════════════════════════════════════════

const MERCHANTS = [
  // MARCHÉS SÉNÉGALAIS
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
  // NEW MERCHANTS
  {
    name: 'Supermarché Citydia',
    slug: 'citydia',
    description: 'Supermarché Citydia — Épicerie, produits frais et articles ménagers.',
    image: '🟢',
    rating: 4.5,
    location: 'Sacré-Cœur, Dakar',
    address: '12 Boulevard de Sacré-Cœur, Dakar',
    latitude: 14.7100,
    longitude: -17.4700,
    specialty: 'Supermarché — Épicerie',
    banner: '#228B22',
  },
  {
    name: 'Supermarché Promod',
    slug: 'promod',
    description: 'Promod — Votre supermarché pour les courses du quotidien.',
    image: '🔵',
    rating: 4.4,
    location: 'Fann Hock, Dakar',
    address: '8 Rue Fann, Dakar',
    latitude: 14.6850,
    longitude: -17.4600,
    specialty: 'Supermarché — Alimentation',
    banner: '#4169E1',
  },
  // BOUTIQUES ÉLECTRONIQUE DAKAR
  {
    name: 'TechShop Dakar',
    slug: 'techshop-dakar',
    description: 'Spécialiste des smartphones et tablettes à Dakar. Produits neufs et originaux.',
    image: '📱',
    rating: 4.7,
    location: 'Almadies, Dakar',
    address: '22 Rue des Almadies, Dakar',
    latitude: 14.7180,
    longitude: -17.5150,
    specialty: 'Téléphones & Tablettes',
    banner: '#1a1a2e',
  },
  {
    name: 'Informatique Numérique',
    slug: 'informatique-numerique',
    description: 'Ordinateurs, accessoires IT et solutions bureautiques pour professionnels et particuliers.',
    image: '💻',
    rating: 4.6,
    location: 'Plateau, Dakar',
    address: '10 Avenue Pompidou, Dakar',
    latitude: 14.6730,
    longitude: -17.4390,
    specialty: 'Ordinateurs & IT',
    banner: '#16213e',
  },
  {
    name: 'Sonorité Dakar',
    slug: 'sonorite-dakar',
    description: 'Audio, casques et matériel son professionnel. Les meilleures marques au Sénégal.',
    image: '🎧',
    rating: 4.5,
    location: 'Médina, Dakar',
    address: '35 Boulevard de la Médina, Dakar',
    latitude: 14.6930,
    longitude: -17.4540,
    specialty: 'Audio & Son',
    banner: '#0f3460',
  },
  {
    name: 'ÉlectroMall',
    slug: 'electromall',
    description: 'TV, électroménager et écrans — les meilleurs prix de Dakar, livraison disponible.',
    image: '📺',
    rating: 4.8,
    location: 'Sacré-Cœur, Dakar',
    address: '5 Boulevard Sacré-Cœur, Dakar',
    latitude: 14.7110,
    longitude: -17.4710,
    specialty: 'TV & Électroménager',
    banner: '#533483',
  },
  {
    name: 'GameZone Dakar',
    slug: 'gamezone-dakar',
    description: 'Consoles, jeux vidéo et accessoires gaming. Le paradis des gamers sénégalais.',
    image: '🎮',
    rating: 4.4,
    location: 'Mermoz, Dakar',
    address: '18 Rue Mermoz, Dakar',
    latitude: 14.6980,
    longitude: -17.4720,
    specialty: 'Gaming & Consoles',
    banner: '#541690',
  },
  {
    name: 'PhotoPro Dakar',
    slug: 'photopro-dakar',
    description: 'Appareils photo, caméras, drones et matériel vidéo professionnel.',
    image: '📷',
    rating: 4.3,
    location: 'Fann, Dakar',
    address: '12 Rue Carnot, Dakar',
    latitude: 14.6870,
    longitude: -17.4630,
    specialty: 'Photo & Vidéo',
    banner: '#e94560',
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

// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE PRODUCT CATALOG (200+ products — Auchan-style variety)
// All prices in FCFA — Sold by Senegalese merchants only
// ═══════════════════════════════════════════════════════════════════════════════

const PRODUCTS: ProductSeed[] = [
  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON VIANDES                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Bœuf Premium', description: 'Viande bovine de première qualité, fraîcheur du jour', price: 6500, unit: 'kg', image: '🥩', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Bœuf Premium', description: 'Bœuf de première qualité, coupé sur commande', price: 7000, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'citydia' },
  { name: 'Bœuf Premium', description: 'Viande bovine de qualité, maturée', price: 6000, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'promod' },
  { name: 'Agneau Entier', description: 'Agneau frais, idéal pour les grandes occasions', price: 8500, unit: 'kg', image: '🍖', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Agneau Entier', description: 'Agneau entier, fraîcheur garantie', price: 8200, unit: 'kg', image: '🍖', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'citydia' },
  { name: 'Mouton Thieboudienne', description: 'Mouton coupé pour thieboudienne, portions généreuses', price: 5500, unit: 'kg', image: '🥓', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Veau Fermier', description: 'Veau de qualité, tendre et savoureux', price: 7500, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Dibi Chèvre', description: 'Chèvre pour dibi, coupure spéciale grillade', price: 4500, unit: 'kg', image: '🍖', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Viande Hachée Bœuf', description: 'Viande hachée 100% bœuf, fraîche', price: 4500, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'citydia' },
  { name: 'Steak Haché', description: 'Steak haché frais, 200g pièce', price: 1200, unit: 'pièce', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'citydia' },
  { name: 'Sauté de Porc', description: 'Sauté de porc, morceaux à braiser', price: 5000, unit: 'kg', image: '🍖', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'citydia' },
  { name: 'Côte de Bœuf', description: 'Côte de bœuf épaisse, parfaite pour le grill', price: 9500, unit: 'kg', image: '🥩', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'citydia' },
  { name: 'Foie de Bœuf', description: 'Foie de bœuf frais, riche en fer', price: 4000, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'promod' },
  { name: 'Queue de Bœuf', description: 'Queue de bœuf pour ragoût et soupes', price: 3500, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'promod' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON VOLAILLES                                                        ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Poulet Fermier', description: 'Poulet fermier élevé en liberté', price: 3500, unit: 'pièce', image: '🐔', inStock: true, featured: true, categorySlug: 'volailles', merchantSlug: 'boucherie-albaraka' },
  { name: 'Poulet Fermier', description: 'Poulet fermier frais, qualité supérieure', price: 3200, unit: 'pièce', image: '🐔', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'citydia' },
  { name: 'Poulet Fermier', description: 'Poulet fermier, élevé en plein air', price: 3400, unit: 'pièce', image: '🐔', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'promod' },
  { name: 'Pintade', description: 'Pintade fraîche, goût authentique', price: 5000, unit: 'pièce', image: '🐦', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'boucherie-albaraka' },
  { name: 'Poulet Congelé', description: 'Poulet entier congelé, pratique et économique', price: 2500, unit: 'pièce', image: '🍗', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'citydia' },
  { name: 'Cuisses de Poulet', description: 'Cuisses de poulet fraîches, idéales pour le four', price: 3000, unit: 'kg', image: '🍗', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'citydia' },
  { name: 'Ailes de Poulet', description: 'Ailes de poulet pour grillades et fritures', price: 2500, unit: 'kg', image: '🍗', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'promod' },
  { name: 'Dinde Entière', description: 'Dinde entière pour les grandes occasions', price: 8000, unit: 'pièce', image: '🦃', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'citydia' },
  { name: 'Filet de Poulet', description: 'Filet de poulet désossé, prêt à cuire', price: 4500, unit: 'kg', image: '🍗', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON POISSONS                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Thiof (Mérou)', description: 'Thiof frais pêché du jour, le poisson roi du Sénégal', price: 8000, unit: 'kg', image: '🐠', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Thiof (Mérou)', description: 'Thiof frais du jour, qualité supérieure', price: 9000, unit: 'kg', image: '🐠', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'citydia' },
  { name: 'Dorade Royale', description: 'Dorade fraîche, parfaite pour le grillage', price: 5500, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Carpe', description: 'Carpe fraîche du fleuve Sénégal', price: 3000, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Huîtres Mangroves', description: 'Huîtres des mangroves de Casamance', price: 5000, unit: 'douzaine', image: '🦪', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Crevettes Tigre', description: 'Crevettes tigre géantes, fraîches du jour', price: 12000, unit: 'kg', image: '🦐', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Crevettes Tigre', description: 'Crevettes tigre congelées, décortiquées', price: 11000, unit: 'kg', image: '🦐', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'citydia' },
  { name: 'Maquereau', description: 'Maquereau frais, riche en oméga-3', price: 3500, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'citydia' },
  { name: 'Sardines Fraîches', description: 'Sardines fraîches du jour, 6-8 pièces', price: 2000, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Poulpe', description: 'Poulpe frais, idéal pour le yassa', price: 7000, unit: 'kg', image: '🐙', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'promod' },
  { name: 'Cabillaud', description: 'Cabillaud frais, chair fine et délicate', price: 9500, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'citydia' },
  { name: 'Bar de Ligne', description: 'Bar pêché à la ligne, qualité extra', price: 10000, unit: 'kg', image: '🐟', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON FRUITS                                                            ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Mangues Kent', description: 'Mangues Kent juteuses du Casamance', price: 1500, unit: 'kg', image: '🥭', inStock: true, featured: true, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Mangues Kent', description: 'Mangues Kent bio, très juteuses', price: 1800, unit: 'kg', image: '🥭', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'citydia' },
  { name: 'Papayes', description: 'Papayes mûres et sucrées', price: 800, unit: 'pièce', image: '🍈', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Bananes Plantain', description: 'Bananes plantain pour friture ou purée', price: 1000, unit: 'régime', image: '🍌', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Oranges Sénégal', description: 'Oranges juteuses de la région de Thiès', price: 1200, unit: 'kg', image: '🍊', inStock: true, featured: true, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Oranges Sénégal', description: 'Oranges douces de Thiès', price: 1000, unit: 'kg', image: '🍊', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'citydia' },
  { name: 'Ananas', description: 'Ananas frais de la Petite Côte', price: 1500, unit: 'pièce', image: '🍍', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Pastèque', description: 'Pastèque rouge et juteuse', price: 2000, unit: 'pièce', image: '🍉', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'citydia' },
  { name: 'Raisins', description: 'Raisins blancs ou noirs, importés', price: 3500, unit: 'kg', image: '🍇', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'citydia' },
  { name: 'Pommes Golden', description: 'Pommes Golden importées, croquantes', price: 3000, unit: 'kg', image: '🍎', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'citydia' },
  { name: 'Fraises', description: 'Fraises fraîches, parfumées', price: 4000, unit: 'barquette', image: '🍓', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'promod' },
  { name: 'Avocats', description: 'Avocats mûrs, parfaits pour les salades', price: 1500, unit: 'pièce', image: '🥑', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'citydia' },
  { name: 'Melon', description: 'Melon charentais, sucré et parfumé', price: 1800, unit: 'pièce', image: '🍈', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'promod' },
  { name: 'Kiwis', description: 'Kiwis verts, riches en vitamine C', price: 3000, unit: 'kg', image: '🥝', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'citydia' },
  { name: 'Bananes', description: 'Bananes jaunes, prêtes à consommer', price: 1200, unit: 'kg', image: '🍌', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'citydia' },
  { name: 'Cerises', description: 'Cerises fraîches, importées', price: 5000, unit: 'kg', image: '🍒', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'promod' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON LÉGUMES                                                           ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Tomates', description: 'Tomates fraîches et charnues', price: 800, unit: 'kg', image: '🍅', inStock: true, featured: true, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Tomates', description: 'Tomates fraîches du marché', price: 700, unit: 'kg', image: '🍅', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Oignons', description: 'Oignons violets de la région', price: 600, unit: 'kg', image: '🧅', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Oignons', description: 'Oignons secs, calibre moyen', price: 500, unit: 'kg', image: '🧅', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Manioc', description: 'Manioc frais, base de la cuisine sénégalaise', price: 500, unit: 'kg', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Niébé', description: 'Niébé (haricots) de qualité', price: 1200, unit: 'kg', image: '🫘', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Pommes de Terre', description: 'Pommes de terre, idéales pour frites et purée', price: 700, unit: 'kg', image: '🥔', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Carottes', description: 'Carottes fraîches, croquantes et sucrées', price: 600, unit: 'kg', image: '🥕', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Poivrons', description: 'Poivrons rouges, verts et jaunes', price: 1500, unit: 'kg', image: '🫑', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Aubergines', description: 'Aubergines violettes, charnues', price: 1000, unit: 'kg', image: '🍆', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'promod' },
  { name: 'Chou', description: 'Chou vert, frais et croquant', price: 500, unit: 'pièce', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Concombre', description: 'Concombre frais, parfait pour les salades', price: 400, unit: 'pièce', image: '🥒', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Salade', description: 'Laitue fraîche, cultivée localement', price: 500, unit: 'pièce', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Courgettes', description: 'Courgettes vertes, tendres', price: 800, unit: 'kg', image: '🥒', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Gombo', description: 'Gombo frais, légume traditionnel', price: 900, unit: 'kg', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Ail', description: 'Ail frais, tête entière', price: 1500, unit: 'kg', image: '🧄', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Gingembre', description: 'Gingembre frais, racine entière', price: 2000, unit: 'kg', image: '🫚', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Piment Frais', description: 'Piment frais, pour les amateurs de relevé', price: 1000, unit: 'kg', image: '🌶️', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON PRODUITS LAITIERS                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Lait Entier UHT', description: 'Lait entier UHT 1L, longue conservation', price: 800, unit: 'bouteille 1L', image: '🥛', inStock: true, featured: true, categorySlug: 'produits-laitiers', merchantSlug: 'citydia' },
  { name: 'Lait Demi-Écrémé', description: 'Lait demi-écrémé UHT 1L', price: 750, unit: 'bouteille 1L', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'promod' },
  { name: 'Lait en Poudre', description: 'Lait en poudre Nestlé, 400g', price: 3500, unit: 'boîte 400g', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'citydia' },
  { name: 'Yaourt Nature', description: 'Yaourt nature, pack de 4', price: 800, unit: 'pack 4', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'citydia' },
  { name: 'Yaourt aux Fruits', description: 'Yaourt aux fruits, pack de 6', price: 1200, unit: 'pack 6', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'citydia' },
  { name: 'Beurre Doux', description: 'Beurre doux 250g, barquette', price: 1500, unit: 'barquette 250g', image: '🧈', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'citydia' },
  { name: 'Beurre Salé', description: 'Beurre salé 250g, barquette', price: 1500, unit: 'barquette 250g', image: '🧈', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'promod' },
  { name: 'Crème Fraîche', description: 'Crème fraîche épaisse 20cl', price: 900, unit: 'pot 20cl', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'citydia' },
  { name: 'Fromage Blanc', description: 'Fromage blanc 0% mg, pot 500g', price: 1200, unit: 'pot 500g', image: '🧀', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'citydia' },
  { name: 'Lait Caillé', description: 'Lait caillé traditionnel sénégalais', price: 500, unit: 'pot', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'fromagerie-ndar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON FROMAGES                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Fromage Wagashi', description: 'Fromage traditionnel du Sénégal', price: 2000, unit: 'pièce', image: '🧀', inStock: true, featured: true, categorySlug: 'fromages', merchantSlug: 'fromagerie-ndar' },
  { name: 'Fromage Frais', description: 'Fromage frais local, crémeux', price: 1500, unit: 'pièce', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'fromagerie-ndar' },
  { name: 'Emmental', description: 'Emmental râpé, sachet 200g', price: 2500, unit: 'sachet 200g', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'citydia' },
  { name: 'Camembert', description: 'Camembert affiné, boîte', price: 2000, unit: 'pièce', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'citydia' },
  { name: 'Gouda', description: 'Gouda tranché, paquet 150g', price: 1800, unit: 'paquet 150g', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'promod' },
  { name: 'Mozzarella', description: 'Mozzarella fraîche, boule 125g', price: 1500, unit: 'boule 125g', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'citydia' },
  { name: 'Cheddar', description: 'Cheddar affiné, bloc 200g', price: 2200, unit: 'bloc 200g', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON BOULANGERIE                                                       ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Pain Complet', description: 'Pain complet au levain naturel', price: 300, unit: 'pièce', image: '🍞', inStock: true, featured: true, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Baguette', description: 'Baguette traditionnelle croustillante', price: 150, unit: 'pièce', image: '🥖', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Baguette', description: 'Baguette tradition, croustillante', price: 200, unit: 'pièce', image: '🥖', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'citydia' },
  { name: 'Croissant', description: 'Croissant au beurre, doré et croustillant', price: 200, unit: 'pièce', image: '🥐', inStock: true, featured: true, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Pain de Mie', description: 'Pain de mie tranché, paquet', price: 1000, unit: 'paquet', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'citydia' },
  { name: 'Pain aux Céréales', description: 'Pain multi-céréales, riche en fibres', price: 500, unit: 'pièce', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'citydia' },
  { name: 'Brioche', description: 'Brioche moelleuse, tranchée', price: 1500, unit: 'paquet', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'promod' },
  { name: 'Gâteau Chocolat', description: 'Gâteau au chocolat, part individuelle', price: 800, unit: 'pièce', image: '🍰', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Tarte aux Fruits', description: 'Tarte aux fruits de saison', price: 2500, unit: 'pièce', image: '🥧', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON CHARCUTERIE                                                       ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Jambon Blanc', description: 'Jambon blanc tranché, paquet 150g', price: 2000, unit: 'paquet 150g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'citydia' },
  { name: 'Jambon de Dinde', description: 'Jambon de dinde tranché, paquet 150g', price: 1500, unit: 'paquet 150g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'citydia' },
  { name: 'Saucisson Sec', description: 'Saucisson sec traditionnel', price: 3000, unit: 'pièce', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'citydia' },
  { name: 'Merguez', description: 'Saucisses merguez épicées, 6 pièces', price: 2500, unit: 'barquette', image: '🌭', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'promod' },
  { name: 'Pâté', description: 'Pâté de campagne, boîte 200g', price: 1800, unit: 'boîte 200g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'citydia' },
  { name: 'Salami', description: 'Salami tranché, paquet 100g', price: 2000, unit: 'paquet 100g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'citydia' },
  { name: 'Bacon', description: 'Bacon fumé, tranches fines', price: 2500, unit: 'paquet 150g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'promod' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON ÉPICES                                                            ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Poivre de Penja', description: 'Poivre noir de Penja, le meilleur d\'Afrique', price: 8000, unit: '100g', image: '🌶️', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Mélange Kolda', description: 'Mélange d\'épices traditionnel de Kolda', price: 3500, unit: '100g', image: '🏺', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Piment Capsicum', description: 'Piment fort séché, pour les amateurs', price: 2000, unit: '50g', image: '🌶️', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Sel de Guérande', description: 'Sel fin importé, qualité supérieure', price: 1500, unit: '500g', image: '🧂', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Curry en Poudre', description: 'Curry en poudre, sachet 100g', price: 1500, unit: '100g', image: '🍛', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'citydia' },
  { name: 'Cumin', description: 'Cumin en poudre, sachet 50g', price: 1200, unit: '50g', image: '🏺', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'citydia' },
  { name: 'Cannelle', description: 'Cannelle en poudre, sachet 50g', price: 1500, unit: '50g', image: '🫙', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'promod' },
  { name: 'Muscade', description: 'Muscade en poudre, sachet 30g', price: 1000, unit: '30g', image: '🏺', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'citydia' },
  { name: 'Cube Maggi', description: 'Cubes Maggi assaisonnés, boîte de 24', price: 1500, unit: 'boîte 24', image: '🧊', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'citydia' },
  { name: 'Ail en Poudre', description: 'Ail déshydraté en poudre, 50g', price: 800, unit: '50g', image: '🧄', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON RIZ & CÉRÉALES                                                    ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Riz Basmati', description: 'Riz basmati premium, grains longs, 5kg', price: 5500, unit: 'sac 5kg', image: '🌾', inStock: true, featured: true, categorySlug: 'riz-cereales', merchantSlug: 'citydia' },
  { name: 'Riz Brisé', description: 'Riz brisé de qualité, sac 5kg', price: 3500, unit: 'sac 5kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'citydia' },
  { name: 'Riz Parfumé', description: 'Riz parfumé du Sénégal, sac 5kg', price: 4500, unit: 'sac 5kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'promod' },
  { name: 'Mil', description: 'Mil local pour couscous et bouillie, 2kg', price: 1500, unit: 'sac 2kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'citydia' },
  { name: 'Couscous de Mil', description: 'Couscous de mil traditionnel, 1kg', price: 1000, unit: 'sac 1kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'epices-teranga' },
  { name: 'Maïs', description: 'Maïs en grains, 1kg', price: 800, unit: 'sac 1kg', image: '🌽', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'citydia' },
  { name: 'Semoule de Blé', description: 'Semoule de blé fine, 1kg', price: 900, unit: 'sac 1kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'citydia' },
  { name: 'Farine de Blé', description: 'Farine de blé tout usage, 1kg', price: 700, unit: 'sac 1kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'promod' },
  { name: 'Avoine', description: 'Flocons d\'avoine, 500g', price: 1500, unit: 'paquet 500g', image: '🥣', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'citydia' },
  { name: 'Cornflakes', description: 'Céréales cornflakes, 375g', price: 2000, unit: 'paquet 375g', image: '🥣', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON HUILES & GRAISSES                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Huile d\'Arachide', description: 'Huile d\'arachide pure, bouteille 1L', price: 2000, unit: 'bouteille 1L', image: '🫒', inStock: true, featured: true, categorySlug: 'huiles', merchantSlug: 'citydia' },
  { name: 'Huile d\'Arachide', description: 'Huile d\'arachide Premium, 5L', price: 9000, unit: 'bidon 5L', image: '🫒', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'promod' },
  { name: 'Huile de Tournesol', description: 'Huile de tournesol, bouteille 1L', price: 1800, unit: 'bouteille 1L', image: '🌻', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'citydia' },
  { name: 'Huile d\'Olive', description: 'Huile d\'olive extra vierge, 75cl', price: 5000, unit: 'bouteille 75cl', image: '🫒', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'citydia' },
  { name: 'Margarine', description: 'Margarine pour cuisson, 500g', price: 1200, unit: 'pot 500g', image: '🧈', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON CONSERVES                                                         ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Tomates Pelées', description: 'Tomates pelées en conserve, 400g', price: 600, unit: 'boîte 400g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'citydia' },
  { name: 'Concentré de Tomates', description: 'Concentré de tomates double, 70g', price: 300, unit: 'tube 70g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'citydia' },
  { name: 'Thon en Boîte', description: 'Thon au naturel, boîte 140g', price: 1000, unit: 'boîte 140g', image: '🥫', inStock: true, featured: true, categorySlug: 'conserves', merchantSlug: 'citydia' },
  { name: 'Sardines à l\'Huile', description: 'Sardines à l\'huile, boîte 125g', price: 700, unit: 'boîte 125g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'citydia' },
  { name: 'Haricots Blancs', description: 'Haricots blancs en conserve, 400g', price: 800, unit: 'boîte 400g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'promod' },
  { name: 'Petits Pois', description: 'Petits pois carottes, boîte 400g', price: 700, unit: 'boîte 400g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'citydia' },
  { name: 'Maïs Doux', description: 'Maïs doux en conserve, 340g', price: 600, unit: 'boîte 340g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'citydia' },
  { name: 'Champignons', description: 'Champignons de Paris entiers, 400g', price: 1200, unit: 'boîte 400g', image: '🍄', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'citydia' },
  { name: 'Lait de Coco', description: 'Lait de coco, boîte 400ml', price: 1000, unit: 'boîte 400ml', image: '🥥', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'promod' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON SAUCES & CONDIMENTS                                               ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Moutarde Dijon', description: 'Moutarde de Dijon, pot 200g', price: 1200, unit: 'pot 200g', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'citydia' },
  { name: 'Ketchup', description: 'Sauce ketchup, bouteille 500g', price: 1000, unit: 'bouteille 500g', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'citydia' },
  { name: 'Mayonnaise', description: 'Mayonnaise, pot 250g', price: 1200, unit: 'pot 250g', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'citydia' },
  { name: 'Sauce Soja', description: 'Sauce soja, bouteille 250ml', price: 1500, unit: 'bouteille 250ml', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'promod' },
  { name: 'Vinaigre', description: 'Vinaigre de vin, bouteille 75cl', price: 800, unit: 'bouteille 75cl', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'citydia' },
  { name: 'Sauce Piquante', description: 'Sauce piquante africaine, bouteille 250ml', price: 1500, unit: 'bouteille 250ml', image: '🌶️', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'epices-teranga' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON SUCRES & CONFISERIES                                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Sucre en Poudre', description: 'Sucre en poudre, 1kg', price: 800, unit: 'sac 1kg', image: '🍬', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'citydia' },
  { name: 'Sucre en Morceaux', description: 'Sucre en morceaux, 1kg', price: 900, unit: 'boîte 1kg', image: '🍬', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'citydia' },
  { name: 'Chocolat Noir', description: 'Tablette de chocolat noir 70%, 100g', price: 1500, unit: 'tablette 100g', image: '🍫', inStock: true, featured: true, categorySlug: 'sucres', merchantSlug: 'citydia' },
  { name: 'Chocolat au Lait', description: 'Tablette de chocolat au lait, 100g', price: 1200, unit: 'tablette 100g', image: '🍫', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'promod' },
  { name: 'Bonbons Mix', description: 'Assortiment de bonbons, 200g', price: 800, unit: 'sachet 200g', image: '🍬', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'citydia' },
  { name: 'Cacao en Poudre', description: 'Cacao en poudre non sucré, 250g', price: 2500, unit: 'boîte 250g', image: '🍫', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'citydia' },
  { name: 'Nutella', description: 'Pâte à tartiner Nutella, pot 400g', price: 3500, unit: 'pot 400g', image: '🍫', inStock: true, featured: true, categorySlug: 'sucres', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON CAFÉ & THÉ                                                        ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Café Moulu', description: 'Café moulu tradition, paquet 250g', price: 2500, unit: 'paquet 250g', image: '☕', inStock: true, featured: true, categorySlug: 'cafe-the', merchantSlug: 'citydia' },
  { name: 'Café Instantané', description: 'Café soluble Nescafé, 200g', price: 3000, unit: 'boîte 200g', image: '☕', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'citydia' },
  { name: 'Café en Grains', description: 'Café en grains, torréfié, 500g', price: 4000, unit: 'paquet 500g', image: '☕', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'promod' },
  { name: 'Thé Vert', description: 'Thé vert Gunpowder, 200g', price: 1500, unit: 'boîte 200g', image: '🍵', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'citydia' },
  { name: 'Ataya (Thé)', description: 'Thé à la menthe traditionnel sénégalais', price: 300, unit: 'sachet', image: '🍵', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'cave-dakar' },
  { name: 'Tisane Kinkéliba', description: 'Tisane de kinkéliba, 20 sachets', price: 1200, unit: 'boîte 20', image: '🍵', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'herboristerie-khady' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON BOISSONS                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Jus de Bissap', description: 'Jus de bissap frais maison', price: 500, unit: 'bouteille 1L', image: '🍷', inStock: true, featured: true, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Jus de Bissap', description: 'Bissap rouge frais et naturel', price: 450, unit: 'bouteille 1L', image: '🍷', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'citydia' },
  { name: 'Jus de Bouye', description: 'Jus de bouye (pain de singe) traditionnel', price: 600, unit: 'bouteille 1L', image: '🍹', inStock: true, featured: true, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Jus de Bouye', description: 'Bouye traditionnel, goût authentique', price: 500, unit: 'bouteille 1L', image: '🍹', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'citydia' },
  { name: 'Jus de Gingembre', description: 'Jus de gingembre pimenté, rafraîchissant', price: 500, unit: 'bouteille 1L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Jus de Mangue', description: 'Jus de mangue naturel, 1L', price: 800, unit: 'bouteille 1L', image: '🥭', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'citydia' },
  { name: 'Jus d\'Orange', description: 'Jus d\'orange pur jus, 1L', price: 1200, unit: 'bouteille 1L', image: '🍊', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'citydia' },
  { name: 'Coca-Cola', description: 'Coca-Cola, bouteille 1.5L', price: 1000, unit: 'bouteille 1.5L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'citydia' },
  { name: 'Fanta Orange', description: 'Fanta orange, bouteille 1.5L', price: 1000, unit: 'bouteille 1.5L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'promod' },
  { name: 'Sprite', description: 'Sprite citron, bouteille 1.5L', price: 1000, unit: 'bouteille 1.5L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'citydia' },
  { name: 'Bière Flag', description: 'Bière Flag, canette 33cl', price: 800, unit: 'canette 33cl', image: '🍺', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Vin Rouge', description: 'Vin rouge de table, 75cl', price: 3500, unit: 'bouteille 75cl', image: '🍷', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON EAU                                                               ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Eau Minérale Kirene', description: 'Eau minérale Kirene, bouteille 1.5L', price: 400, unit: 'bouteille 1.5L', image: '💧', inStock: true, featured: true, categorySlug: 'eau', merchantSlug: 'citydia' },
  { name: 'Eau Minérale Kirene', description: 'Eau Kirene, pack de 6 bouteilles 1.5L', price: 2200, unit: 'pack 6x1.5L', image: '💧', inStock: true, featured: false, categorySlug: 'eau', merchantSlug: 'citydia' },
  { name: 'Eau Minérale Gainde', description: 'Eau minérale Gainde, bouteille 1.5L', price: 350, unit: 'bouteille 1.5L', image: '💧', inStock: true, featured: false, categorySlug: 'eau', merchantSlug: 'promod' },
  { name: 'Eau Gazeuse', description: 'Eau gazeuse Perrier, 75cl', price: 1200, unit: 'bouteille 75cl', image: '💧', inStock: true, featured: false, categorySlug: 'eau', merchantSlug: 'citydia' },
  { name: 'Eau Source', description: 'Eau de source, bouteille 5L', price: 800, unit: 'bouteille 5L', image: '💧', inStock: true, featured: false, categorySlug: 'eau', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON MIEL & CONFITURES                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Miel du Saloum', description: 'Miel naturel du Sine-Saloum, pur et parfumé', price: 5000, unit: 'pot 500g', image: '🍯', inStock: true, featured: true, categorySlug: 'miel-confitures', merchantSlug: 'rucher-saloum' },
  { name: 'Miel du Saloum', description: 'Miel naturel pur, récolté artisanalement', price: 5500, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'citydia' },
  { name: 'Miel de Palme', description: 'Miel de palme traditionnel', price: 3500, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'rucher-saloum' },
  { name: 'Miel de Palme', description: 'Miel de palme de la Casamance', price: 4000, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'herboristerie-khady' },
  { name: 'Confiture de Baobab', description: 'Confiture artisanale au fruit de baobab', price: 2500, unit: 'pot 300g', image: '🫙', inStock: true, featured: true, categorySlug: 'miel-confitures', merchantSlug: 'rucher-saloum' },
  { name: 'Confiture de Mangue', description: 'Confiture de mangue artisanale, pot 300g', price: 2200, unit: 'pot 300g', image: '🫙', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'citydia' },
  { name: 'Confiture Fraise', description: 'Confiture de fraise, pot 370g', price: 2000, unit: 'pot 370g', image: '🫙', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'promod' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON HERBES AROMATIQUES                                                ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Kinkéliba', description: 'Kinkéliba séché, plante médicinale traditionnelle', price: 1000, unit: 'sachet 50g', image: '🌿', inStock: true, featured: true, categorySlug: 'herbes', merchantSlug: 'herboristerie-khady' },
  { name: 'Moringa', description: 'Moringa en poudre, super-aliment sénégalais', price: 2500, unit: 'sachet 100g', image: '🍃', inStock: true, featured: true, categorySlug: 'herbes', merchantSlug: 'herboristerie-khady' },
  { name: 'Moringa', description: 'Poudre de moringa bio', price: 3000, unit: 'sachet 100g', image: '🍃', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'citydia' },
  { name: 'Bouquet Garni', description: 'Mélange d\'herbes fraîches pour la cuisine', price: 500, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'herboristerie-khady' },
  { name: 'Persil', description: 'Persil frais, bouquet', price: 200, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'citydia' },
  { name: 'Menthe Fraîche', description: 'Menthe fraîche, bouquet', price: 200, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'citydia' },
  { name: 'Coriandre', description: 'Coriandre fraîche, bouquet', price: 200, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'promod' },
  { name: 'Thym', description: 'Thym séché, sachet 20g', price: 500, unit: 'sachet 20g', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'citydia' },
  { name: 'Laurier', description: 'Feuilles de laurier séchées, 10g', price: 400, unit: 'sachet 10g', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON CITRONS & AGRUMES                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Citrons Verts', description: 'Citrons verts frais pour la cuisine et les jus', price: 800, unit: 'kg', image: '🍋', inStock: true, featured: true, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-casamance' },
  { name: 'Citrons Verts', description: 'Citrons verts pour assaisonnement', price: 1000, unit: 'kg', image: '🍋', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'citydia' },
  { name: 'Tangerines', description: 'Tangerines de Casamance, sucrées et juteuses', price: 1500, unit: 'kg', image: '🍊', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-casamance' },
  { name: 'Citrons Jaunes', description: 'Citrons jaunes, 3 pièces', price: 500, unit: 'filet 3', image: '🍋', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'citydia' },
  { name: 'Pamplemousse', description: 'Pamplemousse rose, 2 pièces', price: 800, unit: 'sachet 2', image: '🍊', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'promod' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON SURGELÉS                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Poisson Pané', description: 'Bâtonnets de poisson pané, 400g', price: 2500, unit: 'sachet 400g', image: '🐟', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'citydia' },
  { name: 'Poulet Pané', description: 'Nuggets de poulet, 400g', price: 3000, unit: 'sachet 400g', image: '🍗', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'citydia' },
  { name: 'Frites Surgelées', description: 'Frites allumettes, 1kg', price: 2000, unit: 'sachet 1kg', image: '🍟', inStock: true, featured: true, categorySlug: 'surgeles', merchantSlug: 'citydia' },
  { name: 'Légumes Surgelés', description: 'Mélange de légumes, 750g', price: 1800, unit: 'sachet 750g', image: '🥬', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'citydia' },
  { name: 'Pizza Surgelée', description: 'Pizza fromage, 350g', price: 2500, unit: 'pièce', image: '🍕', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'promod' },
  { name: 'Glace Vanille', description: 'Glace vanille, pot 1L', price: 3500, unit: 'pot 1L', image: '🍦', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'citydia' },
  { name: 'Glace Chocolat', description: 'Glace chocolat, pot 1L', price: 3500, unit: 'pot 1L', image: '🍨', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'citydia' },
  { name: 'Crevettes Surgelées', description: 'Crevettes décortiquées surgelées, 500g', price: 6000, unit: 'sachet 500g', image: '🦐', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'citydia' },
  { name: 'Épinards Surgelés', description: 'Épinards hachés surgelés, 750g', price: 1500, unit: 'sachet 750g', image: '🥬', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'promod' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON HYGIÈNE & BEAUTÉ                                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Savon de Marseille', description: 'Savon de Marseille traditionnel, 125g', price: 500, unit: 'pièce', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'citydia' },
  { name: 'Gel Douche', description: 'Gel douche hydratant, 400ml', price: 1500, unit: 'flacon 400ml', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'citydia' },
  { name: 'Shampoing', description: 'Shampoing normal, 250ml', price: 2000, unit: 'flacon 250ml', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'citydia' },
  { name: 'Dentifrice', description: 'Dentifrice menthe, 75ml', price: 1000, unit: 'tube 75ml', image: '🪥', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'citydia' },
  { name: 'Déodorant', description: 'Déodorant roll-on, 50ml', price: 1500, unit: 'flacon 50ml', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'promod' },
  { name: 'Crème Hydratante', description: 'Crème hydratante visage, 50ml', price: 2500, unit: 'pot 50ml', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'citydia' },
  { name: 'Papier Toilette', description: 'Papier toilette, pack de 6 rouleaux', price: 2000, unit: 'pack 6', image: '🧻', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'citydia' },
  { name: 'Mouchoirs', description: 'Mouchoirs, pack de 6 pochettes', price: 1200, unit: 'pack 6', image: '🤧', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'citydia' },
  { name: 'Savon Noir', description: 'Savon noir traditionnel africain', price: 800, unit: 'pièce', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'herboristerie-khady' },
  { name: 'Huile de Coco', description: 'Huile de coco vierge pour soin, 250ml', price: 3000, unit: 'bouteille 250ml', image: '🥥', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'citydia' },
  { name: 'Beurre de Karité', description: 'Beurre de karité pur, 200g', price: 2500, unit: 'pot 200g', image: '🧴', inStock: true, featured: true, categorySlug: 'hygiene-beaute', merchantSlug: 'herboristerie-khady' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON PRODUITS MÉNAGERS                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Lessive Liquide', description: 'Lessive liquide, 2L', price: 3000, unit: 'bidon 2L', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'citydia' },
  { name: 'Lessive Poudre', description: 'Lessive en poudre, 1kg', price: 2000, unit: 'sac 1kg', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'citydia' },
  { name: 'Eau de Javel', description: 'Eau de Javel, bouteille 1L', price: 500, unit: 'bouteille 1L', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'citydia' },
  { name: 'Nettoyant Multi-Usage', description: 'Nettoyant multi-usages, 750ml', price: 1200, unit: 'flacon 750ml', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'citydia' },
  { name: 'Nettoyant Sol', description: 'Nettoyant sols parfumé, 1L', price: 1500, unit: 'bouteille 1L', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'promod' },
  { name: 'Liquide Vaisselle', description: 'Liquide vaisselle, 750ml', price: 1000, unit: 'flacon 750ml', image: '🧽', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'citydia' },
  { name: 'Éponges', description: 'Éponges grattoirs, pack de 3', price: 500, unit: 'pack 3', image: '🧽', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'citydia' },
  { name: 'Sacs Poubelle', description: 'Sacs poubelle 50L, pack de 10', price: 1500, unit: 'pack 10', image: '🗑️', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'citydia' },
  { name: 'Désodorisant', description: 'Désodorisant maison, 300ml', price: 1500, unit: 'spray 300ml', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'citydia' },
  { name: 'Insecticide', description: 'Insecticide spray, 400ml', price: 2000, unit: 'spray 400ml', image: '🦟', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'promod' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON BÉBÉ & PUÉRICULTURE                                               ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Lait Infantile 1er Âge', description: 'Lait infantile 1er âge, 900g', price: 6000, unit: 'boîte 900g', image: '🍼', inStock: true, featured: true, categorySlug: 'bebe', merchantSlug: 'citydia' },
  { name: 'Lait Infantile 2e Âge', description: 'Lait infantile 2e âge, 900g', price: 5500, unit: 'boîte 900g', image: '🍼', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'citydia' },
  { name: 'Couches Taille 3', description: 'Couches bébé taille 3, pack de 44', price: 6000, unit: 'pack 44', image: '🧷', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'citydia' },
  { name: 'Couches Taille 4', description: 'Couches bébé taille 4, pack de 38', price: 6500, unit: 'pack 38', image: '🧷', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'promod' },
  { name: 'Petits Pots Légumes', description: 'Petits pots légumes variés, 2x130g', price: 1500, unit: 'pack 2', image: '🍼', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'citydia' },
  { name: 'Bibelé Lait', description: 'Céréales infantiles, 400g', price: 3000, unit: 'boîte 400g', image: '🍼', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'citydia' },
  { name: 'Lingettes Bébé', description: 'Lingettes bébé douces, pack de 60', price: 2000, unit: 'pack 60', image: '🧷', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'citydia' },
  { name: 'Crème Bébé', description: 'Crème change bébé, 100ml', price: 1800, unit: 'tube 100ml', image: '🍼', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'promod' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON ANIMAUX                                                           ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Croquettes Chat', description: 'Croquettes pour chat adulte, 1.5kg', price: 4500, unit: 'sac 1.5kg', image: '🐱', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'citydia' },
  { name: 'Croquettes Chien', description: 'Croquettes pour chien adulte, 3kg', price: 5500, unit: 'sac 3kg', image: '🐕', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'citydia' },
  { name: 'Pâtée Chat', description: 'Pâtée pour chat, 400g', price: 1200, unit: 'boîte 400g', image: '🐱', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'promod' },
  { name: 'Pâtée Chien', description: 'Pâtée pour chien, 800g', price: 1500, unit: 'boîte 800g', image: '🐕', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'citydia' },
  { name: 'Litière Chat', description: 'Litière agglomérante, 5L', price: 3500, unit: 'sac 5L', image: '🐾', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON SNACKS & BISCUITS                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Biscuits Petit Beurre', description: 'Biscuits petit beurre, paquet 400g', price: 1000, unit: 'paquet 400g', image: '🍪', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'citydia' },
  { name: 'Chips Classiques', description: 'Chips de pomme de terre, 150g', price: 800, unit: 'sachet 150g', image: '🥔', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'citydia' },
  { name: 'Chips Saveur', description: 'Chips assaisonnées, 150g', price: 900, unit: 'sachet 150g', image: '🥔', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'promod' },
  { name: 'Biscuits Chocolat', description: 'Biscuits au chocolat, 200g', price: 1200, unit: 'paquet 200g', image: '🍪', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'citydia' },
  { name: 'Barres Céréalières', description: 'Barres de céréales, pack de 6', price: 1500, unit: 'pack 6', image: '🍫', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'citydia' },
  { name: 'Cacahuètes', description: 'Cacahuètes grillées salées, 250g', price: 800, unit: 'sachet 250g', image: '🥜', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'citydia' },
  { name: 'Noix de Cajou', description: 'Noix de cajou grillées, 200g', price: 2500, unit: 'sachet 200g', image: '🥜', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'promod' },
  { name: 'Pop-Corn', description: 'Pop-corn micro-ondes, 100g', price: 800, unit: 'sachet 100g', image: '🍿', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'citydia' },
  { name: 'Biscuits Sésame', description: 'Biscuits au sésame traditionnels', price: 600, unit: 'paquet', image: '🍪', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'boulangerie-touba' },
  { name: 'Galettes de Riz', description: 'Galettes de riz soufflées, 100g', price: 500, unit: 'sachet 100g', image: '🍪', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ CROSS-MERCHANT COMPETITION — Citydia & Promod                            ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Riz Basmati', description: 'Riz basmati long grain, 5kg', price: 5000, unit: 'sac 5kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'citydia' },
  { name: 'Riz Parfumé', description: 'Riz parfumé qualité, 5kg', price: 4200, unit: 'sac 5kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'promod' },
  { name: 'Huile d\'Arachide', description: 'Huile d\'arachide, 1L', price: 1900, unit: 'bouteille 1L', image: '🫒', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'citydia' },
  { name: 'Huile de Tournesol', description: 'Huile de tournesol, 1L', price: 1700, unit: 'bouteille 1L', image: '🌻', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'promod' },
  { name: 'Sucre en Poudre', description: 'Sucre en poudre, 1kg', price: 750, unit: 'sac 1kg', image: '🍬', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'citydia' },
  { name: 'Café Moulu', description: 'Café moulu, 250g', price: 2300, unit: 'paquet 250g', image: '☕', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'citydia' },
  { name: 'Lait Entier UHT', description: 'Lait entier UHT 1L', price: 750, unit: 'bouteille 1L', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'citydia' },
  { name: 'Thon en Boîte', description: 'Thon au naturel, 140g', price: 900, unit: 'boîte 140g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'promod' },
  { name: 'Coca-Cola', description: 'Coca-Cola, 1.5L', price: 900, unit: 'bouteille 1.5L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'citydia' },
  { name: 'Eau Minérale Kirene', description: 'Eau minérale Kirene, 1.5L', price: 350, unit: 'bouteille 1.5L', image: '💧', inStock: true, featured: false, categorySlug: 'eau', merchantSlug: 'promod' },
  { name: 'Pommes de Terre', description: 'Pommes de terre, 1kg', price: 650, unit: 'kg', image: '🥔', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'citydia' },
  { name: 'Tomates', description: 'Tomates, 1kg', price: 750, unit: 'kg', image: '🍅', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'promod' },
  { name: 'Lessive Liquide', description: 'Lessive liquide, 2L', price: 2800, unit: 'bidon 2L', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'citydia' },
  { name: 'Couches Taille 4', description: 'Couches bébé, pack 38', price: 6200, unit: 'pack 38', image: '🧷', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'promod' },
  { name: 'Croquettes Chien', description: 'Croquettes chien, 3kg', price: 5000, unit: 'sac 3kg', image: '🐕', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'citydia' },
  { name: 'Concentré de Tomates', description: 'Concentré de tomates, 70g', price: 250, unit: 'tube 70g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'citydia' },
  { name: 'Cube Maggi', description: 'Cubes Maggi, 24 pièces', price: 1300, unit: 'boîte 24', image: '🧊', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'promod' },
  { name: 'Chips Classiques', description: 'Chips, 150g', price: 750, unit: 'sachet 150g', image: '🥔', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'citydia' },
  { name: 'Biscuits Petit Beurre', description: 'Biscuits petit beurre, 400g', price: 900, unit: 'paquet 400g', image: '🍪', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'promod' },
  { name: 'Nutella', description: 'Pâte à tartiner, 400g', price: 3200, unit: 'pot 400g', image: '🍫', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'citydia' },
  { name: 'Poulet Fermier', description: 'Poulet fermier frais', price: 3000, unit: 'pièce', image: '🐔', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'citydia' },
  { name: 'Bœuf Premium', description: 'Bœuf de qualité supérieure', price: 6800, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'promod' },
  { name: 'Dorade Royale', description: 'Dorade fraîche', price: 5000, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'citydia' },
  { name: 'Mangues Kent', description: 'Mangues Kent du Casamance', price: 1600, unit: 'kg', image: '🥭', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'promod' },
  { name: 'Yaourt Nature', description: 'Yaourt nature, pack de 4', price: 750, unit: 'pack 4', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'promod' },
  { name: 'Baguette', description: 'Baguette tradition', price: 175, unit: 'pièce', image: '🥖', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'citydia' },
  { name: 'Jus de Bissap', description: 'Bissap naturel, 1L', price: 500, unit: 'bouteille 1L', image: '🍷', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'orangerie-casamance' },
  { name: 'Miel du Saloum', description: 'Miel pur du Saloum', price: 4800, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'jardin-sahel' },
  { name: 'Kinkéliba', description: 'Kinkéliba séché traditionnel', price: 900, unit: 'sachet 50g', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'citydia' },
  { name: 'Pain Complet', description: 'Pain complet au levain', price: 350, unit: 'pièce', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'citydia' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON TÉLÉPHONES & TABLETTES                                           ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'iPhone 15 Pro Max', description: 'Apple iPhone 15 Pro Max 256Go, Titanium', price: 1200000, unit: 'pièce', image: '📱', inStock: true, featured: true, categorySlug: 'telephones-tablettes', merchantSlug: 'techshop-dakar' },
  { name: 'iPhone 15 Pro Max', description: 'iPhone 15 Pro Max 256Go, neuf sous blister', price: 1250000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'electromall' },
  { name: 'iPhone 15', description: 'Apple iPhone 15 128Go, couleur au choix', price: 850000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'techshop-dakar' },
  { name: 'Samsung Galaxy S24 Ultra', description: 'Samsung Galaxy S24 Ultra 256Go, S Pen inclus', price: 950000, unit: 'pièce', image: '📱', inStock: true, featured: true, categorySlug: 'telephones-tablettes', merchantSlug: 'techshop-dakar' },
  { name: 'Samsung Galaxy S24', description: 'Samsung Galaxy S24 128Go, écran AMOLED', price: 850000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'electromall' },
  { name: 'Samsung Galaxy A54', description: 'Samsung Galaxy A54 128Go, meilleur rapport qualité-prix', price: 350000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'techshop-dakar' },
  { name: 'Samsung Galaxy A34', description: 'Samsung Galaxy A34 128Go, 5G prêt', price: 280000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'informatique-numerique' },
  { name: 'Xiaomi Redmi Note 13 Pro', description: 'Xiaomi Redmi Note 13 Pro 256Go, photo 200MP', price: 250000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'techshop-dakar' },
  { name: 'Xiaomi Redmi 13C', description: 'Xiaomi Redmi 13C 128Go, smartphone abordable', price: 120000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'informatique-numerique' },
  { name: 'Tecno Camon 20 Pro', description: 'Tecno Camon 20 Pro, photo pro budget', price: 180000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'techshop-dakar' },
  { name: 'Infinix Note 40', description: 'Infinix Note 40 256Go, charge rapide 68W', price: 165000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'informatique-numerique' },
  { name: 'iPad Air M2', description: 'Apple iPad Air M2 11 pouces 128Go', price: 750000, unit: 'pièce', image: '📱', inStock: true, featured: true, categorySlug: 'telephones-tablettes', merchantSlug: 'techshop-dakar' },
  { name: 'Samsung Galaxy Tab S9', description: 'Samsung Galaxy Tab S9 128Go, S Pen inclus', price: 600000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'electromall' },
  { name: 'Xiaomi Pad 6', description: 'Xiaomi Pad 6 128Go, tablette Android performante', price: 300000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'telephones-tablettes', merchantSlug: 'techshop-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON ORDINATEURS & ACCESSOIRES                                        ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'MacBook Air M3', description: 'Apple MacBook Air M3 13 pouces, 8Go/256Go SSD', price: 1500000, unit: 'pièce', image: '💻', inStock: true, featured: true, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'informatique-numerique' },
  { name: 'MacBook Air M3', description: 'MacBook Air M3 15 pouces, 8Go/256Go', price: 1750000, unit: 'pièce', image: '💻', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'techshop-dakar' },
  { name: 'MacBook Pro M3', description: 'Apple MacBook Pro M3 14 pouces, 18Go/512Go', price: 2500000, unit: 'pièce', image: '💻', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'informatique-numerique' },
  { name: 'HP Pavilion 15', description: 'HP Pavilion 15, Intel Core i5, 8Go RAM, 256Go SSD', price: 650000, unit: 'pièce', image: '💻', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'informatique-numerique' },
  { name: 'HP 250 G9', description: 'HP 250 G9, Intel Core i3, 4Go RAM, 256Go SSD', price: 450000, unit: 'pièce', image: '💻', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'informatique-numerique' },
  { name: 'Dell Inspiron 15', description: 'Dell Inspiron 15 3000, Intel Core i5, 8Go/256Go', price: 600000, unit: 'pièce', image: '💻', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'informatique-numerique' },
  { name: 'Lenovo IdeaPad 3', description: 'Lenovo IdeaPad 3, AMD Ryzen 5, 8Go/256Go SSD', price: 550000, unit: 'pièce', image: '💻', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'electromall' },
  { name: 'ASUS VivoBook 15', description: 'ASUS VivoBook 15, Intel Core i7, 16Go/512Go SSD', price: 780000, unit: 'pièce', image: '💻', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'informatique-numerique' },
  { name: 'Souris sans fil', description: 'Souris optique sans fil Logitech M170', price: 12000, unit: 'pièce', image: '🖱️', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'informatique-numerique' },
  { name: 'Clavier sans fil', description: 'Clavier sans fil Logitech K270, azerty', price: 25000, unit: 'pièce', image: '⌨️', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'informatique-numerique' },
  { name: 'Sacoche Ordinateur 15.6"', description: 'Sacoche rembourrée pour PC 15.6 pouces', price: 15000, unit: 'pièce', image: '💼', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'techshop-dakar' },
  { name: 'Webcam HD', description: 'Webcam Full HD 1080p avec micro intégré', price: 35000, unit: 'pièce', image: '📷', inStock: true, featured: false, categorySlug: 'ordinateurs-accessoires', merchantSlug: 'informatique-numerique' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON AUDIO & CASQUES                                                   ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Sony WH-1000XM5', description: 'Casque sans fil Sony WH-1000XM5, réduction de bruit', price: 180000, unit: 'pièce', image: '🎧', inStock: true, featured: true, categorySlug: 'audio-casques', merchantSlug: 'sonorite-dakar' },
  { name: 'Sony WH-1000XM5', description: 'Sony WH-1000XM5, noir, ANC leader du marché', price: 175000, unit: 'pièce', image: '🎧', inStock: true, featured: false, categorySlug: 'audio-casques', merchantSlug: 'techshop-dakar' },
  { name: 'AirPods Pro 2', description: 'Apple AirPods Pro 2ème génération, USB-C', price: 150000, unit: 'pièce', image: '🎧', inStock: true, featured: true, categorySlug: 'audio-casques', merchantSlug: 'techshop-dakar' },
  { name: 'AirPods Pro 2', description: 'AirPods Pro 2, audio spatial, boîte MagSafe', price: 155000, unit: 'pièce', image: '🎧', inStock: true, featured: false, categorySlug: 'audio-casques', merchantSlug: 'sonorite-dakar' },
  { name: 'JBL Charge 5', description: 'Enceinte Bluetooth JBL Charge 5, étanche IP67', price: 75000, unit: 'pièce', image: '🔊', inStock: true, featured: false, categorySlug: 'audio-casques', merchantSlug: 'sonorite-dakar' },
  { name: 'JBL Flip 6', description: 'Enceinte Bluetooth JBL Flip 6, portable et puissante', price: 55000, unit: 'pièce', image: '🔊', inStock: true, featured: false, categorySlug: 'audio-casques', merchantSlug: 'electromall' },
  { name: 'JBL Tune 720BT', description: 'Casque sans fil JBL Tune 720BT, Pure Bass', price: 45000, unit: 'pièce', image: '🎧', inStock: true, featured: false, categorySlug: 'audio-casques', merchantSlug: 'sonorite-dakar' },
  { name: 'Marshall Emberton II', description: 'Enceinte Bluetooth Marshall Emberton II, design rétro', price: 90000, unit: 'pièce', image: '🔊', inStock: true, featured: false, categorySlug: 'audio-casques', merchantSlug: 'sonorite-dakar' },
  { name: 'Samsung Galaxy Buds2 Pro', description: 'Samsung Galaxy Buds2 Pro, ANC, audio 360', price: 85000, unit: 'pièce', image: '🎧', inStock: true, featured: false, categorySlug: 'audio-casques', merchantSlug: 'techshop-dakar' },
  { name: 'Ecouteurs filaires', description: 'Écouteurs intra-auriculaires avec micro, 3.5mm', price: 5000, unit: 'pièce', image: '🎧', inStock: true, featured: false, categorySlug: 'audio-casques', merchantSlug: 'sonorite-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON TV & ÉCRANS                                                       ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Samsung 55" 4K UHD', description: 'Samsung Crystal UHD 55 pouces, Smart TV, HDR10+', price: 450000, unit: 'pièce', image: '📺', inStock: true, featured: true, categorySlug: 'tv-ecrans', merchantSlug: 'electromall' },
  { name: 'Samsung 55" 4K UHD', description: 'Samsung Smart TV 55 pouces 4K, modèle 2024', price: 470000, unit: 'pièce', image: '📺', inStock: true, featured: false, categorySlug: 'tv-ecrans', merchantSlug: 'techshop-dakar' },
  { name: 'LG OLED 55" C3', description: 'LG OLED 55 pouces C3, Dolby Vision, HDMI 2.1', price: 800000, unit: 'pièce', image: '📺', inStock: true, featured: true, categorySlug: 'tv-ecrans', merchantSlug: 'electromall' },
  { name: 'LG 50" 4K UHD', description: 'LG UHD 50 pouces, Smart TV webOS', price: 380000, unit: 'pièce', image: '📺', inStock: true, featured: false, categorySlug: 'tv-ecrans', merchantSlug: 'electromall' },
  { name: 'Samsung 65" QLED 4K', description: 'Samsung QLED 65 pouces, Quantum HDR, Smart TV', price: 750000, unit: 'pièce', image: '📺', inStock: true, featured: false, categorySlug: 'tv-ecrans', merchantSlug: 'electromall' },
  { name: 'TCL 43" 4K UHD', description: 'TCL 43 pouces 4K UHD, Android TV, Dolby Audio', price: 220000, unit: 'pièce', image: '📺', inStock: true, featured: false, categorySlug: 'tv-ecrans', merchantSlug: 'electromall' },
  { name: 'Hisense 32" HD', description: 'Hisense 32 pouces HD Ready, Smart TV', price: 130000, unit: 'pièce', image: '📺', inStock: true, featured: false, categorySlug: 'tv-ecrans', merchantSlug: 'informatique-numerique' },
  { name: 'Moniteur Samsung 27"', description: 'Moniteur Samsung 27 pouces QHD 144Hz, idéal gaming', price: 200000, unit: 'pièce', image: '🖥️', inStock: true, featured: false, categorySlug: 'tv-ecrans', merchantSlug: 'informatique-numerique' },
  { name: 'Moniteur LG 24" Full HD', description: 'Moniteur LG 24 pouces IPS, Full HD 75Hz', price: 110000, unit: 'pièce', image: '🖥️', inStock: true, featured: false, categorySlug: 'tv-ecrans', merchantSlug: 'informatique-numerique' },
  { name: 'Support TV Mural', description: 'Support mural TV 32-65 pouces, inclinable', price: 25000, unit: 'pièce', image: '🔧', inStock: true, featured: false, categorySlug: 'tv-ecrans', merchantSlug: 'electromall' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON APPAREILS PHOTO & VIDÉO                                           ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Canon EOS R50', description: 'Canon EOS R50, appareil photo hybride 24.2MP, kit 18-45mm', price: 650000, unit: 'pièce', image: '📷', inStock: true, featured: true, categorySlug: 'photo-video', merchantSlug: 'photopro-dakar' },
  { name: 'Canon EOS R50', description: 'Canon EOS R50 nu, capteur APS-C 24.2MP', price: 600000, unit: 'pièce', image: '📷', inStock: true, featured: false, categorySlug: 'photo-video', merchantSlug: 'electromall' },
  { name: 'Sony Alpha 6700', description: 'Sony Alpha 6700, hybride APS-C, 4K 120fps', price: 950000, unit: 'pièce', image: '📷', inStock: true, featured: false, categorySlug: 'photo-video', merchantSlug: 'photopro-dakar' },
  { name: 'DJI Mini 4 Pro', description: 'DJI Mini 4 Pro, drone compact 4K HDR, 249g', price: 550000, unit: 'pièce', image: '🚁', inStock: true, featured: true, categorySlug: 'photo-video', merchantSlug: 'photopro-dakar' },
  { name: 'DJI Mini 4 Pro', description: 'DJI Mini 4 Pro Fly More Combo, 3 batteries', price: 680000, unit: 'pièce', image: '🚁', inStock: true, featured: false, categorySlug: 'photo-video', merchantSlug: 'electromall' },
  { name: 'GoPro Hero 12', description: 'GoPro Hero 12 Black, action cam 5.3K, HyperSmooth 5.0', price: 280000, unit: 'pièce', image: '📷', inStock: true, featured: false, categorySlug: 'photo-video', merchantSlug: 'photopro-dakar' },
  { name: 'Insta360 X4', description: 'Insta360 X4, caméra 360° 8K, invisible selfie stick', price: 350000, unit: 'pièce', image: '📷', inStock: true, featured: false, categorySlug: 'photo-video', merchantSlug: 'photopro-dakar' },
  { name: 'Trépied Vidéo', description: 'Trépied aluminium pour caméra, hauteur max 170cm', price: 35000, unit: 'pièce', image: '📷', inStock: true, featured: false, categorySlug: 'photo-video', merchantSlug: 'photopro-dakar' },
  { name: 'Carte SD 128Go', description: 'SanDisk Extreme 128Go, UHS-I U3, V30, 4K ready', price: 22000, unit: 'pièce', image: '💾', inStock: true, featured: false, categorySlug: 'photo-video', merchantSlug: 'photopro-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON GAMING & CONSOLES                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'PlayStation 5', description: 'Sony PlayStation 5, édition standard avec lecteur disque', price: 400000, unit: 'pièce', image: '🎮', inStock: true, featured: true, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'PlayStation 5', description: 'PS5 édition standard, 1 stock, garantie 1 an', price: 420000, unit: 'pièce', image: '🎮', inStock: true, featured: false, categorySlug: 'gaming-consoles', merchantSlug: 'electromall' },
  { name: 'PS5 Digital Edition', description: 'PlayStation 5 Digital Edition, sans lecteur disque', price: 350000, unit: 'pièce', image: '🎮', inStock: true, featured: false, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'Xbox Series X', description: 'Microsoft Xbox Series X, 1To SSD, 4K gaming', price: 380000, unit: 'pièce', image: '🎮', inStock: true, featured: true, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'Xbox Series S', description: 'Microsoft Xbox Series S 512Go, Full HD gaming', price: 220000, unit: 'pièce', image: '🎮', inStock: true, featured: false, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'Nintendo Switch OLED', description: 'Nintendo Switch OLED Model, écran 7 pouces vivant', price: 250000, unit: 'pièce', image: '🎮', inStock: true, featured: true, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'Nintendo Switch Lite', description: 'Nintendo Switch Lite, console portable compacte', price: 170000, unit: 'pièce', image: '🎮', inStock: true, featured: false, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'Manette PS5 DualSense', description: 'Manette DualSense PlayStation 5, couleur blanche', price: 55000, unit: 'pièce', image: '🎮', inStock: true, featured: false, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'Manette Xbox', description: 'Manette sans fil Xbox Series, Bluetooth', price: 45000, unit: 'pièce', image: '🎮', inStock: true, featured: false, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'Casque Gaming Razer', description: 'Razer Kraken X, casque gaming 7.1 surround', price: 65000, unit: 'pièce', image: '🎧', inStock: true, featured: false, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'FIFA 25 PS5', description: 'EA Sports FC 25, jeu PS5', price: 45000, unit: 'pièce', image: '⚽', inStock: true, featured: false, categorySlug: 'gaming-consoles', merchantSlug: 'gamezone-dakar' },
  { name: 'Souris Gaming Logitech', description: 'Logitech G502 Hero, souris gaming 25600 DPI', price: 50000, unit: 'pièce', image: '🖱️', inStock: true, featured: false, categorySlug: 'gaming-consoles', merchantSlug: 'informatique-numerique' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON ÉLECTROMÉNAGER                                                    ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Climatiseur Samsung 12000 BTU', description: 'Climatiseur split Samsung 12000 BTU, R410A', price: 350000, unit: 'pièce', image: '❄️', inStock: true, featured: true, categorySlug: 'electromenager', merchantSlug: 'electromall' },
  { name: 'Climatiseur LG 9000 BTU', description: 'Climatiseur split LG 9000 BTU, silencieux', price: 280000, unit: 'pièce', image: '❄️', inStock: true, featured: false, categorySlug: 'electromenager', merchantSlug: 'electromall' },
  { name: 'Réfrigérateur Samsung 320L', description: 'Réfrigérateur Samsung double porte 320L, No Frost', price: 450000, unit: 'pièce', image: '🧊', inStock: true, featured: false, categorySlug: 'electromenager', merchantSlug: 'electromall' },
  { name: 'Réfrigérateur Hisense 200L', description: 'Réfrigérateur Hisense simple porte 200L', price: 220000, unit: 'pièce', image: '🧊', inStock: true, featured: false, categorySlug: 'electromenager', merchantSlug: 'electromall' },
  { name: 'Machine à laver Samsung 7kg', description: 'Machine à laver Samsung 7kg, 1200 tours', price: 300000, unit: 'pièce', image: '🧺', inStock: true, featured: false, categorySlug: 'electromenager', merchantSlug: 'electromall' },
  { name: 'Micro-ondes Samsung 23L', description: 'Four micro-ondes Samsung 23L, grill', price: 95000, unit: 'pièce', image: '🔌', inStock: true, featured: false, categorySlug: 'electromenager', merchantSlug: 'electromall' },
  { name: 'Fer à repasser Philips', description: 'Fer à repasser vapeur Philips 2000W, anti-calcaire', price: 35000, unit: 'pièce', image: '🔌', inStock: true, featured: false, categorySlug: 'electromenager', merchantSlug: 'electromall' },
  { name: 'Bouilloire électrique', description: 'Bouilloire électrique 1.7L, acier inoxydable, 2200W', price: 15000, unit: 'pièce', image: '🔌', inStock: true, featured: false, categorySlug: 'electromenager', merchantSlug: 'electromall' },
  { name: 'Ventilateur sur pied', description: 'Ventilateur sur pied 16 pouces, 3 vitesses', price: 25000, unit: 'pièce', image: '🌬️', inStock: true, featured: false, categorySlug: 'electromenager', merchantSlug: 'electromall' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON CHARGEURS & CÂBLES                                                ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Chargeur iPhone 20W USB-C', description: 'Chargeur Apple 20W USB-C pour iPhone 15', price: 15000, unit: 'pièce', image: '🔋', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'techshop-dakar' },
  { name: 'Chargeur Samsung 25W', description: 'Chargeur Samsung Super Fast Charging 25W USB-C', price: 12000, unit: 'pièce', image: '🔋', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'techshop-dakar' },
  { name: 'Chargeur universel 65W', description: 'Chargeur USB-C GaN 65W, compatible PC/phone', price: 25000, unit: 'pièce', image: '🔋', inStock: true, featured: true, categorySlug: 'chargeurs-cables', merchantSlug: 'informatique-numerique' },
  { name: 'Câble USB-C vers Lightning', description: 'Câble MFi USB-C vers Lightning 1m, Apple certifié', price: 8000, unit: 'pièce', image: '🔌', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'techshop-dakar' },
  { name: 'Câble USB-C 1m', description: 'Câble USB-C vers USB-C 1m, charge rapide', price: 5000, unit: 'pièce', image: '🔌', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'techshop-dakar' },
  { name: 'Câble HDMI 2m', description: 'Câble HDMI 2.0 haute vitesse 4K, 2 mètres', price: 8000, unit: 'pièce', image: '🔌', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'informatique-numerique' },
  { name: 'Power Bank 20000mAh', description: 'Batterie externe 20000mAh, 2 ports USB + USB-C', price: 25000, unit: 'pièce', image: '🔋', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'techshop-dakar' },
  { name: 'Power Bank 10000mAh', description: 'Batterie externe 10000mAh, compact et léger', price: 15000, unit: 'pièce', image: '🔋', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'informatique-numerique' },
  { name: 'Coque iPhone 15 Pro', description: 'Coque silicone iPhone 15 Pro, protection anti-choc', price: 8000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'techshop-dakar' },
  { name: 'Film vitre trempée Galaxy S24', description: 'Film protection verre trempé Samsung Galaxy S24', price: 5000, unit: 'pièce', image: '📱', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'techshop-dakar' },
  { name: 'Multiprise 5 prises', description: 'Multiprise 5 prises avec protection surtension, 2m câble', price: 10000, unit: 'pièce', image: '🔌', inStock: true, featured: false, categorySlug: 'chargeurs-cables', merchantSlug: 'electromall' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON STOCKAGE & MÉMOIRES                                               ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Clé USB 64Go', description: 'SanDisk Ultra Flair 64Go, USB 3.0, lecture 150MB/s', price: 8000, unit: 'pièce', image: '💾', inStock: true, featured: false, categorySlug: 'stockage-memoires', merchantSlug: 'informatique-numerique' },
  { name: 'Clé USB 128Go', description: 'SanDisk Ultra Dual 128Go, USB-C + USB-A', price: 15000, unit: 'pièce', image: '💾', inStock: true, featured: false, categorySlug: 'stockage-memoires', merchantSlug: 'informatique-numerique' },
  { name: 'Disque dur externe 1To', description: 'WD Elements Portable 1To, USB 3.0', price: 55000, unit: 'pièce', image: '💾', inStock: true, featured: true, categorySlug: 'stockage-memoires', merchantSlug: 'informatique-numerique' },
  { name: 'Disque dur externe 2To', description: 'Seagate Expansion 2To, USB 3.0, portable', price: 85000, unit: 'pièce', image: '💾', inStock: true, featured: false, categorySlug: 'stockage-memoires', merchantSlug: 'informatique-numerique' },
  { name: 'SSD 500Go', description: 'Samsung T7 Shield 500Go, SSD externe USB 3.2', price: 65000, unit: 'pièce', image: '💾', inStock: true, featured: false, categorySlug: 'stockage-memoires', merchantSlug: 'informatique-numerique' },
  { name: 'SSD 1To', description: 'Samsung T7 1To, SSD externe, lecture 1050MB/s', price: 110000, unit: 'pièce', image: '💾', inStock: true, featured: false, categorySlug: 'stockage-memoires', merchantSlug: 'techshop-dakar' },
  { name: 'Carte MicroSD 128Go', description: 'SanDisk Extreme 128Go, A2, U3, V30, 4K', price: 15000, unit: 'pièce', image: '💾', inStock: true, featured: false, categorySlug: 'stockage-memoires', merchantSlug: 'techshop-dakar' },
  { name: 'Carte MicroSD 64Go', description: 'Samsung EVO Plus 64Go, U3, Full HD', price: 8000, unit: 'pièce', image: '💾', inStock: true, featured: false, categorySlug: 'stockage-memoires', merchantSlug: 'informatique-numerique' },
  { name: 'RAM DDR4 8Go', description: 'Barrette mémoire DDR4 8Go 2666MHz pour PC portable', price: 20000, unit: 'pièce', image: '💾', inStock: true, featured: false, categorySlug: 'stockage-memoires', merchantSlug: 'informatique-numerique' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// REMAP: Redirect Auchan merchant slugs to appropriate Senegalese merchants
// ═══════════════════════════════════════════════════════════════════════════════

const AUCHAN_REMAP: Record<string, Record<string, string>> = {
  'auchan-dakar': {
    viandes: 'citydia',
    volailles: 'citydia',
    poissons: 'citydia',
    fruits: 'citydia',
    legumes: 'citydia',
    'produits-laitiers': 'fromagerie-ndar',
    fromages: 'fromagerie-ndar',
    boulangerie: 'boulangerie-touba',
    charcuterie: 'boucherie-albaraka',
    epices: 'epices-teranga',
    'riz-cereales': 'citydia',
    huiles: 'epices-teranga',
    conserves: 'citydia',
    sauces: 'epices-teranga',
    sucres: 'rucher-saloum',
    'cafe-the': 'cave-dakar',
    boissons: 'cave-dakar',
    eau: 'cave-dakar',
    'miel-confitures': 'rucher-saloum',
    herbes: 'herboristerie-khady',
    'citrons-agrumes': 'orangerie-casamance',
    surgeles: 'citydia',
    'hygiene-beaute': 'citydia',
    'produits-menagers': 'promod',
    bebe: 'citydia',
    animaux: 'promod',
    snacks: 'citydia',
    'telephones-tablettes': 'techshop-dakar',
    'ordinateurs-accessoires': 'informatique-numerique',
    'audio-casques': 'sonorite-dakar',
    'tv-ecrans': 'electromall',
    'photo-video': 'photopro-dakar',
    'gaming-consoles': 'gamezone-dakar',
    electromenager: 'electromall',
    'chargeurs-cables': 'techshop-dakar',
    'stockage-memoires': 'informatique-numerique',
  },
  'auchan-almadies': {
    viandes: 'promod',
    volailles: 'promod',
    poissons: 'promod',
    fruits: 'orangerie-casamance',
    legumes: 'promod',
    'produits-laitiers': 'fromagerie-ndar',
    fromages: 'fromagerie-ndar',
    boulangerie: 'boulangerie-touba',
    charcuterie: 'boucherie-albaraka',
    epices: 'epices-teranga',
    'riz-cereales': 'promod',
    huiles: 'epices-teranga',
    conserves: 'promod',
    sauces: 'epices-teranga',
    sucres: 'rucher-saloum',
    'cafe-the': 'cave-dakar',
    boissons: 'cave-dakar',
    eau: 'cave-dakar',
    'miel-confitures': 'rucher-saloum',
    herbes: 'herboristerie-khady',
    'citrons-agrumes': 'orangerie-casamance',
    surgeles: 'promod',
    'hygiene-beaute': 'promod',
    'produits-menagers': 'promod',
    bebe: 'promod',
    animaux: 'promod',
    snacks: 'promod',
    'telephones-tablettes': 'techshop-dakar',
    'ordinateurs-accessoires': 'informatique-numerique',
    'audio-casques': 'sonorite-dakar',
    'tv-ecrans': 'electromall',
    'photo-video': 'photopro-dakar',
    'gaming-consoles': 'gamezone-dakar',
    electromenager: 'electromall',
    'chargeurs-cables': 'techshop-dakar',
    'stockage-memoires': 'informatique-numerique',
  },
}

function remapMerchantSlug(merchantSlug: string, categorySlug: string): string {
  const remap = AUCHAN_REMAP[merchantSlug]
  if (!remap) return merchantSlug
  return remap[categorySlug] || 'citydia'
}

export async function POST(request: Request) {
  try {
    // Support force re-seed via ?force=true
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

    // Create products (remap Auchan slugs to Senegalese merchants)
    let productCount = 0
    for (const prod of PRODUCTS) {
      const categoryId = categoryMap[prod.categorySlug]
      const effectiveMerchantSlug = remapMerchantSlug(prod.merchantSlug, prod.categorySlug)
      const merchantId = merchantMap[effectiveMerchantSlug]
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
      { email: 'albaraka@marche.sn', password: 'vendeur1', name: 'Boucherie Al Baraka', merchantSlug: 'boucherie-albaraka', plan: 'premium_plus', role: 'vendeur' },
      { email: 'ndiagane@marche.sn', password: 'vendeur2', name: 'Poissonnerie Ndiagane', merchantSlug: 'poissonnerie-ndiagane', plan: 'premium', role: 'vendeur' },
      { email: 'sahel@marche.sn', password: 'vendeur3', name: 'Jardin du Sahel', merchantSlug: 'jardin-sahel', plan: 'gratuit', role: 'vendeur' },
      { email: 'teranga@marche.sn', password: 'vendeur4', name: 'Épices Teranga', merchantSlug: 'epices-teranga', plan: 'premium', role: 'vendeur' },
      { email: 'saloum@marche.sn', password: 'vendeur5', name: 'Rucher du Saloum', merchantSlug: 'rucher-saloum', plan: 'gratuit', role: 'vendeur' },
      { email: 'citydia@marche.sn', password: 'citydia1', name: 'Citydia', merchantSlug: 'citydia', plan: 'premium_plus', role: 'vendeur' },
      { email: 'promod@marche.sn', password: 'promod1', name: 'Promod', merchantSlug: 'promod', plan: 'premium', role: 'vendeur' },
      // Comptes vendeurs électronique
      { email: 'techshop@dakar.sn', password: 'techshop1', name: 'TechShop Dakar', merchantSlug: 'techshop-dakar', plan: 'premium_plus', role: 'vendeur' },
      { email: 'informatique@dakar.sn', password: 'info1', name: 'Informatique Numérique', merchantSlug: 'informatique-numerique', plan: 'premium', role: 'vendeur' },
      { email: 'sonorite@dakar.sn', password: 'sono1', name: 'Sonorité Dakar', merchantSlug: 'sonorite-dakar', plan: 'premium', role: 'vendeur' },
      { email: 'electromall@dakar.sn', password: 'electro1', name: 'ÉlectroMall', merchantSlug: 'electromall', plan: 'premium_plus', role: 'vendeur' },
      { email: 'gamezone@dakar.sn', password: 'game1', name: 'GameZone Dakar', merchantSlug: 'gamezone-dakar', plan: 'premium', role: 'vendeur' },
      { email: 'photopro@dakar.sn', password: 'photo1', name: 'PhotoPro Dakar', merchantSlug: 'photopro-dakar', plan: 'premium', role: 'vendeur' },
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
          role: account.role,
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

    // Create test buyer accounts
    const buyerPassword = await hash('buyer1', 12)
    const buyerUser = await db.user.create({
      data: {
        email: 'acheteur@marche.sn',
        password: buyerPassword,
        name: 'Amadou Diallo',
        phone: '+221771234567',
        role: 'acheteur',
        image: '🧑',
      },
    })

    // Create default address for buyer
    await db.address.create({
      data: {
        userId: buyerUser.id,
        label: 'Maison',
        address: '45 Rue Carnot, Plateau',
        city: 'Dakar',
        phone: '+221771234567',
        isDefault: true,
        latitude: 14.6720,
        longitude: -17.4380,
      },
    })

    // Create second address for buyer
    await db.address.create({
      data: {
        userId: buyerUser.id,
        label: 'Bureau',
        address: '12 Avenue Lamine Gueye, Plateau',
        city: 'Dakar',
        phone: '+221781234567',
        isDefault: false,
        latitude: 14.6700,
        longitude: -17.4350,
      },
    })

    // Create welcome notification for buyer
    await db.notification.create({
      data: {
        userId: buyerUser.id,
        title: 'Bienvenue au Marché Royal ! 👑',
        message: 'Découvrez les meilleures offres de nos marchands. Ajoutez vos adresses de livraison et commencez vos achats.',
        type: 'systeme',
        read: false,
      },
    })

    // Create a second buyer account
    const buyer2Password = await hash('buyer2', 12)
    const buyer2User = await db.user.create({
      data: {
        email: 'fatou@marche.sn',
        password: buyer2Password,
        name: 'Fatou Ndiaye',
        phone: '+221787654321',
        role: 'acheteur',
        image: '👩',
      },
    })

    await db.address.create({
      data: {
        userId: buyer2User.id,
        label: 'Maison',
        address: '8 Rue Fann, Fann Hock',
        city: 'Dakar',
        phone: '+221787654321',
        isDefault: true,
        latitude: 14.6850,
        longitude: -17.4600,
      },
    })

    await db.notification.create({
      data: {
        userId: buyer2User.id,
        title: 'Bienvenue au Marché Royal ! 👑',
        message: 'Explorez les trésors de notre marché. Comparez les prix et trouvez les meilleures offres près de chez vous.',
        type: 'systeme',
        read: false,
      },
    })

    return NextResponse.json({
      message: 'Marché Royal ensemencé avec succès ! 🏪',
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
