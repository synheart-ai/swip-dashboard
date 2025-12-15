import { getMarkdownDocument } from '@/lib/markdown';
import Link from 'next/link';

export default async function DocumentationPage() {
  const doc = await getMarkdownDocument('documentation');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/swip-logo.svg"
                alt="SWIP Logo"
                className="h-12 w-auto"
              />
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-white/70 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/documentation" className="text-white font-medium">
                Documentation
              </Link>
              <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-none">
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white/50 text-sm">
            <p>&copy; 2025 Synheart AI. All rights reserved.</p>
            <div className="mt-4 space-x-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/documentation" className="hover:text-white transition-colors">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
