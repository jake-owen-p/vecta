const items = [
  {
    title: "Strict data protection",
    description: "Every developer signs NDAs and follows enforced data handling policies across engagements.",
  },
  {
    title: "Enterprise-aligned standards",
    description: "Workflows align with GDPR, SOC 2, and ISO controls for security and privacy assurance.",
  },
  {
    title: "Private deployment options",
    description: "Run workloads in your environment with isolated infrastructure and access controls.",
  },
  {
    title: "Continuous monitoring",
    description: "Auditable processes with ongoing reviews ensure compliance as scopes evolve.",
  },
];

export const Compliance = () => {
  return (
    <section className="bg-[#0f0504] py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center space-y-5">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl font-bold">Enterprise-grade practices</h2>
          <p className="text-xl text-white/70">
            Risk-managed delivery with security embedded at every stage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
              <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-white/70">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
