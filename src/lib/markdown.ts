import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';

const postsDirectory = path.join(process.cwd(), 'content');

export interface MarkdownDocument {
  slug: string;
  content: string;
  title: string;
  date?: string;
  description?: string;
}

// Helper function to generate slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to add IDs to headings in HTML
function addHeadingIds(html: string): string {
  const headingRegex = /<h([1-6])>([^<]+)<\/h[1-6]>/g;
  return html.replace(headingRegex, (match, level, text) => {
    const id = slugify(text);
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
}

// Helper function to add syntax highlighting to code blocks
function highlightCodeBlocks(html: string): string {
  // Match code blocks with language hints (```language)
  const codeBlockRegex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
  
  return html.replace(codeBlockRegex, (match, language, code) => {
    // Decode HTML entities
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    try {
      // Auto-detect language if not specified or try to highlight with specified language
      const highlighted = language && hljs.getLanguage(language)
        ? hljs.highlight(decodedCode, { language }).value
        : hljs.highlightAuto(decodedCode).value;
      
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    } catch (e) {
      // If highlighting fails, return original with class
      return `<pre><code class="language-${language}">${code}</code></pre>`;
    }
  });
}

// Helper function to add copy button to code blocks
function addCopyButtons(html: string): string {
  const codeBlockRegex = /<pre><code class="([^"]*)">([\s\S]*?)<\/code><\/pre>/g;
  
  return html.replace(codeBlockRegex, (match, className, code) => {
    return `<div class="code-block-wrapper"><button class="copy-code-btn" aria-label="Copy code">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button><pre><code class="${className}">${code}</code></pre></div>`;
  });
}

export async function getMarkdownDocument(slug: string): Promise<MarkdownDocument> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Use remark to convert markdown to HTML with GFM support (tables, strikethrough, etc.)
    const processedContent = await remark()
      .use(remarkGfm) // Add GitHub Flavored Markdown support (tables, strikethrough, task lists)
      .use(html)
      .process(content);
    
    let contentHtml = processedContent.toString();
    
    // Add IDs to headings for table of contents
    contentHtml = addHeadingIds(contentHtml);
    
    // Add syntax highlighting to code blocks
    contentHtml = highlightCodeBlocks(contentHtml);
    
    // Add copy buttons to code blocks
    contentHtml = addCopyButtons(contentHtml);

    return {
      slug,
      content: contentHtml,
      title: data.title || slug,
      date: data.date,
      description: data.description,
    };
  } catch (error) {
    console.error(`Error reading markdown file ${slug}:`, error);
    throw new Error(`Document not found: ${slug}`);
  }
}

export function getAllMarkdownSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
      .filter((name) => name.endsWith('.md'))
      .map((name) => name.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error reading content directory:', error);
    return [];
  }
}
