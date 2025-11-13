"use client";

import { useState, useEffect, useRef } from "react";
import type { LenisScrollEvent } from "@/types/lenis";

export interface NoteTOCItem {
  id: string;
  title: string;
  level: number;
  isSection?: boolean; // True for section titles like "Overview", "Install"
  tabKey?: string; // Which tab this item belongs to
  sectionKey?: string; // Which section this item belongs to (for multi-tab sections)
}

export function useNoteReadingProgress(
  contentRef: React.RefObject<HTMLDivElement | null>,
  activeTab?: { section: string; tab: string } | null
) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [tocItems, setTocItems] = useState<NoteTOCItem[]>([]);
  // When user clicks a ToC item and we perform a programmatic smooth scroll,
  // temporarily lock the active section to the clicked target to avoid the
  // scroll handler prematurely switching to the next heading.
  const clickLockUntilRef = useRef<number>(0);
  const lastClickedIdRef = useRef<string>("");

  // Extract table of contents from content
  // This effect extracts TOC data from DOM, which is a legitimate use of setState in effect
  useEffect(() => {
    if (!contentRef.current) return;

    // Get all headings including section titles
    const allHeadings = contentRef.current.querySelectorAll("h2, h3");
    const items: NoteTOCItem[] = [];

    const GLOBAL_CONTEXT = "__global__";
    const tabCounters = new Map<
      string,
      {
        level2: number;
        level3: number;
      }
    >();
    let globalLevel2 = 0;
    let globalLevel3 = 0;

    const getContextKey = (sectionKey?: string, tabKey?: string) => {
      if (sectionKey && tabKey) return `${sectionKey}::${tabKey}`;
      if (sectionKey) return `${sectionKey}::__section`;
      if (tabKey) return `__tab::${tabKey}`;
      return GLOBAL_CONTEXT;
    };

    Array.from(allHeadings).forEach((heading, index) => {
      // Check if this heading is inside a tab panel
      const panel = heading.closest('[role="tabpanel"]');
      const tabKey = panel?.getAttribute("data-tab") || undefined;
      const sectionKey = panel?.getAttribute("data-section") || undefined;

      // Generate or get the base ID
      let baseId = heading.id;
      if (!baseId) {
        baseId =
          heading.textContent
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || `heading-${index}`;
      }

      // Prefix with tab key if in a tab to ensure uniqueness across tabs
      let id = baseId;
      if (tabKey && !baseId.startsWith(`${tabKey}-`)) {
        id = `${tabKey}-${baseId}`;
      }

      // Update the heading's ID if it changed
      if (heading.id !== id) {
        heading.id = id;
      }

      const level = parseInt(heading.tagName.charAt(1));
      const rawTitle = heading.textContent || "";
      const isSection = heading.classList.contains("section-title");

      if (isSection) {
        // This is a section title - add without number and reset counters
        items.push({
          id,
          title: rawTitle,
          level: 1, // Treat sections as level 1 for indentation
          isSection: true,
          ...(tabKey !== undefined && { tabKey }),
          ...(sectionKey !== undefined && { sectionKey }),
        });
        if (!tabKey && !sectionKey) {
          globalLevel2 = 0;
          globalLevel3 = 0;
        }
      } else {
        const contextKey = getContextKey(sectionKey, tabKey);

        let displayLevel2 = 0;
        let displayLevel3 = 0;

        if (contextKey === GLOBAL_CONTEXT) {
          if (level === 2) {
            globalLevel2 += 1;
            globalLevel3 = 0;
          } else if (level === 3) {
            if (globalLevel2 === 0) {
              globalLevel2 = 1;
            }
            globalLevel3 += 1;
          }
          displayLevel2 = globalLevel2;
          displayLevel3 = globalLevel3;
        } else {
          const current = tabCounters.get(contextKey) ?? {
            level2: 0,
            level3: 0,
          };
          let { level2, level3 } = current;

          if (level === 2) {
            level2 += 1;
            level3 = 0;
          } else if (level === 3) {
            if (level2 === 0) {
              level2 = 1;
            }
            level3 += 1;
          }

          tabCounters.set(contextKey, { level2, level3 });
          displayLevel2 = level2;
          displayLevel3 = level3;
        }

        // This is a content heading - add with number
        let prefix = "";
        if (level === 2) prefix = `${displayLevel2}.`;
        if (level === 3) prefix = `${displayLevel2}.${displayLevel3}`;

        items.push({
          id,
          title: prefix ? `${prefix} ${rawTitle}` : rawTitle,
          level,
          isSection: false,
          ...(tabKey !== undefined && { tabKey }),
          ...(sectionKey !== undefined && { sectionKey }),
        });
      }
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTocItems(items);
  }, [contentRef, activeTab]); // Re-extract when tab changes

  // Handle scroll for reading progress (separate from observer-based section tracking)
  useEffect(() => {
    const handleScroll = (e?: LenisScrollEvent | Event) => {
      const scrollTop =
        e && "scroll" in e ? e.scroll : window.pageYOffset;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / documentHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    // Listen to Lenis scroll events if available
    const lenis = window.lenis;

    if (lenis) {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
    }

    // Run once on mount to initialize state (e.g., after hash nav or refresh)
    handleScroll();

    return () => {
      if (lenis) {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [contentRef]);

  // Observer-based scrollspy for active section
  useEffect(() => {
    if (!contentRef.current) return;

    const headings = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>("h2[id], h3[id]")
    );
    if (headings.length === 0) return;

    // Derive sticky header offset dynamically from computed scroll-margin-top
    const computed = window.getComputedStyle(headings[0]);
    const parsed = parseFloat(
      (computed.scrollMarginTop as unknown as string) || "0"
    );
    const headerOffset = Number.isFinite(parsed) && parsed >= 0 ? parsed : 96;

    // Track visibility states
    const visible = new Set<string>();

    const pickActive = () => {
      // Respect click lock during programmatic scrolls
      if (Date.now() < clickLockUntilRef.current && lastClickedIdRef.current) {
        setActiveSection(lastClickedIdRef.current);
        return;
      }

      // Prefer the first visible heading in document order
      const byOrder = headings
        .filter((h) => visible.has(h.id))
        .map((h) => h.id);
      if (byOrder.length > 0) {
        setActiveSection(byOrder[0]);
        return;
      }

      // Fallback: last heading above the offset line
      const above = headings.filter(
        (h) => h.getBoundingClientRect().top < headerOffset
      );
      if (above.length > 0) {
        setActiveSection(above[above.length - 1].id);
        return;
      }

      // Edge: at very top with nothing visible/above
      setActiveSection(headings[0].id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        pickActive();
      },
      {
        root: null,
        rootMargin: `-${headerOffset}px 0px 0px 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    headings.forEach((h) => observer.observe(h));
    // Initialize immediately
    pickActive();

    return () => observer.disconnect();
  }, [contentRef, tocItems]);

  const scrollToSection = (id: string) => {
    // Find the TOC item to check if it needs tab switching
    const tocItem = tocItems.find((item) => item.id === id);

    // If the item is in a tab, switch to that tab first
    if (tocItem?.tabKey && tocItem?.sectionKey) {
      const switcherFn = (window as unknown as Record<string, unknown>)[
        `switchTab_${tocItem.sectionKey}`
      ];
      if (typeof switcherFn === "function") {
        switcherFn(tocItem.tabKey);
        // Wait a bit for tab switch to complete before scrolling
        setTimeout(() => {
          performScroll(id);
        }, 100);
        return;
      }
    }

    performScroll(id);
  };

  const performScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Lock active state on click so the next section isn't highlighted
      setActiveSection(id);
      lastClickedIdRef.current = id;
      clickLockUntilRef.current = Date.now() + 1200; // typical smooth-scroll duration

      const lenis = window.lenis;

      if (lenis) {
        // Use Lenis scrollTo with target element
        lenis.scrollTo(element, {
          offset: -96, // Match the scroll-margin-top value
          duration: 1.2,
        });
      } else {
        // Fallback to native scrollIntoView honoring CSS scroll-margin-top on headings
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }

      // Unlock after a safety timeout
      window.setTimeout(() => {
        lastClickedIdRef.current = "";
        clickLockUntilRef.current = 0;
      }, 1500);
    }
  };

  return {
    readingProgress,
    activeSection,
    tocItems,
    scrollToSection,
  };
}
