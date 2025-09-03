"use client";

import { useState } from "react";

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export function useSharing() {
  const [isSharing, setIsSharing] = useState(false);

  const share = async (data: ShareData) => {
    setIsSharing(true);

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(data.url);
        // You could show a toast notification here
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        // User cancelled sharing, or another error occurred
        console.error("Error sharing:", error);
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(data.url);
        } catch (clipboardError) {
          console.error("Error copying to clipboard:", clipboardError);
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  const shareToTwitter = (data: ShareData) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const shareToLinkedIn = (data: ShareData) => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  };

  const shareToFacebook = (data: ShareData) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
    window.open(facebookUrl, "_blank", "noopener,noreferrer");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      return false;
    }
  };

  return {
    isSharing,
    share,
    shareToTwitter,
    shareToLinkedIn,
    shareToFacebook,
    copyToClipboard,
  };
}
