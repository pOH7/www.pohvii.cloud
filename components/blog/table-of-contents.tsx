"use client";

import { useEffect, useRef, useState, useId } from "react";
import { Activity } from "react";
import { List, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type TOCItem } from "@/hooks/use-reading-progress";

export interface TableOfContentsProps {
  items: TOCItem[];
  activeSection: string;
  readingProgress: number;
  onItemClick: (id: string) => void;
}

export function TableOfContents({
  items,
  activeSection,
  readingProgress,
  onItemClick,
}: TableOfContentsProps) {
  const baseId = useId();
  const mobileTitleId = `toc-title-${baseId}-mobile`;
  const desktopTitleId = `toc-title-${baseId}-desktop`;
  const mobilePanelId = `toc-panel-${baseId}`;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const centerActive = (container: HTMLDivElement | null) => {
      if (!container) return;
      if (container.scrollHeight <= container.clientHeight) return;
      const target = container.querySelector<HTMLElement>(
        `[data-id="${CSS.escape(activeSection)}"]`
      );
      if (!target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const topWithin = targetRect.top - containerRect.top;
      const bandTop = container.clientHeight * 0.3;
      const bandBottom = container.clientHeight * 0.7;

      if (topWithin > bandTop && topWithin < bandBottom) return;

      const targetCenter = topWithin + targetRect.height / 2;
      const delta = targetCenter - container.clientHeight / 2;
      container.scrollTo({
        top: container.scrollTop + delta,
        behavior: "smooth",
      });
    };

    const raf = requestAnimationFrame(() => {
      centerActive(desktopScrollRef.current);
      if (isMobileOpen) centerActive(mobileScrollRef.current);
    });
    return () => cancelAnimationFrame(raf);
  }, [activeSection, isMobileOpen]);

  const handleItemClick = (id: string) => {
    onItemClick(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      <div className="fixed right-6 bottom-22 z-40 lg:hidden [&_button]:cursor-pointer">
        <Button
          onClick={() => setIsMobileOpen(true)}
          size="icon"
          className="size-11 rounded-full"
          aria-label="Open table of contents"
          aria-expanded={isMobileOpen}
          aria-controls={mobilePanelId}
        >
          <List className="size-5" />
        </Button>
      </div>

      <Activity mode={isMobileOpen ? "visible" : "hidden"} name="mobile-toc">
        {isMobileOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-50 bg-black/35 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close table of contents"
            />

            <div
              className="bg-background border-border fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-md border-t lg:hidden [&_button]:cursor-pointer"
              id={mobilePanelId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={mobileTitleId}
              ref={mobileScrollRef}
            >
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <List className="text-primary size-4" />
                    <h3 id={mobileTitleId} className="text-sm font-semibold">
                      In this article
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileOpen(false)}
                    className="size-8 rounded-full p-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="bg-muted mb-4 h-px w-full rounded-full">
                  <div
                    className="bg-primary h-px rounded-full"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>

                <nav className="space-y-1" aria-labelledby={mobileTitleId}>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      data-id={item.id}
                      aria-current={
                        activeSection === item.id ? "true" : undefined
                      }
                      className={`block w-full border-l-2 border-transparent px-3 py-1.5 text-left text-sm transition-colors ${
                        item.level === 4
                          ? "pl-8"
                          : item.level === 3
                            ? "pl-6"
                            : "pl-3"
                      } ${
                        activeSection === item.id
                          ? "border-l-primary bg-accent text-accent-foreground"
                          : "hover:border-l-border hover:bg-accent/50"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </>
        )}
      </Activity>

      <aside
        className="sticky top-24 hidden max-h-[calc(100vh-8rem)] w-72 self-start overflow-y-auto lg:block [&_button]:cursor-pointer"
        ref={desktopScrollRef}
      >
        <Card className="gap-0 rounded-md p-3">
          <div className="mb-2 flex items-center gap-2">
            <List className="text-primary size-3.5" />
            <h3 id={desktopTitleId} className="text-xs font-semibold">
              In this article
            </h3>
          </div>

          <div className="bg-muted mb-2 h-px w-full rounded-full">
            <div
              className="bg-primary h-px rounded-full"
              style={{ width: `${readingProgress}%` }}
            />
          </div>

          <nav className="space-y-0.5 text-xs" aria-labelledby={desktopTitleId}>
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                data-id={item.id}
                aria-current={activeSection === item.id ? "true" : undefined}
                className={`block w-full border-l-2 border-transparent px-1.5 py-0.5 text-left leading-tight transition-colors ${
                  item.level === 4
                    ? "pl-4 text-[10px]"
                    : item.level === 3
                      ? "pl-3 text-[10px]"
                      : "text-[11px]"
                } ${
                  activeSection === item.id
                    ? "border-l-primary bg-accent text-accent-foreground"
                    : "hover:border-l-border hover:text-primary"
                }`}
              >
                {item.title}
              </button>
            ))}
          </nav>
        </Card>
      </aside>
    </>
  );
}
