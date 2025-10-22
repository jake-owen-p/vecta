"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

import { cn } from "~/lib/utils/cn";

import { Button } from "../../_components/ui/button";
import { AudienceToggle } from "./AudienceToggle";
import type { Audience } from "./steps";

interface HowHeroProps {
  readonly audience: Audience;
  readonly onAudienceChange: (audience: Audience) => void;
}

const heroCopy: Record<Audience, { subtitle: string; primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string } }> = {
  business: {
    subtitle: "A vetted network of AI engineers, matched to your roadmap in days.",
    primaryCta: { label: "Book a call", href: "https://calendly.com/james-vecta/30min" },
    secondaryCta: { label: "See success stories", href: "/businesses" },
  },
  engineer: {
    subtitle: "Join a network building production AI products with world-class teams.",
    primaryCta: { label: "Apply now", href: "/apply" },
    secondaryCta: { label: "See open roles", href: "/#roles" },
  },
};

export const HowHero = ({ audience, onAudienceChange }: HowHeroProps) => {
  const copy = useMemo(() => heroCopy[audience], [audience]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#180906] via-[#0f0504] to-[#090200] py-28 text-white">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -left-40 top-20 h-72 w-72 rounded-full bg-[#FF3600]/40 blur-[120px]" aria-hidden="true" />
        <div className="absolute right-0 top-60 h-96 w-96 rounded-full bg-[#FF8A00]/20 blur-[140px]" aria-hidden="true" />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 text-center">
        <motion.span
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm uppercase tracking-[0.2em] text-white/70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          How it works
        </motion.span>

        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">How Vecta Works</h1>
          <p className="mx-auto max-w-3xl text-lg text-white/70 md:text-xl">{copy.subtitle}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <AudienceToggle value={audience} onChange={onAudienceChange} />
        </motion.div>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 text-sm sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Button
            asChild
            size="xl"
            variant="accent"
            className={cn(
              "group cursor-pointer border border-[#FF3600]/40 bg-[#FF3600] px-8 text-black shadow-[0_20px_45px_rgba(255,54,0,0.35)] transition hover:bg-[#ff4d1a]",
            )}
          >
            <Link href={copy.primaryCta.href} target={copy.primaryCta.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {copy.primaryCta.label}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="xl"
            variant="ghost"
            className="cursor-pointer border border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <Link href={copy.secondaryCta.href}>{copy.secondaryCta.label}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
