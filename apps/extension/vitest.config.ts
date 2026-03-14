import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@hchat/ui': resolve(__dirname, '../../packages/ui/src'),
      '@hchat/tokens': resolve(__dirname, '../../packages/tokens'),
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/main.tsx'],
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
    },
  },
})
