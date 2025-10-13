import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "../../_components/ui/button";

export const BusinessFinalCTA = () => {
  return (
    <section className="relative overflow-hidden bg-[#120907] py-24 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#120907] via-[#20100c] to-[#120907]" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center space-y-10">
          <span className="mx-auto block h-1 w-24 rounded-full bg-[#FF3600]" />
          <h2 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            Hire developers who turn AI ideas into shipped products.
          </h2>
          <p className="text-xl text-white/70 md:text-2xl">
            Onboard pre-vetted talent, scale faster, and stay ahead of the curve.
          </p>
          <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="xl"
              variant="accent"
              className="w-full sm:w-auto cursor-pointer border border-[#FF3600]/40 bg-[#FF3600] px-8 text-black shadow-[0_15px_40px_rgba(255,54,0,0.3)] hover:bg-[#ff4d1a]"
            >
              <Link href="https://calendly.com/jakeowen-ex/30min" target="_blank" rel="noreferrer">
                Hire AI Developers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="ghost"
              className="w-full sm:w-auto cursor-pointer border border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="https://calendly.com/jakeowen-ex/30min" target="_blank" rel="noreferrer">
                Book a Call
              </Link>
            </Button>
          </div>
          <p className="text-sm text-white/60">
            Tell us what you need and start building within 48 hours.
          </p>
        </div>
      </div>
    </section>
  );
};
