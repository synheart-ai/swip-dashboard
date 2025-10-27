import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content');

export interface MarkdownDocument {
  slug: string;
  content: string;
  title: string;
  date?: string;
  description?: string;
}

export async function getMarkdownDocument(slug: string): Promise<MarkdownDocument> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Use remark to convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(content);
    
    const contentHtml = processedContent.toString();

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
