declare module 'contentlayer/source-files' {
  import type { Plugin } from 'unified';

  // Basic field definition used in Contentlayer document types
  export interface FieldDef {
    type: 'string' | 'number' | 'boolean' | 'date';
    required?: boolean;
    default?: unknown;
    description?: string;
  }

  // Computed field definition with a resolver
  export interface ComputedField<T = unknown> {
    type: 'string' | 'number' | 'boolean' | 'date';
    resolve: (doc: any) => T;
    description?: string;
  }

  // Document type shape
  export interface DocumentTypeDef {
    name: string;
    filePathPattern: string | string[];
    contentType?: 'mdx' | 'markdown';
    fields?: Record<string, FieldDef>;
    computedFields?: Record<string, ComputedField>;
  }

  // Helper to define a document type
  export function defineDocumentType(def: () => DocumentTypeDef): DocumentTypeDef;

  // Source configuration for Contentlayer (subset sufficient for bundler resolution)
  export interface SourceOptions {
    contentDirPath: string;
    documentTypes: DocumentTypeDef[];
    mdx?: {
      remarkPlugins?: Plugin[];
      rehypePlugins?: Plugin[];
    };
  }

  // Creates a Contentlayer source from the provided options
  export function makeSource(options: SourceOptions): unknown;
}
