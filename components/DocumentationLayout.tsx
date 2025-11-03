'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import 'highlight.js/styles/github-dark.css';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface DocumentationLayoutProps {
  content: string;
  title?: string;
  description?: string;
}

export function DocumentationLayout({ content, title, description }: DocumentationLayoutProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Extract headings from HTML content
  useEffect(() => {
    if (!contentRef.current) return;
    
    const headingElements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const extractedHeadings: Heading[] = Array.from(headingElements).map((heading, index) => {
      let id = heading.id;
      const text = heading.textContent || '';
      const level = parseInt(heading.tagName.charAt(1));
      
      // Generate ID if not present
      if (!id) {
        const slug = text
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        id = slug || `heading-${index}`;
        heading.id = id;
      }
      
      return { id, text, level };
    });
    
    setHeadings(extractedHeadings);
  }, [content]);

  // Update active heading on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveHeading(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Smooth scroll to heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveHeading(id);
    }
  };

  // Copy code functionality
  useEffect(() => {
    const handleCopyClick = (e: MouseEvent) => {
      const button = (e.target as HTMLElement).closest('.copy-code-btn');
      if (!button) return;
      
      const codeBlock = button.parentElement?.querySelector('code');
      if (!codeBlock) return;
      
      const code = codeBlock.textContent || '';
      navigator.clipboard.writeText(code).then(() => {
        const svg = button.querySelector('svg');
        if (svg) {
          // Show checkmark
          svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />`;
          setTimeout(() => {
            // Reset to copy icon
            svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />`;
          }, 2000);
        }
      });
    };

    document.addEventListener('click', handleCopyClick);
    return () => document.removeEventListener('click', handleCopyClick);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img
                src="/logos/Swip_logo-02.svg"
                alt="SWIP Logo"
                className="h-12 w-auto"
              />
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white/70 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link href="/documentation" className="text-white font-medium text-sm">
                Documentation
              </Link>
              <Link href="/developer" className="text-white/70 hover:text-white transition-colors text-sm">
                Developer
              </Link>
              <Link href="/privacy" className="text-white/70 hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link href="/terms" className="text-white/70 hover:text-white transition-colors text-sm">
                Terms
              </Link>
            </nav>
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar - Table of Contents */}
        <aside
          className={`
            fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl
            overflow-y-auto transition-transform duration-300 z-40 md:z-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
          `}
        >
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                On this page
              </h2>
              {headings.length > 0 ? (
                <nav className="space-y-1">
                  {headings.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => scrollToHeading(heading.id)}
                      className={`
                        block w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                        ${
                          activeHeading === heading.id
                            ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-500'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                      style={{
                        paddingLeft: `${(heading.level - 1) * 12 + 12}px`,
                      }}
                    >
                      {heading.text}
                    </button>
                  ))}
                </nav>
              ) : (
                <p className="text-sm text-gray-500">No headings available</p>
              )}
            </div>

            {/* Quick Links */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <nav className="space-y-2">
                <Link
                  href="/developer"
                  className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Developer Portal
                </Link>
                <Link
                  href="/documentation"
                  className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  API Reference
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 md:ml-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:pl-12">
            {/* Title Section */}
            {(title || description) && (
              <div className="mb-12 pb-8 border-b border-white/10">
                {title && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      {title}
                    </h1>
                  </div>
                )}
                {description && (
                  <p className="text-xl text-gray-400 leading-relaxed ml-15">{description}</p>
                )}
              </div>
            )}

            {/* Content */}
            <div
              ref={contentRef}
              className="prose prose-invert prose-lg max-w-none documentation-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <img
                  src="/logos/Swip_logo-04.svg"
                  alt="SWIP Logo"
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Open-source wellness intelligence for the modern age.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/leaderboard" className="text-gray-400 hover:text-white text-sm transition-colors">Leaderboard</Link></li>
                <li><Link href="/sessions" className="text-gray-400 hover:text-white text-sm transition-colors">Sessions</Link></li>
                <li><Link href="/analytics" className="text-gray-400 hover:text-white text-sm transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-2">
                <li><Link href="/developer" className="text-gray-400 hover:text-white text-sm transition-colors">Portal</Link></li>
                <li><Link href="/documentation" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
            <p className="text-gray-500 text-sm">
              © 2025 SWIP Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

