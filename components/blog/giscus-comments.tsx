"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { MessageCircle } from "lucide-react";

type GiscusMapping =
  | "pathname"
  | "url"
  | "title"
  | "og:title"
  | "specific"
  | "number";

export interface GiscusCommentsProps {
  term: string;
  mapping?: GiscusMapping;
  strict?: "0" | "1";
  reactionsEnabled?: "0" | "1";
  emitMetadata?: "0" | "1";
  inputPosition?: "top" | "bottom";
  lang?: string;
  loading?: "lazy" | "eager";
}

type GiscusColorMode = "light" | "dark";

const GISCUS_CONFIG = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO ?? "pOH7/www.pohvii.cloud",
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "R_kgDOPlOFvA",
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? "",
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "",
} as const;

const SHOW_SETUP_HINT = process.env.NODE_ENV !== "production";

function resolveGiscusTheme(mode: GiscusColorMode): string {
  if (typeof window === "undefined") return mode;

  // giscus runs in an https iframe and cannot load http custom themes.
  if (window.location.protocol !== "https:") return mode;

  return `${window.location.origin}/giscus/${mode}.css`;
}

export function GiscusComments({
  term,
  mapping = "specific",
  strict = "1",
  reactionsEnabled = "1",
  emitMetadata = "0",
  inputPosition = "bottom",
  lang = "en",
  loading = "lazy",
}: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedDiscussionKeyRef = useRef<string | null>(null);
  const { resolvedTheme } = useTheme();

  const giscusColorMode: GiscusColorMode =
    resolvedTheme === "dark" ? "dark" : "light";
  const giscusTheme = resolveGiscusTheme(giscusColorMode);
  const isThemeReady = resolvedTheme === "dark" || resolvedTheme === "light";
  const discussionKey = [
    mapping,
    term,
    strict,
    reactionsEnabled,
    emitMetadata,
    inputPosition,
    lang,
    loading,
  ].join("|");
  const hasRequiredConfig = Boolean(
    GISCUS_CONFIG.repo &&
    GISCUS_CONFIG.repoId &&
    GISCUS_CONFIG.category &&
    GISCUS_CONFIG.categoryId
  );

  useEffect(() => {
    if (!containerRef.current || !hasRequiredConfig || !isThemeReady) return;
    if (mountedDiscussionKeyRef.current === discussionKey) return;

    mountedDiscussionKeyRef.current = discussionKey;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", GISCUS_CONFIG.repo);
    script.setAttribute("data-repo-id", GISCUS_CONFIG.repoId);
    script.setAttribute("data-category", GISCUS_CONFIG.category);
    script.setAttribute("data-category-id", GISCUS_CONFIG.categoryId);
    script.setAttribute("data-mapping", mapping);
    script.setAttribute("data-term", term);
    script.setAttribute("data-strict", strict);
    script.setAttribute("data-reactions-enabled", reactionsEnabled);
    script.setAttribute("data-emit-metadata", emitMetadata);
    script.setAttribute("data-input-position", inputPosition);
    script.setAttribute("data-theme", giscusTheme);
    script.setAttribute("data-lang", lang);
    script.setAttribute("data-loading", loading);
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    containerRef.current.appendChild(script);
  }, [
    discussionKey,
    emitMetadata,
    giscusTheme,
    hasRequiredConfig,
    isThemeReady,
    inputPosition,
    lang,
    loading,
    mapping,
    reactionsEnabled,
    strict,
    term,
  ]);

  useEffect(() => {
    if (!hasRequiredConfig || !isThemeReady) return;

    let attempts = 0;
    const maxAttempts = 40;

    const syncTheme = () => {
      const iframe = containerRef.current?.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame"
      );
      if (!iframe?.contentWindow) return false;

      iframe.contentWindow.postMessage(
        {
          giscus: {
            setConfig: {
              theme: giscusTheme,
            },
          },
        },
        "https://giscus.app"
      );
      return true;
    };

    if (syncTheme()) return;

    const timer = window.setInterval(() => {
      if (syncTheme()) {
        window.clearInterval(timer);
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [giscusTheme, hasRequiredConfig, isThemeReady]);

  return (
    <section className="mt-16 border-t [border-top-style:dotted] pt-8">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <MessageCircle className="text-primary size-5" />
        Comments
      </h2>

      {hasRequiredConfig ? (
        <div ref={containerRef} className="giscus-container" />
      ) : (
        <p className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
          {SHOW_SETUP_HINT
            ? "Configure NEXT_PUBLIC_GISCUS_CATEGORY and NEXT_PUBLIC_GISCUS_CATEGORY_ID to enable comments."
            : "Comments are temporarily unavailable."}
        </p>
      )}
    </section>
  );
}
