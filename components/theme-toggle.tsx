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
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleThemeToggle = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    const doc = document as DocumentWithViewTransition;

    // Check if View Transitions API is supported or user prefers reduced motion
    if (
      !buttonRef.current ||
      !containerRef.current ||
      typeof doc.startViewTransition !== "function" ||
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

    // Assign view-transition-name to the icon container
    containerRef.current.style.viewTransitionName = "theme-icon";

    const transition = doc.startViewTransition(() => {
      // Disable CSS transitions during the snapshot to capture the final state
      containerRef.current?.classList.add("disable-transitions");
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    transition.finished
      .catch(() => undefined)
      .finally(() => {
        delete root.dataset.themeTransition;
        if (containerRef.current) {
          containerRef.current.style.viewTransitionName = "";
          containerRef.current.classList.remove("disable-transitions");
        }
      });

    await transition.ready;

    // Animate the old and new icons with spinning effect
    const oldPseudo = "::view-transition-old(theme-icon)";
    const newPseudo = "::view-transition-new(theme-icon)";

    // Old icon: spin out counter-clockwise
    root.animate(
      {
        transform: ["rotate(0deg)", "rotate(-90deg)"],
        opacity: ["1", "0"],
      },
      {
        duration: 500,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        pseudoElement: oldPseudo,
        fill: "forwards",
      }
    );

    // New icon: spin in clockwise
    root.animate(
      {
        transform: ["rotate(90deg)", "rotate(0deg)"],
        opacity: ["0", "1"],
      },
      {
        duration: 500,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        pseudoElement: newPseudo,
        fill: "forwards",
      }
    );

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
      onClick={() => void handleThemeToggle()}
      className="hover:text-foreground [&_svg]:text-current"
    >
      <div
        ref={containerRef}
        className="group relative flex items-center justify-center"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 opacity-100 transition-all duration-500 group-[.disable-transitions]:duration-0! dark:-rotate-90 dark:opacity-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-0 opacity-0 transition-all duration-500 group-[.disable-transitions]:duration-0! dark:-rotate-90 dark:opacity-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
