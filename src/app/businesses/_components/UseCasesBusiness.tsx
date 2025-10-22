import { LayoutDashboard, Handshake, MessageSquare, Database, Workflow, Sparkles } from "lucide-react";
import { Card } from "../../_components/ui/card";

const cases = [
  {
    icon: MessageSquare,
    title: "Founding agentic engineer",
    description: "Your first agentic specialist to architect the stack, ship v1, and mentor future hires.",
  },
  {
    icon: Handshake,
    title: "Scale your agent squad",
    description: "Add senior engineers to accelerate workflows, tool integrations, and multi-agent reliability.",
  },
  {
    icon: Workflow,
    title: "Augment internal AI teams",
    description: "Embed seasoned contractors who pair with your ML, product, and platform teams day one.",
  },
  {
    icon: Database,
    title: "Modernize from LLM chat to agents",
    description: "Up-level chat prototypes into agentic systems with memory, retrieval, and tool orchestration.",
  },
  {
    icon: LayoutDashboard,
    title: "Agentic integrations & tooling",
    description: "Engineers who wire up CRMs, data lakes, and internal APIs to autonomous workflows.",
  },
  {
    icon: Sparkles,
    title: "Contract-to-hire pilots",
    description: "Trial talent on scoped sprints before converting to full-time with confidence.",
  },
];

export const UseCasesBusiness = () => {
  return (
    <section className="bg-[#120907] py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center space-y-5">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold">Hiring moves businesses make with us</h2>
          <p className="text-xl text-white/70">Scenarios where agentic engineers unlock speed, reliability, and scale.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((item) => (
            <Card
              key={item.title}
              className="group/card p-6 border border-white/10 bg-white/[0.03] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#FF3600]/40 hover:shadow-[0_18px_45px_rgba(255,54,0,0.25)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#FF3600]/40 bg-[#FF3600]/10">
                <item.icon className="h-6 w-6 text-[#FF3600]" />
              </div>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-white/70">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
