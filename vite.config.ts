import fs from "node:fs/promises";
import path from "node:path";

import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "@mdx-js/rollup";
import type { Element, Text } from "hast";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import vinext from "vinext";
import { defineConfig, type Plugin } from "vite";

import { getWorkerSafeHighlighter } from "./lib/mdx-highlighter";
import rehypeNumberedHeadings from "./lib/rehypeNumberedHeadings";

const blogRawPrefix = "\0blog-mdx-raw:";

function blogMdxRawPlugin(): Plugin {
  return {
    name: "blog-mdx-raw",
    enforce: "pre",
    resolveId(source, importer) {
      if (!source.includes("?blog-raw")) return null;

      const [rawFilePath] = source.split("?");
      if (!rawFilePath) return null;

      const importerPath = importer?.split("?")[0];
      const absolutePath = path.isAbsolute(rawFilePath)
        ? rawFilePath
        : path.resolve(
            importerPath ? path.dirname(importerPath) : process.cwd(),
            rawFilePath
          );

      return `${blogRawPrefix}${encodeURIComponent(absolutePath)}.js`;
    },
    async load(id) {
      if (!id.startsWith(blogRawPrefix)) return null;

      const encodedPath = id.slice(blogRawPrefix.length).replace(/\.js$/, "");
      const source = await fs.readFile(decodeURIComponent(encodedPath), "utf8");

      return `export default ${JSON.stringify(source)};`;
    },
  };
}

export default defineConfig({
  plugins: [
    blogMdxRawPlugin(),
    mdx({
      include: ["**/content/blog/**/*.{md,mdx}"],
      jsxImportSource: "react",
      remarkPlugins: [remarkFrontmatter, remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        rehypeNumberedHeadings,
        [
          rehypePrettyCode,
          {
            keepBackground: false,
            theme: {
              light: "github-light-default",
              dark: "github-dark-default",
            },
            getHighlighter: getWorkerSafeHighlighter,
            onVisitLine(node: Element) {
              if (node.children.length === 0) {
                const space: Text = { type: "text", value: " " };
                node.children = [space];
              }

              const first = node.children[0];
              if (first && "type" in first && first.type === "text") {
                const v = first.value;
                const mark = v.trimStart().charAt(0);
                const leading = v.match(/^\s*/)?.[0] || "";
                if (
                  mark === "+" ||
                  mark === "-" ||
                  mark === "~" ||
                  mark === "!"
                ) {
                  const map: Record<string, string> = {
                    "+": "add",
                    "-": "remove",
                    "~": "change",
                    "!": "change",
                  };
                  if (!node.properties) node.properties = {};
                  (node.properties as Record<string, unknown>)["data-diff"] =
                    map[mark];
                  first.value =
                    leading + v.trimStart().slice(1).replace(/^\s/, "");
                }
              }
            },
          },
        ],
        [
          rehypeAutolinkHeadings,
          {
            behavior: "prepend",
            properties: {
              className: ["heading-anchor"],
              ariaLabel: "Link to this section",
            },
            content: {
              type: "text",
              value: "",
            },
          },
        ],
      ],
    }),
    vinext(),
    cloudflare({
      configPath: "wrangler.build.jsonc",
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
});
