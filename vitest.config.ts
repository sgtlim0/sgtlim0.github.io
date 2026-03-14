import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hchat/ui': resolve(__dirname, 'packages/ui/src'),
      '@hchat/tokens': resolve(__dirname, 'packages/tokens'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      include: ['packages/ui/src/**/*.{ts,tsx}'],
      exclude: ['packages/ui/src/**/index.ts', 'packages/ui/src/**/*.stories.{ts,tsx}'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
})
