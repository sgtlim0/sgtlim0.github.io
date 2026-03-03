import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  transpilePackages: ['@hchat/ui', '@hchat/tokens'],
}

export default nextConfig
