import { BusinessFinalCTA } from "../businesses/_components/BusinessFinalCTA";
import { FinalCTA } from "../_components/FinalCTA";
import { Footer } from "../_components/Footer";
import { SiteToolbar } from "../_components/SiteToolbar";
import { TechStack } from "../_components/TechStack";
import HowItWorksClient from "./_components/HowItWorksClient";

export const metadata = {
  title: "How It Works | Vecta",
  description: "See how Vecta vets AI engineers and matches them to your needs in days.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#090200] text-white">
      <SiteToolbar />
      <HowItWorksClient />
      <section className="bg-[#0f0504]">
        <TechStack />
      </section>
      <div className="bg-[#090200]">
        <BusinessFinalCTA />
        <FinalCTA />
      </div>
      <Footer />
    </div>
  );
}
