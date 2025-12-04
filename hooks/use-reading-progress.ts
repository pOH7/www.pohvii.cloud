"use client";

import { useState, useEffect, useRef } from "react";
import type { LenisScrollEvent } from "@/types/lenis";

export interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export function useReadingProgress(
  contentRef: React.RefObject<HTMLDivElement | null>
) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  // When user clicks a ToC item and we perform a programmatic smooth scroll,
  // temporarily lock the active section to the clicked target to avoid the
  // scroll handler prematurely switching to the next heading.
  const clickLockUntilRef = useRef<number>(0);
  const lastClickedIdRef = useRef<string>("");

  // Extract table of contents from content
  // This effect extracts TOC data from DOM, which is a legitimate use of setState in effect
  useEffect(() => {
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll("h2, h3, h4");

    // Build hierarchical numbering (matches CSS counters applied for H2–H4)
    let c2 = 0,
      c3 = 0,
      c4 = 0;
    const items: TOCItem[] = [];

    Array.from(headings).forEach((heading, index) => {
      let id = heading.id;
      if (!id) {
        id =
          (heading.textContent || "")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || `heading-${index}`;
        heading.id = id;
      }

      const level = parseInt(heading.tagName.charAt(1));
      const rawTitle = heading.textContent || "";

      if (level === 2) {
        c2 += 1;
        c3 = 0;
        c4 = 0;
      } else if (level === 3) {
        c3 += 1;
        c4 = 0;
      } else if (level === 4) {
        c4 += 1;
      }

      let prefix = "";
      if (level === 2) prefix = `${c2}.`;
      if (level === 3) prefix = `${c2}.${c3}.`;
      if (level === 4) prefix = `${c2}.${c3}.${c4}.`;

      items.push({
        id,
        title: prefix ? `${prefix} ${rawTitle}` : rawTitle,
        level,
      });
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTocItems(items);
  }, [contentRef]);

  // Handle scroll for reading progress (separate from observer-based section tracking)
  useEffect(() => {
    const handleScroll = (e?: LenisScrollEvent | Event) => {
      // Respect a short lock window after a programmatic scroll-to-section
      // (Do not early-return; progress bar should keep updating.)
      const scrollTop = e && "scroll" in e ? e.scroll : window.pageYOffset;
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

  // Observer-based scrollspy for active section (Microsoft Learn-like behavior)
  useEffect(() => {
    if (!contentRef.current) return;

    const headings = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>("h2[id], h3[id], h4[id]")
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
