
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: [],
    unoptimized: false,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  // Настройки для Vercel
  experimental: {
    serverComponentsExternalPackages: ['plotly.js'],
  },
  // Исключаем проблемные зависимости из bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
