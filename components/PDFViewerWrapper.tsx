"use client";

import dynamic from "next/dynamic";
import React from "react";

const PDFViewerLoading = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-muted-foreground">Loading viewer…</p>
      </div>
    </div>
  );
};

const PDFViewer = dynamic(() => import("./PDFViewer"), {
  ssr: false,
  loading: () => <PDFViewerLoading />,
});

interface PDFViewerWrapperProps {
  src: string;
  title?: string;
  className?: string;
  locale?: "en" | "zh";
  height?: string;
}

const PDFViewerWrapper: React.FC<PDFViewerWrapperProps> = ({
  src,
  title,
  className = "",
  locale,
  height,
}) => {
  const viewerProps = {
    className,
    src,
    ...(title !== undefined ? { title } : {}),
    ...(locale !== undefined ? { locale } : {}),
    ...(height !== undefined ? { height } : {}),
  } as const;

  return <PDFViewer {...viewerProps} />;
};

export default PDFViewerWrapper;
