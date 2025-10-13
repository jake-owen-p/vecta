import { Quote } from "lucide-react";
import { Card } from "../../_components/ui/card";

const stories = [
  {
    metric: "-65% ops time",
    title: "Automated document workflows for a fintech leader",
    summary: "Deployed AI-driven data intake that reduced manual processing by 65% within three weeks.",
  },
  {
    metric: "+30% conversions",
    title: "AI assistant integrated directly into CRM",
    summary: "Delivered a guided sales co-pilot with contextual recommendations and automated follow-ups.",
  },
  {
    metric: "2 weeks to launch",
    title: "LLM-based data explorer for internal analytics",
    summary: "Embedded retrieval, summarization, and dashboard surfacing in a single interface across teams.",
  },
];

export const Testimonials = () => {
  return (
    <section className="bg-[#120907] py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center space-y-5">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold">Results, not hype</h2>
          <p className="text-xl text-white/70">
            Tangible ROI from teams that ship AI into production.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stories.map((story, index) => (
            <Card
              key={story.title}
              className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#FF3600]/40 hover:shadow-[0_18px_45px_rgba(255,54,0,0.25)]"
            >
              <Quote className="absolute -top-5 right-6 h-20 w-20 text-[#FF3600]/20" />
              <div className="space-y-4">
                <span className="text-sm uppercase tracking-[0.35em] text-[#FFB199]">{story.metric}</span>
                <h3 className="text-xl font-semibold text-white">{story.title}</h3>
                <p className="text-white/70">{story.summary}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
