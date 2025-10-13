"use client";

import { useState, useEffect, useRef } from "react";

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
  useEffect(() => {
    if (contentRef.current) {
      // Get all headings including section titles
      const allHeadings = contentRef.current.querySelectorAll("h2, h3");
      const items: NoteTOCItem[] = [];

      // Track which section we're in for numbering reset
      let c2 = 0,
        c3 = 0;

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
          c2 = 0; // Reset numbering for new section
          c3 = 0;
        } else {
          // This is a content heading - add with number
          if (level === 2) {
            c2 += 1;
            c3 = 0;
          } else if (level === 3) {
            c3 += 1;
          }

          let prefix = "";
          if (level === 2) prefix = `${c2}.`;
          if (level === 3) prefix = `${c2}.${c3}`;

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

      setTocItems(items);
    }
  }, [contentRef, activeTab]); // Re-extract when tab changes

  // Handle scroll for reading progress (separate from observer-based section tracking)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / documentHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll);
    // Run once on mount to initialize state (e.g., after hash nav or refresh)
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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
      // Use native scrollIntoView honoring CSS scroll-margin-top on headings
      clickLockUntilRef.current = Date.now() + 1200; // typical smooth-scroll duration
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
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
