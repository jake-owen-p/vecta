import { Bolt, Workflow, Database, ShieldCheck } from "lucide-react";
import { Card } from "../../_components/ui/card";

const deliverables = [
  {
    icon: Bolt,
    title: "Curated shortlists",
    description: "Receive a tailored slate of agentic engineers aligned to your stack, timezone, and seniority.",
  },
  {
    icon: Workflow,
    title: "Deep technical vetting",
    description: "Hands-on agentic systems interviews, live builds, and tool-chain evaluations run by staff engineers.",
  },
  {
    icon: Database,
    title: "Trial projects & onboarding",
    description: "Optional paid trials, compliance, and onboarding handled end-to-end so your team keeps momentum.",
  },
  {
    icon: ShieldCheck,
    title: "Replacement support",
    description: "If a hire isn’t the right fit, we partner with you to course-correct and replace quickly.",
  },
];

export const Deliverables = () => {
  return (
    <section className="bg-[#120907] py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center space-y-5">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold">Recruiting deliverables that de-risk hiring</h2>
          <p className="text-xl text-white/70">
            Every search is built around your hiring goals — we obsess over fit, speed, and retention.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {deliverables.map((deliverable, index) => (
            <Card
              key={deliverable.title}
              className="group p-8 border border-white/10 bg-white/[0.03] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#FF3600]/40 hover:shadow-[0_18px_45px_rgba(255,54,0,0.25)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#FF3600]/40 bg-[#FF3600]/10">
                  <deliverable.icon className="h-6 w-6 text-[#FF3600]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{deliverable.title}</h3>
                  <p className="text-white/70">{deliverable.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
