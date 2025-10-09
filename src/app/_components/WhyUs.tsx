import { CheckCircle2, X } from "lucide-react";

export const WhyUs = () => {
  return (
    <section className="py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5 animate-fade-in-up">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Not prompt engineers. Problem solvers.
          </h2>
          <p className="text-xl text-white/70">
            We connect you with developers who understand AI systems from the ground up
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          {/* Comparison table */}
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <div className="p-8 rounded-xl border border-white/10 bg-white/[0.04]">
              <h3 className="text-2xl font-semibold mb-6 text-white/60">Freelancer Marketplaces</h3>
              <ul className="space-y-4">
                {[
                  "Generic AI knowledge",
                  "No production experience vetting",
                  "You manage quality control",
                  "Limited AI specialization",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/70">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#EEAC97]/60 bg-[#EEAC97]/20">
                      <X className="w-4 h-4 text-[#EEAC97]" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative overflow-hidden rounded-xl border border-[#FF3600]/60 bg-[#FF3600]/15 p-8 shadow-[0_18px_50px_rgba(255,54,0,0.25)]">
              <div className="absolute top-0 right-0 rounded-bl-xl px-4 py-1 bg-[#FF3600] text-black text-sm font-semibold">
                Best Choice
              </div>
              <h3 className="text-2xl font-semibold mb-6 text-white">Applied AI Network</h3>
              <ul className="space-y-4">
                {[
                  "Production AI specialists",
                  "Pre-vetted technical depth",
                  "Quality guaranteed",
                  "Deep AI infrastructure expertise",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FF3600]/40 bg-black/10">
                      <CheckCircle2 className="w-4 h-4 text-[#FF3600]" />
                    </span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
