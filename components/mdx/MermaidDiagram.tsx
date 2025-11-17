"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize2, Maximize, Minimize } from "lucide-react";
import { useTheme } from "next-themes";

type MermaidDiagramProps = {
  chart: string;
};

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const transformRef = useRef<{
    resetTransform: () => void;
    centerView: (scale?: number) => void;
  } | null>(null);
  const originalSvgSizeRef = useRef<{ width: number; height: number } | null>(null);
  const hasInitializedRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const isThemeChangeRef = useRef(false);
  const previousThemeRef = useRef<string | undefined>(undefined);

  // Get current theme for mermaid diagram
  const { resolvedTheme } = useTheme();
  const mermaidTheme = resolvedTheme === "dark" ? "dark" : "default";

  // Detect theme changes
  useEffect(() => {
    if (previousThemeRef.current !== undefined && previousThemeRef.current !== mermaidTheme) {
      isThemeChangeRef.current = true;
    }
    previousThemeRef.current = mermaidTheme;
  }, [mermaidTheme]);

  useEffect(() => {
    // Initialize mermaid with configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
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

    void renderDiagram();
  }, [chart, mermaidTheme]);

  const onCopy = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if ("clipboard" in navigator && navigator.clipboard) {
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

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      const nowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(nowFullscreen);
      // Note: The fit-to-view logic will be triggered by the isFullscreen dependency
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  // Calculate and apply fit-to-viewport scale
  const fitToViewport = useCallback(() => {
    if (!transformRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const wrapperDiv = container.querySelector("div.rounded-lg.border");
    if (!wrapperDiv) return;

    // Batch all layout reads together to minimize reflows
    const containerWidth = (wrapperDiv as HTMLElement).clientWidth;
    let containerHeight = (wrapperDiv as HTMLElement).clientHeight;

    if (containerHeight < 100) {
      containerHeight = isFullscreen ? window.innerHeight : 500;
    }

    // Use stored original SVG dimensions
    if (originalSvgSizeRef.current) {
      const { width: svgWidth, height: svgHeight } = originalSvgSizeRef.current;

      if (svgWidth && svgHeight && containerWidth && containerHeight) {
        // Calculate scale to fit (use full container)
        const scaleX = containerWidth / svgWidth;
        const scaleY = containerHeight / svgHeight;
        const fitScale = Math.min(scaleX, scaleY);

        // Ensure minimum 80% fill
        const finalScale = Math.max(fitScale, 0.8);

        // Apply the calculated scale and center (writes happen after all reads)
        transformRef.current.centerView(finalScale);
      }
    }
  }, [isFullscreen]);

  // Store original SVG dimensions when SVG first loads
  useEffect(() => {
    if (svg && containerRef.current && transformRef.current) {
      // Skip reset and auto-fit if this is a theme change
      if (isThemeChangeRef.current) {
        isThemeChangeRef.current = false;
        return;
      }

      // Reset initialization flag for new SVG
      hasInitializedRef.current = false;

      // Use requestAnimationFrame to avoid forced reflow
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          const container = containerRef.current;
          if (container && !hasInitializedRef.current && transformRef.current) {
            const wrapperDiv = container.querySelector("div.rounded-lg.border");
            const svgElement = wrapperDiv?.querySelector('svg[id^="mermaid-"]');
            if (svgElement) {
              const svgRect = svgElement.getBoundingClientRect();
              originalSvgSizeRef.current = {
                width: svgRect.width,
                height: svgRect.height
              };
              hasInitializedRef.current = true;

              // Initial fit to viewport
              requestAnimationFrame(() => {
                fitToViewport();
              });
            }
          }
        });
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [svg, fitToViewport]);

  // Re-fit when fullscreen changes (skip first render)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (hasInitializedRef.current && transformRef.current) {
      // Use requestAnimationFrame to avoid forced reflow
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          fitToViewport();
        });
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [isFullscreen, fitToViewport]);

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
    <div
      ref={containerRef}
      className={`relative group my-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background m-0" : ""}`}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={100}
        limitToBounds={false}
        centerOnInit={false}
        centerZoomedOut={false}
        doubleClick={{ disabled: true }}
        wheel={{ smoothStep: 0.01 }}
        panning={{
          velocityDisabled: true,
          disabled: false,
        }}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => {
          // Store transform functions in ref
          transformRef.current = { resetTransform, centerView };

          return (
          <>
            {/* Control buttons */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 rounded-md border border-border bg-background/80 backdrop-blur shadow-sm">
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  aria-label="Zoom in"
                  className="p-2 text-foreground hover:bg-muted transition-colors rounded-l-md"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  aria-label="Zoom out"
                  className="p-2 text-foreground hover:bg-muted transition-colors"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={fitToViewport}
                  aria-label="Fit to viewport"
                  className="p-2 text-foreground hover:bg-muted transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void toggleFullscreen()}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  className="p-2 text-foreground hover:bg-muted transition-colors rounded-r-md"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Copy button */}
              <button
                type="button"
                onClick={() => void onCopy()}
                aria-label="Copy diagram source"
                className="rounded-md border border-border bg-background/80 backdrop-blur px-2 py-1 text-xs text-foreground shadow-sm transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 hover:bg-muted h-9 flex items-center"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Mermaid badge */}
            <span className="pointer-events-none absolute left-2 top-2 z-20 select-none rounded-md bg-background/80 backdrop-blur px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground border border-border opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
              mermaid
            </span>

            {/* Diagram container with pan/zoom */}
            <div className={`rounded-lg border border-border bg-background overflow-hidden w-full ${isFullscreen ? "h-screen w-screen" : "h-[500px]"}`}>
              <TransformComponent
                wrapperClass="w-full h-full"
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: svg }}
                  style={{ cursor: "grab" }}
                />
              </TransformComponent>
            </div>
          </>
          );
        }}
      </TransformWrapper>
    </div>
  );
}
