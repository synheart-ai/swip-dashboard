/**
 * Sidebar Component
 *
 * Navigation sidebar with collapsible and mobile-friendly design
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
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({ 
  sections, 
  logo, 
  footer, 
  isCollapsed, 
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-screen bg-gray-950 border-r border-gray-800 flex flex-col
          transition-all duration-300 ease-in-out z-50 overflow-hidden
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo and Toggle */}
        <div className={`p-3 border-b border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {/* Logo - Full or Small */}
          <div className={`transition-all duration-200 ${isCollapsed ? 'w-full flex justify-center' : 'flex-1'}`}>
            {isCollapsed ? (
              /* Small Logo Icon */
              <Link href="/" className="flex items-center group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
              </Link>
            ) : (
              /* Full Logo */
              logo
            )}
          </div>
          
          {!isCollapsed && (
            <>
              {/* Desktop Toggle Button */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg 
                  className="w-4 h-4"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Collapse Button at Bottom - Only when collapsed */}
        {isCollapsed && (
          <div className="p-3 border-b border-gray-800 flex justify-center">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <svg 
                className="w-4 h-4 rotate-180"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {section.title && !isCollapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1 px-2">
                {section.links.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onCloseMobile}
                        className={`
                          flex items-center rounded-lg
                          transition-all duration-200 group relative
                          ${
                            active
                              ? 'bg-synheart-pink/10 text-synheart-pink border border-synheart-pink/30'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }
                          ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
                        `}
                        title={isCollapsed ? link.label : undefined}
                      >
                        {link.icon && (
                          <span className={`${active ? 'text-synheart-pink' : 'text-gray-500 group-hover:text-gray-400'} flex-shrink-0`}>
                            {link.icon}
                          </span>
                        )}
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 font-medium truncate">{link.label}</span>
                            {link.badge && (
                              <span className={`
                                px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0
                                ${active ? 'bg-synheart-pink/20 text-synheart-pink' : 'bg-gray-800 text-gray-400'}
                              `}>
                                {link.badge}
                              </span>
                            )}
                          </>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 border border-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                            {link.label}
                            {link.badge && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-800">
                                {link.badge}
                              </span>
                            )}
                          </div>
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
        {footer && !isCollapsed && (
          <div className="p-6 border-t border-gray-800">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
