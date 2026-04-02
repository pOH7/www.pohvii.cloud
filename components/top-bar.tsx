"use client";

import type { ComponentType, SVGProps } from "react";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/social-icons";
import { cn } from "@/lib/utils";

type SocialLink = {
  name: string;
  href: string;
  hiddenOn: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const socialLinks: SocialLink[] = [
  {
    name: "X",
    href: "https://x.com/pOHVII",
    hiddenOn: "",
    Icon: XIcon,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/léon-zhang/",
    hiddenOn: "",
    Icon: LinkedInIcon,
  },
  {
    name: "GitHub",
    href: "https://github.com/pOH7",
    hiddenOn: "",
    Icon: GitHubIcon,
  },
];

export function TopBar() {
  return (
    <div className="bg-background/95 border-border fixed inset-x-0 top-0 z-1040 h-7 border-b [border-bottom-style:dotted] backdrop-blur-sm">
      <div className="mx-auto size-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-end">
          <div className="flex items-center gap-3">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`Follow on ${social.name}`}
                aria-label={`Follow on ${social.name} (opens in a new tab)`}
                className={cn(
                  "text-muted-foreground hover:text-primary inline-flex size-4 items-center justify-center border-b-2 border-transparent transition-colors",
                  "focus-visible:border-primary focus-visible:text-primary focus-visible:outline-none",
                  social.hiddenOn,
                  index === 1 && "hover:text-[#0077b5]"
                )}
              >
                <social.Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
