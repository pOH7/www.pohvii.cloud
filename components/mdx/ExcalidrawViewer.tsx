"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type {
  ExcalidrawInitialDataState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        Loading Excalidraw…
      </div>
    ),
  }
);

export interface ExcalidrawViewerProps {
  /**
   * Path to an Excalidraw JSON export (served from public/ or a remote URL).
   */
  src?: string;
  /**
   * Provide scene data directly instead of fetching from `src`.
   */
  initialData?: ExcalidrawInitialDataState | null;
  /**
   * When true, the editor renders in read-only mode (default).
   */
  readOnly?: boolean;
  /**
   * Explicit height for the canvas container. Accepts px number or CSS string.
   */
  height?: number | string;
  /**
   * Additional classes for the container.
   */
  className?: string;
}

const DEFAULT_HEIGHT = 520;

export function ExcalidrawViewer({
  src,
  initialData = null,
  readOnly = true,
  height = DEFAULT_HEIGHT,
  className,
}: ExcalidrawViewerProps) {
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [sceneData, setSceneData] = useState<ExcalidrawInitialDataState | null>(
    initialData
  );
  const [loading, setLoading] = useState<boolean>(Boolean(src && !initialData));
  const [error, setError] = useState<string | null>(null);
  const [apiVersion, setApiVersion] = useState(0);
  const [hasCentered, setHasCentered] = useState(false);
  const { resolvedTheme } = useTheme();
  const [viewerTheme, setViewerTheme] = useState<"light" | "dark">("light");
  const viewerUiOptions = useMemo(
    () => ({
      canvasActions: {
        toggleTheme: false,
      },
    }),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setViewerTheme(
      window.document.documentElement.classList.contains("dark")
        ? "dark"
        : "light"
    );
  }, []);

  useEffect(() => {
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      setViewerTheme(resolvedTheme);
    }
  }, [resolvedTheme]);

  useEffect(() => {
    let cancelled = false;

    if (!src) return;

    async function loadScene(source: string) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as ExcalidrawInitialDataState;
        if (!cancelled) {
          setSceneData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unknown error fetching scene"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadScene(src);

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (!src) {
      setSceneData(initialData ?? null);
      setError(null);
    }
  }, [initialData, src]);

  const resolvedHeight = useMemo(() => {
    if (typeof height === "number") {
      return `${height}px`;
    }
    return height;
  }, [height]);

  useEffect(() => {
    setHasCentered(false);
  }, [sceneData]);

  useEffect(() => {
    const api = excalidrawApiRef.current;
    if (!api) return;
    if (api.getAppState().theme === viewerTheme) return;

    api.updateScene({
      appState: {
        theme: viewerTheme,
      },
    });
  }, [viewerTheme, apiVersion]);

  useEffect(() => {
    if (loading || hasCentered || !apiVersion) return;
    const api = excalidrawApiRef.current;
    if (!api) return;

    const frameId = requestAnimationFrame(() => {
      api.scrollToContent(undefined, {
        fitToViewport: true,
        viewportZoomFactor: 0.9,
        animate: true,
      });
      setHasCentered(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, [loading, hasCentered, apiVersion, sceneData]);

  const handleExcalidrawApi = useCallback((api: ExcalidrawImperativeAPI) => {
    excalidrawApiRef.current = api;
    setApiVersion((prev) => prev + 1);
  }, []);

  if (error) {
    return (
      <div
        className={cn(
          "border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm",
          className
        )}
      >
        Failed to load Excalidraw scene: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={cn(
          "border-border bg-muted/30 text-muted-foreground flex w-full items-center justify-center rounded-lg border text-sm",
          className
        )}
        style={{ height: resolvedHeight }}
      >
        Fetching Excalidraw scene…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-border overflow-hidden rounded-lg border shadow-sm",
        className
      )}
      style={{ height: resolvedHeight }}
    >
      <Excalidraw
        initialData={sceneData ?? null}
        viewModeEnabled={readOnly}
        excalidrawAPI={handleExcalidrawApi}
        theme={viewerTheme}
        UIOptions={viewerUiOptions}
      />
    </div>
  );
}
