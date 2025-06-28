import type { NextConfig } from 'next';
import withNextIntl from 'next-intl/plugin';

const nextIntlConfig = withNextIntl('./src/i18n/i18n.ts');

const r2Hostname = (() => {
  const r2Url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  // Skip URL parsing if it's a placeholder value (starts with __)
  if (!r2Url || r2Url.startsWith('__')) {
    return undefined;
  }

  try {
    return new URL(r2Url).hostname;
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_R2_PUBLIC_URL:', r2Url);
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  turbopack: {},
  distDir: 'dist',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

if (r2Hostname && nextConfig.images?.remotePatterns) {
  nextConfig.images.remotePatterns.push({
    protocol: 'https',
    hostname: r2Hostname,
    port: '',
    pathname: '/**',
  });
}

export default nextIntlConfig(nextConfig);
