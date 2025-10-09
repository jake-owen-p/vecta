import { Bot, Workflow, Database, Zap } from "lucide-react";
import { Card } from "./ui/card";

const services = [
  {
    icon: Bot,
    title: "Agentic Workflow Implementation",
    description: "Orchestrate multi-step reasoning and tools. Build autonomous agents that think, plan, and execute complex tasks.",
  },
  {
    icon: Workflow,
    title: "Integration with Real Systems",
    description: "Connect APIs, webhooks, databases, and apps. Seamless integration with your existing tech stack.",
  },
  {
    icon: Database,
    title: "Retrieval-Augmented Generation (RAG)",
    description: "Embeddings, Pinecone, Postgres hybrid search. Build AI that knows your data inside and out.",
  },
  {
    icon: Zap,
    title: "Automation & Infrastructure",
    description: "Inngest, Vercel, serverless, background jobs. Production-ready AI infrastructure that scales.",
  },
];

export const Services = () => {
  return (
    <section className="py-24 bg-[#120907] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5 animate-fade-in-up">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            From AI idea to working agent
          </h2>
          <p className="text-xl text-white/70">
            Our developers specialize in production-grade AI implementation
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
