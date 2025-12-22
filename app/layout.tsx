import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://azurebay-meridiangroup.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title:
    "Azure Bay Residences | Inversión en Vista Marina, Costa del Sol Premium desde €192k",
  description:
    "Azure Bay Residences es un residencial frente al mar en Vista Marina, Costa del Sol Premium con estudios y apartamentos llave en mano desde £172,000 / 192.000 €. Plan 1% mensual y entrega Q2 2026.",
  generator: "v0.app",
  keywords:
    "inversión inmobiliaria Dubai, Vista Marina, Costa del Sol Premium, Azure Bay Residences, propiedades lujo Emiratos, real estate investment Ras Al Khaimah, seafront apartments UAE",
  alternates: {
    canonical: "/",
    languages: {
      es: "/",
      en: "/?lang=en",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Azure Bay Residences",
    title:
      "Azure Bay Residences | Inversión frente al mar en Vista Marina, Costa del Sol Premium",
    description:
      "Viviendas llave en mano en Vista Marina, Costa del Sol Premium con vistas al Azure Grand Marina. Desde £172k / 192.000€ con plan de pago flexible.",
    images: [
      {
        url: "/assets/imagenes/hero-image.webp",
        width: 1200,
        height: 630,
        alt: "Render de Azure Bay Residences frente al mar en Vista Marina, Costa del Sol Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Azure Bay Residences | Inversión frente al mar en Vista Marina, Costa del Sol Premium",
    description:
      "Residencias boutique con vistas al mar y plan de pago 1% mensual. Descargue el dossier oficial.",
    images: ["/assets/imagenes/hero-image.webp"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical resources for performance */}
        <link
          rel="preconnect"
          href="https://js-eu1.hs-scripts.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/vendor/altcha.js"
          as="script"
          crossOrigin="anonymous"
        />
        <meta name="google" content="notranslate" />
        <meta
          name="description"
          content="Residencias frente al mar en Vista Marina, Costa del Sol Premium con planes de pago flexibles desde €192K. Descarga el dossier de Azure Bay Residences y descubre precios, amenities y la conexión con Azure Grand Marina."
        />
        <meta
          property="og:description"
          content="Residencias frente al mar en Vista Marina, Costa del Sol Premium con planes de pago flexibles desde €192K. Descarga el dossier oficial de Azure Bay Residences y descubre la inversión junto a Azure Grand Marina."
        />
        <meta
          name="twitter:description"
          content="Residencias boutique en Vista Marina, Costa del Sol Premium con vista al mar y planes de pago flexibles. Descarga el dossier y conoce la inversión Azure Bay Residences."
        />
      </head>
      <body
        className={`font-sans antialiased`}
        translate="no"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
