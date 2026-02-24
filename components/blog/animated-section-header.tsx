"use client";

import type { ReactNode } from "react";

interface AnimatedSectionHeaderProps {
  title: string;
  subtitle?: string | ReactNode;
  delay?: number;
}

export function AnimatedSectionHeader({
  title,
  subtitle,
  delay = 0, // kept for API compatibility
}: AnimatedSectionHeaderProps) {
  void delay;

  return (
    <div className="mb-8 border-b [border-bottom-style:dotted] pb-4">
      <h1 className="mb-2 text-3xl font-bold md:text-4xl">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>
      )}
    </div>
  );
}
