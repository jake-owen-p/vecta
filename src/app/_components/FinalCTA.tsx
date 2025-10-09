import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export const FinalCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#120907] via-[#2a140f] to-[#120907]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <span className="mx-auto block h-1 w-24 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Let's build your applied AI system
          </h2>

          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
            Bring your AI ideas to life — with developers who deliver.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="accent"
              size="xl"
              className="group border border-[#FF3600]/40 bg-[#FF3600] px-8 text-black shadow-[0_15px_40px_rgba(255,54,0,0.3)] hover:bg-[#ff4d1a]"
            >
              Hire Developers
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="ghost"
              size="xl"
              className="border border-[#EEAC97]/40 bg-[#EEAC97]/10 text-white hover:bg-[#EEAC97]/20"
            >
              Join as Talent
            </Button>
          </div>
          
          <p className="text-sm text-white/60 pt-4">
            Start your project or apply to join our network today
          </p>
        </div>
      </div>
    </section>
  );
};
