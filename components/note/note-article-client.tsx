"use client";

import {
  useRef,
  useState,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import type { NoteMeta } from "@/lib/note";
import { NoteTableOfContents } from "./note-table-of-contents";
import { useNoteReadingProgress } from "@/hooks/use-note-reading-progress";
import { Clock, BookOpen } from "lucide-react";

interface NoteArticleClientProps {
  note: NoteMeta;
  lang: string;
  children: React.ReactNode;
}

export function NoteArticleClient({
  note,
  lang,
  children,
}: NoteArticleClientProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<{
    section: string;
    tab: string;
  } | null>(null);

  const { readingProgress, activeSection, tocItems, scrollToSection } =
    useNoteReadingProgress(contentRef, activeTab);

  const handleTabChange = (tabKey: string, sectionKey?: string) => {
    if (sectionKey) {
      setActiveTab({ section: sectionKey, tab: tabKey });
    }
  };

  // Inject onTabChange handler into SectionTabs components
  const enhancedChildren = Children.map(children, (child) => {
    if (
      isValidElement<{ children?: React.ReactNode; id?: string }>(child) &&
      child.type === "section"
    ) {
      const sectionChildren = Children.map(
        child.props.children,
        (sectionChild) => {
          if (
            isValidElement(sectionChild) &&
            typeof sectionChild.type !== "string"
          ) {
            // This is likely a SectionTabs component
            return cloneElement(
              sectionChild as React.ReactElement<{
                onTabChange?: (tabKey: string, sectionKey?: string) => void;
                sectionKey?: string;
              }>,
              {
                onTabChange: handleTabChange,
                ...(child.props.id && { sectionKey: child.props.id }),
              }
            );
          }
          return sectionChild;
        }
      );
      return cloneElement(child, {}, sectionChildren);
    }
    return child;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex max-w-6xl mx-auto gap-8">
        {/* Main Content */}
        <article className="min-w-0 flex-1 max-w-4xl" ref={contentRef}>
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

          {/* Sections - passed as children from server component */}
          <div className="space-y-12">{enhancedChildren}</div>
        </article>

        {/* Table of Contents - Sticky Sidebar */}
        <NoteTableOfContents
          items={tocItems}
          activeSection={activeSection}
          readingProgress={readingProgress}
          onItemClick={scrollToSection}
        />
      </div>
    </div>
  );
}
