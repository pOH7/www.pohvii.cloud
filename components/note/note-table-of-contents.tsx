/* eslint-disable react-hooks/refs */
// False positive: The rule incorrectly flags memoized values (not refs) in map callbacks
"use client";

import { useEffect, useRef, useState, useId, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type NoteTOCItem } from "@/hooks/use-note-reading-progress";

export interface NoteTableOfContentsProps {
  items: NoteTOCItem[];
  activeSection: string;
  readingProgress: number;
  onItemClick: (id: string) => void;
  activeTab?: { section: string; tab: string } | null;
}

export function NoteTableOfContents({
  items,
  activeSection,
  readingProgress,
  onItemClick,
  activeTab,
}: NoteTableOfContentsProps) {
  const baseId = useId();
  const mobileTitleId = `toc-title-${baseId}-mobile`;
  const desktopTitleId = `toc-title-${baseId}-desktop`;
  const mobilePanelId = `toc-panel-${baseId}`;
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Refs to the scrollable containers (not the inner nav)
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const hasPlayedInitialAnimationRef = useRef(false);

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

  useEffect(() => {
    hasPlayedInitialAnimationRef.current = true;
  }, []);

  const handleItemClick = (id: string) => {
    onItemClick(id);
    setIsMobileOpen(false); // Close mobile TOC after clicking
  };

  const { platformsBySection, sectionKeyByHeading, defaultTabBySection } =
    useMemo(() => {
      const platformSets: Record<string, Set<string>> = {};
      const headingToSection: Record<string, string> = {};
      const defaultTabs: Record<string, string> = {};
      let currentSectionId: string | null = null;

      for (const item of items) {
        if (item.isSection) {
          currentSectionId = item.id;
        }

        if (item.sectionKey && item.tabKey) {
          if (currentSectionId && !(item.sectionKey in headingToSection)) {
            headingToSection[currentSectionId] = item.sectionKey;
          }
          if (!(item.sectionKey in platformSets)) {
            platformSets[item.sectionKey] = new Set<string>();
          }
          platformSets[item.sectionKey].add(item.tabKey);
          if (!(item.sectionKey in defaultTabs)) {
            defaultTabs[item.sectionKey] = item.tabKey;
          }
        }
      }

      const platforms = Object.fromEntries(
        Object.entries(platformSets).map(([key, value]) => [
          key,
          Array.from(value).sort(),
        ])
      );

      return {
        platformsBySection: platforms as Record<string, string[]>,
        sectionKeyByHeading: headingToSection,
        defaultTabBySection: defaultTabs,
      };
    }, [items]);

  const handlePlatformSwitch = (section: string, platform: string) => {
    const switcherFn = (window as unknown as Record<string, unknown>)[
      `switchTab_${section}`
    ];
    if (typeof switcherFn === "function") {
      (switcherFn as (platform: string) => void)(platform);
      // Find first item in this platform/tab and scroll to it
      const firstItem = items.find(
        (item) =>
          item.tabKey === platform &&
          item.sectionKey === section &&
          !item.isSection
      );
      if (firstItem) {
        // Wait for tab switch and DOM update before scrolling
        setTimeout(() => onItemClick(firstItem.id), 200);
      }
    }
  };

  return (
    <>
      {/* Mobile TOC Button - Fixed position with back-to-top awareness */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="lg:hidden fixed bottom-[5.5rem] right-6 z-40"
      >
        <Button
          onClick={() => setIsMobileOpen(true)}
          size="icon"
          className="rounded-full size-12 shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Open table of contents"
          aria-expanded={isMobileOpen}
          aria-controls={mobilePanelId}
        >
          <List className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Mobile TOC Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Mobile TOC Panel */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl max-h-[80vh] overflow-y-auto"
              id={mobilePanelId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={mobileTitleId}
              ref={mobileScrollRef}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-primary" />
                    <h3 id={mobileTitleId} className="font-semibold">
                      On this page
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileOpen(false)}
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div
                  className="w-full bg-muted rounded-full mb-4"
                  style={{ height: "2px" }}
                >
                  <div
                    className="rounded-full bg-primary transition-all duration-100 ease-out"
                    style={{ width: `${readingProgress}%`, height: "2px" }}
                  />
                </div>

                {/* TOC Navigation */}
                <nav className="space-y-1" aria-labelledby={mobileTitleId}>
                  {items.map((item, index) => {
                    const derivedSectionKey = item.isSection
                      ? (sectionKeyByHeading[item.id] ?? "")
                      : (item.sectionKey || "");
                    const sectionPlatforms =
                      (derivedSectionKey ? platformsBySection[derivedSectionKey] : undefined) || [];
                    const chosenTab = derivedSectionKey
                      ? activeTab?.section === derivedSectionKey
                        ? activeTab.tab
                        : (defaultTabBySection[derivedSectionKey] ||
                          sectionPlatforms[0] ||
                          "")
                      : "";
                    const showSwitcher = Boolean(
                      item.isSection &&
                        derivedSectionKey &&
                        sectionPlatforms.length > 1
                    );
                    if (
                      !item.isSection &&
                      item.tabKey &&
                      derivedSectionKey &&
                      chosenTab &&
                      item.tabKey !== chosenTab
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={item.id}
                        className={showSwitcher ? "space-y-2" : undefined}
                      >
                        <motion.button
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: hasPlayedInitialAnimationRef.current
                              ? 0
                              : index * 0.05,
                          }}
                          onClick={() => handleItemClick(item.id)}
                          data-id={item.id}
                          aria-current={
                            activeSection === item.id ? "true" : undefined
                          }
                          className={`block w-full text-left py-2 rounded transition-all duration-200 border-l-2 border-transparent ${
                            item.isSection
                              ? "px-3 text-base font-semibold"
                              : item.level === 3
                                ? "pl-8 pr-3 text-sm"
                                : "pl-6 pr-3 text-base"
                          } ${
                            activeSection === item.id
                              ? "border-l-primary bg-accent text-accent-foreground"
                              : "hover:border-l-border hover:bg-accent/50"
                          }`}
                        >
                          <span className="flex items-center gap-2 flex-wrap">
                            {item.title}
                            {item.tabKey && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium uppercase">
                                {item.tabKey}
                              </span>
                            )}
                          </span>
                        </motion.button>
                        {showSwitcher && (
                          <div className="flex flex-wrap gap-2 pl-3">
                            {sectionPlatforms.map((platform) => (
                              <button
                                key={`${derivedSectionKey}-${platform}`}
                                onClick={() =>
                                  handlePlatformSwitch(
                                    derivedSectionKey,
                                    platform
                                  )
                                }
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                  activeTab?.section === derivedSectionKey &&
                                  activeTab.tab === platform
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {platform}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop TOC - Sticky Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="w-72 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto hidden lg:block"
        ref={desktopScrollRef}
      >
        <Card className="p-4 gap-0">
          <div className="flex items-center gap-2 mb-3">
            <List className="w-4 h-4 text-primary" />
            <h3 id={desktopTitleId} className="font-medium text-sm">
              On this page
            </h3>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full bg-muted rounded-full mb-3"
            style={{ height: "2px" }}
          >
            <div
              ref={progressBarRef}
              className="rounded-full bg-primary transition-all duration-100 ease-out"
              style={{ width: `${readingProgress}%`, height: "2px" }}
            />
          </div>

          {/* TOC Navigation */}
          <nav className="space-y-1 text-sm" aria-labelledby={desktopTitleId}>
            {items.map((item, index) => {
              const derivedSectionKey = item.isSection
                ? (sectionKeyByHeading[item.id] ?? "")
                : (item.sectionKey ?? "");
              const sectionPlatforms =
                (derivedSectionKey ? platformsBySection[derivedSectionKey] : undefined) || [];
              const chosenTab = derivedSectionKey
                ? activeTab?.section === derivedSectionKey
                  ? activeTab.tab
                  : (defaultTabBySection[derivedSectionKey] ||
                    sectionPlatforms[0] ||
                    "")
                : "";
              const showSwitcher = Boolean(
                item.isSection &&
                  derivedSectionKey &&
                  sectionPlatforms.length > 1
              );
              if (
                !item.isSection &&
                item.tabKey &&
                derivedSectionKey &&
                chosenTab &&
                item.tabKey !== chosenTab
              ) {
                return null;
              }

              return (
                <div
                  key={item.id}
                  className={showSwitcher ? "space-y-2" : undefined}
                >
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: hasPlayedInitialAnimationRef.current
                        ? 0
                        : 0.6 + index * 0.05,
                    }}
                    onClick={() => onItemClick(item.id)}
                    data-id={item.id}
                    aria-current={
                      activeSection === item.id ? "true" : undefined
                    }
                    className={`block w-full text-left py-1.5 rounded transition-all duration-200 hover:translate-x-1 hover:text-primary border-l-2 border-transparent ${
                      item.isSection
                        ? "px-2 text-sm font-semibold"
                        : item.level === 3
                          ? "pl-6 pr-2 text-xs"
                          : "pl-4 pr-2 text-sm"
                    } ${
                      activeSection === item.id
                        ? "border-l-primary bg-accent text-accent-foreground translate-x-1 font-medium"
                        : "hover:border-l-border text-muted-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 flex-wrap">
                      {item.title}
                      {item.tabKey && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-primary/10 text-primary font-medium uppercase leading-none">
                          {item.tabKey}
                        </span>
                      )}
                    </span>
                  </motion.button>
                  {showSwitcher && (
                    <div className="flex flex-wrap gap-1.5 pl-2">
                      {sectionPlatforms.map((platform) => (
                        <button
                          key={`${derivedSectionKey}-${platform}`}
                          onClick={() =>
                            handlePlatformSwitch(derivedSectionKey, platform)
                          }
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                            activeTab?.section === derivedSectionKey &&
                            activeTab.tab === platform
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </Card>
      </motion.aside>
    </>
  );
}
