import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import type { NoteMeta } from "@/lib/note";
import { SectionTabs } from "./section-tabs";
import { SectionNav } from "./section-nav";
import { Clock, BookOpen } from "lucide-react";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
        {/* Main Content */}
        <article className="max-w-4xl">
          {/* Header */}
          <header className="mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <BookOpen className="w-4 h-4" />
              <span className="capitalize">{lang}</span>
              <span className="text-muted-foreground/60">•</span>
              <Clock className="w-4 h-4" />
              <span>{note.readTime}</span>
            </div>
            <h1 className="text-4xl font-bold mb-3">{note.title}</h1>
            {note.description && (
              <p className="text-lg text-muted-foreground">
                {note.description}
              </p>
            )}
          </header>

          {/* Sections */}
          <div className="space-y-12">
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
                    <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
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
                                    if (
                                      first &&
                                      (first as Text).type === "text"
                                    ) {
                                      const v = (first as Text).value;
                                      const mark = v.trimStart().charAt(0);
                                      const leading =
                                        v.match(/^\s*/)?.[0] ?? "";
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
                                        if (!node.properties)
                                          node.properties = {};
                                        (
                                          node.properties as Record<
                                            string,
                                            unknown
                                          >
                                        )["data-diff"] = map[mark];
                                        (first as Text).value =
                                          leading +
                                          v
                                            .trimStart()
                                            .slice(1)
                                            .replace(/^\s/, "");
                                      }
                                    }
                                  },
                                },
                              ],
                              rehypeSlug,
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
          </div>
        </article>

        {/* Sidebar Navigation */}
        <aside>
          <SectionNav
            sections={note.sections.map((s) => ({
              sectionKey: s.sectionKey,
              title: s.title,
            }))}
          />
        </aside>
      </div>
    </div>
  );
}
