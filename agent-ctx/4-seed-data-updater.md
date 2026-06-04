# Task 4: Seed Data Updater

## Summary
Updated the seed data file at `/home/z/my-project/src/app/api/seed/route.ts` with electronics categories, merchants, and products. Fixed broken merchant slug references.

## Changes Made

### Categories Added (9)
1. Téléphones & Tablettes (📱, color: '#1a1a2e')
2. Ordinateurs & Accessoires (💻, color: '#16213e')
3. Audio & Casques (🎧, color: '#0f3460')
4. TV & Écrans (📺, color: '#533483')
5. Appareils Photo & Vidéo (📷, color: '#e94560')
6. Gaming & Consoles (🎮, color: '#541690')
7. Électroménager (🔌, color: '#2b2d42')
8. Chargeurs & Câbles (🔋, color: '#8d99ae')
9. Stockage & Mémoires (💾, color: '#2b2d42')

### Merchants Added (6)
1. TechShop Dakar (slug: 'techshop-dakar', 📱, rating 4.7, Almadies)
2. Informatique Numérique (slug: 'informatique-numerique', 💻, rating 4.6, Plateau)
3. Sonorité Dakar (slug: 'sonorite-dakar', 🎧, rating 4.5, Médina)
4. ÉlectroMall (slug: 'electromall', 📺, rating 4.8, Sacré-Cœur)
5. GameZone Dakar (slug: 'gamezone-dakar', 🎮, rating 4.4, Mermoz)
6. PhotoPro Dakar (slug: 'photopro-dakar', 📷, rating 4.3, Fann)

### Products Added (96)
- Téléphones & Tablettes: 14 products (iPhones, Samsung Galaxy, Xiaomi, Tecno, Infinix, iPads)
- Ordinateurs & Accessoires: 12 products (MacBooks, HP, Dell, Lenovo, ASUS, peripherals)
- Audio & Casques: 10 products (Sony WH-1000XM5, AirPods Pro, JBL, Marshall)
- TV & Écrans: 10 products (Samsung, LG, TCL, Hisense TVs and monitors)
- Photo & Vidéo: 9 products (Canon, Sony, DJI, GoPro, Insta360)
- Gaming & Consoles: 12 products (PS5, Xbox, Nintendo Switch, games, accessories)
- Électroménager: 9 products (ACs, fridges, washing machines, microwaves)
- Chargeurs & Câbles: 11 products (chargers, cables, power banks, cases)
- Stockage & Mémoires: 9 products (USB drives, HDDs, SSDs, memory cards, RAM)

### Bug Fix
- Replaced all 150 `auchan-dakar` merchant slug references with `citydia`
- Replaced all 41 `auchan-almadies` merchant slug references with `promod`
- These slugs were not in the MERCHANTS array and would cause seed failures

### Additional Updates
- Updated AUCHAN_REMAP with electronics category mappings for both auchan-dakar and auchan-almadies
- Added 6 new vendor test accounts for electronics merchants
- Lint passes cleanly with no errors
