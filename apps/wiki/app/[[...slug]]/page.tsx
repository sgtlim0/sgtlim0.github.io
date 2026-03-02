import { getAllPages, getPageBySlug } from '@/lib/markdown';
import HomePage from '@/components/HomePage';
import DocsLayout from '@/components/DocsLayout';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  const pages = getAllPages();

  return pages.map((page) => ({
    slug: page.slug === 'home' ? undefined : page.slug.split('/'),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const pageSlug = slug ? slug.join('/') : 'home';
  const page = getPageBySlug(pageSlug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: `${page.title} | H Chat Wiki`,
    description: page.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const pageSlug = slug ? slug.join('/') : 'home';
  const page = getPageBySlug(pageSlug);

  if (!page) {
    notFound();
  }

  if (pageSlug === 'home') {
    return <HomePage />;
  }

  return <DocsLayout page={page} />;
}
