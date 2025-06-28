import type {NextConfig} from 'next';
import withNextIntl from 'next-intl/plugin';

const nextIntlConfig = withNextIntl('./src/i18n/i18n.ts');

const r2Hostname = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname
  : undefined;

const remotePatterns: NextConfig['images']['remotePatterns'] = [
  {
    protocol: 'https',
    hostname: 'placehold.co',
    port: '',
    pathname: '/**',
  },
];

if (r2Hostname) {
  remotePatterns.push({
    protocol: 'https',
    hostname: r2Hostname,
    port: '',
    pathname: '/**',
  });
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  outDir: 'dist',
  images: {
    remotePatterns,
  },
};

export default nextIntlConfig(nextConfig);
