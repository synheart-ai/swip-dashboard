import type { ReactNode } from 'react';
import { CopyButtonScript } from './CopyButtonScript';

interface DocsContentProps {
  children: ReactNode;
}

export function DocsContent({ children }: DocsContentProps) {
  return (
    <>
      <div className="docs-content">
        {children}
      </div>
      <CopyButtonScript />
      <style>{`
        /* ===== DOCS CONTENT STYLES ===== */
        
        .docs-content {
          color: #e5e7eb;
          line-height: 1.8;
          font-size: 1rem;
        }
        
        /* ===== HEADINGS ===== */
        
        .docs-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          color: white;
          margin-top: 2rem;
          margin-bottom: 1rem;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, #fff 0%, #f9a8d4 50%, #67e8f9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .docs-content h2 {
          font-size: 1.75rem;
          font-weight: 600;
          color: white;
          margin-top: 3rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          scroll-margin-top: 100px;
        }
        
        .docs-content h3 {
          font-size: 1.375rem;
          font-weight: 600;
          color: #f3f4f6;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          scroll-margin-top: 100px;
        }
        
        .docs-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #e5e7eb;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          scroll-margin-top: 100px;
        }
        
        /* ===== PARAGRAPHS ===== */
        
        .docs-content p {
          margin-bottom: 1.25rem;
          color: #d1d5db;
        }
        
        .docs-content strong {
          color: white;
          font-weight: 600;
        }
        
        .docs-content em {
          color: #f9a8d4;
        }
        
        /* ===== LINKS ===== */
        
        .docs-content a {
          color: #67e8f9;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
        }
        
        .docs-content a:hover {
          color: #f472b6;
          border-bottom-color: #f472b6;
        }
        
        /* ===== CODE BLOCKS ===== */
        
        .code-block-wrapper {
          position: relative;
          margin: 1.5rem 0;
        }
        
        .docs-content pre {
          position: relative;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: 1.25rem;
          padding-top: 1.5rem;
          overflow-x: auto;
          font-size: 0.875rem;
          line-height: 1.7;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(139, 92, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        
        .docs-content pre::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f472b6, #8b5cf6, #67e8f9);
          border-radius: 12px 12px 0 0;
        }
        
        .docs-content pre code {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
          font-size: 0.875rem;
          color: #e2e8f0;
        }
        
        .copy-button {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        .copy-button:hover {
          background: rgba(244, 114, 182, 0.2);
          border-color: rgba(244, 114, 182, 0.3);
          color: #f472b6;
        }
        
        /* ===== INLINE CODE ===== */
        
        .docs-content :not(pre) > code {
          background: linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          color: #f9a8d4;
          padding: 0.2em 0.5em;
          border-radius: 6px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.875em;
          border: 1px solid rgba(244, 114, 182, 0.2);
          white-space: nowrap;
        }
        
        /* ===== LISTS ===== */
        
        .docs-content ul {
          list-style: none;
          padding-left: 0;
          margin: 1.25rem 0;
        }
        
        .docs-content ul li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.75rem;
          color: #d1d5db;
        }
        
        .docs-content ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.6em;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #f472b6, #8b5cf6);
          border-radius: 50%;
        }
        
        .docs-content ol {
          counter-reset: list-counter;
          list-style: none;
          padding-left: 0;
          margin: 1.25rem 0;
        }
        
        .docs-content ol li {
          position: relative;
          padding-left: 2.5rem;
          margin-bottom: 0.75rem;
          counter-increment: list-counter;
          color: #d1d5db;
        }
        
        .docs-content ol li::before {
          content: counter(list-counter);
          position: absolute;
          left: 0;
          top: 0;
          width: 1.75rem;
          height: 1.75rem;
          background: linear-gradient(135deg, #f472b6, #8b5cf6);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* ===== TABLES ===== */
        
        .docs-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 1.5rem 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(15, 23, 42, 0.5);
        }
        
        .docs-content th {
          background: linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(103, 232, 249, 0.1) 100%);
          color: #f9a8d4;
          font-weight: 600;
          text-align: left;
          padding: 1rem 1.25rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .docs-content td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #d1d5db;
        }
        
        .docs-content tr:last-child td {
          border-bottom: none;
        }
        
        .docs-content tr:hover td {
          background: rgba(244, 114, 182, 0.05);
        }
        
        /* ===== BLOCKQUOTES ===== */
        
        .docs-content blockquote {
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid;
          border-image: linear-gradient(180deg, #f472b6, #8b5cf6) 1;
          background: linear-gradient(90deg, rgba(244, 114, 182, 0.1) 0%, transparent 100%);
          border-radius: 0 12px 12px 0;
          color: #e5e7eb;
        }
        
        .docs-content blockquote p {
          margin: 0;
        }
        
        /* ===== HORIZONTAL RULE ===== */
        
        .docs-content hr {
          margin: 3rem 0;
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(244, 114, 182, 0.5), rgba(103, 232, 249, 0.5), transparent);
        }
        
        /* ===== IMAGES ===== */
        
        .docs-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem 0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* ===== NESTED LISTS ===== */
        
        .docs-content ul ul,
        .docs-content ol ol,
        .docs-content ul ol,
        .docs-content ol ul {
          margin: 0.5rem 0 0.5rem 1rem;
        }
        
        .docs-content ul ul li::before {
          width: 6px;
          height: 6px;
          background: rgba(244, 114, 182, 0.5);
        }
        
        /* ===== KEYBOARD SHORTCUTS ===== */
        
        .docs-content kbd {
          display: inline-block;
          padding: 0.2em 0.5em;
          background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
          border: 1px solid #4b5563;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.875em;
          color: #e5e7eb;
          box-shadow: 0 2px 0 #111827;
        }
        
        /* ===== MARK/HIGHLIGHT ===== */
        
        .docs-content mark {
          background: linear-gradient(135deg, rgba(244, 114, 182, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
          color: white;
          padding: 0.1em 0.3em;
          border-radius: 4px;
        }
        
        /* ===== SCROLLBAR ===== */
        
        .docs-content pre::-webkit-scrollbar {
          height: 8px;
        }
        
        .docs-content pre::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        .docs-content pre::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #f472b6, #8b5cf6);
          border-radius: 4px;
        }
        
        /* ===== SELECTION ===== */
        
        .docs-content ::selection {
          background: rgba(244, 114, 182, 0.3);
          color: white;
        }
        
        /* ===== FIRST PARAGRAPH EMPHASIS ===== */
        
        .docs-content > p:first-of-type {
          font-size: 1.125rem;
          color: #e5e7eb;
        }
      `}</style>
    </>
  );
}
