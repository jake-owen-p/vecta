"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Menu, X } from "lucide-react";

import { Button } from "./ui/button";

const NAV_LINKS = [
  { href: "/businesses", label: "Hire AI Engineers" },
];

const MobileNav = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        id="mobile-navigation"
        className="fixed right-0 top-0 z-50 flex h-screen w-[min(20rem,80vw)] flex-col gap-10 bg-[#120907] px-6 py-8 shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-end">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-between text-base text-white/80">
          <div className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white" onClick={onClose}>
                {link.label}
              </Link>
            ))}
          </div>

          <Button asChild variant="accent" size="lg" data-cta="mobile-nav-apply" onClick={onClose}>
            <Link href="/apply">Apply</Link>
          </Button>
        </nav>
      </aside>
    </div>
  );
};

export const SiteToolbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#120907]/70 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
        <Link href="/" aria-label="vecta home" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Vecta" width={96} height={32} priority />
        </Link>

        <nav aria-label="Primary" className="hidden items-center text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-white/70 transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
          <Button asChild variant="accent" size="lg" data-cta="nav-apply">
            <Link href="/apply">Apply</Link>
          </Button>
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && <MobileNav onClose={closeMenu} />}
    </header>
  );
};


