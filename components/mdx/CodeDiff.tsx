"use client";

import type { FileDiffOptions } from "@pierre/diffs";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useMemo, type CSSProperties } from "react";

const PatchDiff = dynamic(
  () => import("@pierre/diffs/react").then((module) => module.PatchDiff),
  {
    ssr: false,
    loading: () => (
      <p role="status" className="p-4 text-sm text-muted-foreground">
        Loading diff…
      </p>
    ),
  }
);

const diffStyle = {
  "--diffs-font-family": "var(--font-markdown-mono), monospace",
  "--diffs-header-font-family": "var(--font-markdown-mono), monospace",
  "--diffs-font-size": "13px",
  "--diffs-line-height": "1.6",
} as CSSProperties;

export default function CodeDiff({ patch }: { patch: string }) {
  const { resolvedTheme } = useTheme();
  const options = useMemo(
    () =>
      ({
        theme: { light: "pierre-light", dark: "pierre-dark" },
        themeType: resolvedTheme === "dark" ? "dark" : "light",
        diffStyle: "unified",
        diffIndicators: "classic",
        hunkSeparators: "metadata",
        overflow: "scroll",
      }) satisfies FileDiffOptions<undefined, undefined>,
    [resolvedTheme]
  );

  return (
    <div
      data-mdx-diff
      role="region"
      aria-label="Code changes"
      className="not-prose my-6 min-w-0 overflow-hidden rounded-lg border border-border"
      style={diffStyle}
    >
      <PatchDiff patch={patch} options={options} />
      <noscript>
        <pre className="overflow-x-auto p-4">
          <code>{patch}</code>
        </pre>
      </noscript>
    </div>
  );
}
