import Link from "next/link";

import { FinalCTA } from "../_components/FinalCTA";
import { Footer } from "../_components/Footer";
import { SiteToolbar } from "../_components/SiteToolbar";

export const metadata = {
  title: "Developer Requirements | Vecta",
  description: "Understand the standards you meet to join Vecta's network of agentic AI engineers.",
};

const sections = [
  {
    title: "Agentic Workflow Experience",
    description:
      "You build systems, not prompts. You architect multi-step reasoning flows that connect tools, APIs, and models into cohesive loops, defining plan-execute-reflect cycles that stay within guardrails.",
    bullets: [
      "Designing autonomous or semi-autonomous agents with LangChain, LlamaIndex, or custom orchestration layers.",
      "Managing tool usage, context windows, and control flows that keep agents grounded.",
      "Coordinating multiple models or branching decisions to deliver predictable outcomes.",
    ],
  },
  {
    title: "System Design for AI Products",
    description:
      "You design for reliability, not demos. You deliver production-ready architectures that scale safely, stay maintainable, and are fully observable.",
    bullets: [
      "Shaping data pipelines that retrieve, cache, and reuse context effectively.",
      "Separating LLM reasoning, business logic, and evaluation into clear boundaries.",
      "Handling real-world constraints like token limits, rate limits, and multi-agent concurrency.",
    ],
  },
  {
    title: "Evaluation & Success Criteria",
    description:
      "You measure, iterate, and improve. You define what success looks like and prove it with data before and after launch.",
    bullets: [
      "Establishing measurable criteria such as accuracy, reliability, and task completion.",
      "Implementing evaluation pipelines with datasets, reference outputs, and LLM-based judges.",
      "Building feedback loops that retrain, fine-tune, or adjust prompts to boost performance.",
    ],
  },
  {
    title: "Retrieval & Context Management",
    description:
      "You execute RAG the right way. You know how to structure, embed, and retrieve data so every call has the context it needs without waste.",
    bullets: [
      "Designing chunking and embedding strategies across Postgres, Pinecone, or hybrid stores.",
      "Optimizing queries with filters, metadata, and scoring that surface the best context fast.",
      "Compressing and ranking context to scale large knowledge bases without overwhelming models.",
    ],
  },
  {
    title: "Tooling & Infrastructure",
    description:
      "You take products from prototype to production. You manage the underlying stack so intelligent systems ship and stay online.",
    bullets: [
      "Writing in TypeScript or Python as core languages for services and orchestration.",
      "Building with Vercel AI SDK, FastAPI, or Node backends and orchestrating with Inngest, Temporal, or Airflow.",
      "Deploying to AWS, Vercel, or Cloudflare with observability via Prometheus, Grafana, or similar tools.",
    ],
  },
  {
    title: "Product Integration Skills",
    description:
      "You integrate AI into real products. You connect intelligent features to existing systems your teams already rely on.",
    bullets: [
      "Connecting with CRM and business APIs like HubSpot, Notion, Airtable, or internal services.",
      "Embedding AI experiences directly inside web or mobile frontends.",
      "Creating admin dashboards and analytics so teams monitor and adjust agent behavior.",
    ],
  },
  {
    title: "Collaboration & Delivery",
    description:
      "You embed, not outsource. You join teams, adapt to their standards, and ship value within their repos and pipelines.",
    bullets: [
      "Working in-place inside existing engineering cultures and review processes.",
      "Contributing production-ready code that aligns with CI/CD and compliance requirements.",
      "Maintaining clear communication, documentation, and ownership of deliverables.",
    ],
  },
];

const profiles = [
  {
    capability: "Agentic Workflow Architect",
    background: "Former full-stack engineer specializing in orchestration",
    stack: "TypeScript · LangChain · Vercel AI SDK · Inngest",
  },
  {
    capability: "AI Systems Engineer",
    background: "Backend-focused with evaluation and RAG depth",
    stack: "Python · FastAPI · LlamaIndex · Pinecone",
  },
  {
    capability: "Applied AI Frontend Dev",
    background: "UX engineer integrating LLMs into apps",
    stack: "React · Next.js · OpenAI · Postgres",
  },
  {
    capability: "Automation & Infra Specialist",
    background: "DevOps leader for AI workflow deployment",
    stack: "AWS · Temporal · Cloudflare · Python",
  },
];

export default function RequirementsPage() {
  return (
    <div className="min-h-screen bg-[#090200] text-white">
      <SiteToolbar />
      <main>
        <section className="bg-[#090200] py-24">
          <div className="container mx-auto px-4">
            <span className="block h-1 w-20 rounded-full bg-[#FF3600]" />
            <h1 className="mt-8 max-w-3xl text-4xl font-bold md:text-5xl">
              You join a network that measures capability over tenure.
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-white/70">
              Applied AI is still new. What matters is what you ship, how you evaluate it, and how fast you iterate. Every engineer in our network has built, deployed, and assessed real AI systems. This page spells out the standards you already meet—and the mindset you bring to every engagement.
            </p>
          </div>
        </section>

        <section className="bg-[#0f0504] py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-12">
              {sections.map((section) => (
                <article key={section.title} className="rounded-lg border border-white/5 bg-[#120606] p-8 shadow-lg">
                  <div className="flex items-start gap-4">
                    <span className="mt-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#FF3600]/40 bg-[#FF3600]/10 text-lg font-semibold text-[#FF3600]">
                      {sections.indexOf(section) + 1}
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold md:text-3xl">{section.title}</h2>
                      <p className="mt-3 text-base text-white/70">{section.description}</p>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3 text-white/80">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#FF3600]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#090200] py-24">
          <div className="container mx-auto px-4">
            <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
            <h2 className="mt-8 text-center text-3xl font-bold md:text-4xl">Example Profiles You Match</h2>
            <p className="mt-4 text-center text-white/70">
              You bring a unique mix of experience. These are the types of backgrounds that thrive inside Vecta.
            </p>
            <div className="mt-12 overflow-hidden rounded-xl border border-white/5 bg-[#0f0504]">
              <div className="hidden grid-cols-3 gap-px bg-white/5 text-sm uppercase tracking-wide text-white/70 md:grid">
                <div className="bg-[#0f0504] p-4">Capability</div>
                <div className="bg-[#0f0504] p-4">Typical Background</div>
                <div className="bg-[#0f0504] p-4">Key Stack</div>
              </div>
              <div className="divide-y divide-white/5">
                {profiles.map((profile) => (
                  <div key={profile.capability} className="grid grid-cols-1 md:grid-cols-3 md:gap-px">
                    <div className="bg-[#120606] p-6 font-semibold md:bg-[#0f0504]">{profile.capability}</div>
                    <div className="bg-[#0f0504] p-6 text-white/70">{profile.background}</div>
                    <div className="bg-[#120606] p-6 text-white/70 md:bg-[#0f0504]">{profile.stack}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0f0504] py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <span className="mx-auto block h-1 w-20 rounded-full bg-[#FF3600]" />
              <h2 className="mt-8 text-3xl font-bold md:text-4xl">What This Means for You</h2>
              <p className="mt-4 text-lg text-white/70">
                Joining Vecta means you unlock engagements where the expectations match your capability. Teams rely on you to bring clarity, rigor, and velocity to every agentic AI initiative.
              </p>
              <div className="mt-8 grid gap-4 text-left">
                {["You have shipped agentic workflows and can explain the trade-offs.", "You define success with metrics, evaluation tooling, and iteration loops.", "You architect AI systems that are observable, modular, and scalable.", "You integrate intelligent features directly into production products."].map((item) => (
                  <div key={item} className="flex gap-3 rounded-lg border border-white/5 bg-[#120606] p-4">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#FF3600]" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row">
                <Link
                  href="/apply"
                  className="inline-flex items-center justify-center rounded-full bg-[#FF3600] px-8 py-3 text-base font-semibold text-black transition hover:bg-[#ff5426]"
                >
                  Apply to join the network
                </Link>
                <p className="text-sm text-white/60">Share deployed work, architectures, and evaluation artifacts with your application.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FinalCTA />
      <Footer />
    </div>
  );
}

