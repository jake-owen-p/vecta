import { MessageSquare, FileSearch, Workflow, ShoppingCart, BarChart3, Calendar } from "lucide-react";
import { Card } from "./ui/card";

const useCases = [
  {
    icon: MessageSquare,
    title: "AI customer support",
    description: "Hire builders who have wired LLM agents into CRMs, ticketing tools, and trust layers inside real support orgs.",
  },
  {
    icon: FileSearch,
    title: "Research assistants",
    description: "Operator-builders who know how to parse PDFs, APIs, and proprietary datasets to ship reliable synthesis workflows.",
  },
  {
    icon: Workflow,
    title: "Automated workflows",
    description: "People who have automated onboarding, underwriting, and operations pipelines — and can replicate it with your team.",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce intelligence",
    description: "Talent experienced with multi-agent merchandising, inventory automation, and shopper personalization.",
  },
  {
    icon: BarChart3,
    title: "Analytics & decisioning",
    description: "Operator-builders who craft feedback loops, scoring models, and monitoring so your stakeholders can trust every action.",
  },
  {
    icon: Calendar,
    title: "Smart scheduling",
    description: "People who bring context-aware calendar, routing, and coordination systems into production environments.",
  },
];

export const UseCases = () => {
  return (
    <section className="py-24 bg-[#120907] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5 animate-fade-in-up">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Teams hire us when they need...
          </h2>
          <p className="text-xl text-white/70">
            Real examples of the missions our technical recruitment service has staffed — embedded in your roadmap, not outsourced elsewhere.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card 
              key={useCase.title}
              className="group/card p-6 border border-white/10 bg-white/[0.04] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#FF3600]/50 hover:shadow-[0_18px_45px_rgba(255,54,0,0.25)] animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg border border-[#FF3600]/40 bg-[#FF3600]/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover/card:-translate-y-1">
                <useCase.icon className="w-6 h-6 text-[#FF3600]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{useCase.title}</h3>
              <p className="text-white/70">{useCase.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
