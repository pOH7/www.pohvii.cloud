"use client";

import { useState, useEffect } from "react";
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
}

export function SectionTabs({ subsections, sectionTitle }: SectionTabsProps) {
  const [activeTab, setActiveTab] = useState(subsections[0]?.key ?? "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (subsections.length === 0) return null;

  const activeSubsection = subsections.find((s) => s.key === activeTab);

  return (
    <div className="my-8">
      {/* Section Title */}
      <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>

      {/* Tabs Navigation */}
      <div
        className="flex flex-wrap gap-2 mb-6 border-b border-border pb-2"
        role="tablist"
        aria-label={`${sectionTitle} tabs`}
      >
        {subsections.map((subsection) => (
          <button
            key={subsection.key}
            onClick={() => setActiveTab(subsection.key)}
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

      {/* Tab Content */}
      {mounted && activeSubsection && (
        <div
          id={`panel-${activeSubsection.key}`}
          role="tabpanel"
          aria-labelledby={activeSubsection.key}
          className="blog-article-content"
        >
          <MDXRemote
            {...activeSubsection.mdxSource}
            components={mdxComponents}
          />
        </div>
      )}
    </div>
  );
}
