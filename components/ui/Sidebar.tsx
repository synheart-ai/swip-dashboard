/**
 * Sidebar Component
 *
 * Navigation sidebar with active state handling
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export interface SidebarLink {
  href: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface SidebarSection {
  title?: string;
  links: SidebarLink[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  logo?: ReactNode;
  footer?: ReactNode;
}

export function Sidebar({ sections, logo, footer }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      {logo && (
        <div className="p-6 border-b border-gray-800">
          {logo}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.title && (
              <h3 className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1 px-3">
              {section.links.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 group
                        ${
                          active
                            ? 'bg-synheart-pink/10 text-synheart-pink border border-synheart-pink/30'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }
                      `}
                    >
                      {link.icon && (
                        <span className={`${active ? 'text-synheart-pink' : 'text-gray-500 group-hover:text-gray-400'}`}>
                          {link.icon}
                        </span>
                      )}
                      <span className="flex-1 font-medium">{link.label}</span>
                      {link.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs font-semibold rounded-full
                          ${active ? 'bg-synheart-pink/20 text-synheart-pink' : 'bg-gray-800 text-gray-400'}
                        `}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-6 border-t border-gray-800">
          {footer}
        </div>
      )}
    </aside>
  );
}
