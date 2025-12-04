"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedSectionHeaderProps {
  title: string;
  subtitle?: string | ReactNode;
  delay?: number;
}

export function AnimatedSectionHeader({
  title,
  subtitle,
  delay = 0,
}: AnimatedSectionHeaderProps) {
  return (
    <div className="mb-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="mb-2 text-4xl font-bold md:text-5xl"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.1 }}
          className="text-muted-foreground"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
