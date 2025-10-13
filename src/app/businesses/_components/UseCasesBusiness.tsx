import { LayoutDashboard, Handshake, MessageSquare, Database, Workflow, Sparkles } from "lucide-react";
import { Card } from "../../_components/ui/card";

const cases = [
  {
    icon: MessageSquare,
    title: "Customer support copilots",
    description: "Intelligent agents connected to your CRM and ticketing tools to resolve issues instantly.",
  },
  {
    icon: Handshake,
    title: "Sales & marketing automation",
    description: "Automated lead qualification, personalized outreach, and AI-driven insight generation.",
  },
  {
    icon: Workflow,
    title: "Operations automation",
    description: "Document processing, onboarding assistants, and back-office workflows that run themselves.",
  },
  {
    icon: Database,
    title: "Data & analytics copilots",
    description: "Embedded AI explorers that query internal data and surface insights in seconds.",
  },
  {
    icon: LayoutDashboard,
    title: "Product experience upgrades",
    description: "Smart recommendations, search, and summarization features inside your product.",
  },
  {
    icon: Sparkles,
    title: "Specialized agents",
    description: "Tailored AI processes that adapt to your vertical—from compliance to complex workflows.",
  },
];

export const UseCasesBusiness = () => {
  return (
    <section className="bg-[#120907] py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center space-y-5">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold">Where applied AI delivers business impact</h2>
          <p className="text-xl text-white/70">
            Practical outcomes across revenue, operations, and product experience.
          </p>
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
