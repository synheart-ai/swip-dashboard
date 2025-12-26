// Fumadocs MDX source types
declare module '@/.source/server' {
  import type { BuiltinDoc, BuiltinMeta } from 'fumadocs-mdx';
  
  export const docs: {
    getPage: (slugs: string[] | undefined) => BuiltinDoc | undefined;
    getPages: () => BuiltinDoc[];
    pageTree: unknown;
  };
}
