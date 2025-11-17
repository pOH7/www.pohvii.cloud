"use client";

/* eslint-disable @next/next/no-img-element */

import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";

import type {
  PDFDocumentProxy,
} from "pdfjs-dist/types/src/display/api";

import React, {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Maximize2,
  Move,
  Shrink,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { acquireScrollLock } from "@/lib/scroll-lock";
import type * as PDFJSType from "pdfjs-dist";

type PDFModule = typeof PDFJSType;

type FullscreenDocument = Document & {
  webkitFullscreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

let pdfjsLib: PDFModule | null = null;

const initializePDFJS = async (): Promise<PDFModule | null> => {
  if (typeof window !== "undefined" && !pdfjsLib) {
    const lib = (await import("pdfjs-dist")) as PDFModule;

    lib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
    pdfjsLib = lib;
  }

  return pdfjsLib;
};

const viewerMessages = {
  en: {
    documentLabel: "document",
    initializing: "Initializing viewer…",
    loadingViewer: "Loading viewer…",
    loading: "Loading PDF…",
    rendering: "Rendering page…",
    errors: {
      title: "Unable to display PDF",
      initialize: "We could not initialize the viewer.",
      load: "The PDF file failed to load.",
    },
    controls: {
      previousPage: "Previous page",
      nextPage: "Next page",
      pageIndicator: ({ current, total }: { current: number; total: number }) =>
        `Page ${current} of ${total}`,
      zoomOut: "Zoom out",
      zoomIn: "Zoom in",
      fitToScreen: "Fit to screen",
      enterFullscreen: "Enter fullscreen",
      exitFullscreen: "Exit fullscreen",
      helpText: "Scroll to zoom, drag to pan, double-click to reset",
    },
    pageAlt: ({ title, page }: { title: string; page: number }) =>
      `${title} – page ${page}`,
  },
  zh: {
    documentLabel: "文档",
    initializing: "正在初始化查看器…",
    loadingViewer: "正在加载查看器…",
    loading: "正在加载 PDF…",
    rendering: "正在渲染页面…",
    errors: {
      title: "无法显示 PDF",
      initialize: "无法初始化查看器。",
      load: "PDF 文件加载失败。",
    },
    controls: {
      previousPage: "上一页",
      nextPage: "下一页",
      pageIndicator: ({ current, total }: { current: number; total: number }) =>
        `第 ${current} / ${total} 页`,
      zoomOut: "缩小",
      zoomIn: "放大",
      fitToScreen: "适配屏幕",
      enterFullscreen: "进入全屏",
      exitFullscreen: "退出全屏",
      helpText: "滚轮缩放，拖动平移，双击重置",
    },
    pageAlt: ({ title, page }: { title: string; page: number }) =>
      `${title} – 第 ${page} 页`,
  },
};

interface PDFViewerProps {
  src: string;
  title?: string;
  className?: string;
  locale?: keyof typeof viewerMessages;
  height?: string;
}

type ViewerError = "init" | "load";

const PDFViewer: React.FC<PDFViewerProps> = ({
  src,
  title,
  className = "",
  locale = "en",
  height,
}) => {
  const messages = useMemo(() => {
    return viewerMessages[locale];
  }, [locale]);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ViewerError | null>(null);
  const [pdfLibReady, setPdfLibReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchContentRef | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerAreaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const documentLabel = title?.trim() || messages.documentLabel;
  const viewerHeight = height ?? "75vh";

  const handleFitToScreen = useCallback(() => {
    const transform = transformRef.current;
    const viewerEl = viewerAreaRef.current;
    const imageEl = imageRef.current;

    if (!transform || !viewerEl || !imageEl) {
      return;
    }

    const rect = viewerEl.getBoundingClientRect();
    const { naturalWidth, naturalHeight } = imageEl;

    if (!rect.width || !rect.height || !naturalWidth || !naturalHeight) {
      return;
    }

    const scale = Math.min(
      rect.width / naturalWidth,
      rect.height / naturalHeight
    );
    const clampedScale = Math.max(Math.min(scale, 5), 0.02);

    const scaledWidth = naturalWidth * clampedScale;
    const scaledHeight = naturalHeight * clampedScale;

    const centeredX = (rect.width - scaledWidth) / 2;
    const centeredY = (rect.height - scaledHeight) / 2;
    const positionX = scaledWidth <= rect.width ? centeredX : 0;
    const positionY = scaledHeight <= rect.height ? centeredY : 0;

    transform.setTransform(positionX, positionY, clampedScale);
  }, []);

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      handleFitToScreen();
    },
    [handleFitToScreen]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const init = async () => {
      try {
        await initializePDFJS();
        setPdfLibReady(true);
      } catch (err) {
        console.error("Error initializing PDF.js:", err);
        setError("init");
        setLoading(false);
      }
    };

    void init();
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      handleFitToScreen();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleFitToScreen, isMounted]);

  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfLibReady || !pdfjsLib) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const task = pdfjsLib.getDocument(src);
        const pdf = await task.promise;

        setPdfDoc(pdf);
        setPageNum(1);
        setPageImages({});
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("load");
      } finally {
        setLoading(false);
      }
    };

    if (src && pdfLibReady) {
      void loadPDF();
    }
  }, [src, pdfLibReady]);

  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || pageImages[pageNumber] || !pdfjsLib) return;

      try {
        const page = (await pdfDoc.getPage(pageNumber));
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          canvas,
          viewport,
        }).promise;

        const imageUrl = canvas.toDataURL();

        setPageImages((prev) => ({ ...prev, [pageNumber]: imageUrl }));
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    },
    [pdfDoc, pageImages]
  );

  useEffect(() => {
    if (pdfDoc && pageNum) {
      void renderPage(pageNum);
    }
  }, [pdfDoc, pageNum, renderPage]);

  useEffect(() => {
    if (transformRef.current && pageImages[pageNum]) {
      const timeout = setTimeout(() => {
        handleFitToScreen();
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [pageNum, pageImages, handleFitToScreen]);

  const goToNextPage = useCallback(() => {
    setPageNum((currentPage) => {
      if (!pdfDoc) {
        return currentPage;
      }

      return currentPage < pdfDoc.numPages ? currentPage + 1 : currentPage;
    });
  }, [pdfDoc]);

  const goToPrevPage = useCallback(() => {
    setPageNum((currentPage) => {
      if (!pdfDoc) {
        return currentPage;
      }

      return currentPage > 1 ? currentPage - 1 : currentPage;
    });
  }, [pdfDoc]);

  const handleKeyboardNavigation = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (target) {
        const tag = target.tagName;

        if (
          target.isContentEditable ||
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT"
        ) {
          return;
        }
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        goToNextPage();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        goToPrevPage();
      }
    },
    [goToNextPage, goToPrevPage]
  );

  const isFullscreenSupported = () => {
    const fullscreenDoc = document as FullscreenDocument;

    return Boolean(
      fullscreenDoc.fullscreenEnabled ||
        fullscreenDoc.webkitFullscreenEnabled ||
        fullscreenDoc.msFullscreenEnabled
    );
  };

  const callMaybePromise = async (fn?: () => Promise<void> | void) => {
    if (!fn) return;

    const result = fn();

    if (result && typeof (result).then === "function") {
      await result;
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    const fullscreenElement = containerRef.current as FullscreenElement;

    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (!isFullscreenSupported() || isMobile) {
      setIsMobileFullscreen(!isMobileFullscreen);

      return;
    }

    const fullscreenDoc = document as FullscreenDocument;

    try {
      if (!isFullscreen && !isMobileFullscreen) {
        await callMaybePromise(
          fullscreenElement.requestFullscreen.bind(fullscreenElement)
        );
        // Fallback to webkit/ms if standard method didn't work
        await callMaybePromise(
          fullscreenElement.webkitRequestFullscreen?.bind(fullscreenElement)
        );
        await callMaybePromise(
          fullscreenElement.msRequestFullscreen?.bind(fullscreenElement)
        );
      } else {
        await callMaybePromise(
          fullscreenDoc.exitFullscreen.bind(fullscreenDoc)
        );
        // Fallback to webkit/ms if standard method didn't work
        await callMaybePromise(
          fullscreenDoc.webkitExitFullscreen?.bind(fullscreenDoc)
        );
        await callMaybePromise(
          fullscreenDoc.msExitFullscreen?.bind(fullscreenDoc)
        );
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
      setIsMobileFullscreen(!isMobileFullscreen);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    if (!isMobileFullscreen) {
      return;
    }

    const releaseScrollLock = acquireScrollLock();

    return () => {
      releaseScrollLock();
    };
  }, [isMobileFullscreen]);

  const isAnyFullscreen = isFullscreen || isMobileFullscreen;

  useEffect(() => {
    if (!isAnyFullscreen || !pageImages[pageNum]) {
      return;
    }

    const timeout = setTimeout(() => {
      handleFitToScreen();
    }, 150);

    return () => clearTimeout(timeout);
  }, [isAnyFullscreen, pageImages, pageNum, handleFitToScreen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardNavigation);

    return () => {
      window.removeEventListener("keydown", handleKeyboardNavigation);
    };
  }, [handleKeyboardNavigation]);

  if (!isMounted) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">{messages.initializing}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">{messages.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="mb-2 text-destructive">{messages.errors.title}</p>
          <p className="text-sm text-muted-foreground">
            {error === "init"
              ? messages.errors.initialize
              : messages.errors.load}
          </p>
        </div>
      </div>
    );
  }

  if (!pdfDoc || !pageImages[pageNum]) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">{messages.rendering}</p>
        </div>
      </div>
    );
  }

  const containerStyles: CSSProperties | undefined = isMobileFullscreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        backgroundColor: "var(--background)",
      }
    : {
        height: viewerHeight,
        maxHeight: "90vh",
        width: "100%",
      };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${className} ${
        isAnyFullscreen ? "fixed inset-0 z-50 bg-background" : ""
      }`}
      style={containerStyles}
    >
      <div className="flex items-center justify-between border-b border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Button
            aria-label={messages.controls.previousPage}
            className="cursor-pointer"
            disabled={pageNum <= 1}
            size="sm"
            title={messages.controls.previousPage}
            variant="outline"
            onClick={goToPrevPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span
            aria-label={messages.controls.pageIndicator({
              current: pageNum,
              total: pdfDoc.numPages,
            })}
            className="text-center text-sm font-medium"
            role="status"
          >
            {pageNum} / {pdfDoc.numPages}
          </span>
          <Button
            aria-label={messages.controls.nextPage}
            className="cursor-pointer"
            disabled={pageNum >= pdfDoc.numPages}
            size="sm"
            title={messages.controls.nextPage}
            variant="outline"
            onClick={goToNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            aria-label={messages.controls.zoomOut}
            className="cursor-pointer"
            size="sm"
            title={messages.controls.zoomOut}
            variant="outline"
            onClick={() => {
              if (transformRef.current?.zoomOut) {
                transformRef.current.zoomOut();
              }
            }}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            aria-label={messages.controls.zoomIn}
            className="cursor-pointer"
            size="sm"
            title={messages.controls.zoomIn}
            variant="outline"
            onClick={() => {
              if (transformRef.current?.zoomIn) {
                transformRef.current.zoomIn();
              }
            }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            aria-label={messages.controls.fitToScreen}
            className="cursor-pointer"
            size="sm"
            title={messages.controls.fitToScreen}
            variant="outline"
            onClick={handleFitToScreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            aria-label={
              isAnyFullscreen
                ? messages.controls.exitFullscreen
                : messages.controls.enterFullscreen
            }
            className="cursor-pointer"
            size="sm"
            title={
              isAnyFullscreen
                ? messages.controls.exitFullscreen
                : messages.controls.enterFullscreen
            }
            variant="outline"
            onClick={() => void toggleFullscreen()}
          >
            {isAnyFullscreen ? (
              <Shrink className="h-4 w-4" />
            ) : (
              <Expand className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div
        ref={viewerAreaRef}
        className="flex-1 overflow-hidden bg-muted touch-none"
      >
        <TransformWrapper
          alignmentAnimation={{
            sizeX: 0,
            sizeY: 0,
            velocityAlignmentTime: 0,
            disabled: true,
          }}
          centerOnInit={false}
          centerZoomedOut
          disablePadding
          doubleClick={{
            disabled: true,
          }}
          initialScale={1}
          maxScale={5}
          minScale={0.02}
          panning={{
            velocityDisabled: true,
          }}
          pinch={{
            step: 5,
          }}
          velocityAnimation={{
            disabled: true,
          }}
          wheel={{
            step: 0.1,
            activationKeys: [],
          }}
        >
          {(transformControls) => {
            transformRef.current = transformControls;

            return (
              <TransformComponent
                wrapperClass="h-full w-full"
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  touchAction: "none",
                }}
              >
                <div
                  className="relative inline-block"
                  onDoubleClick={handleDoubleClick}
                >
                  <img
                    ref={imageRef}
                    alt={messages.pageAlt({
                      title: documentLabel,
                      page: pageNum,
                    })}
                    className="select-none shadow-lg"
                    draggable={false}
                    src={pageImages[pageNum]}
                    style={{
                      maxHeight: "none",
                      maxWidth: "none",
                    }}
                    onLoad={handleFitToScreen}
                  />
                </div>
              </TransformComponent>
            );
          }}
        </TransformWrapper>
      </div>

      <div className="border-t border-border bg-card px-3 py-2">
        <p className="text-center text-xs text-muted-foreground">
          <Move className="mr-1 inline h-3 w-3" />
          {messages.controls.helpText}
        </p>
      </div>
    </div>
  );
};

export default PDFViewer;
