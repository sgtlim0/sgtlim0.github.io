import type { StorybookConfig } from '@storybook/nextjs-vite'
import path from 'path'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../../wiki'),
      '@hchat/ui': path.resolve(__dirname, '../../../packages/ui/src'),
      '@hchat/ui/hmg': path.resolve(__dirname, '../../../packages/ui/src/hmg'),
      '@hchat/ui/admin': path.resolve(__dirname, '../../../packages/ui/src/admin'),
      '@hchat/ui/user': path.resolve(__dirname, '../../../packages/ui/src/user'),
      '@hchat/ui/llm-router': path.resolve(__dirname, '../../../packages/ui/src/llm-router'),
      '@hchat/ui/desktop': path.resolve(__dirname, '../../../packages/ui/src/desktop'),
      '@hchat/ui/mobile': path.resolve(__dirname, '../../../packages/ui/src/mobile'),
      '@hchat/ui/roi': path.resolve(__dirname, '../../../packages/ui/src/roi'),
      '@hchat/ui/i18n': path.resolve(__dirname, '../../../packages/ui/src/i18n'),
      '@hchat/tokens': path.resolve(__dirname, '../../../packages/tokens/src'),
    }
    // Vite 7 + Rollup: "iife" worker format is incompatible with code-splitting
    config.worker = { ...config.worker, format: 'es' as const }
    return config
  },
}

export default config
