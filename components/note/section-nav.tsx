"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { SectionKey } from "@/lib/note";

interface SectionNavProps {
  sections: Array<{
    sectionKey: SectionKey;
    title: string;
  }>;
}

export function SectionNav({ sections }: SectionNavProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections
        .map((section) => {
          const element = document.getElementById(section.sectionKey);
          if (element) {
            const rect = element.getBoundingClientRect();
            return {
              id: section.sectionKey,
              top: rect.top,
              bottom: rect.bottom,
            };
          }
          return null;
        })
        .filter(Boolean);

      // Find the section currently in view
      const currentSection = sectionElements.find(
        (el) => el && el.top <= 150 && el.bottom >= 150
      );

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (sectionKey: string) => {
    const element = document.getElementById(sectionKey);
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - 96;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-24 hidden h-fit lg:block">
      <div className="border-border border-l-2 pl-4">
        <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Sections
        </h3>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.sectionKey}>
              <button
                onClick={() => scrollToSection(section.sectionKey)}
                className={cn(
                  "hover:text-foreground w-full text-left text-sm transition-colors",
                  activeSection === section.sectionKey
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
