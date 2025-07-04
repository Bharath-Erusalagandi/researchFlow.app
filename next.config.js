/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },

  // Compression and optimization
  compress: true,
  
  // Bundle analyzer (enable when needed)
  webpack: (config, { dev, isServer }) => {
    // Enable bundle analyzer in development
    if (dev && !isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    // Optimize chunk splitting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion|@react-spring)[\\/]/,
              name: 'animations',
              chunks: 'all',
            },
            icons: {
              test: /[\\/]node_modules[\\/](lucide-react|@tabler\/icons-react)[\\/]/,
              name: 'icons',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },

  exportPathMap: function () {
    return {
      '/': { page: '/' },
      '/search': { page: '/search' },
      '/professors': { page: '/professors' },
      '/publications': { page: '/publications' },
      '/research': { page: '/research' },
      '/contact': { page: '/contact' },
      '/profile': { page: '/profile' },
      '/login': { page: '/login' },
      '/signup': { page: '/signup' }
    };
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  images: {
    domains: [
      'images.unsplash.com',
      'upload.wikimedia.org',
      'lh3.googleusercontent.com'
    ],
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  }
}

module.exports = nextConfig 