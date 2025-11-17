"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Globe } from "lucide-react";
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

  // Extract language from pathname to ensure consistency between server and client
  const currentLang = pathname.startsWith("/zh")
    ? "zh"
    : pathname.startsWith("/en")
      ? "en"
      : lang;
  const navigationItems = getNavigationItems(currentLang);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === currentLang) return;

    // Navigate to new locale path
    const path = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(path);

    // Set cookie for language preference in a microtask to avoid direct modification during render
    void Promise.resolve().then(() => {
      document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    });

    router.refresh();
  };

  return (
    <header className="sticky top-6 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <Link
            href={`/${currentLang}`}
            className="flex items-center space-x-3"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full overflow-hidden transition-all duration-200"
            >
              <Image
                src="/android-chrome-192x192.png"
                alt="Site logo"
                width={40}
                height={40}
                className="w-10 h-10 object-cover"
                priority
                unoptimized
              />
            </motion.div>
            <div className="flex flex-col">
              <h1
                className="font-semibold leading-tight"
                style={{ color: "var(--foreground)", fontSize: "20px" }}
              >
                {dictionary.Header.name}
              </h1>
              <p
                className="text-sm leading-tight text-muted-foreground animate-pulse"
                style={{
                  color: "var(--muted-foreground)",
                  animation: "fadeInUp 400ms ease-out 200ms forwards",
                  opacity: 0,
                }}
              >
                {dictionary.Header.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`relative text-base font-medium transition-colors hover:text-primary group 
                    text-foreground`}
              >
                {dictionary.Navigation[item.key]}
                <span
                  className={`absolute -bottom-1 left-1/2 h-0.5 bg-primary transition-all duration-250 ease-out transform -translate-x-1/2 ${
                    pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 [&_svg]:!text-current hover:!text-foreground">
                  <Globe className="h-4 w-4" />
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

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Language Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 [&_svg]:!text-current hover:!text-foreground">
                  <Globe className="h-4 w-4" />
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
              onClick={() => setIsSheetOpen(!isSheetOpen)}
            >
              {isSheetOpen ? (
                <motion.div
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-4 w-4" />
                </motion.div>
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isSheetOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg z-50"
            >
              <div className="px-4 py-6 space-y-4">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsSheetOpen(false)}
                      className={`block py-2 text-lg font-medium transition-colors hover:text-primary text-foreground`}
                    >
                      {dictionary.Navigation[item.key]}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Backdrop */}
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
