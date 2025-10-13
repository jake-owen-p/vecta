"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "../../_components/ui/card";
import type { Audience, ProcessStep } from "./steps";

interface ProcessStepsProps {
  readonly audience: Audience;
  readonly steps: ProcessStep[];
}

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const ProcessSteps = ({ audience, steps }: ProcessStepsProps) => {
  return (
    <section className="bg-[#0f0504] py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="mt-8 text-3xl font-bold md:text-5xl">
            {audience === "business" ? "From intake to onboarding in days" : "A transparent six-step vetting journey"}
          </h2>
          <p className="mt-4 text-lg text-white/70">
            {audience === "business"
              ? "Every step is designed to surface the right builders fast while derisking delivery."
              : "We evaluate real-world execution, collaboration, and ability to ship production AI systems."}
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeVariants}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="h-full border-white/10 bg-white/[0.04] backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white/60">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base font-bold text-white/80">
                      {index + 1}
                    </span>
                    {step.badge ? (
                      <span className="inline-flex items-center rounded-full border border-[#FF3600]/40 bg-[#FF3600]/10 px-3 py-1 text-xs uppercase tracking-wide text-[#FF3600]">
                        {step.badge}
                      </span>
                    ) : null}
                    {step.duration ? (
                      <span className="ml-auto text-xs uppercase tracking-wide text-white/50">{step.duration}</span>
                    ) : null}
                  </div>
                  <CardTitle className="text-2xl text-white">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-base text-white/70">{step.description}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
