import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  poweredByHeader: false,
  transpilePackages: ['@hchat/ui', '@hchat/tokens'],
}

export default nextConfig
