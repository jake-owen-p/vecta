import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../../_components/ui/button";

const steps = [
  {
    step: "01",
    title: "Align on hiring needs",
    description: "Define the roles, seniority, timezone, and agentic stack your team expects.",
  },
  {
    step: "02",
    title: "Review curated matches",
    description: "See detailed profiles with domain notes, project history, and references.",
  },
  {
    step: "03",
    title: "Interview & trial",
    description: "Run interviews, pair sessions, or paid trials with our coordination support.",
  },
  {
    step: "04",
    title: "Launch with confidence",
    description: "Start quickly with onboarding, payroll, and retention handled by our team.",
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
            Our process quickly places production-ready agentic engineers in front of you, with zero sourcing overhead.
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
              Request Agentic Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
