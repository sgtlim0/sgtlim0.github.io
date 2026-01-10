import { getAllPages, getPageBySlug } from '@/lib/markdown';
import MarkdownRenderer from '@/components/MarkdownRenderer';
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
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: `${page.title} | My Wiki`,
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

  return (
    <article className="max-w-4xl mx-auto px-8 py-12">
      <header className="mb-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">{page.title}</h1>
        {page.description && (
          <p className="text-lg text-gray-600">{page.description}</p>
        )}
      </header>
      <MarkdownRenderer content={page.content} />
    </article>
  );
}
