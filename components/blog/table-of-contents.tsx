"use client";

import { useEffect, useRef, useState, useId } from "react";
import { Activity } from "react";
import { motion } from "framer-motion";
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
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Refs to the scrollable containers (not the inner nav)
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Keep the active item centered within scrollable TOC containers
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

      // If already roughly in the center band, avoid nudging to keep things smooth
      if (topWithin > bandTop && topWithin < bandBottom) return;

      // Compute delta from current position to center within the container
      const targetCenter = topWithin + targetRect.height / 2;
      const delta = targetCenter - container.clientHeight / 2;
      container.scrollTo({
        top: container.scrollTop + delta,
        behavior: "smooth",
      });
    };

    // Defer to next frame to avoid layout thrash during animations
    const raf = requestAnimationFrame(() => {
      centerActive(desktopScrollRef.current);
      if (isMobileOpen) centerActive(mobileScrollRef.current);
    });
    return () => cancelAnimationFrame(raf);
  }, [activeSection, isMobileOpen]);

  const handleItemClick = (id: string) => {
    onItemClick(id);
    setIsMobileOpen(false); // Close mobile TOC after clicking
  };

  return (
    <>
      {/* Mobile TOC Button - Fixed position with back-to-top awareness */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed right-6 bottom-[5.5rem] z-40 lg:hidden"
      >
        <Button
          onClick={() => setIsMobileOpen(true)}
          size="icon"
          className="size-12 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
          aria-label="Open table of contents"
          aria-expanded={isMobileOpen}
          aria-controls={mobilePanelId}
        >
          <List className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Mobile TOC Overlay - Using React 19.2 Activity API */}
      {/* Activity preserves the TOC panel's scroll position when hidden */}
      <Activity mode={isMobileOpen ? "visible" : "hidden"} name="mobile-toc">
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isMobileOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            style={{ display: isMobileOpen ? "block" : "none" }}
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Mobile TOC Panel */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{
              opacity: isMobileOpen ? 1 : 0,
              y: isMobileOpen ? 0 : "100%",
            }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="bg-background border-border fixed right-0 bottom-0 left-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t lg:hidden"
            style={{ display: isMobileOpen ? "block" : "none" }}
            id={mobilePanelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={mobileTitleId}
            ref={mobileScrollRef}
          >
            <div className="p-4">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="text-primary h-4 w-4" />
                  <h3 id={mobileTitleId} className="font-semibold">
                    In this article
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileOpen(false)}
                  className="h-8 w-8 rounded-full p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div
                className="bg-muted mb-4 w-full rounded-full"
                style={{ height: "1px" }}
              >
                <div
                  className="bg-primary rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${readingProgress}%`, height: "1px" }}
                />
              </div>

              {/* TOC Navigation */}
              <nav className="space-y-1" aria-labelledby={mobileTitleId}>
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item.id)}
                    data-id={item.id}
                    aria-current={
                      activeSection === item.id ? "true" : undefined
                    }
                    className={`block w-full rounded border-l-2 border-transparent px-3 py-2 text-left transition-all duration-200 ${
                      item.level === 4
                        ? "pl-8 text-sm"
                        : item.level === 3
                          ? "pl-6 text-sm"
                          : "text-base"
                    } ${
                      activeSection === item.id
                        ? "border-l-primary bg-accent text-accent-foreground"
                        : "hover:border-l-border hover:bg-accent/50"
                    }`}
                  >
                    {item.title}
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>
        </>
      </Activity>

      {/* Desktop TOC - Sticky Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="sticky top-24 hidden max-h-[calc(100vh-8rem)] w-72 overflow-y-auto lg:block"
        ref={desktopScrollRef}
      >
        <Card className="gap-0 p-3">
          <div className="mb-2 flex items-center gap-2">
            <List className="text-primary h-3 w-3" />
            <h3 id={desktopTitleId} className="text-xs font-medium">
              In this article
            </h3>
          </div>

          {/* Progress Bar */}
          <div
            className="bg-muted mb-2 w-full rounded-full"
            style={{ height: "1px" }}
          >
            <div
              ref={progressBarRef}
              className="bg-primary rounded-full transition-all duration-100 ease-out"
              style={{ width: `${readingProgress}%`, height: "1px" }}
            />
          </div>

          {/* TOC Navigation */}
          <nav className="space-y-0.5 text-xs" aria-labelledby={desktopTitleId}>
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => onItemClick(item.id)}
                data-id={item.id}
                aria-current={activeSection === item.id ? "true" : undefined}
                className={`hover:text-primary block w-full rounded border-l-2 border-transparent px-1.5 py-0.5 text-left leading-tight transition-all duration-200 hover:translate-x-1 ${
                  item.level === 4
                    ? "pl-4 text-[10px]"
                    : item.level === 3
                      ? "pl-3 text-[10px]"
                      : "text-[11px]"
                } ${
                  activeSection === item.id
                    ? "border-l-primary bg-accent text-accent-foreground translate-x-1"
                    : "hover:border-l-border"
                }`}
              >
                {item.title}
              </motion.button>
            ))}
          </nav>
        </Card>
      </motion.aside>
    </>
  );
}
