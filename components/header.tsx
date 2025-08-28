"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import type { Dictionary } from "../app/[lang]/dictionaries";

const navigationItems = [
  { key: "home" as const, href: "/" },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === lang) return;

    setIsLanguageOpen(false);
    const path = pathname.replace(`/${lang}`, `/${newLang}`);

    // Use replace instead of push to avoid back/forward issues
    // and window.location for instant navigation without flash
    window.location.href = path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Image
                src="/images/logo.svg"
                alt="POHVII Logo"
                width={40}
                height={40}
                className="h-10 w-10"
                unoptimized
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                  pathname === item.href
                    ? "text-foreground border-b-2 border-primary"
                    : "text-foreground/60"
                }`}
              >
                {dictionary.Navigation[item.key]}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
                aria-expanded={isLanguageOpen}
                aria-haspopup="true"
              >
                <Globe className="h-4 w-4 mr-2" />
                {languages.find((language) => language.code === lang)?.flag}
                <span className="ml-1 hidden sm:inline">
                  {languages.find((language) => language.code === lang)?.name}
                </span>
              </button>

              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-popover p-1 shadow-lg"
                  >
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`flex w-full items-center rounded-sm px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                          lang === language.code
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }`}
                      >
                        <span className="mr-3">{language.flag}</span>
                        {language.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">Toggle menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/40">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {dictionary.Navigation[item.key]}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Language Selector */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: navigationItems.length * 0.1,
                    duration: 0.2,
                  }}
                  className="px-3 py-2"
                >
                  <div className="text-sm font-medium text-foreground/60 mb-2">
                    {dictionary.Header.language}
                  </div>
                  <div className="space-y-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                          lang === language.code
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <span className="mr-3">{language.flag}</span>
                        {language.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Click outside to close language dropdown */}
      {isLanguageOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsLanguageOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
