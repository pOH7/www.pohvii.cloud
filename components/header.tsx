"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Globe, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dictionary } from "../app/[lang]/dictionaries";

const navigationItems = [
  { key: "home" as const, href: "/" },
  { key: "blog" as const, href: "/blog" },
  { key: "notes" as const, href: "/notes" },
  { key: "about" as const, href: "/about" },
  { key: "contact" as const, href: "/contact" },
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

  const handleLanguageChange = (newLang: string) => {
    if (newLang === lang) return;

    const path = pathname.replace(`/${lang}`, `/${newLang}`);

    // Use replace instead of push to avoid back/forward issues
    // and window.location for instant navigation without flash
    window.location.href = path;
  };

  return (
    <header className="sticky top-6 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base font-mono transition-all duration-200"
              style={{
                backgroundColor: "var(--primary-red)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              LZ
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
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Globe className="h-4 w-4 mr-2" />
                  {languages.find((language) => language.code === lang)?.flag}
                  <span className="ml-1 hidden sm:inline">
                    {languages.find((language) => language.code === lang)?.name}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0"
              >
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`flex w-full items-center ${
                      lang === language.code
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <span className="mr-3">{language.flag}</span>
                    {language.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            {/* CTA Button */}
            <Button
              asChild
              className="bg-primary hover:bg-accent hover:text-accent-foreground font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <a
                href="https://linkedin.com/in/léon-zhang"
                target="_blank"
                rel="noopener noreferrer"
              >
                {dictionary.Header.cta}
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
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

                {/* Mobile Controls */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: navigationItems.length * 0.1,
                    duration: 0.2,
                  }}
                  className="pt-4 space-y-4"
                >
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    {dictionary.Header.language}
                  </div>
                  <div className="space-y-2">
                    {languages.map((language) => (
                      <Button
                        key={language.code}
                        variant={lang === language.code ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          handleLanguageChange(language.code);
                          setIsSheetOpen(false);
                        }}
                      >
                        <span className="mr-3">{language.flag}</span>
                        {language.name}
                      </Button>
                    ))}
                  </div>

                  <hr className="border-border my-4" />

                  {/* Mobile CTA */}
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-accent hover:text-accent-foreground font-semibold py-3 text-lg"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    <a
                      href="https://linkedin.com/in/léon-zhang"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      {dictionary.Header.cta}
                    </a>
                  </Button>
                </motion.div>
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
