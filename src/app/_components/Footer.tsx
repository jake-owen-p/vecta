import { Code2 } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-white/10 bg-[#0d0503] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FF3600]/40 bg-[#FF3600]/10">
                <Code2 className="h-5 w-5 text-[#FF3600]" />
              </div>
              <span className="text-xl font-bold text-white">Applied AI Network</span>
            </div>
            <p className="text-white/70 max-w-md">
              Connecting companies with vetted AI developers who build production-ready intelligent systems.
            </p>
          </div>
          
          {/* For Companies */}
          <div>
            <h3 className="font-semibold mb-4 text-white">For Companies</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#" className="transition-colors hover:text-[#FF3600]">Hire Developers</a></li>
              <li><a href="#" className="transition-colors hover:text-[#FF3600]">How It Works</a></li>
            </ul>
          </div>
          
          {/* For Developers */}
          <div>
            <h3 className="font-semibold mb-4 text-white">For Developers</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/apply" className="transition-colors hover:text-[#FF3600]">Apply to Join</a></li>
              <li><a href="/requirements" className="transition-colors hover:text-[#FF3600]">Requirements</a></li>
              <li><a href="/faq" className="transition-colors hover:text-[#FF3600]">FAQ</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/70">
          <p>© {currentYear} Applied AI Network. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/privacy-policy" className="transition-colors hover:text-[#FF3600]">Privacy Policy</a>
            <a href="/terms" className="transition-colors hover:text-[#FF3600]">Terms of Service</a>
            <a href="https://calendly.com/james-vecta/30min" className="transition-colors hover:text-[#FF3600]">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
