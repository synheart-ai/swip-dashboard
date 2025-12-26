import Link from 'next/link';
import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  href?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function Card({ title, href, icon, children }: CardProps) {
  const content = (
    <div className="group relative p-6 rounded-xl border border-gray-800/50 bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-purple-900/20 hover:border-pink-500/40 transition-all duration-500 cursor-pointer h-full overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -inset-px bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-cyan-500/20 blur-xl" />
      </div>
      
      {/* Content */}
      <div className="relative">
        {icon && (
          <div className="mb-4 w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-white group-hover:text-pink-300 transition-colors duration-300 mb-2">
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {children}
        </p>
        {href && (
          <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm font-medium group-hover:text-pink-400 transition-all duration-300">
            <span>Learn more</span>
            <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-pink-500/30 to-transparent blur-2xl" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline hover:no-underline">
        {content}
      </Link>
    );
  }

  return content;
}

interface CardsProps {
  children: ReactNode;
  cols?: 2 | 3;
}

export function Cards({ children, cols = 3 }: CardsProps) {
  return (
    <div className={`grid grid-cols-1 ${cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4 my-8 not-prose`}>
      {children}
    </div>
  );
}

// Callout component for notes, warnings, tips
interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'error' | 'note';
  title?: string;
  children: ReactNode;
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const styles: Record<string, { bg: string; border: string; icon: string; title: string }> = {
    info: {
      bg: 'from-cyan-500/10 to-blue-500/5',
      border: 'border-cyan-500/30',
      icon: 'text-cyan-400',
      title: 'text-cyan-300',
    },
    warning: {
      bg: 'from-yellow-500/10 to-orange-500/5',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-400',
      title: 'text-yellow-300',
    },
    tip: {
      bg: 'from-green-500/10 to-emerald-500/5',
      border: 'border-green-500/30',
      icon: 'text-green-400',
      title: 'text-green-300',
    },
    error: {
      bg: 'from-red-500/10 to-rose-500/5',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      title: 'text-red-300',
    },
    note: {
      bg: 'from-purple-500/10 to-pink-500/5',
      border: 'border-purple-500/30',
      icon: 'text-purple-400',
      title: 'text-purple-300',
    },
  };

  const icons: Record<string, ReactNode> = {
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    tip: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    note: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  };

  // Default to info if type is not found
  const safeType = type && styles[type] ? type : 'info';
  const style = styles[safeType];
  const icon = icons[safeType];

  return (
    <div className={`my-6 p-5 rounded-xl border ${style.border} bg-gradient-to-r ${style.bg} backdrop-blur-sm not-prose`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`font-semibold mb-2 ${style.title}`}>{title}</p>
          )}
          <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Steps component for numbered instructions
interface StepsProps {
  children: ReactNode;
}

export function Steps({ children }: StepsProps) {
  return (
    <div className="my-8 space-y-6 not-prose">
      {children}
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  children: ReactNode;
}

export function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-5 group">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 group-hover:scale-110 transition-all duration-300">
          {number}
        </div>
        <div className="w-0.5 h-full bg-gradient-to-b from-pink-500/50 to-transparent mx-auto mt-2" />
      </div>
      <div className="flex-1 pb-6">
        <h4 className="font-semibold text-white mb-2 group-hover:text-pink-300 transition-colors">{title}</h4>
        <div className="text-gray-400 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// Badge/Tag component
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const variants = {
    default: 'bg-gray-700/50 text-gray-300 border-gray-600',
    success: 'bg-green-500/10 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// API Endpoint component
interface EndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  children?: ReactNode;
}

export function Endpoint({ method, path, children }: EndpointProps) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400 border-green-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
    PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="my-4 rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden not-prose">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 border-b border-gray-800">
        <span className={`px-2.5 py-1 rounded text-xs font-bold ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-sm text-gray-300 font-mono">{path}</code>
      </div>
      {children && (
        <div className="p-4 text-sm text-gray-400">
          {children}
        </div>
      )}
    </div>
  );
}

// Export all components for MDX
export const mdxComponents = {
  Card,
  Cards,
  Callout,
  Steps,
  Step,
  Badge,
  Endpoint,
};
