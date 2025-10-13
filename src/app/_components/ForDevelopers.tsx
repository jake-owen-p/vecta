'use client';

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Code2, Briefcase, DollarSign, Users } from "lucide-react";

const benefits = [
  {
    icon: Code2,
    title: "Cutting-Edge Work",
    description: "Build real AI products with the latest technologies and frameworks",
  },
  {
    icon: Briefcase,
    title: "Top Companies",
    description: "Work with innovative startups and established enterprises",
  },
  {
    icon: DollarSign,
    title: "Competitive Rates",
    description: "Premium compensation for specialized AI engineering skills",
  },
  {
    icon: Users,
    title: "Zero Hassle",
    description: "We handle matching, contracts, and billing — you focus on building",
  },
];

export const ForDevelopers = () => {
  const router = useRouter();

  return (
    <section className="py-24 relative overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6f2f1f]/20 via-[#120907] to-[#120907]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-block px-4 py-2 rounded-full border border-[#FF3600]/40 bg-[#FF3600]/10 text-sm font-semibold uppercase tracking-[0.25em] text-[#FF3600]">
                For Developers
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Join a network of{" "}
                <span className="text-[#FF3600]">applied AI engineers</span>
              </h2>
              <p className="text-xl text-white/70">
                Work with cutting-edge startups and established companies building real AI products. 
                We connect you with opportunities that match your expertise.
              </p>
              <Button
                variant="accent"
                size="xl"
                onClick={() => router.push("/apply")}
                className="mt-4 border border-[#FF3600]/40 bg-[#FF3600] text-black shadow-[0_15px_40px_rgba(255,54,0,0.35)] hover:bg-[#ff4d1a]"
              >
                Apply to Join
              </Button>
            </div>
            
            {/* Right: Benefits */}
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={benefit.title}
                  className="group/card p-6 rounded-xl border border-white/10 bg-white/[0.04] shadow-lg transition-all duration-300 animate-fade-in-up hover:-translate-y-1 hover:border-[#FF3600]/40 hover:shadow-[0_18px_45px_rgba(255,54,0,0.25)]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg border border-[#FF3600]/40 bg-[#FF3600]/10 flex items-center justify-center mb-3 transition-transform duration-300 group-hover/card:-translate-y-1">
                    <benefit.icon className="w-5 h-5 text-[#FF3600]" />
                  </div>
                  <h3 className="font-semibold mb-2 text-white">{benefit.title}</h3>
                  <p className="text-sm text-white/70">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
