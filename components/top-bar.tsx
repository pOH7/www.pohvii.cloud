"use client";

import { Github } from "lucide-react";
import { cn } from "@/lib/utils";

// Social media configuration with Tailwind hover colors
const socialLinks = [
  {
    name: "X",
    href: "https://x.com/pOHVII",
    hoverColor: "hover:text-foreground dark:hover:text-white",
    hiddenOn: "", // Always visible
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/léon-zhang/",
    hoverColor: "hover:text-[#0077b5]",
    hiddenOn: "", // Always visible
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com/pOH7",
    hoverColor: "hover:text-foreground dark:hover:text-white",
    hiddenOn: "", // Always visible
    icon: <Github className="w-4 h-4" />,
  },
];

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-6 bg-background/95 backdrop-blur-sm border-b border-border/40 z-[1040] animate-in slide-in-from-top duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl h-full">
        <div className="flex items-center justify-end h-full">
          <div className="flex items-center space-x-3 md:space-x-4">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`Follow on ${social.name}`}
                className={cn(
                  // Base styles
                  "inline-flex items-center justify-center w-4 h-4 text-muted-foreground transition-all duration-200 ease-out",
                  // Hover effects
                  "hover:-translate-y-0.5 hover:scale-110",
                  // Platform-specific hover colors
                  social.hoverColor,
                  // Responsive visibility
                  social.hiddenOn,
                  // Focus styles
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm",
                  // Animation
                  "animate-in fade-in zoom-in duration-400 ease-out"
                )}
                style={{
                  animationDelay: `${100 + index * 50}ms`,
                  animationFillMode: "both",
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
