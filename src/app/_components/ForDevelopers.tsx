'use client';

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { CircuitBoard, Target, Heart, TrendingUp } from "lucide-react";

const proofPoints = [
  {
    icon: CircuitBoard,
    title: "Technical leadership embedded",
    description:
      "We translate your mission into architecture because we’ve built the same multi-agent and RAG systems ourselves.",
  },
  {
    icon: Target,
    title: "Mission-fit placements",
    description:
      "We place operator-builders in companies they love so they stay close to the purpose and carry momentum into every sprint.",
  },
  {
    icon: Heart,
    title: "Love of the craft",
    description:
      "Technical operators want to solve real world problems; they love what they do and it’s for the love the game — the passion for building.",
  },
  {
    icon: TrendingUp,
    title: "Operator-builders who scale companies",
    description:
      "Operator-builders that will level up your business, add new capabilities, and compound value across product, data, and ops.",
  },
];

export const ForDevelopers = () => {
  const router = useRouter();

  return (
    <section className="py-24 relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#6f2f1f]/20 via-[#120907] to-[#120907]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-block px-4 py-2 rounded-full border border-[#FF3600]/40 bg-[#FF3600]/10 text-sm font-semibold uppercase tracking-[0.25em] text-[#FF3600]">
                Technical recruitment service
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Technical operators for ambitious companies.
              </h2>
              <p className="text-xl text-white/70">
                Operator-builders that will level up your business because we stay close to the product, the customers, and the mission before we ever suggest a name.
              </p>
              <p className="text-white/70">
                We want to place technical co-founders-at-heart in companies they love. We want to understand products &amp; businesses and give them the right talent — not tick the box talent. Operator-builders want to solve real world problems; they love what they do. It&apos;s for the love the game, the passion for building. We aren&apos;t a software house; we&apos;re the technical recruitment bridge that makes sure the right humans join your team.
              </p>

              <div className="rounded-2xl border border-[#FF3600]/30 bg-black/30 p-6 space-y-3 shadow-[0_18px_45px_rgba(255,54,0,0.15)]">
                <h3 className="text-2xl font-semibold text-white">
                  We Match People to Missions, Not Job Specs
                </h3>
                <p className="text-white/80">A job description tells you the tasks.</p>
                <p className="text-white/80">A mission tells you the purpose.</p>
                <p className="text-white/80">
                  We pair humans to missions where they come alive — not to bullet points.
                </p>
                <p className="text-white/80">
                  We take time to understand the product, the business, the mission and match talent who can have real impact — not &quot;good on paper,&quot; but right for the reality.
                </p>
              </div>

              <Button
                variant="accent"
                size="xl"
                onClick={() => router.push("/businesses")}
                className="border border-[#FF3600]/40 bg-[#FF3600] text-black shadow-[0_15px_40px_rgba(255,54,0,0.35)] hover:bg-[#ff4d1a]"
              >
                Share your mission with a technical co-founder
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {proofPoints.map((point, index) => (
                <div
                  key={point.title}
                  className="group/card p-6 rounded-xl border border-white/10 bg-white/[0.04] shadow-lg transition-all duration-300 animate-fade-in-up hover:-translate-y-1 hover:border-[#FF3600]/40 hover:shadow-[0_18px_45px_rgba(255,54,0,0.25)]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg border border-[#FF3600]/40 bg-[#FF3600]/10 flex items-center justify-center mb-3 transition-transform duration-300 group-hover/card:-translate-y-1">
                    <point.icon className="w-5 h-5 text-[#FF3600]" />
                  </div>
                  <h3 className="font-semibold mb-2 text-white">{point.title}</h3>
                  <p className="text-sm text-white/70">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
