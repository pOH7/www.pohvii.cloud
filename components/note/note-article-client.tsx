"use client";

import {
  memo,
  useRef,
  useState,
  useMemo,
  useCallback,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import type { NoteMeta } from "@/lib/note";
import { TableOfContents } from "@/components/blog/table-of-contents";
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

  const handleTabChange = useCallback((tabKey: string, sectionKey?: string) => {
    if (sectionKey) {
      setActiveTab({ section: sectionKey, tab: tabKey });
    }
  }, []);

  // Inject onTabChange handler into SectionTabs components
  // Memoize to prevent re-rendering children when only scroll position changes
  const enhancedChildren = useMemo(
    () =>
      Children.map(children, (child) => {
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
      }),
    [children, handleTabChange]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto flex max-w-6xl items-start gap-8">
        {/* Main Content */}
        <article className="max-w-4xl min-w-0 flex-1" ref={contentRef}>
          {/* Header */}
          <header className="border-border mb-8 border-b pb-6">
            <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
              <BookOpen className="size-4" />
              <span className="capitalize">{lang}</span>
              <span className="text-muted-foreground/60">•</span>
              <Clock className="size-4" />
              <span>{note.readTime}</span>
            </div>
            <h1 className="mb-3 text-4xl font-bold">{note.title}</h1>
            {note.description && (
              <p className="text-muted-foreground text-lg">
                {note.description}
              </p>
            )}
          </header>

          {/* Sections - passed as children from server component */}
          <div className="space-y-12">{enhancedChildren}</div>
        </article>

        {/* Table of Contents - Sticky Sidebar */}
        <NoteTableOfContents contentRef={contentRef} activeTab={activeTab} />
      </div>
    </div>
  );
}

interface NoteTableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  activeTab: { section: string; tab: string } | null;
}

const NoteTableOfContents = memo(function NoteTableOfContents({
  contentRef,
  activeTab,
}: NoteTableOfContentsProps) {
  const { activeSection, tocItems, scrollToSection } = useNoteReadingProgress(
    contentRef,
    activeTab
  );

  return (
    <TableOfContents
      items={tocItems}
      activeSection={activeSection}
      onItemClick={scrollToSection}
    />
  );
});
