'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PageTreeItem {
  type: 'page' | 'folder' | 'separator';
  name: string;
  url?: string;
  children?: PageTreeItem[];
}

interface DocsNavigationProps {
  tree: { children: PageTreeItem[] };
}

export function DocsNavigation({ tree }: DocsNavigationProps) {
  const pathname = usePathname();

  const renderItem = (item: PageTreeItem, depth = 0) => {
    if (item.type === 'separator') {
      return (
        <div key={item.name} className="pt-4 pb-2 first:pt-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-400/80">
            {item.name}
          </span>
        </div>
      );
    }

    if (item.type === 'folder') {
      return (
        <div key={item.name} className="space-y-1">
          <span className="block text-sm font-medium text-gray-300 py-1">
            {item.name}
          </span>
          {item.children && (
            <div className="pl-3 border-l border-gray-800 space-y-1">
              {item.children.map(child => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isActive = pathname === item.url;

    return (
      <Link
        key={item.url}
        href={item.url || '#'}
        className={`block text-sm py-2 px-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-pink-500/20 to-cyan-500/10 text-white font-medium border-l-2 border-pink-500'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }`}
      >
        {item.name}
      </Link>
    );
  };

  return (
    <nav className="space-y-1">
      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border border-pink-500/20">
        <p className="text-sm text-gray-300">
          📚 SWIP Documentation
        </p>
      </div>
      {tree.children?.map(item => renderItem(item))}
    </nav>
  );
}

