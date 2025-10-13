import { CheckCircle2, XCircle } from "lucide-react";

const pros = [
  "Pre-vetted on agentic workflows, retrieval, orchestration, and infra — beyond prompt tinkering.",
  "48-hour turnaround from project brief to first match.",
  "Flexible models: contract, full-time, or dedicated pods that scale with demand.",
  "Guaranteed quality — replace or refund if you’re not satisfied.",
  "Backed by technical recruiters who understand applied AI systems end-to-end.",
];

const cons = [
  "Generic skill screening and surface-level AI knowledge.",
  "Weeks of sourcing with no guarantee of fit.",
  "Inflexible terms, hidden fees, or minimum commitments.",
  "Limited accountability once the contract is signed.",
  "Non-technical gatekeepers translating requirements poorly.",
];

export const WhyHire = () => {
  return (
    <section className="bg-[#0f0504] py-24 text-white">
      <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#FF3600]">
            Why hire through us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold">
            AI engineers, pre-vetted for real work — not just demos.
          </h2>
          <p className="text-lg text-white/70">
            We built a network for teams serious about production AI: seasoned engineers, world-class process, and hiring that runs at the speed of shipping.
          </p>
          <div className="mt-8 grid gap-4">
            {pros.map((item) => (
              <div key={item} className="flex items-start gap-3 text-white/80">
                <CheckCircle2 className="mt-1 h-5 w-5 text-[#FF3600]" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
          <div className="absolute -top-4 left-8 rounded-full bg-[#FF3600] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-black">
            Compare
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Generic Freelancers</h3>
              <div className="space-y-3 text-white/60">
                {cons.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <XCircle className="mt-1 h-5 w-5 text-white/30" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#FF3600]/40 bg-[#FF3600]/10 p-6">
              <h3 className="text-xl font-semibold text-white">Applied AI Network</h3>
              <div className="space-y-3 text-white/80">
                {pros.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-[#FF3600]" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
