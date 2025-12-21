# Azure Bay Landing Page

**Premium coastal district investment opportunity landing page**

Project: Azure Bay - Fictional waterfront residential concept powered by the Azure Grand Marina catalyst (Spring 2027).

**Live:** [azurebay-meridian.vercel.app](https://azurebay-meridian.vercel.app)

---

## 📋 Project Overview

- **Type**: Premium Next.js landing page
- **Language**: TypeScript + React
- **Styling**: Tailwind CSS with custom design system
- **Features**: 
  - Bilingual (Spanish/English) with dynamic language switching
  - Lead generation with ALTCHA verification
  - Dossier automation via API
  - HubSpot integration ready
  - Mobile-responsive design
  - Smooth scroll animations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ToniIAPro73/azure-bay-landing-page.git
cd azure-bay-landing-page

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

---

## 📦 Deployment to Vercel

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import this GitHub repository
4. Select `ToniIAPro73/azure-bay-landing-page`

### Step 2: Configure Project Settings

**Framework Preset**: Next.js (auto-detected)

**Environment Variables** (if needed):
```
NEXT_PUBLIC_SITE_URL=https://azurebay-meridian.vercel.app
```

### Step 3: Set Custom Domain

1. After deployment, go to **Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `azurebay-meridian.vercel.app`
4. Choose **"Use Vercel DNS"** (recommended)
5. Wait for DNS propagation (usually 1-5 minutes)

### Step 4: Automatic Deployments

- **Production**: Triggered on every `main` branch push
- **Preview**: Triggered on every pull request

---

## 📂 Project Structure

```
.
├── app/
│   ├── page.tsx              # Main landing page (Azure Bay)
│   ├── layout.tsx            # Root layout with metadata
│   ├── HubSpotScript.tsx     # HubSpot integration
│   └── api/
│       ├── submit-lead.ts    # Lead submission endpoint
│       └── altcha/
│           └── challenge.ts  # ALTCHA verification endpoint
├── components/
│   └── ui/                   # Reusable UI components
├── public/
│   ├── assets/               # Images and media
│   ├── hero-background.png   # Hero section background
│   └── vendor/
│       └── altcha.js         # ALTCHA widget library
├── styles/
│   └── globals.css           # Global styles + Tailwind
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 🎨 Design System

### Color Palette

**Primary Colors**:
- Gold/Warm: `#A29060` (luxury accent)
- Brown Dark: `#5a4f3d` (text, primary)
- Cream Light: `#fdf9f3` (background)

**Neutral Colors**:
- Taupe Warm: `#b8a890`
- Olive Brown: `#4a3f2f`

### Typography

- **Font Family**: System UI (Geist, Inter, -apple-system)
- **Headings**: Light weight (300-400) for luxury feel
- **Body**: Normal weight (400) with relaxed line-height

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SITE_URL=https://azurebay-meridian.vercel.app
NEXT_PUBLIC_ALTCHA_API=https://api.altcha.com
```

### HubSpot Integration

The page includes HubSpot script loading when privacy is accepted. Update the script ID in `HubSpotScript.tsx` if needed.

---

## 📝 Content Management

### Bilingual Content

All content is managed in the `content` object inside `page.tsx`:

```typescript
const content = {
  es: { /* Spanish content */ },
  en: { /* English content */ }
};
```

To update content:
1. Edit the relevant section in `page.tsx`
2. Commit changes to `main` branch
3. Vercel deploys automatically

---

## 🔐 Security

- **ALTCHA Verification**: Private anti-bot protection
- **Input Validation**: Server-side validation for all forms
- **HTTPS**: Automatic SSL through Vercel
- **Environment Variables**: Sensitive data in `.env.local`

---

## 🚨 Troubleshooting

### ALTCHA Not Working
- Check that `altcha.js` is loaded from `/vendor/`
- Verify ALTCHA challenge endpoint is accessible

### Form Not Submitting
- Check browser console for errors
- Verify `/api/submit-lead` endpoint is accessible
- Check network tab for response status

### Images Not Loading
- Ensure all image paths in `public/assets/` are correct
- Check that image files exist in the directory

---

## 📞 Support

For questions or issues, contact the development team.

---

## 📄 License

Private project. All rights reserved.
