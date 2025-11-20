import { Bot, Workflow, Database, Zap } from "lucide-react";
import { Card } from "./ui/card";

const services = [
  {
    icon: Bot,
    title: "Agentic workflow leads",
    description: "Operator-builders who design and maintain multi-step reasoning systems inside your product, not as an outsourced project.",
  },
  {
    icon: Workflow,
    title: "Systems integration talent",
    description: "People who can sit with your team and wire APIs, webhooks, and internal tools because they’ve done it in production before.",
  },
  {
    icon: Database,
    title: "RAG + data specialists",
    description: "Talent fluent in embeddings, Pinecone, Postgres hybrid search, and retrieval guardrails — ready to own your data layer.",
  },
  {
    icon: Zap,
    title: "Automation & infra operators",
    description: "Inngest, Vercel, serverless, background jobs, observability — the operators who keep your AI infra shipping.",
  },
];

export const Services = () => {
  return (
    <section className="py-24 bg-[#120907] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5 animate-fade-in-up">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Talent specializations we vet
          </h2>
          <p className="text-xl text-white/70">
            We’re not a software house — these are the operator-builders our recruitment service embeds inside your org.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className="group/card p-6 border border-white/10 bg-white/[0.04] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#FF3600]/50 hover:shadow-[0_18px_45px_rgba(255,54,0,0.25)] animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg border border-[#FF3600]/40 bg-[#FF3600]/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover/card:-translate-y-1">
                <service.icon className="w-6 h-6 text-[#FF3600]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{service.title}</h3>
              <p className="text-white/70">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
