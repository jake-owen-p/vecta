import { Footer } from "../_components/Footer";
import { SiteToolbar } from "../_components/SiteToolbar";
import { SelectionProcess } from "../_components/SelectionProcess";
import { TechStack } from "../_components/TechStack";
import { BusinessHero } from "./_components/BusinessHero";
import { Compliance } from "./_components/Compliance";
import { Deliverables } from "./_components/Deliverables";
import { SpeedFlex } from "./_components/SpeedFlex";
import { Testimonials } from "./_components/Testimonials";
import { UseCasesBusiness } from "./_components/UseCasesBusiness";
import { WhyHire } from "./_components/WhyHire";
import { BusinessFinalCTA } from "./_components/BusinessFinalCTA";

export default function BusinessesPage() {
  return (
    <div className="min-h-screen bg-[#090200] text-white">
      <SiteToolbar />
      <BusinessHero />
      <Deliverables />
      <WhyHire />
      <UseCasesBusiness />
      <section className="bg-[#0f0504] py-16">
        <div className="container mx-auto px-4 text-left md:text-center">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="mt-8 text-4xl font-bold md:text-5xl">The vetting process</h2>
          <p className="mt-4 text-xl text-white/70">
            Only the top 5% make the cut — every engineer is tested on real, production-level AI systems.
          </p>
        </div>
      </section>
      <SelectionProcess />
      <SpeedFlex />
      <section className="bg-[#0f0504] py-24">
        <div className="container mx-auto px-4 text-center">
          <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
          <h2 className="mt-8 text-4xl font-bold md:text-5xl">Expertise you can leverage</h2>
          <p className="mt-4 text-xl text-white/70">
            Developers trained and tested across modern applied AI stacks you already trust.
          </p>
        </div>
      </section>
      <TechStack />
      <Testimonials />
      <Compliance />
      <BusinessFinalCTA />
      <Footer />
    </div>
  );
}
