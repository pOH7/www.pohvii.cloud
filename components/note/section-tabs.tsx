"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "@/components/mdx-components";
import { cn } from "@/lib/utils";

interface Subsection {
  key: string;
  title: string;
  platform?: string;
  content: string;
  mdxSource: MDXRemoteSerializeResult;
}

interface SectionTabsProps {
  subsections: Subsection[];
  sectionTitle: string;
  sectionKey?: string;
  onTabChange?: (tabKey: string, sectionKey?: string) => void;
}

export function SectionTabs({
  subsections,
  sectionTitle,
  sectionKey,
  onTabChange,
}: SectionTabsProps) {
  const initialTabKey = subsections[0]?.key ?? "";
  const [activeTab, setActiveTab] = useState(initialTabKey);
  const [mounted, setMounted] = useState(false);
  const initialSyncRef = useRef(false);

  const handleTabChange = useCallback(
    (newTab: string) => {
      if (newTab === activeTab) return;
      setActiveTab(newTab);
      if (onTabChange) {
        onTabChange(newTab, sectionKey);
      }
    },
    [activeTab, onTabChange, sectionKey]
  );

  // Mount and expose method to parent
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    if (typeof window !== "undefined") {
      // Store tab switcher function globally for TOC access
      const key = sectionKey || sectionTitle;
      (window as unknown as Record<string, unknown>)[`switchTab_${key}`] =
        handleTabChange;
    }
  }, [sectionKey, sectionTitle, handleTabChange]);

  // Sync initial tab selection with parent
  useEffect(() => {
    if (!mounted || !initialTabKey || initialSyncRef.current) return;
    initialSyncRef.current = true;
    if (onTabChange) {
      onTabChange(initialTabKey, sectionKey);
    }
  }, [mounted, initialTabKey, onTabChange, sectionKey]);

  if (subsections.length === 0) return null;

  return (
    <div className="my-8">
      {/* Section Title */}
      <h2 className="text-3xl font-bold mb-4 section-title">{sectionTitle}</h2>

      {/* Tabs Navigation */}
      <div
        className="flex flex-wrap gap-2 mb-6 border-b border-border pb-2"
        role="tablist"
        aria-label={`${sectionTitle} tabs`}
      >
        {subsections.map((subsection) => (
          <button
            key={subsection.key}
            onClick={() => handleTabChange(subsection.key)}
            role="tab"
            aria-selected={activeTab === subsection.key}
            aria-controls={`panel-${subsection.key}`}
            className={cn(
              "px-4 py-2 rounded-md font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              activeTab === subsection.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {subsection.title}
          </button>
        ))}
      </div>

      {/* Tab Content - Render all tabs but hide inactive ones */}
      {/* Only render on client to avoid SSR issues with MDX components that use hooks */}
      {mounted &&
        subsections.map((subsection) => (
          <div
            key={subsection.key}
            id={`panel-${subsection.key}`}
            role="tabpanel"
            aria-labelledby={subsection.key}
            aria-hidden={activeTab !== subsection.key}
            data-tab={subsection.key}
            data-section={sectionKey || sectionTitle}
            className={cn(
              "blog-article-content",
              activeTab !== subsection.key && "hidden"
            )}
          >
            <MDXRemote {...subsection.mdxSource} components={mdxComponents} />
          </div>
        ))}
    </div>
  );
}
