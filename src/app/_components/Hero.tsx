"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef } from "react";
import { ArrowRight, Menu } from "lucide-react";

import { cn } from "~/lib/utils/cn";

import { Button } from "./ui/button";

const HERO_EVENTS = {
  viewHero: "view_hero",
  clickApply: "click_apply",
  viewCard: "view_card",
  scrollCarousel: "scroll_carousel",
  clickCardApply: "click_card_apply",
} as const;

const LOOP_MULTIPLIER = 3;
const SCROLL_SPEED_PX_PER_SEC = 32;
const INITIAL_SCROLL_OFFSET = 24;

const emit = (event: string, payload?: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(event, { detail: payload }));
};

type StackLogo = {
  src: string;
  alt: string;
  label: string;
  className?: string;
};

type Stack = {
  id: string;
  title: string;
  logos: StackLogo[];
  cta: { label: string; href: string };
};

const LOGO_FILES = {
  infra: [
    "Tech Stack Logos.svg",
    "Tech Stack Logos-1.svg",
    "Tech Stack Logos-2.svg",
    "Tech Stack Logos-3.svg",
    "Tech Stack Logos-4.svg",
    "Tech Stack Logos-5.svg",
    "Tech Stack Logos.svg",
  ],
  agents: [
    "Tech Stack Logos-1.svg",
    "Tech Stack Logos-2.svg",
    "Tech Stack Logos-3.svg",
    "Tech Stack Logos-4.svg",
    "Tech Stack Logos-5.svg",
    "Tech Stack Logos.svg",
    "Tech Stack Logos-1.svg",
  ],
  rag: [
    "Tech Stack Logos-2.svg",
    "Tech Stack Logos-3.svg",
    "Tech Stack Logos-4.svg",
    "Tech Stack Logos-5.svg",
    "Tech Stack Logos.svg",
    "Tech Stack Logos-1.svg",
    "Tech Stack Logos-2.svg",
  ],
  llmops: [
    "Tech Stack Logos-3.svg",
    "Tech Stack Logos-4.svg",
    "Tech Stack Logos-5.svg",
    "Tech Stack Logos.svg",
    "Tech Stack Logos-1.svg",
    "Tech Stack Logos-2.svg",
    "Tech Stack Logos-3.svg",
  ],
  fullstack: [
    "Tech Stack Logos-4.svg",
    "Tech Stack Logos-5.svg",
    "Tech Stack Logos.svg",
    "Tech Stack Logos-1.svg",
    "Tech Stack Logos-2.svg",
    "Tech Stack Logos-3.svg",
    "Tech Stack Logos-4.svg",
  ],
} satisfies Record<string, string[]>;

const createStackLogos = (stackId: keyof typeof LOGO_FILES, stackTitle: string): StackLogo[] =>
  LOGO_FILES[stackId].map((fileName, index, logos) => ({
    label: `${stackId}-logo-${index + 1}`,
    alt: `${stackTitle} icon ${index + 1}`,
    src: `/logos/${fileName}`,
    className: index === logos.length - 1 ? "col-start-2" : undefined,
  }));

const baseStacks: Stack[] = [
  {
    id: "infra",
    title: "Infra",
    logos: createStackLogos("infra", "Infra"),
    cta: { label: "Apply now", href: "/apply?stack=infra" },
  },
  {
    id: "agents",
    title: "Agents",
    logos: createStackLogos("agents", "Agents"),
    cta: { label: "Apply now", href: "/apply?stack=agents" },
  },
  {
    id: "rag",
    title: "RAG",
    logos: createStackLogos("rag", "RAG"),
    cta: { label: "Apply now", href: "/apply?stack=rag" },
  },
  {
    id: "llmops",
    title: "LLMOps",
    logos: createStackLogos("llmops", "LLMOps"),
    cta: { label: "Apply now", href: "/apply?stack=llmops" },
  },
  {
    id: "fullstack",
    title: "Full-stack",
    logos: createStackLogos("fullstack", "Full-stack"),
    cta: { label: "Apply now", href: "/apply?stack=fullstack" },
  },
];

export const Hero = () => {
  const listRef = useRef<HTMLUListElement>(null);
  const heroId = useId();
  const hoverRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const segmentWidthRef = useRef(0);
  const scrollPositionRef = useRef(INITIAL_SCROLL_OFFSET);

  const stacks = useMemo(
    () => Array.from({ length: LOOP_MULTIPLIER }, () => baseStacks).flat(),
    [],
  );

  useEffect(() => {
    emit(HERO_EVENTS.viewHero);
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    const updateSegmentWidth = () => {
      segmentWidthRef.current = node.scrollWidth / LOOP_MULTIPLIER;
    };

    updateSegmentWidth();

    const resizeObserver = new ResizeObserver(updateSegmentWidth);
    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    node.scrollLeft = 0;
    lastTimestampRef.current = null;
    scrollPositionRef.current = INITIAL_SCROLL_OFFSET;
    node.scrollLeft = INITIAL_SCROLL_OFFSET;
    lastTimestampRef.current = null;

    const step = (timestamp: number) => {
      if (hoverRef.current) {
        lastTimestampRef.current = timestamp;
        animationFrameRef.current = requestAnimationFrame(step);
        return;
      }

      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const delta = timestamp - lastTimestampRef.current;
      const distance = (SCROLL_SPEED_PX_PER_SEC * delta) / 1000;
      lastTimestampRef.current = timestamp;

      const baseWidth = segmentWidthRef.current || node.scrollWidth / LOOP_MULTIPLIER || 1;
      let nextScroll = scrollPositionRef.current + distance;

      if (nextScroll >= baseWidth + INITIAL_SCROLL_OFFSET) {
        nextScroll -= baseWidth;
      }

      scrollPositionRef.current = nextScroll;
      node.scrollLeft = nextScroll;

      emit(HERO_EVENTS.scrollCarousel, { scrollLeft: node.scrollLeft });
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const stackId = entry.target.getAttribute("data-stack-id");
          if (!stackId) return;
          if (entry.isIntersecting) {
            emit(HERO_EVENTS.viewCard, { stack: stackId });
          }
        });
      },
      { root: node, threshold: 0.6 },
    );

    Array.from(node.children).forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [stacks.length]);

  const handleNavClick = (href: string) => {
    emit(HERO_EVENTS.clickApply, { source: "nav", href });
  };

  const handleHeroCta = () => {
    emit(HERO_EVENTS.clickApply, { source: "hero" });
  };

  const handleCardClick = (stack: Stack) => {
    emit(HERO_EVENTS.clickCardApply, { stack: stack.id });
  };

  const handleMouseEnter = () => {
    hoverRef.current = true;
    const node = listRef.current;
    if (node) {
      scrollPositionRef.current = node.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    hoverRef.current = false;
    lastTimestampRef.current = null;
    const node = listRef.current;
    if (node) {
      scrollPositionRef.current = node.scrollLeft;
    }
  };

  return (
    <section className="relative overflow-hidden text-white">

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#120907]/70 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
          <Link href="/" aria-label="vecta home" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Vecta" width={96} height={32} priority />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-10 text-sm font-medium md:flex">
            {[
              { href: "/apply", label: "Apply" },
              { href: "/hire", label: "Hire AI Engineers" },
              { href: "/articles", label: "Articles" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/70 transition-colors hover:text-white"
                onClick={() => handleNavClick(link.href)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild variant="accent" size="lg" data-cta="nav-apply" onClick={() => handleNavClick("/apply")}>
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

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-6 pb-24 pt-46 md:pb-32 lg:flex-row lg:items-end lg:pt-46 justify-between">
        <div className="flex-1 space-y-10 lg:max-w-[640px]">
          <span className="inline-flex h-1 w-16 rounded-full bg-gradient-to-r from-white/40 to-white/10" />
          <h1 className="text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
            Remote roles for the top 5% of <span className="font-black text-[#FF3600]">AI builders</span>
          </h1>
        </div>

        <div className="flex flex-1 flex-col gap-6 self-stretch lg:max-w-[420px]">
          <p className="text-lg text-white/50 md:text-lg">
            You’ve mastered AI frameworks — now use them for products people rely on daily. Remote freedom, great pay, and high-impact projects.
          </p>
          <Button
            asChild
            variant="accent"
            size="xl"
            className="group w-fit rounded-full border-[#ff3700e4] border-2 bg-white px-8 text-sm font-semibold uppercase tracking-tight text-white shadow-[0_0_25px_rgba(255,92,26,0.45)] transition hover:translate-y-[-2px] hover:bg-[#ffe6dfb8]"
            data-cta="hero-apply"
            onClick={handleHeroCta}
          >
            <Link href="/apply" className="flex items-center gap-3">
              <span className="text-[#ff3700e4]">Apply Now</span>
              <ArrowRight className="h-4 w-8 text-[#ff3700e4] transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative z-10 w-full pb-12">
        <div className="px-6 pb-6 md:px-10">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Stacks</h2>
            <p className="text-sm text-white/40">Join the engineers redefining what’s possible with AI every single day.</p>
          </div>
        </div>
        <div className="group relative" role="region" aria-label="Stack carousel">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 -translate-x-6 bg-gradient-to-r from-[#130b08] to-transparent opacity-90 md:w-32 md:-translate-x-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 translate-x-6 bg-gradient-to-l from-[#130b08] to-transparent opacity-90 md:w-32 md:translate-x-10" />
          <ul
            ref={listRef}
            id={heroId}
            role="list"
            className="flex gap-6 overflow-hidden pb-10 pt-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {stacks.map((stack, index) => (
              <li
                key={`${stack.id}-${index}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${stack.title} stack`}
                data-stack-id={stack.id}
                className="snap-start"
              >
                <StackCard stack={stack} onApply={() => handleCardClick(stack)} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

type StackCardProps = {
  stack: Stack;
  onApply: () => void;
};

const StackCard = ({ stack, onApply }: StackCardProps) => (
  <Link
    href={stack.cta.href}
    className={cn(
      "group/card relative block h-[360px] w-[260px] shrink-0 overflow-hidden rounded-3xl border border-white/10 p-6 text-white transition-transform duration-300 will-change-transform md:h-[420px] md:w-[280px]",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70",
      "translate-y-0 shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(255,90,40,0.35)]",
      "bg-cover bg-center",
    )}
    style={{ backgroundImage: "url('/@glassbg.png')" }}
    data-cta="card-apply"
    data-stack={stack.id}
    onClick={onApply}
  >
    <div className="absolute inset-0 -z-20 bg-black/20" aria-hidden="true" />
    <div className="flex h-full flex-col justify-between">
      <header className="flex items-center justify-between">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/70">{stack.title}</p>
        <span className="text-xs text-white/40">Stack</span>
      </header>
      <div className="grid grid-cols-3 gap-3">
        {stack.logos.map((logo) => (
          <LogoTile key={`${stack.id}-${logo.label}`} {...logo} />
        ))}
      </div>
      <footer className="flex items-center justify-between text-sm font-semibold text-white">
        <span>{stack.cta.label}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-1" />
      </footer>
    </div>
  </Link>
);

type LogoTileProps = {
  src?: string;
  alt: string;
  title?: string;
  className?: string;
};

const LogoTile = ({ src, alt, title, className }: LogoTileProps) => (
  <div
    className={cn(
      "group/logo relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white/90 p-3 shadow-inner shadow-black/10 transition-transform group-hover/card:-translate-y-0.5",
      className,
    )}
  >
    {src ? (
      <Image src={src} alt={alt} title={title ?? alt} width={64} height={64} className="object-contain" />
    ) : (
      <span className="text-sm font-semibold text-gray-700">{alt}</span>
    )}
  </div>
);
