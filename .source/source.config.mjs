// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "content/docs"
});
var source_config_default = defineConfig({
  mdxOptions: {
    // Enable GFM for tables, etc.
  }
});
export {
  source_config_default as default,
  docs
};
