"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { List } from "lucide-react";
import { Card } from "@/components/ui/card";
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

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="w-72 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto hidden lg:block"
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <List className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Table of Contents</h3>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-1 mb-4">
          <div
            ref={progressBarRef}
            className="h-1 rounded-full bg-primary transition-all duration-100 ease-out"
            style={{ width: `${readingProgress}%` }}
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

        {/* Reading Progress Info */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">
            Reading Progress
          </div>
          <div className="text-sm font-medium">
            {Math.round(readingProgress)}% Complete
          </div>
        </div>
      </Card>
    </motion.aside>
  );
}
