// Fumadocs MDX source types
declare module '@/.source/server' {
  import type { BuiltinDoc, BuiltinMeta } from 'fumadocs-mdx';
  
  export const docs: {
    docs: BuiltinDoc[];
    meta: BuiltinMeta[];
    toFumadocsSource: () => any;
  };
}
