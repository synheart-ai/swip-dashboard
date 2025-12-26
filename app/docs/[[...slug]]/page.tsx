import { source } from '../../../lib/source';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DocsContent } from '../components/DocsContent';
import { TableOfContents } from '../components/TableOfContents';
import { mdxComponents } from '../components/mdx-components';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <article className="flex-1 min-w-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/docs" className="hover:text-pink-400 transition-colors">Docs</a>
          <span>/</span>
          <span className="text-gray-300">{page.data.title}</span>
        </nav>

        {/* Title & Description */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-pink-200 to-cyan-200 bg-clip-text text-transparent">
            {page.data.title}
          </h1>
          {page.data.description && (
            <p className="text-lg text-gray-400 leading-relaxed">
              {page.data.description}
            </p>
          )}
        </header>

        {/* Content */}
        <DocsContent>
          <MDX components={mdxComponents} />
        </DocsContent>

        {/* Navigation Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <a 
              href="/docs" 
              className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Docs
            </a>
            <a
              href="https://github.com/synheart-ai/swip-dashboard/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit this page
            </a>
          </div>
        </footer>
      </article>

      {/* Table of Contents */}
      <aside className="hidden xl:block w-56 flex-shrink-0">
        <div className="sticky top-24">
          <TableOfContents toc={page.data.toc} />
        </div>
      </aside>
    </div>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) return {};

  return {
    title: `${page.data.title} | SWIP Docs`,
    description: page.data.description,
  };
}
