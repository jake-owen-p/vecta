import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../../_components/ui/button";

const steps = [
  {
    step: "01",
    title: "Share your goals",
    description: "Outline outcomes, teams involved, and the systems we’ll connect.",
  },
  {
    step: "02",
    title: "Match in 48 hours",
    description: "Review profiles of vetted engineers aligned to your stack and industry.",
  },
  {
    step: "03",
    title: "Select and onboard",
    description: "Choose contract, full-time, or dedicated pods with instant start dates.",
  },
  {
    step: "04",
    title: "Start shipping",
    description: "Kick off delivery without payroll, sourcing, or vendor management overhead.",
  },
];

export const SpeedFlex = () => {
  return (
    <section className="bg-[#120907] py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center space-y-5">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold">Hire in days, not months</h2>
          <p className="text-xl text-white/70">
            Our process gets production-ready engineers into your roadmap fast.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left">
              <span className="text-4xl font-semibold text-white/20">{item.step}</span>
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-white/70">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="xl" variant="accent">
            <Link href="https://calendly.com/jakeowen-ex/30min" target="_blank" rel="noreferrer">
              Start Hiring Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
