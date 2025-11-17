import React from "react";
import CodeBlock from "@/components/mdx/CodeBlock";
import PDFViewerWrapper from "@/components/PDFViewerWrapper";
import HlsVideoPlayer from "@/components/mdx/HlsVideoPlayer";
import { ExcalidrawViewer } from "@/components/mdx/ExcalidrawViewer";

// Optional: map/augment elements for MDX rendering
export const mdxComponents = {
  // Example: style anchors/headings subtly
  a: (props: React.ComponentProps<"a">) => (
    <a
      {...props}
      aria-label={props["aria-label"] ?? "Link"}
      className={`underline decoration-dotted hover:decoration-solid ${props.className ?? ""}`}
    />
  ),
  // Render fenced code blocks with a copy button
  pre: (props: React.ComponentProps<"pre"> & { children: React.ReactNode }) => (
    <CodeBlock {...props} />
  ),
  // Keep inline code default styling while letting prose styles apply
  code: (props: React.ComponentProps<"code">) => {
    const { className, ...rest } = props;
    const isBlock =
      typeof className === "string" && /(^|\s)language-/.test(className);
    if (isBlock) {
      // Block code is handled by <pre>; keep as-is so syntax highlighting (if any) works
      return <code className={className} {...rest} />;
    }
    return <code {...rest} className={className} />;
  },
  PDFViewer: (props: React.ComponentProps<typeof PDFViewerWrapper>) => (
    <PDFViewerWrapper {...props} />
  ),
  HlsVideoPlayer: (props: React.ComponentProps<typeof HlsVideoPlayer>) => (
    <HlsVideoPlayer {...props} />
  ),
  Excalidraw: (props: React.ComponentProps<typeof ExcalidrawViewer>) => (
    <ExcalidrawViewer {...props} />
  ),
};

export type MdxComponents = typeof mdxComponents;
