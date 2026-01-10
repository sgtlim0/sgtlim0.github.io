import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export interface PageData {
  slug: string;
  title: string;
  description?: string;
  content: string;
  path: string;
}

export interface NavItem {
  title: string;
  slug: string;
  path: string;
  children?: NavItem[];
}

// Get all markdown files recursively
function getAllMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (item.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

// Convert file path to slug
function pathToSlug(filePath: string): string {
  return filePath
    .replace(/\.md$/, '')
    .replace(/\\/g, '/');
}

// Get all pages
export function getAllPages(): PageData[] {
  const files = getAllMarkdownFiles(contentDirectory);

  return files.map(file => {
    const fullPath = path.join(contentDirectory, file);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: pathToSlug(file),
      title: data.title || 'Untitled',
      description: data.description,
      content,
      path: file,
    };
  });
}

// Get page by slug
export function getPageBySlug(slug: string): PageData | null {
  const pages = getAllPages();
  return pages.find(page => page.slug === slug) || null;
}

// Build navigation structure
export function getNavigation(): NavItem[] {
  const pages = getAllPages();
  const nav: NavItem[] = [];
  const navMap = new Map<string, NavItem>();

  // Sort pages: home first, then alphabetically
  pages.sort((a, b) => {
    if (a.slug === 'home') return -1;
    if (b.slug === 'home') return 1;
    return a.title.localeCompare(b.title);
  });

  for (const page of pages) {
    const parts = page.slug.split('/');

    if (parts.length === 1) {
      // Top-level page
      const navItem: NavItem = {
        title: page.title,
        slug: page.slug,
        path: `/${page.slug}`,
      };
      nav.push(navItem);
      navMap.set(page.slug, navItem);
    } else {
      // Nested page
      const parentSlug = parts.slice(0, -1).join('/');
      const navItem: NavItem = {
        title: page.title,
        slug: page.slug,
        path: `/${page.slug}`,
      };

      // Find or create parent
      let parent = navMap.get(parentSlug);
      if (!parent) {
        parent = {
          title: parentSlug.split('/').pop() || parentSlug,
          slug: parentSlug,
          path: `/${parentSlug}`,
          children: [],
        };
        nav.push(parent);
        navMap.set(parentSlug, parent);
      }

      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(navItem);
      navMap.set(page.slug, navItem);
    }
  }

  return nav;
}
