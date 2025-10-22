'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "../../_components/ui/button";
import { cn } from "~/lib/utils/cn";

const badges = ["OpenAI", "Vercel", "Pinecone", "AWS", "LangChain", "Finch", "Zenith"];

const growthPoints = [
  { delay: 0, left: "5%", top: "60%" },
  { delay: 0.2, left: "20%", top: "40%" },
  { delay: 0.4, left: "40%", top: "30%" },
  { delay: 0.6, left: "60%", top: "42%" },
  { delay: 0.8, left: "82%", top: "20%" },
];

export const BusinessHero = () => {
  return (
    <section className="relative overflow-hidden bg-[#090200] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,54,0,0.12),_transparent_45%),_radial-gradient(circle_at_bottom,_rgba(255,255,255,0.08),_transparent_55%)]" />
        <div className="absolute bottom-0 left-1/2 h-40 w-[120vw] -translate-x-1/2 bg-gradient-to-t from-[#090200]" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto flex flex-col items-center gap-12 px-4 pb-20 pt-28 text-center lg:flex-row lg:text-left">
          <div className="flex-1 space-y-6">
            <span className="-ml-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.35em] text-[#FF3600]">
              Agentic engineering talent network
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl mt-4">
              Hire pre-vetted agentic software engineers.
            </h1>
            <p className="text-lg text-white/80 md:text-xl">
              We source, test, and deliver the top 5% — engineers fluent in autonomous agents, tool orchestration, and production reliability.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button asChild size="xl" variant="accent" className="w-full sm:w-auto">
                <Link href="https://calendly.com/james-vecta/30min" target="_blank" rel="noreferrer">
                  Request Candidates
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="ghost"
                className="w-full border border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
              >
                <Link href="https://calendly.com/jakeowen-ex/30min" target="_blank" rel="noreferrer">
                  Book a Hiring Consult
                </Link>
              </Button>
            </div>

            <div className="mt-10 space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">Trusted by teams scaling agentic products</p>
              <div className="flex flex-wrap items-center justify-center gap-6 opacity-80 lg:justify-start">
                {badges.map((badge) => (
                  <div
                    key={badge}
                    className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-medium text-white/80"
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex-1">
            <div className="relative mx-auto h-[420px] w-full max-w-[460px] rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
              <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-[#FF3600]/30 bg-[#FF3600]/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#FF3600]/80">
                Growth trajectory
              </div>

              <div className="absolute inset-0" aria-hidden>
                <svg viewBox="0 0 400 400" className="h-full w-full">
                  <defs>
                    <linearGradient id="growth-line" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF3600" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#FF3600" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M40 280 Q120 220 180 250 T340 120"
                    fill="none"
                    stroke="url(#growth-line)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="animate-[pulse_4s_ease-in-out_infinite]"
                  />

                  <motion.circle
                    cx="40"
                    cy="280"
                    r="8"
                    className="fill-[#FF3600]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                  />
                </svg>
              </div>

              <div className="relative h-full">
                {growthPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      "absolute flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 shadow-lg backdrop-blur",
                      index === growthPoints.length - 1 && "h-20 w-20 border-[#FF3600]/40 bg-[#FF3600]/10",
                    )}
                    style={{ left: point.left, top: point.top }}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: point.delay + 0.3, duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <span className="text-xs uppercase tracking-[0.3em] text-white/60">{index < growthPoints.length - 1 ? "ROI" : "Launch"}</span>
                    <span className="text-lg font-semibold text-white">
                      {index < growthPoints.length - 1 ? `${60 + index * 10}%` : "Live"}
                    </span>
                  </motion.div>
                ))}

                <motion.div
                  className="absolute bottom-12 right-10 rounded-xl border border-[#FF3600]/30 bg-[#FF3600]/10 px-4 py-3 text-left text-sm text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[#FFB199]">New launch</p>
                  <p className="text-base font-semibold">AI workflow deployed in 10 days</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
