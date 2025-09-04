"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        className="lg:hidden fixed bottom-[5.5rem] right-6 z-40"
      >
        <Button
          onClick={() => setIsMobileOpen(true)}
          size="icon"
          className="rounded-full size-12 shadow-lg hover:shadow-xl transition-all duration-200"
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
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">In this article</h3>
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
                  style={{ height: "1px" }}
                >
                  <div
                    className="rounded-full bg-primary transition-all duration-100 ease-out"
                    style={{ width: `${readingProgress}%`, height: "1px" }}
                  />
                </div>

                {/* TOC Navigation */}
                <nav className="space-y-1">
                  {items.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleItemClick(item.id)}
                      className={`block w-full text-left py-2 px-3 rounded transition-all duration-200 border-l-2 border-transparent ${
                        item.level === 3 ? "pl-6 text-sm" : "text-base"
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
        )}
      </AnimatePresence>

      {/* Desktop TOC - Sticky Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="w-72 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto hidden lg:block"
      >
        <Card className="p-6 gap-0">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">In this article</h3>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full bg-muted rounded-full my-3"
            style={{ height: "1px" }}
          >
            <div
              ref={progressBarRef}
              className="rounded-full bg-primary transition-all duration-100 ease-out"
              style={{ width: `${readingProgress}%`, height: "1px" }}
            />
          </div>

          {/* TOC Navigation */}
          <nav className="space-y-2 text-sm">
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => onItemClick(item.id)}
                className={`block w-full text-left py-2 px-3 rounded transition-all duration-200 hover:translate-x-1 hover:text-primary border-l-2 border-transparent ${
                  item.level === 3 ? "pl-6 text-xs" : ""
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
