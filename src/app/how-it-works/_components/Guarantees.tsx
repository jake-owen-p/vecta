"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "../../_components/ui/card";
import type { Audience, GuaranteeItem } from "./steps";

interface GuaranteesProps {
  readonly audience: Audience;
  readonly items: GuaranteeItem[];
}

export const Guarantees = ({ audience, items }: GuaranteesProps) => {
  return (
    <section className="bg-[#120907] py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto block h-1 w-16 rounded-full bg-[#FF3600]" />
          <h2 className="mt-8 text-3xl font-bold md:text-5xl">
            {audience === "business" ? "Why teams choose Vecta" : "How we support our engineers"}
          </h2>
          <p className="mt-4 text-lg text-white/70">
            {audience === "business"
              ? "Service-level guarantees that derisk hiring and keep your roadmap on track."
              : "We invest in your success with fair, transparent engagements and global support."}
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              className="h-full"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
            >
              <Card className="h-full border-white/10 bg-white/[0.05] backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#FF3600]">
                    {item.highlight}
                  </div>
                  <CardTitle className="text-2xl text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-base text-white/70">{item.description}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
