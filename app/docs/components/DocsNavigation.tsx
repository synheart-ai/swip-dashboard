'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Root, Node } from 'fumadocs-core/page-tree';
import type React from 'react';

interface PageTreeItem {
  type: 'page' | 'folder' | 'separator';
  name: string;
  url?: string;
  children?: PageTreeItem[];
}

interface DocsNavigationProps {
  tree: Root;
}

// Helper function to convert ReactNode to string
function nodeToString(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToString).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: React.ReactNode } }).props;
    if (props?.children) return nodeToString(props.children);
    return '';
  }
  return '';
}

export function DocsNavigation({ tree }: DocsNavigationProps) {
  const pathname = usePathname();

  // Transform fumadocs Root nodes to PageTreeItem format
  const transformNode = (node: Node): PageTreeItem | null => {
    if (node.type === 'separator') {
      return {
        type: 'separator',
        name: node.name ? nodeToString(node.name) : '',
      };
    }
    if (node.type === 'folder') {
      return {
        type: 'folder',
        name: nodeToString(node.name),
        children: node.children?.map(transformNode).filter((item): item is PageTreeItem => item !== null) || [],
      };
    }
    if (node.type === 'page') {
      return {
        type: 'page',
        name: nodeToString(node.name),
        url: node.url,
      };
    }
    return null;
  };

  const transformedChildren = tree.children?.map(transformNode).filter((item): item is PageTreeItem => item !== null) || [];

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
      {transformedChildren.map(item => renderItem(item))}
    </nav>
  );
}

