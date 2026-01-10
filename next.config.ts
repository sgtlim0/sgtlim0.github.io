import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If deploying to username.github.io/repo-name, uncomment and set basePath:
  // basePath: '/your-repo-name',
};

export default nextConfig;
