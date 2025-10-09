import { MessageSquare, Users, Rocket } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Tell us what you're building",
    description: "Share your AI project requirements, timeline, and technical needs.",
  },
  {
    icon: Users,
    number: "02",
    title: "Get matched with vetted developers",
    description: "We connect you with pre-screened AI engineers within 48 hours.",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Launch and start shipping",
    description: "Kick off implementation immediately with flexible contract or full-time support.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5 animate-fade-in-up">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Fast, vetted, and reliable
          </h2>
          <p className="text-xl text-white/70">
            From first contact to shipping code in 48 hours
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Step card */}
                <div className="flex flex-col items-center group/card rounded-xl border border-white/10 bg-white/[0.04] p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#FF3600]/40 hover:shadow-[0_18px_45px_rgba(255,54,0,0.25)]">
                  {/* Icon circle */}
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#FF3600]/30 bg-[#FF3600]/10 shadow-lg transition-transform duration-300 group-hover/card:-translate-y-1">
                    <step.icon className="w-7 h-7 text-[#FF3600]" />
                  </div>
                  
                  {/* Number */}
                  <div className="mb-2 text-center text-5xl font-bold text-white/15">{step.number}</div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-3 text-center text-white max-w-[180px]">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-center text-white/70">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
