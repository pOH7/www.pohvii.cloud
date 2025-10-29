"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

type MermaidDiagramProps = {
  chart: string;
};

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Initialize mermaid with configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "inherit",
    });

    const renderDiagram = async () => {
      if (!chart.trim()) {
        setError("Empty diagram");
        return;
      }

      try {
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError("");
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to render diagram"
        );
      }
    };

    renderDiagram();
  }, [chart]);

  const onCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(chart);
      } else {
        throw new Error("clipboard API not available");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = chart;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } catch {
        // noop
      }
    }
  };

  if (error) {
    return (
      <div className="relative group">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-medium mb-2">
            Mermaid Diagram Error
          </p>
          <pre className="text-xs text-muted-foreground overflow-auto">
            {error}
          </pre>
          <details className="mt-3">
            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
              View source
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-[200px]">
              {chart}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group my-6">
      {/* Copy button */}
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy diagram source"
        className="absolute top-2 right-2 z-10 rounded-md border border-border bg-background/80 backdrop-blur px-2 py-1 text-xs text-foreground shadow-sm transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 hover:bg-muted"
      >
        {copied ? "Copied" : "Copy"}
      </button>

      {/* Mermaid badge */}
      <span className="pointer-events-none absolute left-2 top-2 z-10 select-none rounded-md bg-background/80 backdrop-blur px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground border border-border opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
        mermaid
      </span>

      {/* Diagram container */}
      <div
        ref={containerRef}
        className="flex items-center justify-center overflow-auto rounded-lg border border-border bg-background p-8"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
