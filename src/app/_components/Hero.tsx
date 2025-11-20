"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "~/lib/utils/cn";

import { Button } from "./ui/button";
import { SiteToolbar } from "./SiteToolbar";

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

const STACK_DATA = [
  {
    id: "llmops",
    title: "LLMOps",
    logos: [
      {
        label: "python",
        alt: "Python logo",
        src: "https://logo.svgcdn.com/l/python.svg",
      },
      {
        label: "fastapi",
        alt: "FastAPI logo",
        src: "https://fastapi.tiangolo.com/img/favicon.png",
      },
      {
        label: "langchain",
        alt: "LangChain logo",
        src: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langchain-color.png",
      },
      {
        label: "docker",
        alt: "Docker logo",
        src: "https://www.svgrepo.com/show/331370/docker.svg",
      },
      {
        label: "kubernetes",
        alt: "Kubernetes logo",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/2109px-Kubernetes_logo_without_workmark.svg.png",
      },
      {
        label: "pinecone",
        alt: "Pinecone logo",
        src: "https://www.pinecone.io/favicon.ico",
      },
      {
        label: "prometheus",
        alt: "Prometheus logo",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Prometheus_software_logo.svg/2066px-Prometheus_software_logo.svg.png",
      },
    ],
    cta: { label: "Hire for this stack", href: "/businesses?stack=llmops" },
  },
  {
    id: "typescript-fullstack",
    title: "TypeScript Full-Stack",
    logos: [
      {
        label: "typescript",
        alt: "TypeScript logo",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/2048px-Typescript_logo_2020.svg.png",
      },
      {
        label: "nextjs",
        alt: "Next.js logo",
        src: "https://logo.svgcdn.com/l/nextjs.svg",
      },
      {
        label: "vercel",
        alt: "Vercel logo",
        src: "https://logo.svgcdn.com/l/vercel.svg",
      },
      {
        label: "openai",
        alt: "OpenAI logo",
        src: "https://logo.svgcdn.com/l/openai.svg",
      },
      {
        label: "prisma",
        alt: "Prisma logo",
        src: "https://www.svgrepo.com/show/354210/prisma.svg",
      },
      {
        label: "postgresql",
        alt: "PostgreSQL logo",
        src: "https://logo.svgcdn.com/l/postgresql.svg",
      },
      {
        label: "inngest",
        alt: "Inngest logo",
        src: "https://avatars.githubusercontent.com/u/78935958?s=280&v=4",
      },
    ],
    cta: { label: "Hire for this stack", href: "/businesses?stack=typescript-fullstack" },
  },
  {
    id: "python-fullstack",
    title: "Python Full-Stack",
    logos: [
      {
        label: "python",
        alt: "Python logo",
        src: "https://logo.svgcdn.com/l/python.svg",
      },
      {
        label: "fastapi",
        alt: "FastAPI logo",
        src: "https://fastapi.tiangolo.com/img/favicon.png",
      },
      {
        label: "react",
        alt: "React logo",
        src: "https://logo.svgcdn.com/l/react.svg",
      },
      {
        label: "langchain",
        alt: "LangChain logo",
        src: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langchain-color.png",
      },
      {
        label: "postgresql",
        alt: "PostgreSQL logo",
        src: "https://logo.svgcdn.com/l/postgresql.svg",
      },
      {
        label: "celery",
        alt: "Celery logo",
        src: "https://raw.githubusercontent.com/celery/celery/master/docs/images/celery_512.png",
      },
      {
        label: "docker",
        alt: "Docker logo",
        src: "https://www.svgrepo.com/show/331370/docker.svg",
      },
    ],
    cta: { label: "Hire for this stack", href: "/businesses?stack=python-fullstack" },
  },
  {
    id: "agents",
    title: "Agents",
    logos: [
      {
        label: "python",
        alt: "Python logo",
        src: "https://logo.svgcdn.com/l/python.svg",
      },
      {
        label: "fastapi",
        alt: "FastAPI logo",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/2048px-Typescript_logo_2020.svg.png",
      },
      {
        label: "langchain",
        alt: "LangChain logo",
        src: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langchain-color.png",
      },
      {
        label: "openai",
        alt: "OpenAI logo",
        src: "https://logo.svgcdn.com/l/openai.svg",
      },
      {
        label: "pinecone",
        alt: "Pinecone logo",
        src: "https://www.pinecone.io/favicon.ico",
      },
      {
        label: "playwright",
        alt: "Playwright logo",
        src: "https://logo.svgcdn.com/l/playwright.svg",
      },
      {
        label: "langfuse",
        alt: "LangFuse logo",
        src: "https://langfuse.com/favicon.ico",
      },
    ],
    cta: { label: "Hire for this stack", href: "/businesses?stack=agents" },
  },
  {
    id: "frontend-ai",
    title: "Frontend AI Engineer",
    logos: [
      {
        label: "typescript",
        alt: "TypeScript logo",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/2048px-Typescript_logo_2020.svg.png",
      },
      {
        label: "react",
        alt: "React logo",
        src: "https://logo.svgcdn.com/l/react.svg",
      },
      {
        label: "nextjs",
        alt: "Next.js logo",
        src: "https://logo.svgcdn.com/l/nextjs.svg",
      },
      {
        label: "vercel",
        alt: "Vercel logo",
        src: "https://logo.svgcdn.com/l/vercel.svg",
      },
      {
        label: "tailwind",
        alt: "Tailwind CSS logo",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/2560px-Tailwind_CSS_Logo.svg.png",
      },
      {
        label: "supabase",
        alt: "Supabase logo",
        src: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/claude-color.png",
      },
      {
        label: "cloudflare",
        alt: "Cloudflare Workers logo",
        src: "https://www.cloudflare.com/favicon.ico",
      },
    ],
    cta: { label: "Hire for this stack", href: "/businesses?stack=frontend-ai" },
  },
  {
    id: "ios-ai",
    title: "iOS AI Developer",
    logos: [
      {
        label: "swift",
        alt: "Swift logo",
        src: "https://logo.svgcdn.com/l/swift.svg",
      },
      {
        label: "swiftui",
        alt: "SwiftUI icon",
        src: "https://developer.apple.com/favicon.ico",
      },
      {
        label: "core-ml",
        alt: "Core ML icon",
        src: "https://logo.svgcdn.com/d/supabase-original-8x.png",
      },
      {
        label: "openai",
        alt: "OpenAI logo",
        src: "https://logo.svgcdn.com/l/openai.svg",
      },
      {
        label: "combine",
        alt: "Combine icon",
        src: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/anthropic.png",
      },
      {
        label: "firebase",
        alt: "Firebase logo",
        src: "https://logo.svgcdn.com/l/firebase.svg",
      },
      {
        label: "xcode",
        alt: "Xcode logo",
        src: "https://logo.svgcdn.com/l/xcode.svg",
      },
    ],
    cta: { label: "Hire for this stack", href: "/businesses?stack=ios-ai" },
  },
  {
    id: "android-ai",
    title: "Android AI Developer",
    logos: [
      {
        label: "kotlin",
        alt: "Kotlin logo",
        src: "https://logo.svgcdn.com/l/kotlin.svg",
      },
      {
        label: "jetpack-compose",
        alt: "Jetpack Compose icon",
        src: "https://developer.android.com/favicon.ico",
      },
      {
        label: "tensorflow-lite",
        alt: "TensorFlow Lite logo",
        src: "https://logo.svgcdn.com/l/tensorflow.svg",
      },
      {
        label: "openai",
        alt: "OpenAI logo",
        src: "https://logo.svgcdn.com/l/openai.svg",
      },
      {
        label: "retrofit",
        alt: "Retrofit icon",
        src: "https://cdn-icons-png.flaticon.com/512/5968/5968313.png",
      },
      {
        label: "room",
        alt: "Room icon",
        src: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/anthropic.png",
      },
      {
        label: "firebase-ml",
        alt: "Firebase ML logo",
        src: "https://logo.svgcdn.com/l/firebase.svg",
      },
    ],
    cta: { label: "Hire for this stack", href: "/businesses?stack=android-ai" },
  },
] satisfies Array<Omit<Stack, "logos"> & { logos: Array<Omit<StackLogo, "className">> }>;

const baseStacks: Stack[] = STACK_DATA.map((stack) => ({
  ...stack,
  logos: stack.logos.map((logo, index, logos) => ({
    ...logo,
    label: `${stack.id}-${logo.label}`,
    className: index === logos.length - 1 ? "col-start-2" : undefined,
  })),
}));

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

      const previousTimestamp = lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const delta = previousTimestamp === null ? 0 : timestamp - previousTimestamp;
      const distance = (SCROLL_SPEED_PX_PER_SEC * delta) / 1000;

      const fallbackBaseWidth = node.scrollWidth / LOOP_MULTIPLIER;
      const baseWidth = segmentWidthRef.current ?? (fallbackBaseWidth || 1);
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

      <SiteToolbar />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-6 pb-24 pt-32 md:pb-32 lg:flex-row lg:items-end lg:pt-46 justify-between">
        <div className="flex-1 space-y-8 lg:max-w-[640px]">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
            Technical recruitment service
          </div>
          <h1 className="text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
          AI Talent Sourced by People Who Build AI
          </h1>
          <p className="text-lg text-white/70 md:text-xl">
            We built these systems ourselves, so our recruitment service is run by technical co-founders—not account reps. Every intro is mission-first: we pair elite builders with your company after interviewing them to guarantee they can advance your mission.
          </p>
          <ul className="space-y-3 text-base text-white/70">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-4 rounded-full bg-[#FF3600]" />
              <span>Deep technical interviews led by co-founders who have shipped the same agentic systems.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-4 rounded-full bg-[#FF3600]" />
              <span>We take time to understand your product, stack, and mission before introducing talent.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-4 rounded-full bg-[#FF3600]" />
              <span>AI builders join you full-time or contract-to-hire to execute your roadmap with mission-level context.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-1 flex-col gap-6 self-stretch lg:max-w-[420px]">
          <p className="text-lg text-white/60">
            We place technical operators in companies they love so they bring momentum, ownership, and context from day one.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              variant="accent"
              size="xl"
              className="group w-full rounded-full border-[#ff3700e4] border-2 bg-white px-8 text-sm font-semibold uppercase tracking-tight text-white shadow-[0_0_25px_rgba(255,92,26,0.45)] transition hover:translate-y-[-2px] hover:bg-[#ffe6dfb8]"
              data-cta="hero-apply"
              onClick={handleHeroCta}
            >
              <Link href="/businesses" className="flex cursor-pointer items-center justify-center gap-3">
                <span className="text-[#ff3700e4]">Talk to a technical co-founder</span>
                <ArrowRight className="h-4 w-8 text-[#ff3700e4] transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-white/60">
            Operator-builders want to solve real world problems because they love what they do — we exist to pair that passion with the missions that need it most.
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full pb-12">
        <div className="px-6 pb-6 md:px-10">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Stacks we productionize</h2>
            <p className="text-sm text-white/40">Proof that we understand your architecture before we match you with talent.</p>
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
      "group/card relative block h-[360px] w-[260px] shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-white/10 p-6 text-white transition-transform duration-300 will-change-transform md:h-[420px] md:w-[280px]",
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
