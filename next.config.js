/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configurar las calidades permitidas
    qualities: [60, 75],
    // Si usas dominios externos, añádelos aquí
    // domains: ['example.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  // Optimizations for modern browsers - Turbopack (Next.js 16 default)
  experimental: {
    optimizePackageImports: ['lucide-react', 'zod', 'react-hook-form'],
  },
  // Headers para mejorar bfcache, cache policy y performance
  async headers() {
    return [
      // External CDN resources with long cache
      {
        source: '/(.*)\\.min\\.(js|css)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Static assets (images, fonts) - Cache for 1 year
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Next.js static chunks - Cache for 1 year
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Public folder - Cache for 1 year
      {
        source: '/:path*.@(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // HTML pages - Cache for 1 hour
      {
        source: '/:path*.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate'
          }
        ]
      },
      // API routes - No caching
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      },
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
