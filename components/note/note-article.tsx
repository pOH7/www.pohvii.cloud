import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import type { NoteMeta } from "@/lib/note";
import { SectionTabs } from "./section-tabs";
import { NoteArticleClient } from "./note-article-client";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeNumberedHeadings from "@/lib/rehypeNumberedHeadings";
import type { Element, ElementContent, Text } from "hast";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - type definitions provided by package at runtime
import rehypePrettyCode from "rehype-pretty-code";

interface NoteArticleProps {
  note: NoteMeta;
  lang: string;
}

export function NoteArticle({ note, lang }: NoteArticleProps) {
  return (
    <NoteArticleClient note={note} lang={lang}>
      {note.sections.map((section) => (
        <section
          key={section.sectionKey}
          id={section.sectionKey}
          className="scroll-mt-24"
        >
          {section.isDirectory && section.subsections ? (
            // Multi-file section with tabs
            <SectionTabs
              subsections={section.subsections}
              sectionTitle={section.title}
            />
          ) : section.content ? (
            // Single file section
            <div>
              <h2 className="text-3xl font-bold mb-4 section-title">
                {section.title}
              </h2>
              <div className="blog-article-content">
                <MDXRemote
                  source={section.content}
                  components={mdxComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [
                        [
                          rehypePrettyCode,
                          {
                            keepBackground: false,
                            theme: {
                              light: "github-light-default",
                              dark: "github-dark-default",
                            },
                            onVisitLine(node: Element) {
                              if (node.children.length === 0) {
                                const space: Text = {
                                  type: "text",
                                  value: " ",
                                };
                                node.children = [space];
                              }
                              const first: ElementContent | undefined =
                                node.children?.[0];
                              if (first && (first as Text).type === "text") {
                                const v = (first as Text).value;
                                const mark = v.trimStart().charAt(0);
                                const leading = v.match(/^\s*/)?.[0] ?? "";
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
                                  (node.properties as Record<string, unknown>)[
                                    "data-diff"
                                  ] = map[mark];
                                  (first as Text).value =
                                    leading +
                                    v.trimStart().slice(1).replace(/^\s/, "");
                                }
                              }
                            },
                          },
                        ],
                        rehypeSlug,
                        rehypeNumberedHeadings,
                        [
                          rehypeAutolinkHeadings,
                          {
                            behavior: "prepend",
                            properties: {
                              className: ["heading-anchor"],
                              ariaLabel: "Link to this section",
                            },
                            content: {
                              type: "element",
                              tagName: "span",
                              properties: {
                                className: ["heading-link-icon"],
                                ariaHidden: "true",
                              },
                              children: [
                                {
                                  type: "element",
                                  tagName: "svg",
                                  properties: {
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: 2,
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    ariaHidden: "true",
                                    focusable: "false",
                                  },
                                  children: [
                                    {
                                      type: "element",
                                      tagName: "path",
                                      properties: {
                                        d: "M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5",
                                      },
                                      children: [],
                                    },
                                    {
                                      type: "element",
                                      tagName: "path",
                                      properties: {
                                        d: "M14 11a5 5 0 0 0-7.07 0L5.5 12.43a5 5 0 0 0 7.07 7.07L14 19",
                                      },
                                      children: [],
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                        ],
                      ],
                    },
                  }}
                />
              </div>
            </div>
          ) : null}
        </section>
      ))}
    </NoteArticleClient>
  );
}
