'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  title: string;
  url: string;
  depth: number;
}

interface TableOfContentsProps {
  toc: TocItem[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    const headings = document.querySelectorAll('h2, h3, h4');
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  if (!toc || toc.length === 0) return null;

  return (
    <nav className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-4">
        On this page
      </h4>
      <ul className="space-y-2 text-sm">
        {toc.map((item) => {
          const id = item.url.replace('#', '');
          const isActive = activeId === id;
          
          return (
            <li 
              key={item.url}
              style={{ paddingLeft: `${(item.depth - 2) * 12}px` }}
            >
              <a
                href={item.url}
                className={`block py-1 transition-colors duration-200 ${
                  isActive
                    ? 'text-pink-400 font-medium'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

