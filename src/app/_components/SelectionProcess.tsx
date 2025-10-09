const steps = [
  {
    id: "STEP 1",
    percentage: 62.3,
    description: "AI-driven background screening & performance analysis",
    layout: {
      desktop: {
        rows: [16, 16, 16, 16, 16, 16, 16],
        containerClass: "w-[560px] min-h-[216px]",
      },
      mobile: {
        rows: [12, 12, 12, 12, 12],
        containerClass: "w-[260px] min-h-[160px]",
      },
    },
  },
  {
    id: "STEP 2",
    percentage: 39.4,
    description: "English proficiency, collaboration, and remote-readiness.",
    layout: {
      desktop: {
        rows: [10, 10, 10, 10, 10],
        containerClass: "w-[560px] min-h-[180px]",
      },
      mobile: {
        rows: [10, 10, 10, 10],
        containerClass: "w-[220px] min-h-[150px]",
      },
    },
  },
  {
    id: "STEP 3",
    percentage: 11.2,
    description:
      "Human-led interviews, problem-solving and domain-specific knowledge validation.",
    layout: {
      desktop: {
        rows: [6, 6, 6, 6],
        containerClass: "w-[560px] min-h-[150px]",
      },
      mobile: {
        rows: [8, 8, 8],
        containerClass: "w-[200px] min-h-[120px]",
      },
    },
  },
  {
    id: "STEP 4",
    percentage: 6.2,
    description: "Timezone alignment, working style, and project compatibility check.",
    layout: {
      desktop: {
        rows: [2, 2, 2],
        containerClass: "w-[560px] min-h-[140px]",
      },
      mobile: {
        rows: [6, 6, 6],
        containerClass: "w-[180px] min-h-[110px]",
      },
    },
  },
];

const DotRows = ({ rows }: { rows: number[] }) => (
  <div className="flex flex-col items-end gap-2 justify-center h-full">
    {rows.map((count, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex flex-row-reverse gap-2">
        {Array.from({ length: count }).map((_, dotIndex) => (
          <span
            key={`dot-${rowIndex}-${dotIndex}`}
            className="h-3 w-3 rounded-[3px] bg-[#FB5D33]"
          />
        ))}
      </div>
    ))}
  </div>
);

const DotGrid = ({
  layout,
}: {
  layout: {
    desktop: { rows: number[]; containerClass: string };
    mobile: { rows: number[]; containerClass: string };
  };
}) => {
  return (
    <div className="w-full md:flex md:items-center md:justify-end">
      <div className="hidden md:flex md:w-full md:items-center md:justify-end">
        <div
          className={`rounded-xl px-6 py-5 md:px-10 flex items-center justify-end ${layout.desktop.containerClass}`}
        >
          <DotRows rows={layout.desktop.rows} />
        </div>
      </div>
      <div className="md:hidden flex justify-end items-center w-full">
        <div
          className={`rounded-xl bg-[#f8cbbf]/30 border border-[#f8cbbf]/60 px-5 py-4 flex items-center justify-end ${layout.mobile.containerClass}`}
        >
          <DotRows rows={layout.mobile.rows} />
        </div>
      </div>
    </div>
  );
};

export const SelectionProcess = () => {
  return (
    <section className="py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-14">
            We only work with the best
          </h2>

          <div className="space-y-16 md:-ml-8">
            {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col gap-6 md:grid md:grid-cols-[560px_160px_360px] md:items-center md:gap-12"
            >
                <DotGrid layout={step.layout} />

                <div className="md:w-[160px] text-right">
                  <span className="text-5xl md:text-6xl font-semibold text-white">
                    {step.percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="md:pl-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#ff3700e4] font-bold mb-1">
                    {step.id}
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed text-white">
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


