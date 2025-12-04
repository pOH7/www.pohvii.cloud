"use client";

import * as React from "react";
import { useEffectEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LenisScrollEvent } from "@/types/lenis";

interface BackToTopProps {
  /**
   * The scroll threshold in pixels to show the button
   * @default 300
   */
  threshold?: number;
  /**
   * Custom className for the button
   */
  className?: string;
  /**
   * Smooth scroll duration in milliseconds
   * @default 800
   */
  scrollDuration?: number;
}

export function BackToTop({
  threshold = 300,
  className,
  scrollDuration = 800,
}: BackToTopProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  // Extract non-reactive scroll logic using React 19.2's useEffectEvent
  // This allows us to access the latest threshold value without re-running the effect
  const handleScroll = useEffectEvent((e?: LenisScrollEvent | Event) => {
    const scrollY = e && "scroll" in e ? e.scroll : window.scrollY;
    const documentHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / documentHeight) * 100;

    setIsVisible(scrollY > threshold);
    setScrollProgress(Math.min(progress, 100));
  });

  React.useEffect(() => {
    // Listen to Lenis scroll events if available
    const lenis = window.lenis;

    if (lenis) {
      lenis.on("scroll", handleScroll);
    } else {
      // Fallback to native scroll events if Lenis is not available
      let ticking = false;
      const throttledHandleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener("scroll", throttledHandleScroll, {
        passive: true,
      });
    }

    // Check initial position
    handleScroll();

    return () => {
      if (lenis) {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", () => {});
      }
    };
  }, []); // ✨ No dependencies needed! useEffectEvent always reads latest values

  const scrollToTop = () => {
    const lenis = window.lenis;

    if (lenis) {
      // Use Lenis scrollTo for smooth scrolling
      lenis.scrollTo(0, {
        duration: scrollDuration / 1000, // Convert ms to seconds
        easing: (t: number) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      });
    } else {
      // Fallback to native smooth scroll
      const startPosition = window.scrollY;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);

        // Ease-in-out cubic function
        const easeInOutCubic =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentPosition = startPosition * (1 - easeInOutCubic);
        window.scrollTo(0, currentPosition);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  return (
    <div
      className={cn(
        "fixed right-6 bottom-6 z-30 transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-90 opacity-0",
        className
      )}
    >
      <div className="relative">
        {/* Progress ring */}
        <svg
          className="pointer-events-none absolute inset-0 size-12 -rotate-90"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border opacity-20"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`}
          />
        </svg>

        {/* Back to top button */}
        <Button
          onClick={scrollToTop}
          size="icon"
          className={cn(
            "size-12 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "hover:scale-105 active:scale-95",
            "focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-2"
          )}
          aria-label="Back to top"
        >
          <svg
            className="size-5 transition-transform duration-200 hover:rotate-12"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
