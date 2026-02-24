"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
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

  const utterancesTheme =
    theme || (currentTheme === "dark" ? "github-dark" : "github-light");

  useEffect(() => {
    if (!containerRef.current) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const orphanIframes = document.querySelectorAll(
      ".utterances, .utterances-frame"
    );
    orphanIframes.forEach((el) => el.remove());

    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", repo);
    script.setAttribute("issue-term", issueTerm);
    script.setAttribute("label", label);
    script.setAttribute("theme", utterancesTheme);
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    containerRef.current.appendChild(script);
  }, [repo, issueTerm, label, utterancesTheme]);

  useEffect(() => {
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
    <section className="mt-16 border-t [border-top-style:dotted] pt-8">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <MessageCircle className="text-primary size-5" />
        Comments
      </h2>

      <div ref={containerRef} className="utterances-container" />
    </section>
  );
}
