import { FinalCTA } from "../_components/FinalCTA";
import { Footer } from "../_components/Footer";
import { SiteToolbar } from "../_components/SiteToolbar";

export const metadata = {
  title: "FAQ | Vecta",
  description: "Common questions from developers and businesses working with Vecta.",
};

const developerFaq = [
  {
    question: "What do you look for in applicants?",
    answer:
      "You bring shipped AI systems, clear architectural reasoning, and evaluation discipline. We review production work, but we also love side projects - both lets us ensure you can embed with teams immediately.",
  },
  {
    question: "What does the vetting process involve?",
    answer:
      "You walk through prior deployments, share artifacts (design docs, evaluation runs), and complete a scenario-based system design interview focused on agentic workflows and RAG.",
  },
  {
    question: "How do matches work and how fast can I start?",
    answer:
      "Once you’re approved, we surface engagements aligned with your stack and timezone. After that it's up to you to choose the best fit for you.",
  },
  {
    question: "What stacks are most in demand?",
    answer:
      "TypeScript or Python paired with orchestration tools (LangChain, LlamaIndex, Inngest, Temporal), modern hosting (Vercel, AWS, Cloudflare), and observability know-how are our most requested combinations.",
  },
  {
    question: "Do I need experience with LangChain or LlamaIndex?",
    answer:
      "Direct experience helps, but we evaluate your ability to design orchestration layers in general. If you’ve built custom planners, tools, or agent loops, you’re already in scope.",
  },
  {
    question: "How are rates set and payments handled?",
    answer:
      "We collaborate on a target hourly or weekly rate based on your background and typical engagement scope. Payments are handled directly by the employer since Vecta operates as a recruitment agency.",
  },
  {
    question: "What timezone overlap do you expect?",
    answer:
      "Most teams request at least 3–4 hours of shared overlap. We flag opportunities that fit your availability and won’t push matches that conflict with your schedule.",
  },
  {
    question: "How should I present past work and evaluation artifacts?",
    answer:
      "Share architecture diagrams, repo snippets, eval dashboards, and deployment notes. The more concrete, the better—we want to understand how you drove reliability after launch.",
  },
  {
    question: "Can I work part-time or across multiple clients?",
    answer:
      "Yes. Many engineers split time between engagements. We outline expectations with each client so bandwidth stays transparent and commitments remain sustainable.",
  },
  {
    question: "What support do you provide during engagements?",
    answer:
      "You get access to our partner success team, shared playbooks, and evaluation tooling. We check in regularly to unblock decisions and keep delivery on track.",
  },
];

const businessFaq = [
  {
    question: "How quickly can we get matched and start?",
    answer:
      "After a scoping call, we typically introduce vetted engineers within 48 hours. Teams often begin working with their match in under a week.",
  },
  {
    question: "How do you vet engineers and ensure quality?",
    answer:
      "Every engineer has shipped production AI systems. We review code samples, architecture decisions, evaluation artifacts, and run scenario interviews focused on your use cases.",
  },
//   {
//     question: "Can we trial an engineer before committing long term?",
//     answer:
//       "Yes. Most engagements begin with a short paid trial or milestone. You expand the scope only once you’re confident in the fit.",
//   },
  {
    question: "Who owns IP and how is confidentiality handled?",
    answer:
      "You retain full ownership of IP. NDAs and MSAs ensure your code, data, and processes remain confidential. Engineers work inside your repos and tooling under your controls.",
  },
//   {
//     question: "What are your pricing and billing options?",
//     answer:
//       "We support hourly and project-based structures. Billing runs through Vecta on a biweekly schedule with transparent timesheets and deliverable reports.",
//   },
  {
    question: "How do you handle security and compliance?",
    answer:
      "We align with your access policies, SSO, and audit requirements. Engineers follow your security protocols, and we can provide documentation for SOC 2, HIPAA, or other frameworks.",
  },
  {
    question: "What timezone coverage can we expect?",
    answer:
      "We match you with engineers who overlap at least a half day with your core team. If you need extended coverage, we can staff distributed pairs.",
  },
  {
    question: "What if the initial match isn’t the right fit?",
    answer:
      "We monitor every engagement. If something feels off, we intervene quickly and can provide an alternate engineer without restarting the entire process.",
  },
  {
    question: "Do you support maintenance after delivery?",
    answer:
      "Yes. We can keep engineers on retainer, transition them into long-term roles, or spin up a maintenance pod to manage updates and monitoring.",
  },
  {
    question: "How do you ensure visibility and ongoing evaluation?",
    answer:
      "Engineers ship with metrics: evaluation dashboards, alerting, and logging. We encourage weekly reviews so you see performance trends and can iterate with real data.",
  },
];

function FaqList({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <div className="divide-y divide-white/10">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-medium text-white transition">
            <span>{item.question}</span>
            <span className="ml-4 text-2xl leading-none text-[#FF3600] transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="pb-6 text-base text-white/70">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#090200] text-white">
      <SiteToolbar />
      <main>
        <section className="bg-[#090200] py-24">
          <div className="container mx-auto px-4">
            <span className="block h-1 w-20 rounded-full bg-[#FF3600]" />
            <h1 className="mt-8 max-w-3xl text-4xl font-bold md:text-5xl">Frequently Asked Questions</h1>
            <p className="mt-6 max-w-3xl text-lg text-white/70">
              Whether you build applied AI systems or you hire them, these are the answers teams ask most before working with Vecta. Need something else? Reach out and we’ll jump on a call.
            </p>
            <nav className="mt-10 flex flex-wrap gap-3 text-sm font-semibold text-white/70">
              <a
                href="#developers"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-[#FF3600] hover:text-white"
              >
                For Developers
              </a>
              <a
                href="#businesses"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-[#FF3600] hover:text-white"
              >
                For Businesses
              </a>
            </nav>
          </div>
        </section>

        <section id="developers" className="bg-[#0f0504] py-24">
          <div className="container mx-auto px-4">
            <span className="block h-1 w-16 rounded-full bg-[#FF3600]" />
            <h2 className="mt-8 text-3xl font-semibold md:text-4xl">For Developers</h2>
            <p className="mt-4 max-w-2xl text-white/70">
              The expectations, processes, and support you can count on once you join the network.
            </p>
            <div className="mt-10 rounded-2xl border border-white/5 bg-[#120606] p-6 shadow-lg">
              <FaqList items={developerFaq} />
            </div>
          </div>
        </section>

        <section id="businesses" className="bg-[#090200] py-24">
          <div className="container mx-auto px-4">
            <span className="block h-1 w-16 rounded-full bg-[#FF3600]" />
            <h2 className="mt-8 text-3xl font-semibold md:text-4xl">For Businesses</h2>
            <p className="mt-4 max-w-2xl text-white/70">
              How we scope, staff, and deliver applied AI talent that fits your team’s standards.
            </p>
            <div className="mt-10 rounded-2xl border border-white/5 bg-[#0f0504] p-6 shadow-lg">
              <FaqList items={businessFaq} />
            </div>
          </div>
        </section>
      </main>
      <FinalCTA />
      <Footer />
    </div>
  );
}

