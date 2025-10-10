import Image from "next/image";
import Link from "next/link";

import { Menu } from "lucide-react";

import { Button } from "./ui/button";

const NAV_LINKS = [
  { href: "/apply", label: "Apply" },
  { href: "/hire", label: "Hire AI Engineers" },
  { href: "/articles", label: "Articles" },
];

export const SiteToolbar = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#120907]/70 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
        <Link href="/" aria-label="vecta home" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Vecta" width={96} height={32} priority />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-10 text-sm font-medium md:flex">
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
          aria-label="Open navigation"
          aria-expanded="false"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};


