# Markdown Wiki

A simple, Notion-style markdown-based wiki built with Next.js. Perfect for documentation, knowledge bases, and personal wikis.

## Features

- **Markdown Support**: Write content in standard markdown format
- **Notion-Style UI**: Clean, minimalist design inspired by Notion
- **Automatic Navigation**: Sidebar navigation generated from your content
- **Syntax Highlighting**: Code blocks with language-specific highlighting
- **GitHub Pages Ready**: Easy deployment to GitHub Pages
- **Static Export**: Fast, SEO-friendly static HTML generation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd markdown-wiki
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Creating Content

### Adding New Pages

1. Create a new `.md` file in the `content/` directory
2. Add frontmatter at the top of the file:

```markdown
---
title: Your Page Title
description: A brief description of your page
---

# Your Content Here

Write your content using markdown...
```

3. The page will automatically appear in the sidebar navigation

### Organizing Content

You can organize your content using folders:

```
content/
├── home.md                  # Homepage
├── getting-started.md       # Top-level page
└── guides/                  # Folder for guides
    ├── markdown-basics.md
    └── advanced-topics.md
```

Pages in folders will be grouped in the sidebar with a collapsible menu.

### Markdown Features

This wiki supports GitHub Flavored Markdown (GFM):

- Headings (`#`, `##`, `###`, etc.)
- **Bold**, *italic*, ~~strikethrough~~ text
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Tables
- Links and images
- Blockquotes
- Task lists
- And more!

See the [Markdown Basics](content/guides/markdown-basics.md) guide for examples.

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

This project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` branch.

1. **Push your code to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" in the sidebar
   - Under "Build and deployment", select "GitHub Actions" as the source
   - Save the settings

3. **Configure base path (if needed)**:
   - If deploying to `username.github.io/repo-name`, edit `next.config.ts`
   - Uncomment and set the `basePath`:
   ```typescript
   basePath: '/your-repo-name',
   ```
   - Commit and push the change

4. **Wait for deployment**:
   - GitHub Actions will automatically build and deploy your site
   - Check the "Actions" tab to monitor progress
   - Your site will be live at `https://username.github.io/repo-name/`

### Manual Deployment

If you prefer manual deployment:

1. Build the static site:
```bash
npm run build
```

2. The static files will be in the `out/` directory

3. Deploy the `out/` directory to any static hosting service

## Configuration

### Site Title and Metadata

Edit `app/layout.tsx` to change the site title and description:

```typescript
export const metadata: Metadata = {
  title: "My Wiki",
  description: "A simple markdown-based wiki",
};
```

### Styling

The wiki uses Tailwind CSS for styling. You can customize:

- Colors and theme: Edit `app/globals.css`
- Component styles: Edit files in `components/`
- Markdown rendering: Edit `components/MarkdownRenderer.tsx`

### Navigation

The sidebar navigation is automatically generated from your content structure. Pages are sorted with `home.md` first, then alphabetically.

## Project Structure

```
markdown-wiki/
├── app/                      # Next.js app directory
│   ├── [[...slug]]/         # Dynamic route for wiki pages
│   ├── layout.tsx           # Root layout with sidebar
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Sidebar.tsx          # Navigation sidebar
│   └── MarkdownRenderer.tsx # Markdown content renderer
├── content/                 # Your markdown content
│   ├── home.md             # Homepage
│   ├── getting-started.md  # Example page
│   └── guides/             # Example folder
├── lib/                     # Utility functions
│   └── markdown.ts         # Markdown parsing utilities
├── public/                  # Static assets
└── .github/workflows/       # GitHub Actions workflows
    └── deploy.yml          # Deployment workflow
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown, gray-matter
- **Syntax Highlighting**: highlight.js
- **Language**: TypeScript

## Customization

### Adding Features

This wiki is designed to be simple and extensible. You can add features like:

- Search functionality
- Table of contents
- Dark mode
- Comments
- Edit buttons linking to GitHub
- Custom components in markdown

### Theming

The design is inspired by Notion's clean aesthetic. You can customize the look by editing:

- Sidebar: `components/Sidebar.tsx`
- Content rendering: `components/MarkdownRenderer.tsx`
- Colors and spacing: `app/globals.css`

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Make sure all markdown files have valid frontmatter
2. Check that there are no circular references in links
3. Verify Node.js version (18+ required)

### GitHub Pages Not Updating

1. Check the "Actions" tab for deployment status
2. Ensure GitHub Pages is enabled in repository settings
3. Verify the `basePath` is correct if using a project repository

### Images Not Loading

1. Place images in the `public/` directory
2. Reference them in markdown as `/image-name.jpg`
3. If using `basePath`, ensure images are referenced correctly

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

Built with Next.js and Markdown
