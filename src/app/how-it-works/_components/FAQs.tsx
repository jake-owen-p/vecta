"use client";

import { motion } from "framer-motion";

import type { Audience, FAQItem } from "./steps";

interface FAQsProps {
  readonly audience: Audience;
  readonly items: FAQItem[];
}

export const FAQs = ({ audience, items }: FAQsProps) => {
  return (
    <section className="bg-[#0f0504] py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto block h-1 w-16 rounded-full bg-[#FF3600]" />
          <h2 className="mt-8 text-3xl font-bold md:text-5xl">
            {audience === "business" ? "FAQs for hiring teams" : "FAQs for engineers"}
          </h2>
          <p className="mt-4 text-lg text-white/70">
            {audience === "business"
              ? "Get clarity on timelines, engagement models, and how we keep delivery on track."
              : "Understand what the vetting experience looks like and how we match you to opportunities."}
          </p>
        </div>

        <div className="mt-12 space-y-6">
          {items.map((faq, index) => (
            <motion.details
              key={faq.question}
              className="group rounded-xl border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-white">
                <span>{faq.question}</span>
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[#FF3600] transition-transform group-open:rotate-45"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M10 4.1665V15.8332" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M4.1665 10H15.8332" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </summary>
              <motion.div className="mt-3 text-base text-white/70 leading-relaxed" initial={{ height: 0 }} animate={{ height: "auto" }}>
                {faq.answer}
              </motion.div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
};
