# 🚀 SESIÓN 2 - EXECUTION PLAN

**Project Name**: AZURE BAY RESIDENCES
**Location**: Premium Beachfront Community
**URL**: azure-bay-residences.vercel.app
**Branch**: session-2/azure-bay-rebranding
**Status**: LIVE EXECUTION
**Start Time**: December 8, 2025 - 02:53 AM CET

---

## 📋 PARALLELIZATION STRATEGY

### Thread A: MIDJOURNEY IMAGE GENERATION (Async)
**Action**: Generate 30 images in batches
**Timeline**: 45 minutes total (starts now)
**Your Action**: Submit to Midjourney while we execute Threads B & C

**Batch 1 (HERO + APARTMENTS)** - Run FIRST
```
5 images: Hero, Studio, 1BR, 2BR, 3BR
Estimate: 5-8 minutes
Priority: CRITICAL
```

**Batch 2 (AMENITIES)** - Run AFTER Batch 1
```
7 images: Pool, Cinema, Fitness, Spa, Retail, Lounge, Lobby
Estimate: 7-10 minutes
Priority: HIGH
```

**Batch 3 (FEATURES)** - Run PARALLEL to B
```
8 images: Beachfront, Architectural, Lifestyle, Beach, Gardens, Jogging, Tennis, Plazas
Estimate: 8-12 minutes
Priority: HIGH
```

**Batch 4 (DETAILS)** - Run as needed
```
5 images: Balcony, Staircase, Promenade, Lounge, Facade
Estimate: 5-8 minutes
Priority: MEDIUM
```

👉 **Action NOW**: Copy prompts from MIDJOURNEY_PROMPTS.md and submit Batch 1 to Midjourney in Fast mode

---

### Thread B: FIND & REPLACE - PROJECT NAMING
**Action**: Update all "Playa Viva" → "Azure Bay" references
**Timeline**: 15-20 minutes
**File**: app/page.tsx

#### Search & Replace Operations

**Operation 1: Hero Title**
```javascript
// LINE ~110
FROM: title: "Playa Viva",
TO:   title: "Azure Bay Residences",

// LINE ~120 (EN version)
FROM: title: "Playa Viva",
TO:   title: "Azure Bay Residences",
```

**Operation 2: Structured Data**
```javascript
// LINE ~1150
FROM: name: "Playa Viva Residences"
TO:   name: "Azure Bay Residences"
```

**Operation 3: Content Object References (Spanish)**
```javascript
// LINES 180-500 (content.es object)
Global Replace:
"Playa Viva" → "Azure Bay Residences"
"playa viva" → "azure bay residences"
```

**Operation 4: Content Object References (English)**
```javascript
// LINES 550-850 (content.en object)
Global Replace:
"Playa Viva" → "Azure Bay Residences"
"playa viva" → "azure bay residences"
```

✅ **Progress Check**: All "Playa Viva" references should now be "Azure Bay Residences"

---

### Thread C: FIND & REPLACE - LOCATION
**Action**: Update location references
**Timeline**: 10-15 minutes
**File**: app/page.tsx

#### Search & Replace Operations

**Operation 1: Subtitle (Hero)**
```javascript
// LINE ~115 (ES)
FROM: subtitle: "AL MARJAN ISLAND, RAS AL KHAIMAH",
TO:   subtitle: "PREMIUM BEACHFRONT COMMUNITY",

// LINE ~125 (EN)
FROM: subtitle: "AL MARJAN ISLAND, RAS AL KHAIMAH",
TO:   subtitle: "PREMIUM BEACHFRONT COMMUNITY",
```

**Operation 2: Description (Remove Wynn References)**
```javascript
// LINE ~120 (ES)
FROM: "Invierta en lujo frente al mar junto al nuevo Wynn Casino de $5.1B. Rentabilidades del 7-8%"
TO:   "Invierta en lujo frente al mar en comunidad costera de primer nivel. Rentabilidades del 7-8%"

// LINE ~130 (EN)
FROM: "Invest in beachfront luxury next to the new $5.1B Wynn Casino. 7-8% rental yields"
TO:   "Invest in beachfront luxury in premier coastal community. 7-8% rental yields"
```

**Operation 3: Location Title**
```javascript
// LINES 2800-2900 (location section)
FROM: title: "Al Marjan Island",
TO:   title: "Premium Coastal Destination",

FROM: subtitle: "El futuro de la vida de lujo en los EAU" (ES)
TO:   subtitle: "El futuro de la vida de lujo en comunidades costeras premium"

FROM: subtitle: "The future of luxury living in the UAE" (EN)
TO:   subtitle: "The future of luxury living in premium coastal communities"
```

**Operation 4: Wynn Effect Section**
```javascript
// LINES 550-650 (wynnEffect section ES)
FROM: title: "El Efecto Wynn",
TO:   title: "El Efecto Resort Cosmopolita",

FROM: "El Wynn Resort & Casino de $5.1 mil millones"
TO:   "El futuro resort de clase mundial"

FROM: "primer casino de los EAU"
TO:   "primer desarrollo de su clase"

// LINES 850-950 (wynnEffect section EN)
FROM: title: "The Wynn Effect",
TO:   title: "The World-Class Resort Effect",

FROM: "The $5.1 billion Wynn Resort & Casino"
TO:   "The upcoming world-class resort"

FROM: "first casino in UAE history"
TO:   "first development of its kind"
```

**Operation 5: FAQ Section**
```javascript
// LINES 2200+ (faq.questions ES & EN)
Remove all specific Al Marjan / Wynn references
Replace with generic premium coastal community references

Example:
FROM: "¿Dónde está ubicado?"
      "En Al Marjan Island, Ras Al Khaimah..."
TO:   "¿Dónde está ubicado?"
      "En una comunidad costera premium de primer nivel..."
```

✅ **Progress Check**: All location references should be generic/premium

---

### Thread D: META TAGS & URLS
**Action**: Update metadata
**Timeline**: 5-10 minutes
**Files**: app/layout.tsx, app/page.tsx

#### Updates Required

**Operation 1: Page Title (app/layout.tsx)**
```typescript
FROM: title: "Playa Viva - Inversión en lujo"
TO:   title: "Azure Bay Residences - Premium Luxury Investment"
```

**Operation 2: Meta Description**
```typescript
FROM: content: "Playa Viva en Al Marjan Island..."
TO:   content: "Azure Bay Residences - Premium beachfront luxury residences..."
```

**Operation 3: Open Graph**
```typescript
FROM: og:title: "Playa Viva"
TO:   og:title: "Azure Bay Residences"

FROM: og:description: "Inversión en Playa Viva, Al Marjan Island"
TO:   og:description: "Premium coastal community investment opportunity"
```

**Operation 4: SITE_URL**
```typescript
FROM: const SITE_URL = "https://playaviva-uniestate.vercel.app"
TO:   const SITE_URL = "https://azure-bay-residences.vercel.app"
```

✅ **Progress Check**: All URLs and meta tags updated

---

## 💰 PRICING UPDATES
**Action**: Update apartment prices (maintain realistic ranges)
**Timeline**: 15-20 minutes
**File**: app/page.tsx (lines ~1850-1900)

### Current → New Pricing

**Strategy**: Shift prices by 5-10% to create distinct identity while maintaining credibility

#### Studio
```javascript
FROM: studio: { en: "£172,000", es: "192.000€" }
TO:   studio: { en: "£165,000", es: "185.000€" }
// (5% reduction for competitive positioning)
```

#### One-Bedroom
```javascript
FROM: oneBed: { en: "£325,000", es: "370.000€" }
TO:   oneBed: { en: "£315,000", es: "355.000€" }
// (3-5% adjustment)
```

#### Two-Bedroom
```javascript
FROM: twoBed: { en: "£526,000", es: "598.000€" }
TO:   twoBed: { en: "£510,000", es: "575.000€" }
// (3% adjustment)
```

#### Three-Bedroom
```javascript
FROM: threeBed: { en: "£795,000", es: "905.000€" }
TO:   threeBed: { en: "£770,000", es: "870.000€" }
// (3-4% adjustment)
```

✅ **Progress Check**: New pricing is credible and distinct

---

## 🖼️ IMAGE ASSET UPDATES
**Action**: Replace image references once Midjourney images ready
**Timeline**: 30-45 minutes (after Midjourney completes)
**File**: app/page.tsx + public/assets/imagenes/

### Image Replacement Map

**CRITICAL IMAGES** (Replace FIRST):
```
hero-background.png → Midjourney Hero (Image #1)
logo-playa-viva.png → "AZURE BAY" text logo (create manually or use Image #1 crop)
```

**APARTMENT INTERIORS** (Replace SECOND):
```
studio.webp → Midjourney Studio (Image #2)
1-bedroom.webp → Midjourney 1BR (Image #3)
2-bedroom.webp → Midjourney 2BR (Image #4)
3-bedroom.png → Midjourney 3BR (Image #5)
```

**AMENITIES** (Replace THIRD):
```
Piscina_mejorada.png → Midjourney Pool (Image #6)
cinema.webp → Midjourney Cinema (Image #7)
foto galeria 4.jpg → Midjourney Fitness (Image #8)
foto galeria 7.jpg → Midjourney Spa (Image #9)
retail.webp → Midjourney Retail (Image #10)
```

**FEATURES**:
```
view1.webp → Midjourney Beach Community (Image #13)
view2.jpg → Midjourney Architectural (Image #14)
view3.webp → Midjourney Lifestyle (Image #15)
beach.webp → Midjourney Private Beach (Image #16)
```

**COLLAGES** (Recreate if needed):
```
Collage_estructura_es.png → Update with Azure Bay branding
Collage_estructura_en.png → Update with Azure Bay branding
Collage_servicios_instalaciones.png → Update with new amenity images
Collage_Al_Marjan_Island.png → Rebrand as "Premium Coastal Community"
```

✅ **Progress Check**: All image references updated

---

## 📝 FAQ & DESCRIPTIONS UPDATE
**Action**: Genericize all FAQ responses
**Timeline**: 10-15 minutes
**File**: app/page.tsx (lines 2100+)

### Example FAQ Updates

**Q: ¿Qué es Azure Bay Residences?**
```javascript
FROM: "Playa Viva es un desarrollo residencial de lujo en Al Marjan Island..."
TO:   "Azure Bay Residences es un desarrollo residencial de lujo en comunidad costera premium,
       diseñado para inversores sofisticados que buscan lujo frente al mar y rendimientos sólidos."
```

**Q: What is Azure Bay Residences?**
```javascript
FROM: "Playa Viva is a luxury residential development in Al Marjan Island..."
TO:   "Azure Bay Residences is a luxury residential development in a premier coastal community,
       designed for sophisticated investors seeking beachfront luxury and solid returns."
```

**Q: ¿Dónde está ubicado?**
```javascript
FROM: "En Al Marjan Island, Ras Al Khaimah, a 12 minutos del centro..."
TO:   "En una comunidad costera premium de primer nivel en la región, perfectamente
       conectada a aeropuertos internacionales y centros urbanos."
```

**Q: Where is it located?**
```javascript
FROM: "In Al Marjan Island, Ras Al Khaimah, 12 minutes from RAK center..."
TO:   "In a premier coastal community perfectly connected to international airports
       and major urban centers."
```

✅ **Progress Check**: All FAQ responses are generic and premium

---

## ✅ THREAD COMPLETION CHECKLIST

### Thread A: Midjourney Images
- [ ] Batch 1 submitted (Hero + Apartments) - 5-8 min wait
- [ ] Batch 2 submitted (Amenities) - 7-10 min wait
- [ ] Batch 3 submitted (Features) - 8-12 min wait
- [ ] Batch 4 submitted (Details) - 5-8 min wait
- [ ] All 25-30 images downloaded and organized
- [ ] Images optimized for web (optional)

### Thread B: Project Naming
- [ ] Operation 1: Hero Title ✅
- [ ] Operation 2: Structured Data ✅
- [ ] Operation 3: Content ES ✅
- [ ] Operation 4: Content EN ✅
- [ ] All "Playa Viva" → "Azure Bay Residences"
- [ ] All "playa viva" → "azure bay residences"
- [ ] Git commit: "Replace project name with Azure Bay"

### Thread C: Location
- [ ] Operation 1: Hero Subtitle ✅
- [ ] Operation 2: Hero Description ✅
- [ ] Operation 3: Location Title ✅
- [ ] Operation 4: Wynn Effect Section ✅
- [ ] Operation 5: FAQ Section ✅
- [ ] All location references genericized
- [ ] Git commit: "Genericize location references"

### Thread D: Meta & URLs
- [ ] Page Title ✅
- [ ] Meta Description ✅
- [ ] Open Graph ✅
- [ ] SITE_URL ✅
- [ ] Git commit: "Update meta tags and URLs"

### Thread E: Pricing
- [ ] Studio pricing updated ✅
- [ ] 1BR pricing updated ✅
- [ ] 2BR pricing updated ✅
- [ ] 3BR pricing updated ✅
- [ ] Git commit: "Update pricing for Azure Bay positioning"

### Thread F: Images
- [ ] Hero background replaced ✅
- [ ] Logo updated ✅
- [ ] Apartment interiors replaced ✅
- [ ] Amenities replaced ✅
- [ ] Features replaced ✅
- [ ] Collages updated ✅
- [ ] All image paths verified ✅
- [ ] Git commit: "Replace all images with Azure Bay assets"

### Thread G: FAQ & Descriptions
- [ ] All FAQs genericized ✅
- [ ] All descriptions updated ✅
- [ ] Es & EN versions aligned ✅
- [ ] Git commit: "Genericize FAQs and descriptions"

---

## 🔄 COMMIT STRATEGY

**Plan**: Make small atomic commits as we complete each section

```bash
git add app/page.tsx
git commit -m "[Session 2] Replace project name: Playa Viva → Azure Bay Residences"

git add app/page.tsx
git commit -m "[Session 2] Genericize location references and Wynn Effect section"

git add app/layout.tsx app/page.tsx
git commit -m "[Session 2] Update meta tags and SITE_URL for Azure Bay"

git add app/page.tsx
git commit -m "[Session 2] Adjust pricing for Azure Bay positioning"

git add public/assets/imagenes/
git commit -m "[Session 2] Replace images with Midjourney AI-generated assets"

git add app/page.tsx
git commit -m "[Session 2] Genericize FAQs and feature descriptions"
```

**Final**: Prepare for PR to main
```bash
git checkout main
git pull origin main
git checkout session-2/azure-bay-rebranding
git rebase main
```

---

## ⏱️ TOTAL EXECUTION TIME

**Parallel Execution**:
- Thread A (Midjourney): 45 min (async, you wait)
- Thread B (Naming): 15-20 min (while A runs)
- Thread C (Location): 10-15 min (while A runs)
- Thread D (Meta): 5-10 min (while A runs)
- Thread E (Pricing): 15-20 min (while A runs)
- Thread F (Images): 30-45 min (after A completes)
- Thread G (FAQ): 10-15 min (final pass)

**Total Sequential**: ~2.5-3 hours
**Actual Time (Parallel)**: ~1.5-2 hours (A-G run parallel where possible)

---

## 📲 NEXT ACTIONS

### IMMEDIATE (Next 5 minutes):
1. [ ] Copy Batch 1 prompts from MIDJOURNEY_PROMPTS.md
2. [ ] Open Midjourney Discord server
3. [ ] Submit Batch 1 (5 images) in Fast mode
4. [ ] Return here and proceed to Thread B

### WHILE MIDJOURNEY PROCESSES (45 min):
1. [ ] Execute Thread B: Project Naming (15-20 min)
2. [ ] Execute Thread C: Location (10-15 min)
3. [ ] Execute Thread D: Meta Tags (5-10 min)
4. [ ] Execute Thread E: Pricing (15-20 min)
5. [ ] Make git commits as you go

### AFTER MIDJOURNEY COMPLETES:
1. [ ] Execute Thread F: Images (30-45 min)
2. [ ] Execute Thread G: FAQ (10-15 min)
3. [ ] Final git commit
4. [ ] Prepare for Session 3 (Testing + Deploy)

---

## 🎯 SESSION 2 SUCCESS CRITERIA

✅ All "Playa Viva" references replaced with "Azure Bay Residences"
✅ All location references genericized to "Premium Beachfront Community"
✅ All Wynn/casino references removed or genericized
✅ 25-30 Midjourney images generated and integrated
✅ Pricing updated (5-10% variations)
✅ Meta tags and URLs updated for azure-bay-residences.vercel.app
✅ All FAQ responses genericized
✅ All changes committed to session-2/azure-bay-rebranding branch
✅ Code tested locally (npm run dev)
✅ Ready for Session 3: Testing + Deploy

---

**Status**: 🚀 READY TO EXECUTE
**Branch**: session-2/azure-bay-rebranding
**Next Step**: Submit Midjourney Batch 1 and proceed with Threads B-E in parallel

**Let's go!** ⚡
