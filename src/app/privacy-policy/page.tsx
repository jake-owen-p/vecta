import { FinalCTA } from "../_components/FinalCTA";
import { Footer } from "../_components/Footer";
import { SiteToolbar } from "../_components/SiteToolbar";

export const metadata = {
  title: "Privacy Policy | Vecta",
  description: "How Vecta collects, uses, shares, and protects personal data for candidates and clients.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#090200] text-white">
      <SiteToolbar />
      <main>
        <section className="bg-[#090200] py-24">
          <div className="container mx-auto px-4">
            <span className="block h-1 w-20 rounded-full bg-[#FF3600]" />
            <h1 className="mt-8 max-w-3xl text-4xl font-bold md:text-5xl">Privacy Policy</h1>
            <p className="mt-6 max-w-3xl text-lg text-white/70">
              This Privacy Policy explains how Vecta ("we", "us") collects, uses, shares, and safeguards
              personal data for candidates and business users of our platform and services.
            </p>
            <p className="mt-3 max-w-3xl text-sm text-white/50">Last updated: October 13, 2025</p>
          </div>
        </section>

        <section className="bg-[#0f0504] py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl border border-white/5 bg-[#120606] p-6 md:p-8 shadow-lg">
              <h2 className="text-2xl font-semibold">Who We Are</h2>
              <p className="mt-3 text-white/70">
                Vecta is an AI recruitment agency focused on applied AI and application development.
                We vet engineering candidates and introduce them to employers seeking talent.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">Scope</h2>
              <p className="mt-3 text-white/70">
                This Policy applies to personal data processed when you browse our website, apply as a
                candidate, or engage with us as a business. It does not cover data processing performed by
                employers once you work directly with them under their own policies and agreements.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">Information We Collect</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
                <li>
                  Candidate information: contact details, resume/CV, portfolio links, work history,
                  skills, availability, rate expectations, interview notes, and fit assessments.
                </li>
                <li>
                  Business contact information: company details, role requirements, hiring preferences,
                  and communications.
                </li>
                <li>
                  Usage and device data: logs, analytics, and cookies that help us operate and improve the
                  site (see Cookies below).
                </li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold">Cookies and Analytics</h3>
              <p className="mt-3 text-white/70">
                We may use cookies and similar technologies to remember preferences, measure traffic, and
                improve the experience. You can control cookies through your browser settings.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">How We Use Personal Data</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
                <li>Evaluate candidates and determine fit for specific roles and engagements.</li>
                <li>Introduce vetted candidates to employers and coordinate interviews and feedback.</li>
                <li>Operate, maintain, and improve our site, services, and candidate experience.</li>
                <li>Communicate about opportunities, updates, and administrative matters.</li>
                <li>Comply with legal obligations and enforce our terms and policies.</li>
                <li>Ensure platform security, fraud prevention, and abuse detection.</li>
              </ul>

              <h2 className="mt-10 text-2xl font-semibold">Legal Bases (EEA/UK)</h2>
              <p className="mt-3 text-white/70">
                Where applicable, we rely on one or more legal bases: consent, contract necessity,
                legitimate interests (e.g., efficient recruiting and platform operation), and legal
                obligations.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">How We Share Information</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-white/70">
                <li>
                  With employers/clients to facilitate recruiting conversations after we assess a potential fit.
                </li>
                <li>With service providers that help us host, store, analyze, and communicate.</li>
                <li>For legal reasons, to protect rights, or in a business transfer (e.g., merger).</li>
              </ul>
              <p className="mt-3 text-white/70">
                Payments for engagements are handled directly between employers and talent; Vecta acts as a
                recruitment agency and is not a party to employment or contractor agreements.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">International Data Transfers</h2>
              <p className="mt-3 text-white/70">
                If we transfer personal data across borders, we use appropriate safeguards consistent with
                applicable laws (e.g., standard contractual clauses where relevant).
              </p>

              <h2 className="mt-10 text-2xl font-semibold">Data Retention</h2>
              <p className="mt-3 text-white/70">
                We keep personal data for as long as needed to provide services and for legitimate business
                or legal purposes. We may retain basic records to prevent duplicate accounts and maintain
                accurate recruiting history.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">Security</h2>
              <p className="mt-3 text-white/70">
                We implement reasonable technical and organizational measures to protect personal data.
                No system is perfectly secure; please use caution when sharing sensitive information.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">Your Rights</h2>
              <p className="mt-3 text-white/70">
                Depending on your location, you may have rights to access, correct, delete, or restrict
                processing of your personal data; to data portability; and to object to certain processing.
                You can also withdraw consent where consent is the legal basis.
              </p>
              <p className="mt-3 text-white/70">
                To exercise these rights, contact us using the details below. We may need to verify your
                identity before fulfilling a request.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">Children's Privacy</h2>
              <p className="mt-3 text-white/70">
                Our services are not directed to children under the age of 16, and we do not knowingly
                collect personal data from children.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">Changes to This Policy</h2>
              <p className="mt-3 text-white/70">
                We may update this Policy from time to time. Material changes will be indicated on this page
                with an updated date.
              </p>

              <h2 className="mt-10 text-2xl font-semibold">Contact</h2>
              <p className="mt-3 text-white/70">
                Questions about this Policy or our data practices? Reach out at
                <span className="ml-1 underline">privacy@vecta.dev</span>.
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


