import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Element, ElementContent, Text } from "hast";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
// Syntax highlighting
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - type definitions provided by package at runtime
import rehypePrettyCode from "rehype-pretty-code";

// Standard section order
export const STANDARD_SECTIONS = [
  "overview",
  "install",
  "quickstart",
  "config",
  "usage",
  "examples",
  "troubleshooting",
] as const;

export type SectionKey = (typeof STANDARD_SECTIONS)[number];

export interface NoteFrontmatter {
  title?: string;
  description?: string;
  platform?: string; // For subsections (e.g., 'Windows', 'Linux')
  order?: number; // Custom ordering within directory
  icon?: string; // Optional icon identifier
}

export interface NoteSubsection {
  key: string; // Filename without extension (e.g., 'windows')
  title: string; // From frontmatter or capitalized key
  platform?: string;
  content: string;
  mdxSource: MDXRemoteSerializeResult;
  order: number;
}

export interface NoteSection {
  sectionKey: SectionKey;
  title: string; // Display title
  isDirectory: boolean;
  subsections?: NoteSubsection[]; // If directory with multiple files
  content?: string; // If single file
  mdxSource?: MDXRemoteSerializeResult; // If single file
}

export interface NoteMeta {
  topic: string;
  lang: string;
  title: string;
  description: string;
  sections: NoteSection[];
  readTime: string;
}

const contentDir = path.join(process.cwd(), "content", "note");

function getLangDir(lang: string) {
  return path.join(contentDir, lang);
}

function getTopicDir(lang: string, topic: string) {
  return path.join(getLangDir(lang), topic);
}

/**
 * Get all available note topics for a language
 */
export function getAllNoteTopics(lang: string): string[] {
  const dir = getLangDir(lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

/**
 * Serialize MDX content with standard plugins
 */
async function serializeMDX(
  content: string
): Promise<MDXRemoteSerializeResult> {
  return await serialize(content, {
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
                const space: Text = { type: "text", value: " " };
                node.children = [space];
              }
              const first: ElementContent | undefined = node.children?.[0];
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
                  (node.properties as Record<string, unknown>)["data-diff"] =
                    map[mark];
                  (first as Text).value =
                    leading + v.trimStart().slice(1).replace(/^\s/, "");
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
      development: process.env.NODE_ENV === "development",
    },
    parseFrontmatter: false,
  });
}

/**
 * Get subsections for a directory-based section
 */
async function getSubsections(sectionDir: string): Promise<NoteSubsection[]> {
  if (!fs.existsSync(sectionDir)) return [];

  const files = fs
    .readdirSync(sectionDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const subsections: NoteSubsection[] = [];

  for (const file of files) {
    const filePath = path.join(sectionDir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const { content, data } = matter(raw);
    const fm = data as Partial<NoteFrontmatter>;

    const key = file.replace(/\.(mdx?|MDX?)$/, "");
    const title =
      fm.title ?? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

    const mdxSource = await serializeMDX(content);

    subsections.push({
      key,
      title,
      ...(fm.platform !== undefined && { platform: fm.platform }),
      content,
      mdxSource,
      order: fm.order ?? 999,
    });
  }

  // Sort by order, then by key
  return subsections.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.key.localeCompare(b.key);
  });
}

/**
 * Get content for a specific section (file or directory)
 */
async function getSectionContent(
  lang: string,
  topic: string,
  sectionKey: SectionKey
): Promise<NoteSection | null> {
  const topicDir = getTopicDir(lang, topic);
  const sectionFile = path.join(topicDir, `${sectionKey}.mdx`);
  const sectionDir = path.join(topicDir, sectionKey);

  // Capitalize section title
  const title =
    sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).toLowerCase();

  // Check if it's a directory with multiple files
  if (fs.existsSync(sectionDir) && fs.statSync(sectionDir).isDirectory()) {
    const subsections = await getSubsections(sectionDir);
    if (subsections.length === 0) return null;

    return {
      sectionKey,
      title,
      isDirectory: true,
      subsections,
    };
  }

  // Check if it's a single file
  if (fs.existsSync(sectionFile)) {
    const raw = fs.readFileSync(sectionFile, "utf8");
    const { content, data } = matter(raw);
    const fm = data as Partial<NoteFrontmatter>;

    const mdxSource = await serializeMDX(content);

    return {
      sectionKey,
      title: fm.title ?? title,
      isDirectory: false,
      content,
      mdxSource,
    };
  }

  return null;
}

/**
 * Extract the first text paragraph, skipping code blocks and components.
 */
function extractFirstParagraph(content: string): string {
  const lines = content.split("\n");
  let inFence = false;
  const paragraphLines: string[] = [];

  const clearParagraph = () => {
    paragraphLines.length = 0;
  };

  const commitParagraph = () => {
    if (paragraphLines.length === 0) return "";
    const paragraph = paragraphLines.join(" ").trim();
    clearParagraph();
    return paragraph;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      inFence = !inFence;
      if (!inFence) {
        clearParagraph();
      }
      continue;
    }

    if (inFence) continue;

    if (trimmed === "") {
      const paragraph = commitParagraph();
      if (paragraph) return paragraph;
      continue;
    }

    if (
      /^[#>\-*]/.test(trimmed) ||
      /^\d+\./.test(trimmed) ||
      /^<\/?[A-Za-z]/.test(trimmed) ||
      trimmed.startsWith("<") ||
      /^(import|export)\b/.test(trimmed) ||
      /^(?:\t|\s{4})/.test(line)
    ) {
      clearParagraph();
      continue;
    }

    paragraphLines.push(trimmed);
  }

  return commitParagraph();
}

/**
 * Get aggregated note with all sections
 */
export async function getNoteByTopic(
  lang: string,
  topic: string
): Promise<NoteMeta | null> {
  const topicDir = getTopicDir(lang, topic);
  if (!fs.existsSync(topicDir)) return null;

  const sections: NoteSection[] = [];
  let totalContent = "";

  // Process sections in standard order
  for (const sectionKey of STANDARD_SECTIONS) {
    const section = await getSectionContent(lang, topic, sectionKey);
    if (section) {
      sections.push(section);

      // Accumulate content for reading time calculation
      if (section.content) {
        totalContent += section.content + "\n\n";
      }
      if (section.subsections) {
        totalContent += section.subsections.map((s) => s.content).join("\n\n");
      }
    }
  }

  if (sections.length === 0) return null;

  // Try to get title and description from overview or first section
  const overviewSection = sections.find((s) => s.sectionKey === "overview");
  const firstSection = sections[0];

  // Default title is capitalized topic name
  let title = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
  let description = "";

  // Try to extract title from first H1 in overview or first section
  const contentToCheck =
    overviewSection?.content ?? firstSection?.content ?? "";
  const h1Match = contentToCheck.match(/^#\s+(.+)$/m);
  if (h1Match) {
    title = h1Match[1];
  }

  // Try to extract description from first paragraph (not lists or headings)
  const firstParagraph = extractFirstParagraph(contentToCheck);
  if (firstParagraph) {
    description = firstParagraph.slice(0, 200);
  }

  return {
    topic,
    lang,
    title,
    description,
    sections,
    readTime: readingTime(totalContent).text,
  };
}

/**
 * Get basic metadata for all notes (for index page)
 */
export async function getAllNotesMetadata(lang: string): Promise<
  Array<{
    topic: string;
    title: string;
    description: string;
    sectionCount: number;
  }>
> {
  const topics = getAllNoteTopics(lang);
  const metadata = [];

  for (const topic of topics) {
    const note = await getNoteByTopic(lang, topic);
    if (note) {
      metadata.push({
        topic,
        title: note.title,
        description: note.description,
        sectionCount: note.sections.length,
      });
    }
  }

  return metadata;
}
