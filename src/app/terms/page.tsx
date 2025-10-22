import { FinalCTA } from "../_components/FinalCTA";
import { Footer } from "../_components/Footer";
import { SiteToolbar } from "../_components/SiteToolbar";

export const metadata = {
  title: "Terms of Service | Vecta",
  description:
    "The terms governing access to and use of Vecta's website and recruitment services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090200] text-white">
      <SiteToolbar />
      <main>
        <section className="bg-[#090200] py-24">
          <div className="container mx-auto px-4">
            <span className="block h-1 w-20 rounded-full bg-[#FF3600]" />
            <h1 className="mt-8 max-w-3xl text-4xl font-bold md:text-5xl">Terms of Service</h1>
            <p className="mt-6 max-w-3xl text-lg text-white/70">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of Vecta&apos;s website and
              recruitment services. By accessing or using our site, you agree to be bound by these Terms.
            </p>
            <p className="mt-3 max-w-3xl text-sm text-white/50">Last updated: October 13, 2025</p>
          </div>
        </section>

        <section className="bg-[#0f0504] py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl border border-white/5 bg-[#120606] p-6 md:p-8 shadow-lg">
              <h2 className="text-2xl font-semibold">1. Who We Are</h2>
              <p className="mt-3 text-white/70">
                Vecta is an AI recruitment agency focused on agentic AI and application development. We vet
                candidates and introduce them to employers seeking talent.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">2. Eligibility</h2>
              <p className="mt-3 text-white/70">
                You must be able to form a binding contract in your jurisdiction to use our site and
                services. If you are using our services on behalf of a company, you represent that you have
                authority to bind that company.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">3. Your Account and Information</h2>
              <p className="mt-3 text-white/70">
                You agree to provide accurate, current information and keep it updated. You are responsible
                for maintaining the confidentiality of your account and for all activities under it.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">4. Use of Services</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
                <li>Do not misuse the site or attempt to disrupt it.</li>
                <li>Do not post or transmit unlawful, infringing, or harmful content.</li>
                <li>Respect confidentiality when viewing candidate or employer information.</li>
              </ul>

              <h2 className="mt-10 text-2xl font-semibold">5. Recruiting Relationship</h2>
              <p className="mt-3 text-white/70">
                We vet and introduce candidates to employers. Any engagement terms, including payment,
                are handled directly between employer and talent. Vecta is not a party to employment or
                contractor agreements unless explicitly stated in a separate written contract.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">6. Intellectual Property</h2>
              <p className="mt-3 text-white/70">
                The site and its content are owned by Vecta or its licensors and are protected by
                intellectual property laws. You may not copy, modify, or distribute content except as
                permitted by these Terms.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">7. Confidentiality</h2>
              <p className="mt-3 text-white/70">
                Information shared during recruiting, including candidate details and employer needs,
                is confidential and may only be used for evaluating potential engagements.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">8. Disclaimers</h2>
              <p className="mt-3 text-white/70">
                The services are provided &quot;as is&quot; without warranties of any kind. We do not guarantee that a
                particular candidate or role will be available or suitable for your needs.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">9. Limitation of Liability</h2>
              <p className="mt-3 text-white/70">
                To the maximum extent permitted by law, Vecta is not liable for indirect, incidental,
                special, consequential, or punitive damages, or loss of profits, revenues, or data.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">10. Indemnification</h2>
              <p className="mt-3 text-white/70">
                You agree to defend and indemnify Vecta against claims arising from your use of the site or
                services, your content, or your violation of these Terms.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">11. Termination</h2>
              <p className="mt-3 text-white/70">
                We may suspend or terminate access if we believe you violated these Terms. Upon termination,
                certain sections survive, including confidentiality, IP, and limitation of liability.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">12. Governing Law</h2>
              <p className="mt-3 text-white/70">
                These Terms are governed by the laws of the jurisdiction where Vecta is established, without
                regard to conflict-of-law principles.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">13. Changes to Terms</h2>
              <p className="mt-3 text-white/70">
                We may update these Terms from time to time. Continued use of the site after changes
                constitutes acceptance of the updated Terms.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">14. Contact</h2>
              <p className="mt-3 text-white/70">
                Questions about these Terms? Contact us at <span className="underline">legal@vecta.dev</span>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <FinalCTA />
      <Footer />
    </div>
  );
}


