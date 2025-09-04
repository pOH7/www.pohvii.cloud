"use client";

import { useState, useEffect, useRef } from "react";

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
  useEffect(() => {
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll("h2, h3");
      const items: TOCItem[] = Array.from(headings).map((heading, index) => {
        // Use existing ID if available, otherwise generate one
        let id = heading.id;
        if (!id) {
          id =
            heading.textContent
              ?.toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "") || `heading-${index}`;
          heading.id = id;
        }

        return {
          id,
          title: heading.textContent || "",
          level: parseInt(heading.tagName.charAt(1)),
        };
      });
      setTocItems(items);
    }
  }, [contentRef]);

  // Handle scroll for reading progress and active section
  useEffect(() => {
    const handleScroll = () => {
      // Respect a short lock window after a programmatic scroll-to-section
      if (Date.now() < clickLockUntilRef.current) {
        // Keep the clicked section highlighted during the lock window
        if (lastClickedIdRef.current) {
          setActiveSection(lastClickedIdRef.current);
        }
        return;
      }
      const scrollTop = window.pageYOffset;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / documentHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));

      // Find current section (stable rule: last heading above the offset line)
      if (contentRef.current) {
        const headings = contentRef.current.querySelectorAll("h2[id], h3[id]");
        const headerOffset = 96;
        let current = "";
        headings.forEach((heading) => {
          const top = (heading as HTMLElement).getBoundingClientRect().top;
          if (top - headerOffset <= 1) {
            current = (heading as HTMLElement).id;
          }
        });
        if (!current && headings.length > 0) {
          current = (headings[0] as HTMLElement).id;
        }
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [contentRef]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 96; // Same offset used in handleScroll for consistency
      // Lock active state on click so the next section isn't highlighted
      setActiveSection(id);
      lastClickedIdRef.current = id;
      const elementPosition = element.offsetTop - headerOffset;
      // Lock until we reach the target (or a hard timeout)
      clickLockUntilRef.current = Date.now() + 2000; // generous window for long smooth scrolls
      let raf = 0;
      const checkArrival = () => {
        const delta = Math.abs(window.pageYOffset - elementPosition);
        if (delta < 4) {
          lastClickedIdRef.current = "";
          clickLockUntilRef.current = 0;
          cancelAnimationFrame(raf);
        } else {
          raf = requestAnimationFrame(checkArrival);
        }
      };
      raf = requestAnimationFrame(checkArrival);
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  return {
    readingProgress,
    activeSection,
    tocItems,
    scrollToSection,
  };
}
