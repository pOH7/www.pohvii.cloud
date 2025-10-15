"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { flushSync } from "react-dom";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => {
    finished: Promise<void>;
    ready: Promise<void>;
  };
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleThemeToggle = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    const doc = document as DocumentWithViewTransition;

    // Check if View Transitions API is supported or user prefers reduced motion
    if (
      !buttonRef.current ||
      !doc.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(newTheme);
      return;
    }

    const root = document.documentElement;
    const transitionType = newTheme === "dark" ? "to-dark" : "to-light";
    root.dataset.themeTransition = transitionType;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    transition.finished
      .catch(() => undefined)
      .finally(() => {
        delete root.dataset.themeTransition;
      });

    await transition.ready;

    const clipKeyframes = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${maxRadius}px at ${x}px ${y}px)`,
    ];
    const fullyOpenClip = [
      `circle(${maxRadius}px at ${x}px ${y}px)`,
      `circle(${maxRadius}px at ${x}px ${y}px)`,
    ];
    const animationOptions = {
      duration: 500,
      easing: "ease-in-out",
      fill: "both",
    } as const;

    if (newTheme === "light") {
      root.animate(
        {
          clipPath: clipKeyframes,
        },
        {
          ...animationOptions,
          pseudoElement: "::view-transition-new(root)",
        }
      );
      root.animate(
        {
          clipPath: fullyOpenClip,
        },
        {
          ...animationOptions,
          pseudoElement: "::view-transition-old(root)",
        }
      );
      return;
    }

    root.animate(
      {
        clipPath: [...clipKeyframes].reverse(),
      },
      {
        ...animationOptions,
        pseudoElement: "::view-transition-old(root)",
      }
    );
    root.animate(
      {
        clipPath: fullyOpenClip,
      },
      {
        ...animationOptions,
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      onClick={handleThemeToggle}
      className="h-10 w-10"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
