import type { Preview } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import '../app/globals.css';

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        Light: '',
        Dark: 'dark',
      },
      defaultTheme: 'Light',
    }),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    viewport: {
      viewports: {
        wikiDesktop: {
          name: 'Wiki Desktop (1440px)',
          styles: { width: '1440px', height: '900px' },
        },
        wikiContent: {
          name: 'Content Area (1160px)',
          styles: { width: '1160px', height: '900px' },
        },
        wikiSidebar: {
          name: 'Sidebar Only (280px)',
          styles: { width: '280px', height: '900px' },
        },
      },
    },
  },
};

export default preview;
