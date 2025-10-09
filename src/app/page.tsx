import { FinalCTA } from "./_components/FinalCTA";
import { Footer } from "./_components/Footer";
import { ForDevelopers } from "./_components/ForDevelopers";
import { Hero } from "./_components/Hero";
import { HowItWorks } from "./_components/HowItWorks";
import { SelectionProcess } from "./_components/SelectionProcess";
import { Services } from "./_components/Services";
import { TechStack } from "./_components/TechStack";
import { UseCases } from "./_components/UseCases";
import { WhyUs } from "./_components/WhyUs";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#090200]">
      <Hero />
      <SelectionProcess />
      <Services />
      <WhyUs />
      <UseCases />
      <ForDevelopers />
      <HowItWorks />
      <TechStack />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;