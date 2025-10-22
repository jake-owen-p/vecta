import { Card } from "./ui/card";

const technologies = [
  { name: "OpenAI", category: "LLM Providers" },
  { name: "Anthropic", category: "LLM Providers" },
  { name: "Google Gemini", category: "LLM Providers" },
  { name: "LangChain", category: "Frameworks" },
  { name: "LlamaIndex", category: "Frameworks" },
  { name: "Vercel AI SDK", category: "Frameworks" },
  { name: "Pinecone", category: "Vector DBs" },
  { name: "Postgres", category: "Databases" },
  { name: "Redis", category: "Caching" },
  { name: "Next.js", category: "Frontend" },
  { name: "Inngest", category: "Workflows" },
  { name: "Temporal", category: "Workflows" },
];

export const TechStack = () => {
  return (
    <section className="py-24 bg-[#120907] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5 animate-fade-in-up">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold text-white">Technical stack & capabilities</h2>
          <p className="text-xl text-white/70">Our engineers ship reliable agentic systems across the modern AI ecosystem.</p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {technologies.map((tech, index) => (
              <Card 
                key={tech.name}
                className="group/card p-6 text-center border border-white/10 bg-white/[0.04] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#FF3600]/50 hover:shadow-[0_18px_45px_rgba(255,54,0,0.25)] animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-lg font-semibold mb-1 text-white transition-colors group-hover:text-[#FF3600]">
                  {tech.name}
                </div>
                <div className="text-xs text-white/60">
                  {tech.category}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
