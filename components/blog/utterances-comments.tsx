"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export interface UtterancesCommentsProps {
  repo: string;
  issueTerm?: string;
  label?: string;
  theme?: string;
}

export function UtterancesComments({
  repo,
  issueTerm = "pathname",
  label = "comment",
  theme,
}: UtterancesCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const { theme: currentTheme } = useTheme();

  // Determine utterances theme to match our custom design
  const utterancesTheme =
    theme || (currentTheme === "dark" ? "github-dark" : "github-light");

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent duplicate initialization (Strict Mode, fast refresh, rapid effects)
    if (initializedRef.current) return;
    initializedRef.current = true;

    // If an iframe already exists in the document (e.g., from a previous pass
    // in dev), remove it to ensure a single instance only.
    const orphanIframes = document.querySelectorAll(
      ".utterances, .utterances-frame"
    );
    orphanIframes.forEach((el) => el.remove());

    // Create new script element
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", repo);
    script.setAttribute("issue-term", issueTerm);
    script.setAttribute("label", label);
    script.setAttribute("theme", utterancesTheme);
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    // Append script to container
    containerRef.current.appendChild(script);
  }, [repo, issueTerm, label, utterancesTheme]);

  // Handle theme changes for existing utterances
  useEffect(() => {
    // Add a small delay to ensure iframe is fully loaded
    const timer = setTimeout(() => {
      const iframe =
        document.querySelector<HTMLIFrameElement>(".utterances-frame");
      if (iframe && iframe.contentWindow) {
        const message = {
          type: "set-theme",
          theme: utterancesTheme,
        };
        iframe.contentWindow.postMessage(message, "https://utteranc.es");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [utterancesTheme]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="border-border mt-16 border-t pt-8"
    >
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1 }}
        className="mb-8 flex items-center gap-2 text-2xl font-bold"
      >
        <MessageCircle className="text-primary h-6 w-6" />
        Comments
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        ref={containerRef}
        className="utterances-container"
      />
    </motion.section>
  );
}
