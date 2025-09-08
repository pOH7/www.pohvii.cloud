"use client";

import { Github, Youtube, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

// Social media configuration with Tailwind hover colors
const socialLinks = [
  {
    name: "Bluesky",
    href: "https://bsky.app/profile/yourhandle",
    hoverColor: "hover:text-[#00a8e6]",
    hiddenOn: "", // Always visible
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.5C9.5 5.5 6.5 9 3.5 12c3 3 6 6.5 8.5 9.5 2.5-3 5.5-6.5 8.5-9.5-3-3-6-6.5-8.5-9.5z" />
        <path d="M12 2.5c-1.5 2-3.5 4.5-5.5 7 2 2.5 4 5 5.5 7.5 1.5-2.5 3.5-5 5.5-7.5-2-2.5-4-5-5.5-7z" />
      </svg>
    ),
  },
  {
    name: "Mastodon",
    href: "https://mastodon.social/@yourhandle",
    hoverColor: "hover:text-[#6364ff]",
    hiddenOn: "max-[480px]:hidden", // Hidden on very small screens
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.433 4.014.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.434-2.233.398-5.454.398-5.454zm-3.353 5.59h-2.081V9.057c0-1.075-.452-1.62-1.357-1.62-1 0-1.501.647-1.501 1.927v2.791h-2.069V9.364c0-1.28-.501-1.927-1.502-1.927-.905 0-1.357.546-1.357 1.62v5.099H6.026V8.903c0-1.074.273-1.927.823-2.558.566-.631 1.307-.955 2.228-.955 1.065 0 1.872.409 2.405 1.228l.518.869.519-.869c.533-.819 1.34-1.228 2.405-1.228.92 0 1.662.324 2.228.955.549.631.822 1.484.822 2.558v5.253z" />
      </svg>
    ),
  },
  {
    name: "Dribbble",
    href: "https://dribbble.com/yourhandle",
    hoverColor: "hover:text-[#ea4c89]",
    hiddenOn: "max-md:hidden", // Hidden on tablet and below
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@yourchannel",
    hoverColor: "hover:text-red-500",
    hiddenOn: "", // Always visible
    icon: <Youtube className="w-4 h-4" />,
  },
  {
    name: "GitHub",
    href: "https://github.com/pOH7",
    hoverColor: "hover:text-foreground dark:hover:text-white",
    hiddenOn: "", // Always visible
    icon: <Github className="w-4 h-4" />,
  },
  {
    name: "Medium",
    href: "https://medium.com/@yourhandle",
    hoverColor: "hover:text-foreground dark:hover:text-white",
    hiddenOn: "max-md:hidden", // Hidden on tablet and below
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z" />
      </svg>
    ),
  },
  {
    name: "RSS",
    href: "/rss.xml",
    hoverColor: "hover:text-[#ee802f]",
    hiddenOn: "", // Always visible
    icon: <Rss className="w-4 h-4" />,
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
                target={social.name === "RSS" ? "_self" : "_blank"}
                rel={social.name === "RSS" ? undefined : "noopener noreferrer"}
                title={`${social.name === "RSS" ? "Subscribe to" : "Follow on"} ${social.name}`}
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
