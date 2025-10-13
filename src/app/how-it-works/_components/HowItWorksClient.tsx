"use client";

import { useMemo, useState } from "react";

import { HowHero } from "./HowHero";
import { FAQs } from "./FAQs";
import { Guarantees } from "./Guarantees";
import { ProcessSteps } from "./ProcessSteps";
import { Audience, businessSteps, engineerSteps, faqs, guarantees } from "./steps";

const HowItWorksClient = () => {
  const [audience, setAudience] = useState<Audience>("business");

  const steps = useMemo(() => (audience === "business" ? businessSteps : engineerSteps), [audience]);
  const guaranteeItems = useMemo(() => guarantees[audience], [audience]);
  const faqItems = useMemo(() => faqs[audience], [audience]);

  return (
    <>
      <HowHero audience={audience} onAudienceChange={setAudience} />
      <ProcessSteps audience={audience} steps={steps} />
      <Guarantees audience={audience} items={guaranteeItems} />
      {/* <FAQs audience={audience} items={faqItems} /> */}
    </>
  );
};

export default HowItWorksClient;
