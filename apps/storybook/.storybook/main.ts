import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../../wiki'),
      '@hchat/ui': path.resolve(__dirname, '../../../packages/ui/src'),
      '@hchat/ui/hmg': path.resolve(__dirname, '../../../packages/ui/src/hmg'),
      '@hchat/ui/admin': path.resolve(__dirname, '../../../packages/ui/src/admin'),
      '@hchat/ui/user': path.resolve(__dirname, '../../../packages/ui/src/user'),
      '@hchat/tokens': path.resolve(__dirname, '../../../packages/tokens/src'),
    };
    return config;
  },
};

export default config;
