"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type TopLoaderProps = {
  color?: string;
  height?: number;
  shadow?: string;
  zIndex?: number;
};

function isPlainLeftClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function getNavigatingAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.href === window.location.href) return null;

  return anchor;
}

export function TopLoader({
  color = "var(--primary)",
  height = 3,
  shadow = "0 0 10px color-mix(in oklab, var(--primary) 55%, transparent)",
  zIndex = 1050,
}: TopLoaderProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setIsVisible(true);
    setProgress((current) => (current > 0 && current < 1 ? current : 0.08));

    window.requestAnimationFrame(() => {
      setProgress((current) => Math.max(current, 0.62));
    });

    intervalRef.current = window.setInterval(() => {
      setProgress((current) => Math.min(current + (1 - current) * 0.18, 0.92));
    }, 280);
  }, [clearTimers]);

  const finish = useCallback(() => {
    clearTimers();
    setProgress(1);

    finishTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
      finishTimerRef.current = null;
    }, 220);
  }, [clearTimers]);

  useEffect(() => {
    finish();
  }, [pathname, finish]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isPlainLeftClick(event)) return;
      if (!getNavigatingAnchor(event.target)) return;

      start();
      fallbackTimerRef.current = window.setTimeout(finish, 1400);
    };

    const handleBeforeUnload = () => {
      start();
    };

    const history = window.history;
    const pushState = history.pushState.bind(history);
    const replaceState = history.replaceState.bind(history);

    window.history.pushState = function pushStateWithLoader(...args) {
      start();
      return pushState(...args);
    };

    window.history.replaceState = function replaceStateWithLoader(...args) {
      start();
      return replaceState(...args);
    };

    window.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", start);

    return () => {
      clearTimers();
      window.history.pushState = pushState;
      window.history.replaceState = replaceState;
      window.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", start);
    };
  }, [clearTimers, finish, start]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0"
      style={{ height, zIndex }}
    >
      <div
        className="h-full origin-left transition-[transform,opacity] duration-200 ease-out"
        style={{
          backgroundColor: color,
          boxShadow: shadow,
          opacity: isVisible ? 1 : 0,
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
}
