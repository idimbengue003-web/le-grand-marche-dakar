import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const CATEGORIES = [
  { name: 'Viandes', slug: 'viandes', icon: '🥩', description: 'Sélection royale de viandes fines et succulentes', color: '#8B0000' },
  { name: 'Poissons', slug: 'poissons', icon: '🐟', description: 'Poissons frais de nos rivières et mers', color: '#1E90FF' },
  { name: 'Fruits', slug: 'fruits', icon: '🍎', description: 'Fruits exquis du verger royal', color: '#FF6347' },
  { name: 'Légumes', slug: 'legumes', icon: '🥬', description: 'Légumes frais des jardins du château', color: '#2E8B57' },
  { name: 'Épices', slug: 'epices', icon: '🌶️', description: 'Épices rares des terres lointaines', color: '#FF8C00' },
  { name: 'Miel & Confitures', slug: 'miel-confitures', icon: '🍯', description: 'Miel doré et confitures artisanales', color: '#DAA520' },
  { name: 'Fromages', slug: 'fromages', icon: '🧀', description: 'Fromages affinés des meilleures fromageries', color: '#FFD700' },
  { name: 'Boulangerie', slug: 'boulangerie', icon: '🍞', description: 'Pains et pâtisseries du boulanger royal', color: '#D2691E' },
  { name: 'Vins & Boissons', slug: 'vins-boissons', icon: '🍷', description: 'Vins de nos vignobles et boissons royales', color: '#722F37' },
  { name: 'Herbes Aromatiques', slug: 'herbes', icon: '🌿', description: 'Herbes fraîches du jardin botanique', color: '#3CB371' },
  { name: 'Citrons & Agrumes', slug: 'citrons-agrumes', icon: '🍋', description: 'Agrumes ensoleillés des orangeries', color: '#FFD700' },
  { name: 'Volailles', slug: 'volailles', icon: '🐔', description: 'Volailles fermières de la basse-cour royale', color: '#CD853F' },
]

const MERCHANTS = [
  {
    name: 'Maison de Beaumont',
    slug: 'maison-beaumont',
    description: 'Fournisseur officiel de la cour depuis 3 générations. Les viandes les plus tendres du royaume.',
    image: '🏰',
    rating: 4.9,
    location: 'Allée des Seigneurs',
    specialty: 'Viandes & Volailles',
    banner: '#8B0000',
  },
  {
    name: 'Poissonnerie du Dauphin',
    slug: 'poissonnerie-dauphin',
    description: 'Poissons et fruits de mer pêchés chaque matin dans les eaux cristallines du lac royal.',
    image: '🐬',
    rating: 4.7,
    location: 'Place de la Fontaine',
    specialty: 'Poissons & Fruits de mer',
    banner: '#1E90FF',
  },
  {
    name: 'Jardins du Soleil',
    slug: 'jardins-soleil',
    description: 'Fruits et légumes cultivés dans les jardins ensoleillés du domaine royal.',
    image: '☀️',
    rating: 4.8,
    location: 'Ruelle des Jardins',
    specialty: 'Fruits & Légumes',
    banner: '#FF6347',
  },
  {
    name: 'Épices d\'Orient',
    slug: 'epices-orient',
    description: 'Épices rares rapportées par les caravanes de la Route de la Soie. Saveurs d\'ailleurs.',
    image: '🎪',
    rating: 4.6,
    location: 'Caravansérail Royal',
    specialty: 'Épices & Condiments',
    banner: '#FF8C00',
  },
  {
    name: 'Rucher du Moine',
    slug: 'rucher-moine',
    description: 'Miel récolté par les moines de l\'abbaye depuis des siècles. Tradition et pureté.',
    image: '⛪',
    rating: 4.9,
    location: 'Claire Voie de l\'Abbaye',
    specialty: 'Miel & Confitures',
    banner: '#DAA520',
  },
  {
    name: 'Fromagerie du Comte',
    slug: 'fromagerie-comte',
    description: 'Fromages affinés dans les caves du château. Le goût authentique de notre terroir.',
    image: '🏔️',
    rating: 4.8,
    location: 'Cave des Maîtres',
    specialty: 'Fromages & Produits laitiers',
    banner: '#FFD700',
  },
  {
    name: 'Boulangerie Royal',
    slug: 'boulangerie-royal',
    description: 'Le pain du roi, cuit dans les fours séculaires. Pâtisseries dignes des banquets.',
    image: '👑',
    rating: 4.7,
    location: 'Grand Boulevard',
    specialty: 'Pains & Pâtisseries',
    banner: '#D2691E',
  },
  {
    name: 'Cave du Château',
    slug: 'cave-chateau',
    description: 'Vins fins sélectionnés parmi les meilleurs crus du royaume. Dégustation royale.',
    image: '🍷',
    rating: 4.9,
    location: 'Venelle des Vignerons',
    specialty: 'Vins & Spiritueux',
    banner: '#722F37',
  },
  {
    name: 'Herboristerie de la Reine',
    slug: 'herboristerie-reine',
    description: 'Herbes médicinales et aromatiques choisies par la reine elle-même. Sagesse ancestrale.',
    image: '👸',
    rating: 4.5,
    location: 'Cour des Plantes',
    specialty: 'Herbes & Remèdes',
    banner: '#3CB371',
  },
  {
    name: 'Orangerie du Prince',
    slug: 'orangerie-prince',
    description: 'Agrumes rares cultivés dans les serres chauffées du prince. Fraîcheur garantie.',
    image: '🍊',
    rating: 4.6,
    location: 'Serre des Orangers',
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

const PRODUCTS: ProductSeed[] = [
  // === VIANDES (Maison de Beaumont) ===
  { name: 'Bœuf Angus Premium', description: 'Pièce de bœuf Angus maturée 28 jours, tendre et savoureuse', price: 34.90, unit: 'kg', image: '🥩', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'maison-beaumont' },
  { name: 'Agneau de Pré-Salé', description: 'Agneau élevé sur les prés salés de la côte, goût unique et délicat', price: 42.50, unit: 'kg', image: '🍖', inStock: true, featured: true, categorySlug: 'viandes', merchantSlug: 'maison-beaumont' },
  { name: 'Porc Ibérique', description: 'Porc ibérique de bellota, la noblesse de la charcuterie', price: 29.90, unit: 'kg', image: '🥓', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'maison-beaumont' },
  { name: 'Veau Fermier', description: 'Veau élevé en plein air, viande tendre et fondante', price: 38.00, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'maison-beaumont' },
  { name: 'Saucisse de Toulouse', description: 'Saucisse artisanale aux herbes de Provence', price: 12.90, unit: 'kg', image: '🌭', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'maison-beaumont' },

  // === VOLAILLES (Maison de Beaumont) ===
  { name: 'Poulet de Bresse AOP', description: 'Le roi des poulets, élevé en liberté dans la Bresse', price: 24.90, unit: 'pièce', image: '🐔', inStock: true, featured: true, categorySlug: 'volailles', merchantSlug: 'maison-beaumont' },
  { name: 'Canard Entier', description: 'Canard de Challans, chair fine et goûteuse', price: 19.90, unit: 'pièce', image: '🦆', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'maison-beaumont' },
  { name: 'Caille Dorée', description: 'Caille fermière rôtie, délice de la table royale', price: 8.90, unit: 'pièce', image: '🐦', inStock: true, featured: false, categorySlug: 'volailles', merchantSlug: 'maison-beaumont' },

  // === POISSONS (Poissonnerie du Dauphin) ===
  { name: 'Saumon Sauvage d\'Alaska', description: 'Saumon sauvage pêché dans les eaux glacées d\'Alaska', price: 32.90, unit: 'kg', image: '🐠', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-dauphin' },
  { name: 'Bar de Ligne', description: 'Bar pêché à la ligne, fraîcheur garantie du jour', price: 28.50, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-dauphin' },
  { name: 'Sole Meunière', description: 'Sole fraîche, parfaite pour une préparation meunière', price: 36.00, unit: 'kg', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-dauphin' },
  { name: 'Huîtres Spéciales', description: 'Huîtres spéciales de la côte, charnues et iodées', price: 18.90, unit: 'douzaine', image: '🦪', inStock: true, featured: true, categorySlug: 'poissons', merchantSlug: 'poissonnerie-dauphin' },
  { name: 'Crevettes Roses', description: 'Crevettes roses de Méditerranée, tendres et sucrées', price: 22.50, unit: 'kg', image: '🦐', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'poissonnerie-dauphin' },

  // === FRUITS (Jardins du Soleil) ===
  { name: 'Pommes Reinettes', description: 'Pommes reinettes grises du verger, croquantes et acidulées', price: 4.90, unit: 'kg', image: '🍎', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardins-soleil' },
  { name: 'Fraises Gariguette', description: 'Fraises Gariguette, les plus parfumées du royaume', price: 8.90, unit: 'barquette', image: '🍓', inStock: true, featured: true, categorySlug: 'fruits', merchantSlug: 'jardins-soleil' },
  { name: 'Raisin Muscat', description: 'Raisin muscat doré, sucré comme le miel', price: 6.50, unit: 'kg', image: '🍇', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardins-soleil' },
  { name: 'Pêches de Vigne', description: 'Pêches de vigne rouges, parfumées et juteuses', price: 7.90, unit: 'kg', image: '🍑', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'jardins-soleil' },
  { name: 'Cerises Burlat', description: 'Cerises Burlat charnues, la reine des fruits rouges', price: 9.90, unit: 'kg', image: '🍒', inStock: true, featured: true, categorySlug: 'fruits', merchantSlug: 'jardins-soleil' },

  // === LÉGUMES (Jardins du Soleil) ===
  { name: 'Asperges Vertes', description: 'Asperges vertes des jardins, tendres et savoureuses', price: 12.90, unit: 'botte', image: '🥦', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardins-soleil' },
  { name: 'Tomates Anciennes', description: 'Coffret de tomates anciennes multicolores', price: 5.90, unit: 'kg', image: '🍅', inStock: true, featured: true, categorySlug: 'legumes', merchantSlug: 'jardins-soleil' },
  { name: 'Artichauts Violet', description: 'Artichauts violets de Provence, tendres et fondants', price: 3.50, unit: 'pièce', image: '🥬', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardins-soleil' },
  { name: 'Champignons de Paris', description: 'Champignons frais de la cave royale', price: 4.50, unit: 'kg', image: '🍄', inStock: true, featured: false, categorySlug: 'legumes', merchantSlug: 'jardins-soleil' },

  // === ÉPICES (Épices d'Orient) ===
  { name: 'Safran du Kashmir', description: 'Safran pur du Kashmir, l\'or rouge des épices', price: 89.00, unit: '5g', image: '✨', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'epices-orient' },
  { name: 'Poivre de Kampot', description: 'Poivre noir de Kampot, le meilleur poivre du monde', price: 24.90, unit: '50g', image: '🌶️', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'epices-orient' },
  { name: 'Cannelle de Ceylan', description: 'Bâtons de cannelle de Ceylan, arôme doux et chaud', price: 12.50, unit: '50g', image: '🪵', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'epices-orient' },
  { name: 'Ras el Hanout', description: 'Mélange royal de 30 épices, secret des marchands', price: 18.90, unit: '50g', image: '🏺', inStock: true, featured: true, categorySlug: 'epices', merchantSlug: 'epices-orient' },
  { name: 'Vanille de Madagascar', description: 'Gousses de vanille Bourbon, charnues et parfumées', price: 34.90, unit: '5 gousses', image: '🌿', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'epices-orient' },
  { name: 'Cardamome Verte', description: 'Cardamome verte entière, la reine des épices', price: 15.90, unit: '50g', image: '🫚', inStock: true, featured: false, categorySlug: 'epices', merchantSlug: 'epices-orient' },

  // === MIEL & CONFITURES (Rucher du Moine) ===
  { name: 'Miel de Lavande', description: 'Miel de lavande de l\'abbaye, doux et parfumé', price: 14.90, unit: 'pot 250g', image: '🍯', inStock: true, featured: true, categorySlug: 'miel-confitures', merchantSlug: 'rucher-moine' },
  { name: 'Miel d\'Acacia', description: 'Miel d\'acacia cristallin, clair et délicat', price: 12.50, unit: 'pot 250g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'rucher-moine' },
  { name: 'Miel de Châtaignier', description: 'Miel de châtaignier au goût boisé et intense', price: 13.90, unit: 'pot 250g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'rucher-moine' },
  { name: 'Confiture de Figues', description: 'Confiture artisanale de figues violettes', price: 9.90, unit: 'pot 220g', image: '🫙', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'rucher-moine' },
  { name: 'Confiture de Fraises', description: 'Confiture royale aux fraises des bois', price: 8.90, unit: 'pot 220g', image: '🫙', inStock: true, featured: true, categorySlug: 'miel-confitures', merchantSlug: 'rucher-moine' },

  // === FROMAGES (Fromagerie du Comte) ===
  { name: 'Comté 24 Mois', description: 'Comté affiné 24 mois dans les caves du fort', price: 19.90, unit: 'kg', image: '🧀', inStock: true, featured: true, categorySlug: 'fromages', merchantSlug: 'fromagerie-comte' },
  { name: 'Brie de Meaux', description: 'Le roi des fromages, crémeux et parfumé', price: 15.90, unit: 'kg', image: '🧀', inStock: true, featured: true, categorySlug: 'fromages', merchantSlug: 'fromagerie-comte' },
  { name: 'Roquefort Société', description: 'Roquefort authentique, bleu intense et persillé', price: 24.50, unit: 'kg', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'fromagerie-comte' },
  { name: 'Chèvre Frais', description: 'Fromage de chèvre frais du Poitou, onctueux', price: 8.90, unit: 'pièce', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'fromagerie-comte' },
  { name: 'Camembert de Normandie', description: 'Camembert au lait cru, véritable normand', price: 6.90, unit: 'pièce', image: '🧀', inStock: true, featured: false, categorySlug: 'fromages', merchantSlug: 'fromagerie-comte' },

  // === BOULANGERIE (Boulangerie Royal) ===
  { name: 'Pain de Campagne', description: 'Pain de campagne au levain naturel, croustillant', price: 4.50, unit: 'pièce', image: '🍞', inStock: true, featured: true, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-royal' },
  { name: 'Baguette Tradition', description: 'Baguette tradition au goût incomparable', price: 1.90, unit: 'pièce', image: '🥖', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-royal' },
  { name: 'Croissant Pur Beurre', description: 'Croissant au beurre AOP Charentes-Poitou', price: 1.60, unit: 'pièce', image: '🥐', inStock: true, featured: true, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-royal' },
  { name: 'Pain aux Céréales', description: 'Pain aux 7 céréales, source de bienfaits', price: 5.20, unit: 'pièce', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-royal' },
  { name: 'Brioche Tressée', description: 'Brioche tressée dorée, moelleuse et parfumée', price: 6.90, unit: 'pièce', image: '🥐', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'boulangerie-royal' },

  // === VINS & BOISSONS (Cave du Château) ===
  { name: 'Château Margaux 2018', description: 'Grand cru classé, l\'élégance à l\'état pur', price: 189.00, unit: 'bouteille', image: '🍷', inStock: true, featured: true, categorySlug: 'vins-boissons', merchantSlug: 'cave-chateau' },
  { name: 'Bourgogne Pinot Noir', description: 'Pinot noir de Bourgogne, fin et fruité', price: 29.90, unit: 'bouteille', image: '🍷', inStock: true, featured: false, categorySlug: 'vins-boissons', merchantSlug: 'cave-chateau' },
  { name: 'Champagne Brut Millésimé', description: 'Champagne d\'exception pour les grandes occasions', price: 59.90, unit: 'bouteille', image: '🥂', inStock: true, featured: true, categorySlug: 'vins-boissons', merchantSlug: 'cave-chateau' },
  { name: 'Cidre Artisanal', description: 'Cidre brut fermier, pétillant naturel', price: 6.90, unit: 'bouteille', image: '🍹', inStock: true, featured: false, categorySlug: 'vins-boissons', merchantSlug: 'cave-chateau' },
  { name: 'Elixir Royal', description: 'Liqueur secrète aux herbes, recette ancestrale', price: 34.90, unit: 'bouteille', image: '⚗️', inStock: true, featured: false, categorySlug: 'vins-boissons', merchantSlug: 'cave-chateau' },

  // === HERBES (Herboristerie de la Reine) ===
  { name: 'Bouquet Garni Royal', description: 'Mélange de thym, laurier et romarin du jardin', price: 3.90, unit: 'bouquet', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'herboristerie-reine' },
  { name: 'Herbes de Provence', description: 'Mélange authentique de 6 herbes provençales', price: 5.90, unit: 'sachet 30g', image: '🌿', inStock: true, featured: true, categorySlug: 'herbes', merchantSlug: 'herboristerie-reine' },
  { name: 'Basilic Grand Vert', description: 'Basilic frais parfumé, idéal pour le pesto', price: 2.50, unit: 'botte', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'herboristerie-reine' },
  { name: 'Sauge Officinale', description: 'Sauge aux vertus médicinales, récoltée à la main', price: 4.50, unit: 'sachet 20g', image: '🍃', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'herboristerie-reine' },

  // === CITRONS & AGRUMES (Orangerie du Prince) ===
  { name: 'Citrons de Menton', description: 'Citrons de Menton IGP, doux et parfumés', price: 6.90, unit: 'kg', image: '🍋', inStock: true, featured: true, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-prince' },
  { name: 'Oranges Sanguines', description: 'Oranges sanguines de Sicile, juteuses et colorées', price: 5.50, unit: 'kg', image: '🍊', inStock: true, featured: true, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-prince' },
  { name: 'Pamplemousse Rose', description: 'Pamplemousse rose de Floride, sucré et amer', price: 3.90, unit: 'kg', image: '🍇', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-prince' },
  { name: 'Cédrat Confît', description: 'Cédrat confît de Corse, délice des pâtissiers', price: 14.90, unit: 'boîte', image: '🍈', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'orangerie-prince' },

  // === Cross-merchant products (same category, different prices) ===
  // Viandes at other merchants
  { name: 'Bœuf Angus Premium', description: 'Viande bovine de qualité supérieure, maturée 21 jours', price: 31.50, unit: 'kg', image: '🥩', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'jardins-soleil' },
  { name: 'Saucisson Sec', description: 'Saucisson sec artisanal aux noisettes', price: 9.90, unit: 'pièce', image: '🌭', inStock: true, featured: false, categorySlug: 'viandes', merchantSlug: 'boulangerie-royal' },

  // Poissons at Orangerie
  { name: 'Truite Fumée', description: 'Truite fumée au bois de hêtre, tranchée finement', price: 16.90, unit: '200g', image: '🐟', inStock: true, featured: false, categorySlug: 'poissons', merchantSlug: 'cave-chateau' },

  // Fruits at Rucher
  { name: 'Framboises Fraîches', description: 'Framboises charnues du verger de l\'abbaye', price: 7.50, unit: 'barquette', image: '🫐', inStock: true, featured: false, categorySlug: 'fruits', merchantSlug: 'rucher-moine' },

  // Miel from other merchants
  { name: 'Miel de Montagne', description: 'Miel de montagne toutes fleurs, récolté à 1500m', price: 16.90, unit: 'pot 250g', image: '🍯', inStock: true, featured: false, categorySlug: 'miel-confitures', merchantSlug: 'jardins-soleil' },

  // Fromage at Cave
  { name: 'Brie aux Truffes', description: 'Brie affiné aux truffes noires du Périgord', price: 35.90, unit: 'pièce', image: '🧀', inStock: true, featured: true, categorySlug: 'fromages', merchantSlug: 'cave-chateau' },

  // Herbes at Jardin
  { name: 'Romarin Frais', description: 'Romarin aromatique du jardin du château', price: 2.90, unit: 'botte', image: '🌿', inStock: true, featured: false, categorySlug: 'herbes', merchantSlug: 'jardins-soleil' },

  // Citrons at Herboristerie
  { name: 'Citrons de Menton', description: 'Citrons bio pour infusions et décoctions', price: 7.50, unit: 'kg', image: '🍋', inStock: true, featured: false, categorySlug: 'citrons-agrumes', merchantSlug: 'herboristerie-reine' },

  // Boulangerie at Maison de Beaumont
  { name: 'Pain de Seigle', description: 'Pain de seigle au levain, tradition paysanne', price: 3.90, unit: 'pièce', image: '🍞', inStock: true, featured: false, categorySlug: 'boulangerie', merchantSlug: 'maison-beaumont' },

  // Vins at Maison de Beaumont
  { name: 'Vin Rouge Maison', description: 'Cuvée spéciale de la maison, charpentée', price: 14.90, unit: 'bouteille', image: '🍷', inStock: true, featured: false, categorySlug: 'vins-boissons', merchantSlug: 'maison-beaumont' },
]

export async function POST() {
  try {
    // Check if already seeded
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

    return NextResponse.json({
      message: 'Royal Market seeded successfully!',
      count: {
        categories: CATEGORIES.length,
        merchants: MERCHANTS.length,
        products: productCount,
      },
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
