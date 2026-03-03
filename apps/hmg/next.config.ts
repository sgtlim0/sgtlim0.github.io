import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  transpilePackages: ['@hchat/ui', '@hchat/tokens'],
}

export default withBundleAnalyzer(nextConfig)
