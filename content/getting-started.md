---
title: Getting Started
description: Learn how to use and customize your wiki
---

# Getting Started

Welcome! This guide will help you get started with your markdown wiki.

## Creating New Pages

To create a new wiki page:

1. Create a new `.md` file in the `content/` directory
2. Add frontmatter with title and description
3. Write your content using markdown
4. The page will automatically appear in navigation

### Example

```markdown
---
title: My New Page
description: A description of my page
---

# My New Page

Your content here...
```

## Organizing Content

You can organize your wiki using folders:

```
content/
├── home.md
├── getting-started.md
└── guides/
    ├── markdown-basics.md
    └── advanced-features.md
```

## Markdown Syntax

This wiki supports GitHub Flavored Markdown (GFM), including:

- **Bold** and *italic* text
- `Code` inline and code blocks
- Lists (ordered and unordered)
- Tables
- Links and images
- And much more!

Check out the [Markdown Basics](guides/markdown-basics) guide for more details.

## Deployment

To deploy your wiki to GitHub Pages:

1. Push your code to GitHub
2. Run `npm run deploy`
3. Enable GitHub Pages in repository settings
4. Your wiki will be live!

See the deployment section for detailed instructions.
