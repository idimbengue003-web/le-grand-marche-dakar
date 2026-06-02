import { db } from '@/lib/db'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════════
// AUCHAN-STYLE COMPREHENSIVE CATEGORIES
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
]

// ═══════════════════════════════════════════════════════════════════════════════
// MERCHANTS (Including Auchan + existing + new)
// ═══════════════════════════════════════════════════════════════════════════════

const MERCHANTS = [
  // AUCHAN - Main hypermarket
  {
    name: 'Auchan Dakar',
    slug: 'auchan-dakar',
    description: 'Hypermarché Auchan — Tous vos produits du quotidien sous un même toit. Fraîcheur garantie, prix compétitifs.',
    image: '🔴',
    rating: 4.8,
    location: 'Plateau, Dakar',
    address: 'Place de l\'Indépendance, Dakar',
    latitude: 14.6720,
    longitude: -17.4380,
    specialty: 'Hypermarket — Tous rayons',
    banner: '#E30613',
  },
  {
    name: 'Auchan almadies',
    slug: 'auchan-almadies',
    description: 'Auchan Almadies — Votre supermarché de proximité, frais et accessible.',
    image: '🔴',
    rating: 4.7,
    location: 'Almadies, Dakar',
    address: '45 Route des Almadies, Dakar',
    latitude: 14.7167,
    longitude: -17.5167,
    specialty: 'Supermarché — Proximité',
    banner: '#E30613',
  },
  // EXISTING MERCHANTS
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
// COMPREHENSIVE AUCHAN-STYLE PRODUCT CATALOG (200+ products)
// All prices in FCFA
// ═══════════════════════════════════════════════════════════════════════════════

const PRODUCTS: ProductSeed[] = [
  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON VIANDES                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Bœuf Premium', description: 'Viande bovine de première qualité, fraîcheur du jour', price: 6500, unit: 'kg', image: '🥩', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Bœuf Premium', description: 'Bœuf de première qualité, coupé sur commande', price: 7000, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'auchan-dakar' },
  { name: 'Bœuf Premium', description: 'Viande bovine de qualité, maturée', price: 6000, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'auchan-almadies' },
  { name: 'Agneau Entier', description: 'Agneau frais, idéal pour les grandes occasions', price: 8500, unit: 'kg', image: '🍖', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Agneau Entier', description: 'Agneau entier, fraîcheur garantie', price: 8200, unit: 'kg', image: '🍖', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'auchan-dakar' },
  { name: 'Mouton Thieboudienne', description: 'Mouton coupé pour thieboudienne, portions généreuses', price: 5500, unit: 'kg', image: '🥓', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Veau Fermier', description: 'Veau de qualité, tendre et savoureux', price: 7500, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Dibi Chèvre', description: 'Chèvre pour dibi, coupure spéciale grillade', price: 4500, unit: 'kg', image: '🍖', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boucherie-albaraka' },
  { name: 'Viande Hachée Bœuf', description: 'Viande hachée 100% bœuf, fraîche', price: 4500, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'auchan-dakar' },
  { name: 'Steak Haché', description: 'Steak haché frais, 200g pièce', price: 1200, unit: 'pièce', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'auchan-dakar' },
  { name: 'Sauté de Porc', description: 'Sauté de porc, morceaux à braiser', price: 5000, unit: 'kg', image: '🍖', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'auchan-dakar' },
  { name: 'Côte de Bœuf', description: 'Côte de bœuf épaisse, parfaite pour le grill', price: 9500, unit: 'kg', image: '🥩', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'auchan-dakar' },
  { name: 'Foie de Bœuf', description: 'Foie de bœuf frais, riche en fer', price: 4000, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'auchan-almadies' },
  { name: 'Queue de Bœuf', description: 'Queue de bœuf pour ragoût et soupes', price: 3500, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'auchan-almadies' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON VOLAILLES                                                        ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Poulet Fermier', description: 'Poulet fermier élevé en liberté', price: 3500, unit: 'pièce', image: '🐔', inStock: true, featured: true, categorySlug: 'volailles', merchantSlug: 'boucherie-albaraka' },
  { name: 'Poulet Fermier', description: 'Poulet fermier frais, qualité supérieure', price: 3200, unit: 'pièce', image: '🐔', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'auchan-dakar' },
  { name: 'Poulet Fermier', description: 'Poulet fermier, élevé en plein air', price: 3400, unit: 'pièce', image: '🐔', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'auchan-almadies' },
  { name: 'Pintade', description: 'Pintade fraîche, goût authentique', price: 5000, unit: 'pièce', image: '🐦', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'boucherie-albaraka' },
  { name: 'Poulet Congelé', description: 'Poulet entier congelé, pratique et économique', price: 2500, unit: 'pièce', image: '🍗', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'auchan-dakar' },
  { name: 'Cuisses de Poulet', description: 'Cuisses de poulet fraîches, idéales pour le four', price: 3000, unit: 'kg', image: '🍗', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'auchan-dakar' },
  { name: 'Ailes de Poulet', description: 'Ailes de poulet pour grillades et fritures', price: 2500, unit: 'kg', image: '🍗', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'auchan-almadies' },
  { name: 'Dinde Entière', description: 'Dinde entière pour les grandes occasions', price: 8000, unit: 'pièce', image: '🦃', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'auchan-dakar' },
  { name: 'Filet de Poulet', description: 'Filet de poulet désossé, prêt à cuire', price: 4500, unit: 'kg', image: '🍗', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'auchan-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON POISSONS                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Thiof (Mérou)', description: 'Thiof frais pêché du jour, le poisson roi du Sénégal', price: 8000, unit: 'kg', image: '🐠', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Thiof (Mérou)', description: 'Thiof frais du jour, qualité supérieure', price: 9000, unit: 'kg', image: '🐠', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'auchan-dakar' },
  { name: 'Dorade Royale', description: 'Dorade fraîche, parfaite pour le grillage', price: 5500, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Carpe', description: 'Carpe fraîche du fleuve Sénégal', price: 3000, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Huîtres Mangroves', description: 'Huîtres des mangroves de Casamance', price: 5000, unit: 'douzaine', image: '🦪', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Crevettes Tigre', description: 'Crevettes tigre géantes, fraîches du jour', price: 12000, unit: 'kg', image: '🦐', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Crevettes Tigre', description: 'Crevettes tigre congelées, décortiquées', price: 11000, unit: 'kg', image: '🦐', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'auchan-dakar' },
  { name: 'Maquereau', description: 'Maquereau frais, riche en oméga-3', price: 3500, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'auchan-dakar' },
  { name: 'Sardines Fraîches', description: 'Sardines fraîches du jour, 6-8 pièces', price: 2000, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },
  { name: 'Poulpe', description: 'Poulpe frais, idéal pour le yassa', price: 7000, unit: 'kg', image: '🐙', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'auchan-almadies' },
  { name: 'Cabillaud', description: 'Cabillaud frais, chair fine et délicate', price: 9500, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'auchan-dakar' },
  { name: 'Bar de Ligne', description: 'Bar pêché à la ligne, qualité extra', price: 10000, unit: 'kg', image: '🐟', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-ndiagane' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON FRUITS                                                            ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Mangues Kent', description: 'Mangues Kent juteuses du Casamance', price: 1500, unit: 'kg', image: '🥭', inStock: true, featured: true, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Mangues Kent', description: 'Mangues Kent bio, très juteuses', price: 1800, unit: 'kg', image: '🥭', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-dakar' },
  { name: 'Papayes', description: 'Papayes mûres et sucrées', price: 800, unit: 'pièce', image: '🍈', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Bananes Plantain', description: 'Bananes plantain pour friture ou purée', price: 1000, unit: 'régime', image: '🍌', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Oranges Sénégal', description: 'Oranges juteuses de la région de Thiès', price: 1200, unit: 'kg', image: '🍊', inStock: true, featured: true, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Oranges Sénégal', description: 'Oranges douces de Thiès', price: 1000, unit: 'kg', image: '🍊', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-dakar' },
  { name: 'Ananas', description: 'Ananas frais de la Petite Côte', price: 1500, unit: 'pièce', image: '🍍', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardin-sahel' },
  { name: 'Pastèque', description: 'Pastèque rouge et juteuse', price: 2000, unit: 'pièce', image: '🍉', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-dakar' },
  { name: 'Raisins', description: 'Raisins blancs ou noirs, importés', price: 3500, unit: 'kg', image: '🍇', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-dakar' },
  { name: 'Pommes Golden', description: 'Pommes Golden importées, croquantes', price: 3000, unit: 'kg', image: '🍎', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-dakar' },
  { name: 'Fraises', description: 'Fraises fraîches, parfumées', price: 4000, unit: 'barquette', image: '🍓', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-almadies' },
  { name: 'Avocats', description: 'Avocats mûrs, parfaits pour les salades', price: 1500, unit: 'pièce', image: '🥑', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-dakar' },
  { name: 'Melon', description: 'Melon charentais, sucré et parfumé', price: 1800, unit: 'pièce', image: '🍈', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-almadies' },
  { name: 'Kiwis', description: 'Kiwis verts, riches en vitamine C', price: 3000, unit: 'kg', image: '🥝', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-dakar' },
  { name: 'Bananes', description: 'Bananes jaunes, prêtes à consommer', price: 1200, unit: 'kg', image: '🍌', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-dakar' },
  { name: 'Cerises', description: 'Cerises fraîches, importées', price: 5000, unit: 'kg', image: '🍒', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'auchan-almadies' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON LÉGUMES                                                           ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Tomates', description: 'Tomates fraîches et charnues', price: 800, unit: 'kg', image: '🍅', inStock: true, featured: true, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Tomates', description: 'Tomates fraîches du marché', price: 700, unit: 'kg', image: '🍅', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Oignons', description: 'Oignons violets de la région', price: 600, unit: 'kg', image: '🧅', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Oignons', description: 'Oignons secs, calibre moyen', price: 500, unit: 'kg', image: '🧅', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Manioc', description: 'Manioc frais, base de la cuisine sénégalaise', price: 500, unit: 'kg', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Niébé', description: 'Niébé (haricots) de qualité', price: 1200, unit: 'kg', image: '🫘', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Pommes de Terre', description: 'Pommes de terre, idéales pour frites et purée', price: 700, unit: 'kg', image: '🥔', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Carottes', description: 'Carottes fraîches, croquantes et sucrées', price: 600, unit: 'kg', image: '🥕', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Poivrons', description: 'Poivrons rouges, verts et jaunes', price: 1500, unit: 'kg', image: '🫑', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Aubergines', description: 'Aubergines violettes, charnues', price: 1000, unit: 'kg', image: '🍆', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-almadies' },
  { name: 'Chou', description: 'Chou vert, frais et croquant', price: 500, unit: 'pièce', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Concombre', description: 'Concombre frais, parfait pour les salades', price: 400, unit: 'pièce', image: '🥒', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Salade', description: 'Laitue fraîche, cultivée localement', price: 500, unit: 'pièce', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Courgettes', description: 'Courgettes vertes, tendres', price: 800, unit: 'kg', image: '🥒', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Gombo', description: 'Gombo frais, légume traditionnel', price: 900, unit: 'kg', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },
  { name: 'Ail', description: 'Ail frais, tête entière', price: 1500, unit: 'kg', image: '🧄', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Gingembre', description: 'Gingembre frais, racine entière', price: 2000, unit: 'kg', image: '🫚', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'auchan-dakar' },
  { name: 'Piment Frais', description: 'Piment frais, pour les amateurs de relevé', price: 1000, unit: 'kg', image: '🌶️', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardin-sahel' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON PRODUITS LAITIERS                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Lait Entier UHT', description: 'Lait entier UHT 1L, longue conservation', price: 800, unit: 'bouteille 1L', image: '🥛', inStock: true, featured: true, categorySlug: 'produits-laitiers', merchantSlug: 'auchan-dakar' },
  { name: 'Lait Demi-Écrémé', description: 'Lait demi-écrémé UHT 1L', price: 750, unit: 'bouteille 1L', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'auchan-almadies' },
  { name: 'Lait en Poudre', description: 'Lait en poudre Nestlé, 400g', price: 3500, unit: 'boîte 400g', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'auchan-dakar' },
  { name: 'Yaourt Nature', description: 'Yaourt nature, pack de 4', price: 800, unit: 'pack 4', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'auchan-dakar' },
  { name: 'Yaourt aux Fruits', description: 'Yaourt aux fruits, pack de 6', price: 1200, unit: 'pack 6', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'auchan-dakar' },
  { name: 'Beurre Doux', description: 'Beurre doux 250g, barquette', price: 1500, unit: 'barquette 250g', image: '🧈', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'auchan-dakar' },
  { name: 'Beurre Salé', description: 'Beurre salé 250g, barquette', price: 1500, unit: 'barquette 250g', image: '🧈', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'auchan-almadies' },
  { name: 'Crème Fraîche', description: 'Crème fraîche épaisse 20cl', price: 900, unit: 'pot 20cl', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'auchan-dakar' },
  { name: 'Fromage Blanc', description: 'Fromage blanc 0% mg, pot 500g', price: 1200, unit: 'pot 500g', image: '🧀', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'auchan-dakar' },
  { name: 'Lait Caillé', description: 'Lait caillé traditionnel sénégalais', price: 500, unit: 'pot', image: '🥛', inStock: true, featured: false, categorySlug: 'produits-laitiers', merchantSlug: 'fromagerie-ndar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON FROMAGES                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Fromage Wagashi', description: 'Fromage traditionnel du Sénégal', price: 2000, unit: 'pièce', image: '🧀', inStock: true, featured: true, categorySlug: 'fromages', merchantSlug: 'fromagerie-ndar' },
  { name: 'Fromage Frais', description: 'Fromage frais local, crémeux', price: 1500, unit: 'pièce', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'fromagerie-ndar' },
  { name: 'Emmental', description: 'Emmental râpé, sachet 200g', price: 2500, unit: 'sachet 200g', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'auchan-dakar' },
  { name: 'Camembert', description: 'Camembert affiné, boîte', price: 2000, unit: 'pièce', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'auchan-dakar' },
  { name: 'Gouda', description: 'Gouda tranché, paquet 150g', price: 1800, unit: 'paquet 150g', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'auchan-almadies' },
  { name: 'Mozzarella', description: 'Mozzarella fraîche, boule 125g', price: 1500, unit: 'boule 125g', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'auchan-dakar' },
  { name: 'Cheddar', description: 'Cheddar affiné, bloc 200g', price: 2200, unit: 'bloc 200g', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'auchan-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON BOULANGERIE                                                       ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Pain Complet', description: 'Pain complet au levain naturel', price: 300, unit: 'pièce', image: '🍞', inStock: true, featured: true, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Baguette', description: 'Baguette traditionnelle croustillante', price: 150, unit: 'pièce', image: '🥖', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Baguette', description: 'Baguette tradition, croustillante', price: 200, unit: 'pièce', image: '🥖', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'auchan-dakar' },
  { name: 'Croissant', description: 'Croissant au beurre, doré et croustillant', price: 200, unit: 'pièce', image: '🥐', inStock: true, featured: true, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Pain de Mie', description: 'Pain de mie tranché, paquet', price: 1000, unit: 'paquet', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'auchan-dakar' },
  { name: 'Pain aux Céréales', description: 'Pain multi-céréales, riche en fibres', price: 500, unit: 'pièce', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'auchan-dakar' },
  { name: 'Brioche', description: 'Brioche moelleuse, tranchée', price: 1500, unit: 'paquet', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'auchan-almadies' },
  { name: 'Gâteau Chocolat', description: 'Gâteau au chocolat, part individuelle', price: 800, unit: 'pièce', image: '🍰', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },
  { name: 'Tarte aux Fruits', description: 'Tarte aux fruits de saison', price: 2500, unit: 'pièce', image: '🥧', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-touba' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON CHARCUTERIE                                                       ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Jambon Blanc', description: 'Jambon blanc tranché, paquet 150g', price: 2000, unit: 'paquet 150g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'auchan-dakar' },
  { name: 'Jambon de Dinde', description: 'Jambon de dinde tranché, paquet 150g', price: 1500, unit: 'paquet 150g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'auchan-dakar' },
  { name: 'Saucisson Sec', description: 'Saucisson sec traditionnel', price: 3000, unit: 'pièce', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'auchan-dakar' },
  { name: 'Merguez', description: 'Saucisses merguez épicées, 6 pièces', price: 2500, unit: 'barquette', image: '🌭', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'auchan-almadies' },
  { name: 'Pâté', description: 'Pâté de campagne, boîte 200g', price: 1800, unit: 'boîte 200g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'auchan-dakar' },
  { name: 'Salami', description: 'Salami tranché, paquet 100g', price: 2000, unit: 'paquet 100g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'auchan-dakar' },
  { name: 'Bacon', description: 'Bacon fumé, tranches fines', price: 2500, unit: 'paquet 150g', image: '🥓', inStock: true, featured: false, categorySlug: 'charcuterie', merchantSlug: 'auchan-almadies' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON ÉPICES                                                            ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Poivre de Penja', description: 'Poivre noir de Penja, le meilleur d\'Afrique', price: 8000, unit: '100g', image: '🌶️', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Mélange Kolda', description: 'Mélange d\'épices traditionnel de Kolda', price: 3500, unit: '100g', image: '🏺', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Piment Capsicum', description: 'Piment fort séché, pour les amateurs', price: 2000, unit: '50g', image: '🌶️', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Sel de Guérande', description: 'Sel fin importé, qualité supérieure', price: 1500, unit: '500g', image: '🧂', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'epices-teranga' },
  { name: 'Curry en Poudre', description: 'Curry en poudre, sachet 100g', price: 1500, unit: '100g', image: '🍛', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'auchan-dakar' },
  { name: 'Cumin', description: 'Cumin en poudre, sachet 50g', price: 1200, unit: '50g', image: '🏺', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'auchan-dakar' },
  { name: 'Cannelle', description: 'Cannelle en poudre, sachet 50g', price: 1500, unit: '50g', image: '🫙', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'auchan-almadies' },
  { name: 'Muscade', description: 'Muscade en poudre, sachet 30g', price: 1000, unit: '30g', image: '🏺', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'auchan-dakar' },
  { name: 'Cube Maggi', description: 'Cubes Maggi assaisonnés, boîte de 24', price: 1500, unit: 'boîte 24', image: '🧊', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'auchan-dakar' },
  { name: 'Ail en Poudre', description: 'Ail déshydraté en poudre, 50g', price: 800, unit: '50g', image: '🧄', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'auchan-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON RIZ & CÉRÉALES                                                    ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Riz Basmati', description: 'Riz basmati premium, grains longs, 5kg', price: 5500, unit: 'sac 5kg', image: '🌾', inStock: true, featured: true, categorySlug: 'riz-cereales', merchantSlug: 'auchan-dakar' },
  { name: 'Riz Brisé', description: 'Riz brisé de qualité, sac 5kg', price: 3500, unit: 'sac 5kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'auchan-dakar' },
  { name: 'Riz Parfumé', description: 'Riz parfumé du Sénégal, sac 5kg', price: 4500, unit: 'sac 5kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'auchan-almadies' },
  { name: 'Mil', description: 'Mil local pour couscous et bouillie, 2kg', price: 1500, unit: 'sac 2kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'auchan-dakar' },
  { name: 'Couscous de Mil', description: 'Couscous de mil traditionnel, 1kg', price: 1000, unit: 'sac 1kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'epices-teranga' },
  { name: 'Maïs', description: 'Maïs en grains, 1kg', price: 800, unit: 'sac 1kg', image: '🌽', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'auchan-dakar' },
  { name: 'Semoule de Blé', description: 'Semoule de blé fine, 1kg', price: 900, unit: 'sac 1kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'auchan-dakar' },
  { name: 'Farine de Blé', description: 'Farine de blé tout usage, 1kg', price: 700, unit: 'sac 1kg', image: '🌾', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'auchan-almadies' },
  { name: 'Avoine', description: 'Flocons d\'avoine, 500g', price: 1500, unit: 'paquet 500g', image: '🥣', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'auchan-dakar' },
  { name: 'Cornflakes', description: 'Céréales cornflakes, 375g', price: 2000, unit: 'paquet 375g', image: '🥣', inStock: true, featured: false, categorySlug: 'riz-cereales', merchantSlug: 'auchan-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON HUILES & GRAISSES                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Huile d\'Arachide', description: 'Huile d\'arachide pure, bouteille 1L', price: 2000, unit: 'bouteille 1L', image: '🫒', inStock: true, featured: true, categorySlug: 'huiles', merchantSlug: 'auchan-dakar' },
  { name: 'Huile d\'Arachide', description: 'Huile d\'arachide Premium, 5L', price: 9000, unit: 'bidon 5L', image: '🫒', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'auchan-almadies' },
  { name: 'Huile de Tournesol', description: 'Huile de tournesol, bouteille 1L', price: 1800, unit: 'bouteille 1L', image: '🌻', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'auchan-dakar' },
  { name: 'Huile d\'Olive', description: 'Huile d\'olive extra vierge, 75cl', price: 5000, unit: 'bouteille 75cl', image: '🫒', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'auchan-dakar' },
  { name: 'Margarine', description: 'Margarine pour cuisson, 500g', price: 1200, unit: 'pot 500g', image: '🧈', inStock: true, featured: false, categorySlug: 'huiles', merchantSlug: 'auchan-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON CONSERVES                                                         ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Tomates Pelées', description: 'Tomates pelées en conserve, 400g', price: 600, unit: 'boîte 400g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'auchan-dakar' },
  { name: 'Concentré de Tomates', description: 'Concentré de tomates double, 70g', price: 300, unit: 'tube 70g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'auchan-dakar' },
  { name: 'Thon en Boîte', description: 'Thon au naturel, boîte 140g', price: 1000, unit: 'boîte 140g', image: '🥫', inStock: true, featured: true, categorySlug: 'conserves', merchantSlug: 'auchan-dakar' },
  { name: 'Sardines à l\'Huile', description: 'Sardines à l\'huile, boîte 125g', price: 700, unit: 'boîte 125g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'auchan-dakar' },
  { name: 'Haricots Blancs', description: 'Haricots blancs en conserve, 400g', price: 800, unit: 'boîte 400g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'auchan-almadies' },
  { name: 'Petits Pois', description: 'Petits pois carottes, boîte 400g', price: 700, unit: 'boîte 400g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'auchan-dakar' },
  { name: 'Maïs Doux', description: 'Maïs doux en conserve, 340g', price: 600, unit: 'boîte 340g', image: '🥫', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'auchan-dakar' },
  { name: 'Champignons', description: 'Champignons de Paris entiers, 400g', price: 1200, unit: 'boîte 400g', image: '🍄', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'auchan-dakar' },
  { name: 'Lait de Coco', description: 'Lait de coco, boîte 400ml', price: 1000, unit: 'boîte 400ml', image: '🥥', inStock: true, featured: false, categorySlug: 'conserves', merchantSlug: 'auchan-almadies' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON SAUCES & CONDIMENTS                                               ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Moutarde Dijon', description: 'Moutarde de Dijon, pot 200g', price: 1200, unit: 'pot 200g', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'auchan-dakar' },
  { name: 'Ketchup', description: 'Sauce ketchup, bouteille 500g', price: 1000, unit: 'bouteille 500g', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'auchan-dakar' },
  { name: 'Mayonnaise', description: 'Mayonnaise, pot 250g', price: 1200, unit: 'pot 250g', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'auchan-dakar' },
  { name: 'Sauce Soja', description: 'Sauce soja, bouteille 250ml', price: 1500, unit: 'bouteille 250ml', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'auchan-almadies' },
  { name: 'Vinaigre', description: 'Vinaigre de vin, bouteille 75cl', price: 800, unit: 'bouteille 75cl', image: '🧴', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'auchan-dakar' },
  { name: 'Sauce Piquante', description: 'Sauce piquante africaine, bouteille 250ml', price: 1500, unit: 'bouteille 250ml', image: '🌶️', inStock: true, featured: false, categorySlug: 'sauces', merchantSlug: 'epices-teranga' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON SUCRES & CONFISERIES                                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Sucre en Poudre', description: 'Sucre en poudre, 1kg', price: 800, unit: 'sac 1kg', image: '🍬', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'auchan-dakar' },
  { name: 'Sucre en Morceaux', description: 'Sucre en morceaux, 1kg', price: 900, unit: 'boîte 1kg', image: '🍬', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'auchan-dakar' },
  { name: 'Chocolat Noir', description: 'Tablette de chocolat noir 70%, 100g', price: 1500, unit: 'tablette 100g', image: '🍫', inStock: true, featured: true, categorySlug: 'sucres', merchantSlug: 'auchan-dakar' },
  { name: 'Chocolat au Lait', description: 'Tablette de chocolat au lait, 100g', price: 1200, unit: 'tablette 100g', image: '🍫', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'auchan-almadies' },
  { name: 'Bonbons Mix', description: 'Assortiment de bonbons, 200g', price: 800, unit: 'sachet 200g', image: '🍬', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'auchan-dakar' },
  { name: 'Cacao en Poudre', description: 'Cacao en poudre non sucré, 250g', price: 2500, unit: 'boîte 250g', image: '🍫', inStock: true, featured: false, categorySlug: 'sucres', merchantSlug: 'auchan-dakar' },
  { name: 'Nutella', description: 'Pâte à tartiner Nutella, pot 400g', price: 3500, unit: 'pot 400g', image: '🍫', inStock: true, featured: true, categorySlug: 'sucres', merchantSlug: 'auchan-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON CAFÉ & THÉ                                                        ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Café Moulu', description: 'Café moulu tradition, paquet 250g', price: 2500, unit: 'paquet 250g', image: '☕', inStock: true, featured: true, categorySlug: 'cafe-the', merchantSlug: 'auchan-dakar' },
  { name: 'Café Instantané', description: 'Café soluble Nescafé, 200g', price: 3000, unit: 'boîte 200g', image: '☕', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'auchan-dakar' },
  { name: 'Café en Grains', description: 'Café en grains, torréfié, 500g', price: 4000, unit: 'paquet 500g', image: '☕', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'auchan-almadies' },
  { name: 'Thé Vert', description: 'Thé vert Gunpowder, 200g', price: 1500, unit: 'boîte 200g', image: '🍵', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'auchan-dakar' },
  { name: 'Ataya (Thé)', description: 'Thé à la menthe traditionnel sénégalais', price: 300, unit: 'sachet', image: '🍵', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'cave-dakar' },
  { name: 'Tisane Kinkéliba', description: 'Tisane de kinkéliba, 20 sachets', price: 1200, unit: 'boîte 20', image: '🍵', inStock: true, featured: false, categorySlug: 'cafe-the', merchantSlug: 'herboristerie-khady' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON BOISSONS                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Jus de Bissap', description: 'Jus de bissap frais maison', price: 500, unit: 'bouteille 1L', image: '🍷', inStock: true, featured: true, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Jus de Bissap', description: 'Bissap rouge frais et naturel', price: 450, unit: 'bouteille 1L', image: '🍷', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'auchan-dakar' },
  { name: 'Jus de Bouye', description: 'Jus de bouye (pain de singe) traditionnel', price: 600, unit: 'bouteille 1L', image: '🍹', inStock: true, featured: true, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Jus de Bouye', description: 'Bouye traditionnel, goût authentique', price: 500, unit: 'bouteille 1L', image: '🍹', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'auchan-dakar' },
  { name: 'Jus de Gingembre', description: 'Jus de gingembre pimenté, rafraîchissant', price: 500, unit: 'bouteille 1L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Jus de Mangue', description: 'Jus de mangue naturel, 1L', price: 800, unit: 'bouteille 1L', image: '🥭', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'auchan-dakar' },
  { name: 'Jus d\'Orange', description: 'Jus d\'orange pur jus, 1L', price: 1200, unit: 'bouteille 1L', image: '🍊', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'auchan-dakar' },
  { name: 'Coca-Cola', description: 'Coca-Cola, bouteille 1.5L', price: 1000, unit: 'bouteille 1.5L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'auchan-dakar' },
  { name: 'Fanta Orange', description: 'Fanta orange, bouteille 1.5L', price: 1000, unit: 'bouteille 1.5L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'auchan-almadies' },
  { name: 'Sprite', description: 'Sprite citron, bouteille 1.5L', price: 1000, unit: 'bouteille 1.5L', image: '🥤', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'auchan-dakar' },
  { name: 'Bière Flag', description: 'Bière Flag, canette 33cl', price: 800, unit: 'canette 33cl', image: '🍺', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },
  { name: 'Vin Rouge', description: 'Vin rouge de table, 75cl', price: 3500, unit: 'bouteille 75cl', image: '🍷', inStock: true, featured: false, categorySlug: 'boissons', merchantSlug: 'cave-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON EAU                                                               ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Eau Minérale Kirene', description: 'Eau minérale Kirene, bouteille 1.5L', price: 400, unit: 'bouteille 1.5L', image: '💧', inStock: true, featured: true, categorySlug: 'eau', merchantSlug: 'auchan-dakar' },
  { name: 'Eau Minérale Kirene', description: 'Eau Kirene, pack de 6 bouteilles 1.5L', price: 2200, unit: 'pack 6x1.5L', image: '💧', inStock: true, featured: false, categorySlug: 'eau', merchantSlug: 'auchan-dakar' },
  { name: 'Eau Minérale Gainde', description: 'Eau minérale Gainde, bouteille 1.5L', price: 350, unit: 'bouteille 1.5L', image: '💧', inStock: true, featured: false, categorySlug: 'eau', merchantSlug: 'auchan-almadies' },
  { name: 'Eau Gazeuse', description: 'Eau gazeuse Perrier, 75cl', price: 1200, unit: 'bouteille 75cl', image: '💧', inStock: true, featured: false, categorySlug: 'eau', merchantSlug: 'auchan-dakar' },
  { name: 'Eau Source', description: 'Eau de source, bouteille 5L', price: 800, unit: 'bouteille 5L', image: '💧', inStock: true, featured: false, categorySlug: 'eau', merchantSlug: 'auchan-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON MIEL & CONFITURES                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Miel du Saloum', description: 'Miel naturel du Sine-Saloum, pur et parfumé', price: 5000, unit: 'pot 500g', image: '🍯', inStock: true, featured: true, categorySlug: 'miel-confitures', merchantSlug: 'rucher-saloum' },
  { name: 'Miel du Saloum', description: 'Miel naturel pur, récolté artisanalement', price: 5500, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'auchan-dakar' },
  { name: 'Miel de Palme', description: 'Miel de palme traditionnel', price: 3500, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'rucher-saloum' },
  { name: 'Miel de Palme', description: 'Miel de palme de la Casamance', price: 4000, unit: 'pot 500g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'herboristerie-khady' },
  { name: 'Confiture de Baobab', description: 'Confiture artisanale au fruit de baobab', price: 2500, unit: 'pot 300g', image: '🫙', inStock: true, featured: true, categorySlug: 'miel-confitures', merchantSlug: 'rucher-saloum' },
  { name: 'Confiture de Mangue', description: 'Confiture de mangue artisanale, pot 300g', price: 2200, unit: 'pot 300g', image: '🫙', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'auchan-dakar' },
  { name: 'Confiture Fraise', description: 'Confiture de fraise, pot 370g', price: 2000, unit: 'pot 370g', image: '🫙', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'auchan-almadies' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON HERBES AROMATIQUES                                                ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Kinkéliba', description: 'Kinkéliba séché, plante médicinale traditionnelle', price: 1000, unit: 'sachet 50g', image: '🌿', inStock: true, featured: true, categorySlug: 'herbes', merchantSlug: 'herboristerie-khady' },
  { name: 'Moringa', description: 'Moringa en poudre, super-aliment sénégalais', price: 2500, unit: 'sachet 100g', image: '🍃', inStock: true, featured: true, categorySlug: 'herbes', merchantSlug: 'herboristerie-khady' },
  { name: 'Moringa', description: 'Poudre de moringa bio', price: 3000, unit: 'sachet 100g', image: '🍃', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'auchan-dakar' },
  { name: 'Bouquet Garni', description: 'Mélange d\'herbes fraîches pour la cuisine', price: 500, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'herboristerie-khady' },
  { name: 'Persil', description: 'Persil frais, bouquet', price: 200, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'auchan-dakar' },
  { name: 'Menthe Fraîche', description: 'Menthe fraîche, bouquet', price: 200, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'auchan-dakar' },
  { name: 'Coriandre', description: 'Coriandre fraîche, bouquet', price: 200, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'auchan-almadies' },
  { name: 'Thym', description: 'Thym séché, sachet 20g', price: 500, unit: 'sachet 20g', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'auchan-dakar' },
  { name: 'Laurier', description: 'Feuilles de laurier séchées, 10g', price: 400, unit: 'sachet 10g', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'auchan-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON CITRONS & AGRUMES                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Citrons Verts', description: 'Citrons verts frais pour la cuisine et les jus', price: 800, unit: 'kg', image: '🍋', inStock: true, featured: true, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-casamance' },
  { name: 'Citrons Verts', description: 'Citrons verts pour assaisonnement', price: 1000, unit: 'kg', image: '🍋', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'auchan-dakar' },
  { name: 'Tangerines', description: 'Tangerines de Casamance, sucrées et juteuses', price: 1500, unit: 'kg', image: '🍊', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-casamance' },
  { name: 'Citrons Jaunes', description: 'Citrons jaunes, 3 pièces', price: 500, unit: 'filet 3', image: '🍋', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'auchan-dakar' },
  { name: 'Pamplemousse', description: 'Pamplemousse rose, 2 pièces', price: 800, unit: 'sachet 2', image: '🍊', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'auchan-almadies' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON SURGELÉS                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Poisson Pané', description: 'Bâtonnets de poisson pané, 400g', price: 2500, unit: 'sachet 400g', image: '🐟', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'auchan-dakar' },
  { name: 'Poulet Pané', description: 'Nuggets de poulet, 400g', price: 3000, unit: 'sachet 400g', image: '🍗', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'auchan-dakar' },
  { name: 'Frites Surgelées', description: 'Frites allumettes, 1kg', price: 2000, unit: 'sachet 1kg', image: '🍟', inStock: true, featured: true, categorySlug: 'surgeles', merchantSlug: 'auchan-dakar' },
  { name: 'Légumes Surgelés', description: 'Mélange de légumes, 750g', price: 1800, unit: 'sachet 750g', image: '🥬', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'auchan-dakar' },
  { name: 'Pizza Surgelée', description: 'Pizza fromage, 350g', price: 2500, unit: 'pièce', image: '🍕', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'auchan-almadies' },
  { name: 'Glace Vanille', description: 'Glace vanille, pot 1L', price: 3500, unit: 'pot 1L', image: '🍦', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'auchan-dakar' },
  { name: 'Glace Chocolat', description: 'Glace chocolat, pot 1L', price: 3500, unit: 'pot 1L', image: '🍨', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'auchan-dakar' },
  { name: 'Crevettes Surgelées', description: 'Crevettes décortiquées surgelées, 500g', price: 6000, unit: 'sachet 500g', image: '🦐', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'auchan-dakar' },
  { name: 'Épinards Surgelés', description: 'Épinards hachés surgelés, 750g', price: 1500, unit: 'sachet 750g', image: '🥬', inStock: true, featured: false, categorySlug: 'surgeles', merchantSlug: 'auchan-almadies' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON HYGIÈNE & BEAUTÉ                                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Savon de Marseille', description: 'Savon de Marseille traditionnel, 125g', price: 500, unit: 'pièce', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'auchan-dakar' },
  { name: 'Gel Douche', description: 'Gel douche hydratant, 400ml', price: 1500, unit: 'flacon 400ml', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'auchan-dakar' },
  { name: 'Shampoing', description: 'Shampoing normal, 250ml', price: 2000, unit: 'flacon 250ml', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'auchan-dakar' },
  { name: 'Dentifrice', description: 'Dentifrice menthe, 75ml', price: 1000, unit: 'tube 75ml', image: '🪥', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'auchan-dakar' },
  { name: 'Déodorant', description: 'Déodorant roll-on, 50ml', price: 1500, unit: 'flacon 50ml', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'auchan-almadies' },
  { name: 'Crème Hydratante', description: 'Crème hydratante visage, 50ml', price: 2500, unit: 'pot 50ml', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'auchan-dakar' },
  { name: 'Papier Toilette', description: 'Papier toilette, pack de 6 rouleaux', price: 2000, unit: 'pack 6', image: '🧻', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'auchan-dakar' },
  { name: 'Mouchoirs', description: 'Mouchoirs, pack de 6 pochettes', price: 1200, unit: 'pack 6', image: '🤧', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'auchan-dakar' },
  { name: 'Savon Noir', description: 'Savon noir traditionnel africain', price: 800, unit: 'pièce', image: '🧴', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'herboristerie-khady' },
  { name: 'Huile de Coco', description: 'Huile de coco vierge pour soin, 250ml', price: 3000, unit: 'bouteille 250ml', image: '🥥', inStock: true, featured: false, categorySlug: 'hygiene-beaute', merchantSlug: 'auchan-dakar' },
  { name: 'Beurre de Karité', description: 'Beurre de karité pur, 200g', price: 2500, unit: 'pot 200g', image: '🧴', inStock: true, featured: true, categorySlug: 'hygiene-beaute', merchantSlug: 'herboristerie-khady' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON PRODUITS MÉNAGERS                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Lessive Liquide', description: 'Lessive liquide, 2L', price: 3000, unit: 'bidon 2L', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-dakar' },
  { name: 'Lessive Poudre', description: 'Lessive en poudre, 1kg', price: 2000, unit: 'sac 1kg', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-dakar' },
  { name: 'Eau de Javel', description: 'Eau de Javel, bouteille 1L', price: 500, unit: 'bouteille 1L', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-dakar' },
  { name: 'Nettoyant Multi-Usage', description: 'Nettoyant multi-usages, 750ml', price: 1200, unit: 'flacon 750ml', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-dakar' },
  { name: 'Nettoyant Sol', description: 'Nettoyant sols parfumé, 1L', price: 1500, unit: 'bouteille 1L', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-almadies' },
  { name: 'Liquide Vaisselle', description: 'Liquide vaisselle, 750ml', price: 1000, unit: 'flacon 750ml', image: '🧽', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-dakar' },
  { name: 'Éponges', description: 'Éponges grattoirs, pack de 3', price: 500, unit: 'pack 3', image: '🧽', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-dakar' },
  { name: 'Sacs Poubelle', description: 'Sacs poubelle 50L, pack de 10', price: 1500, unit: 'pack 10', image: '🗑️', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-dakar' },
  { name: 'Désodorisant', description: 'Désodorisant maison, 300ml', price: 1500, unit: 'spray 300ml', image: '🧹', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-dakar' },
  { name: 'Insecticide', description: 'Insecticide spray, 400ml', price: 2000, unit: 'spray 400ml', image: '🦟', inStock: true, featured: false, categorySlug: 'produits-menagers', merchantSlug: 'auchan-almadies' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON BÉBÉ & PUÉRICULTURE                                               ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Lait Infantile 1er Âge', description: 'Lait infantile 1er âge, 900g', price: 6000, unit: 'boîte 900g', image: '🍼', inStock: true, featured: true, categorySlug: 'bebe', merchantSlug: 'auchan-dakar' },
  { name: 'Lait Infantile 2e Âge', description: 'Lait infantile 2e âge, 900g', price: 5500, unit: 'boîte 900g', image: '🍼', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'auchan-dakar' },
  { name: 'Couches Taille 3', description: 'Couches bébé taille 3, pack de 44', price: 6000, unit: 'pack 44', image: '🧷', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'auchan-dakar' },
  { name: 'Couches Taille 4', description: 'Couches bébé taille 4, pack de 38', price: 6500, unit: 'pack 38', image: '🧷', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'auchan-almadies' },
  { name: 'Petits Pots Légumes', description: 'Petits pots légumes variés, 2x130g', price: 1500, unit: 'pack 2', image: '🍼', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'auchan-dakar' },
  { name: 'Bibelé Lait', description: 'Céréales infantiles, 400g', price: 3000, unit: 'boîte 400g', image: '🍼', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'auchan-dakar' },
  { name: 'Lingettes Bébé', description: 'Lingettes bébé douces, pack de 60', price: 2000, unit: 'pack 60', image: '🧷', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'auchan-dakar' },
  { name: 'Crème Bébé', description: 'Crème change bébé, 100ml', price: 1800, unit: 'tube 100ml', image: '🍼', inStock: true, featured: false, categorySlug: 'bebe', merchantSlug: 'auchan-almadies' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON ANIMAUX                                                           ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Croquettes Chat', description: 'Croquettes pour chat adulte, 1.5kg', price: 4500, unit: 'sac 1.5kg', image: '🐱', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'auchan-dakar' },
  { name: 'Croquettes Chien', description: 'Croquettes pour chien adulte, 3kg', price: 5500, unit: 'sac 3kg', image: '🐕', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'auchan-dakar' },
  { name: 'Pâtée Chat', description: 'Pâtée pour chat, 400g', price: 1200, unit: 'boîte 400g', image: '🐱', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'auchan-almadies' },
  { name: 'Pâtée Chien', description: 'Pâtée pour chien, 800g', price: 1500, unit: 'boîte 800g', image: '🐕', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'auchan-dakar' },
  { name: 'Litière Chat', description: 'Litière agglomérante, 5L', price: 3500, unit: 'sac 5L', image: '🐾', inStock: true, featured: false, categorySlug: 'animaux', merchantSlug: 'auchan-dakar' },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║ RAYON SNACKS & BISCUITS                                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  { name: 'Biscuits Petit Beurre', description: 'Biscuits petit beurre, paquet 400g', price: 1000, unit: 'paquet 400g', image: '🍪', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'auchan-dakar' },
  { name: 'Chips Classiques', description: 'Chips de pomme de terre, 150g', price: 800, unit: 'sachet 150g', image: '🥔', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'auchan-dakar' },
  { name: 'Chips Saveur', description: 'Chips assaisonnées, 150g', price: 900, unit: 'sachet 150g', image: '🥔', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'auchan-almadies' },
  { name: 'Biscuits Chocolat', description: 'Biscuits au chocolat, 200g', price: 1200, unit: 'paquet 200g', image: '🍪', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'auchan-dakar' },
  { name: 'Barres Céréalières', description: 'Barres de céréales, pack de 6', price: 1500, unit: 'pack 6', image: '🍫', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'auchan-dakar' },
  { name: 'Cacahuètes', description: 'Cacahuètes grillées salées, 250g', price: 800, unit: 'sachet 250g', image: '🥜', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'auchan-dakar' },
  { name: 'Noix de Cajou', description: 'Noix de cajou grillées, 200g', price: 2500, unit: 'sachet 200g', image: '🥜', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'auchan-almadies' },
  { name: 'Pop-Corn', description: 'Pop-corn micro-ondes, 100g', price: 800, unit: 'sachet 100g', image: '🍿', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'auchan-dakar' },
  { name: 'Biscuits Sésame', description: 'Biscuits au sésame traditionnels', price: 600, unit: 'paquet', image: '🍪', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'boulangerie-touba' },
  { name: 'Galettes de Riz', description: 'Galettes de riz soufflées, 100g', price: 500, unit: 'sachet 100g', image: '🍪', inStock: true, featured: false, categorySlug: 'snacks', merchantSlug: 'auchan-dakar' },

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
  { name: 'Kinkéliba', description: 'Kinkéliba séché traditionnel', price: 900, unit: 'sachet 50g', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'auchan-dakar' },
  { name: 'Pain Complet', description: 'Pain complet au levain', price: 350, unit: 'pièce', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'auchan-dakar' },
]

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
      { email: 'auchan@marche.sn', password: 'auchan1', name: 'Auchan Dakar', merchantSlug: 'auchan-dakar', plan: 'premium_plus' },
      { email: 'auchan.almadies@marche.sn', password: 'auchan2', name: 'Auchan Almadies', merchantSlug: 'auchan-almadies', plan: 'premium_plus' },
      { email: 'citydia@marche.sn', password: 'citydia1', name: 'Citydia', merchantSlug: 'citydia', plan: 'premium' },
      { email: 'promod@marche.sn', password: 'promod1', name: 'Promod', merchantSlug: 'promod', plan: 'premium' },
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
