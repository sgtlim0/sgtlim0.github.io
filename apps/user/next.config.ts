import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  transpilePackages: ['@hchat/ui', '@hchat/tokens'],
}

export default withBundleAnalyzer(nextConfig)
