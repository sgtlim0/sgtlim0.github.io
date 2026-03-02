import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'H Chat Wiki Design System',
    brandUrl: 'https://hchat-wiki.vercel.app',
    colorPrimary: '#2563EB',
    colorSecondary: '#3B82F6',
  }),
});
