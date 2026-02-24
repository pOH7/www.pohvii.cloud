"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyMarkdownButtonProps {
  onCopy?: () => Promise<boolean>;
}

function CopyMarkdownButton({ onCopy }: CopyMarkdownButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== undefined) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopyClick = useCallback(async () => {
    if (!onCopy) return;

    const didCopy = await onCopy();
    if (!didCopy) return;

    setCopied(true);
    if (resetTimerRef.current !== undefined) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
  }, [onCopy]);

  return (
    <Button
      variant="outline"
      size="sm"
      className="inline-flex cursor-pointer items-center gap-2"
      onClick={() => void handleCopyClick()}
      disabled={!onCopy}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : "Copy Markdown"}
    </Button>
  );
}

export const MemoizedCopyMarkdownButton = memo(CopyMarkdownButton);
