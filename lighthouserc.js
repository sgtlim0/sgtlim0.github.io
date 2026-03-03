module.exports = {
  ci: {
    collect: {
      url: [
        'https://sgtlim0.github.io/',
        'https://hchat-admin.vercel.app/',
        'https://hchat-hmg.vercel.app/',
        'https://hchat-user.vercel.app/',
        'https://hchat-llm-router.vercel.app/',
        'https://hchat-desktop.vercel.app/',
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
