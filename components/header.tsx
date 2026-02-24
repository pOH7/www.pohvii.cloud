"use client";

import { useState } from "react";
import { Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { AuthButton } from "./auth/auth-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dictionary } from "../app/[lang]/dictionaries";

const getNavigationItems = (lang: string) => [
  { key: "home" as const, href: `/${lang}/` },
  { key: "blog" as const, href: `/${lang}/blog/` },
  { key: "notes" as const, href: `/${lang}/note/` },
  { key: "about" as const, href: `/${lang}/about/` },
  { key: "contact" as const, href: `/${lang}/contact/` },
];

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

interface HeaderProps {
  dictionary: Dictionary;
  lang: string;
}

export function Header({ dictionary, lang }: HeaderProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentLang = pathname.startsWith("/zh")
    ? "zh"
    : pathname.startsWith("/en")
      ? "en"
      : lang;
  const navigationItems = getNavigationItems(currentLang);
  const isActiveNav = (href: string) =>
    pathname === href || pathname === href.replace(/\/$/, "");

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLang) return;

    const path = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(path);

    void Promise.resolve().then(() => {
      document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    });

    router.refresh();
  };

  return (
    <header className="bg-background/95 border-border sticky top-7 z-50 w-full border-b [border-bottom-style:dotted] backdrop-blur-sm">
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href={`/${currentLang}`} className="flex items-center gap-3">
            <div className="border-border size-9 overflow-hidden rounded-sm border">
              <Image
                src="/android-chrome-192x192.png"
                alt="Site logo"
                width={36}
                height={36}
                className="size-full object-contain"
                priority
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base/tight font-semibold tracking-tight">
                {dictionary.Header.name}
              </h1>
              <p className="text-muted-foreground truncate text-xs/tight">
                {dictionary.Header.tagline}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="hover:text-primary data-[active=true]:text-primary data-[active=true]:border-b-primary border-b-2 border-b-transparent text-sm font-medium no-underline transition-colors"
                data-active={isActiveNav(item.href)}
              >
                {dictionary.Navigation[item.key]}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="[&_svg]:text-current"
                >
                  <Globe className="size-4" />
                  <span className="sr-only">Select language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((language) => (
                  <DropdownMenuCheckboxItem
                    key={language.code}
                    checked={currentLang === language.code}
                    onClick={() => handleLanguageChange(language.code)}
                  >
                    {language.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
            <AuthButton dictionary={dictionary} />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="[&_svg]:text-current"
                >
                  <Globe className="size-4" />
                  <span className="sr-only">Select language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuLabel className="text-xs">
                  Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((language) => (
                  <DropdownMenuCheckboxItem
                    key={language.code}
                    checked={currentLang === language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className="text-sm"
                  >
                    {language.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
            <AuthButton dictionary={dictionary} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSheetOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={isSheetOpen}
            >
              {isSheetOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {isSheetOpen && (
          <div className="bg-background border-border absolute inset-x-0 top-full z-50 border-b p-4 lg:hidden">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsSheetOpen(false)}
                  className="hover:text-primary data-[active=true]:text-primary data-[active=true]:border-b-primary block border-b-2 border-b-transparent py-2 text-base no-underline transition-colors"
                  data-active={isActiveNav(item.href)}
                >
                  {dictionary.Navigation[item.key]}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {isSheetOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setIsSheetOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
