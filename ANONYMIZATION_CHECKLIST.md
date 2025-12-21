# 🔐 ANONYMIZATION CHECKLIST - PLAYA VIVA LANDING

**Project**: Rebranding & Anonimización de Landing Playa Viva
**Status**: SESIÓN 1 - Auditoría & Planificación
**Date**: December 8, 2025
**Client**: Self (Portfolio Case Study)

---

## 📊 PROYECTO OVERVIEW

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **State**: React Hooks
- **CMS Integration**: HubSpot
- **Security**: ALTCHA (private verification)
- **Deployment**: Vercel

### Decisiones Tomadas
| Aspecto | Decisión |
|---------|----------|
| **Naming Style** | Internacional Premium (Azure Bay, Meridian Shores, Sapphire Coast style) |
| **Color Palette** | Mantener (Azul-teal + Dorados + Crema) |
| **Imágenes** | AI-Generated (Midjourney) |
| **Idiomas** | Bilingüe (ES/EN) - Sin cambios en estructura |

---

## 🔍 SECCIÓN 1: REEMPLAZO DE TEXTOS & BRANDING

### 1.1 Nombre del Proyecto
**Archivo**: `app/page.tsx`
**Líneas Aproximadas**: 80-120, 450-600

| Actual | Nuevo | Notas |
|--------|-------|-------|
| "Playa Viva" | **[NOMBRE_ELEGIDO]** | En hero, títulos, logotipos |
| "AL MARJAN ISLAND, RAS AL KHAIMAH" | Ubicación genérica premium | Mantener estilo: "COASTAL DISTRICT, [EMIRATE]" |
| "junto al nuevo Wynn Casino de $5.1B" | "junto a resort de clase mundial en construcción" | Genericizar referencia |

**Search Terms** (para Find & Replace):
```
"Playa Viva"
"AL MARJAN ISLAND"
"RAS AL KHAIMAH"
"Ras Al Khaimah"
"Wynn"
"Wynn Resort"
"Al Marjan Island"
```

### 1.2 Textos Descriptivos
**Archivos**: `app/page.tsx` (content object ES/EN)

#### SPANISH (ES) - Content Object (líneas ~200-500)
- [ ] `hero.title`: "Playa Viva" → **[NOMBRE]**
- [ ] `hero.subtitle`: Reemplazar ubicación
- [ ] `hero.description`: Reemplazar Wynn y ubicación
- [ ] `wynnEffect.title`: Cambiar "El Efecto Wynn" → "El Efecto [RESORT]"
- [ ] `wynnEffect.description`: Reescribir sin referencias específicas
- [ ] `wynnEffect.stats`: Cambiar valores de Wynn si es necesario
- [ ] `trust.description`: Reemplazar "Al Marjan Island" y "Wynn"
- [ ] `trust.articles`: URLs de noticias pueden quedar (referentes genéricos)
- [ ] `location.title`: "Al Marjan Island" → Ubicación genérica
- [ ] `location.stats`: Mantener estructura, cambiar contexto

#### ENGLISH (EN) - Content Object (líneas ~550-850)
- [ ] `hero.title`: "Playa Viva" → **[NOMBRE]**
- [ ] `hero.subtitle`: Reemplazar ubicación
- [ ] `hero.description`: Reemplazar Wynn y ubicación
- [ ] `wynnEffect.title`: "The Wynn Effect" → "The [RESORT] Effect"
- [ ] `wynnEffect.description`: Reescribir
- [ ] `trust.description`: Reemplazar referencias
- [ ] `location.title`: Ubicación genérica

### 1.3 Precios & Datos Financieros
**Archivo**: `app/page.tsx` (objetos de precios)

- [ ] `apartmentPrices.studio`: Cambiar EUR/GBP (mantener rango creíble)
- [ ] `apartmentPrices.oneBed`: Idem
- [ ] `apartmentPrices.twoBed`: Idem
- [ ] `apartmentPrices.threeBed`: Idem
- [ ] `paymentPlan`: Mantener estructura (40/60), actualizar contexto
- [ ] `investment.stats`: Cambiar rendimientos si es necesario (7-8% es estándar)
- [ ] `faq.questions`: Genericizar todas las referencias específicas de Playa Viva

**Rango de Precios Actual**:
```javascript
studio: { en: "£172,000", es: "192.000€" }
oneBed: { en: "£325,000", es: "370.000€" }
twoBed: { en: "£526,000", es: "598.000€" }
threeBed: { en: "£795,000", es: "905.000€" }
```

**Estrategia**: Mantener rangos SIMILARES pero cambiar números específicos
- Studio: ±5-10% ajuste
- OneBed: ±5-10% ajuste
- etc.

---

## 🎨 SECCIÓN 2: IMÁGENES & ASSETS

### 2.1 Imágenes Críticas (Frontend)
**Ubicación**: `public/assets/imagenes/`

| Archivo | Tipo | Prioridad | Reemplazo |
|---------|------|-----------|-----------|
| `hero-background.png` | Background | CRÍTICA | Generar con Midjourney |
| `logo-playa-viva.png` | Logo | CRÍTICA | Nuevo logo/texto |
| `studio.webp` | Interior | ALTA | Generar interior estudio |
| `1-bedroom.webp` | Interior | ALTA | Generar 1BR |
| `2-bedroom.webp` | Interior | ALTA | Generar 2BR |
| `3-bedroom.png` | Interior | ALTA | Generar 3BR |
| `Piscina_mejorada.png` | Amenity | ALTA | Generar piscina infinity |
| `cinema.webp` | Amenity | MEDIA | Generar cine al aire libre |
| `foto galeria 4.jpg` | Amenity (Fitness) | MEDIA | Generar fitness center |
| `foto galeria 7.jpg` | Amenity (Spa) | MEDIA | Generar spa/wellness |
| `retail.webp` | Amenity (Retail) | MEDIA | Generar retail/dining |
| `beach.webp` | Location | MEDIA | Generar beach scene |
| `view1.webp` | Feature | MEDIA | Generar vista costera |
| `view2.jpg` | Feature | MEDIA | Generar diseño inspirador |
| `view3.webp` | Feature | MEDIA | Generar lujo moderno |
| `Collage_*.png` | Collages | MEDIA | Recrear collages |
| `news_*.png` | News coverage | BAJA | Mantener (referentes genéricos) |
| `uniestate.png` | Logo Uniestate | BAJA | Mantener |

**Total Images to Generate**: ~25-30

### 2.2 Midjourney Prompts (Preparación)

#### HERO SECTION (1 imagen)
```
Modern luxury beachfront residential complex, 
three contemporary towers overlooking Arabian Gulf, 
sunset lighting, premium photography, 
architectural render quality, 4K, 
architectural visualization style, 
golden hour lighting, calm waters
```

#### APARTMENTS INTERIORS (4 imágenes)
```
[Studio] Minimalist luxury studio apartment, 
modern kitchen, floor-to-ceiling windows, 
sea view, contemporary design, 
high-end finishes, 4K render

[1BR] One-bedroom luxury apartment, 
open-plan living, modern kitchen, 
master suite, balcony with sea view, 
contemporary design, 4K architectural render

[2BR] Two-bedroom luxury apartment corner unit, 
dual balconies, island kitchen, 
modern interiors, sea views, 
contemporary architectural render, 4K

[3BR] Three-bedroom luxury penthouse, 
master suite, panoramic terraces, 
high-end finishes, sea and marina views, 
contemporary design, 4K
```

#### AMENITIES (5 imágenes)
```
[Pool] Modern luxury infinity pool, 
sea view, resort-style, 
contemporary architecture, 
evening lighting, architectural render

[Cinema] Outdoor rooftop cinema, 
modern lounge seating, 
sea backdrop, evening mood, 
luxury resort setting

[Fitness] State-of-the-art fitness center, 
modern equipment, floor-to-ceiling windows, 
sea view, contemporary design, 
architectural render, 4K

[Spa] Luxury spa and wellness center, 
minimalist design, natural materials, 
serene atmosphere, 
contemporary spa architecture

[Retail] Ground-floor luxury retail and 
dining venue, modern restaurant, 
contemporary design, 
coastal setting, high-end finishes
```

#### FEATURES (3 imágenes)
```
[Coastal] Contemporary luxury beachfront 
community, private beach access, 
modern architecture, coastal setting, 
architectural photography, golden hour

[Design] Modern architectural masterpiece, 
luxury residential towers, 
sophisticated design, 
contemporary architecture, 
premium photography

[Lifestyle] Luxury beachfront living, 
modern residences, sea views, 
contemporary architecture, 
lifestyle photography, daytime
```

#### COLLAGES (4 imágenes) - RECREAR
- Estructura del desarrollo (3 torres)
- Servicios e instalaciones
- Sitios de interés cercanos
- Al Marjan Island overview

---

## 🔗 SECCIÓN 3: VARIABLES & CONFIGURACIÓN

### 3.1 Variables a Reemplazar en Código
**Archivo**: `app/page.tsx`

```typescript
// HERO HERO_1: Project Name
const projectName = "Playa Viva" 
// → const projectName = "[NOMBRE_FINAL]"

// HERO_2: Subtitle Location
const subtitle = "AL MARJAN ISLAND, RAS AL KHAIMAH"
// → const subtitle = "[LOCATION_GENERIC]"

// SITE_URL
const SITE_URL = "https://playaviva-uniestate.vercel.app"
// → const SITE_URL = "https://[new-project].vercel.app" (cuando sea)

// ESTRUCTURADO: Meta Data
const structuredData = {
  name: "Playa Viva Residences"
  // → name: "[NOMBRE] Residences"
}
```

### 3.2 URLs & Rutas a Actualizar
- [ ] Meta tags (title, description)
- [ ] Open Graph (og:title, og:description, og:image)
- [ ] Twitter Card
- [ ] Canonical URL
- [ ] Sitemap references

**Archivo**: `app/layout.tsx`, `app/head.js`

---

## 📸 SECCIÓN 4: IMÁGENES - PLAN DETALLADO

### Estrategia Midjourney
1. **Batch 1 (Inmediato)**: Hero + Apartments (5 imágenes)
2. **Batch 2 (Siguiente)**: Amenities (5 imágenes)
3. **Batch 3**: Features + Collages (7 imágenes)
4. **Fine-tuning**: Ajustes según preview

### Fallback Plan
Si Midjourney no funciona:
- Unsplash como backup (búsqueda: "luxury resort", "modern apartment", etc.)
- Pexels como alternative
- Pixabay para assets genéricos

---

## 📋 SECCIÓN 5: ORDEN DE PRIORIDADES (SESIÓN 2 & 3)

### SESIÓN 2: Content + Assets (2-3 horas)
1. ✅ Generar 25-30 imágenes Midjourney (paralelo)
2. ✅ Decidir nombre final del proyecto
3. ✅ Reemplazar todos los textos (ES/EN)
4. ✅ Actualizar precios (rangos creíbles)
5. ✅ Reemplazar imágenes en código
6. ✅ Verificar URLs internas

### SESIÓN 3: Testing + Deploy (1-2 horas)
1. ✅ Testing responsivo (mobile, tablet, desktop)
2. ✅ Testing de formularios
3. ✅ Verificar HubSpot integration
4. ✅ Lighthouse audit
5. ✅ Deploy a nueva URL anónima
6. ✅ Testing final en producción

---

## 🎯 DECISIONES PENDIENTES

### Nombre Final
**Opciones (Estilo Internacional)**:
- [ ] `Azure Bay Residences`
- [ ] `Meridian Shores`
- [ ] `The Riviera Collection`
- [ ] `Sapphire Coast`
- [ ] `Pearl Island Residences`
- [ ] `Coastal Pinnacle`
- [ ] `Marina Luxe`
- [ ] **OTRO**: _________________

### Ubicación Genérica
**Opciones**:
- [ ] "Coastal District, Dubai" (genérico)
- [ ] "Premium Coastal Development, UAE"
- [ ] "Luxury Waterfront Development"
- [ ] "Beachfront Residences, Arabian Gulf"

### URL para Deploy
Current: `https://playaviva-uniestate.vercel.app`
New: `https://[project-name].vercel.app`

Options:
- [ ] `azurebay-residences.vercel.app`
- [ ] `meridian-shores.vercel.app`
- [ ] `sapphire-coast.vercel.app`
- [ ] `anon-luxury-landing.vercel.app` (temporario para portfolio)

---

## 📊 CHECKLIST FINAL (SESIÓN 1)

### Pre-Sesión 2
- [ ] Nombre final DECIDIDO
- [ ] Ubicación genérica DECIDIDA
- [ ] Precios nuevos CALCULADOS
- [ ] Prompts Midjourney REFINADOS
- [ ] Lista de images to replace FINALIZADA

### Documentación
- [ ] Este checklist COMPLETO
- [ ] README de instrucciones CREADO
- [ ] CHANGELOG de cambios INICIADO

---

## 💡 NOTAS IMPORTANTES

1. **Mantener Estructura**: La arquitectura del código es excelente. Solo cambiar CONTENIDO, no ESTRUCTURA.
2. **Bilingüismo**: Todos los cambios ES e EN en paralelo.
3. **Colores**: Mantener variables CSS (az azules, teal, dorados, cremas).
4. **Rendimiento**: Las optimizaciones de Lighthouse se mantienen.
5. **HubSpot**: Sin cambios en integración, solo en textos de form.

---

## 🚀 SIGUIENTE PASO

**¿Cuál es tu nombre final elegido?**

Una vez decidamos:
1. Actualizo este checklist con nombre final
2. Genero los 25-30 prompts de Midjourney finales
3. **COMENZAMOS SESIÓN 2** en paralelo (mientras Midjourney procesa, hacemos text replacements)

**Estoy listo. Dame el nombre final y comenzamos inmediatamente.** ⏱️
