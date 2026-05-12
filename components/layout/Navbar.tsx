// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import logoMark from "@/NGram.png";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explain", label: "Methodology" },
  { href: "#about-project", label: "About Project" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink-200/60 dark:border-ink-800/80 bg-ink-50/80 dark:bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src={logoMark}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg shadow-glow"
              priority
            />
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-display text-lg font-bold tracking-tight">
                NGramLab
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-400">
                Digital Data Academy
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href ||
                (!link.href.startsWith("#") &&
                  link.href !== "/" &&
                  pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent-400/10 text-accent-600 dark:text-accent-300"
                      : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <ThemeToggle />
          </div>
        </div>
        {/* Mobile nav row */}
        <div className="md:hidden -mt-1 pb-3 flex overflow-x-auto gap-1 scrollbar-thin">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (!link.href.startsWith("#") &&
                link.href !== "/" &&
                pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-accent-400/10 text-accent-600 dark:text-accent-300"
                    : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
