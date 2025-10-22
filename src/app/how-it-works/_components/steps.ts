export type Audience = "business" | "engineer";

export interface ProcessStep {
  readonly title: string;
  readonly description: string;
  readonly duration?: string;
  readonly badge?: string;
}

export const businessSteps: ProcessStep[] = [
  {
    title: "Discovery Call",
    description: "Clarify goals, constraints, and timelines so we can scope the engagement together.",
    duration: "30–45 minutes",
  },
  {
    title: "Role & Success Criteria",
    description: "Define the stack, seniority, and measurable outcomes to qualify a perfect hire.",
  },
  {
    title: "Shortlist in 72 Hours",
    description: "Review 2–5 matched engineers with work samples, vetting notes, and availability.",
    badge: "72h SLA",
  },
  {
    title: "Deep Vetting & Trial",
    description: "Hold structured interviews and, if you like, run a paid trial on real deliverables.",
  },
  {
    title: "Engagement & Onboarding",
    description: "Contracts, compliance, tooling access, and kickoff—all handled in a few clicks.",
  },
  {
    title: "Ongoing Success",
    description: "Weekly check-ins, performance reviews, replacements, and scaling as needs evolve.",
  },
];

export const engineerSteps: ProcessStep[] = [
  {
    title: "Apply & Profile",
    description: "Tell us your strengths, project history, and the kind of AI work you want next.",
  },
  {
    title: "Resume Screen",
    description: "We evaluate real impact, shipped systems, and the depth of your agentic AI experience.",
  },
  {
    title: "AI Systems Challenge",
    description: "Solve a production-style task that mirrors the constraints of our client work.",
  },
  {
    title: "Technical Interview",
    description: "Walk through architecture, design decisions, and code quality with our senior engineers.",
  },
  {
    title: "Collaboration & Reliability",
    description: "Assess communication, ownership, and delivery cadence across async and live scenarios.",
  },
  {
    title: "Matching & Start",
    description: "Get introduced to roles aligned to your goals, compensation target, and availability.",
  },
];

export interface GuaranteeItem {
  readonly title: string;
  readonly description: string;
  readonly highlight?: string;
}

export const guarantees: Record<Audience, GuaranteeItem[]> = {
  business: [
    {
      title: "Shortlist in 72 Hours",
      description: "Receive a curated slate of 2–5 engineers, each with full vetting notes and code samples.",
      highlight: "Speed",
    },
    {
      title: "Replacement Service",
      description: "If someone is not the right fit, we'll help to find you the right engineer.",
      highlight: "Assurance",
    },
    {
      title: "Global Compliance",
      description: "Contracts, IP protection, and NDAs handled across jurisdictions with airtight compliance.",
      highlight: "Compliance",
    },
    {
      title: "Flexible Engagements",
      description: "Contract, contract-to-hire, or direct hire—with simple, consolidated invoicing.",
      highlight: "Flexibility",
    },
  ],
  engineer: [
    {
      title: "Real AI Products",
      description: "Join teams that ship production AI systems—not endless POCs or prompt tinkering.",
      highlight: "Impact",
    },
    {
      title: "Paid Trial Options",
      description: "When clients run trials, they are paid engagements respecting your time and expertise.",
      highlight: "Fairness",
    },
    {
      title: "Global Contracts",
      description: "We handle compliant agreements, IP protection, and timely payouts wherever you live.",
      highlight: "Stability",
    },
    {
      title: "Match to Your Goals",
      description: "We align opportunities with your preferred stack, industry, schedule, and compensation.",
      highlight: "Fit",
    },
  ],
};

export interface FAQItem {
  readonly question: string;
  readonly answer: string;
}

export const faqs: Record<Audience, FAQItem[]> = {
  business: [
    {
      question: "How quickly can we start?",
      answer: "We schedule discovery this week and deliver a vetted shortlist within 72 hours of locking requirements.",
    },
    {
      question: "Do you handle contracts and payments?",
      answer: "Yes. We manage contracts, invoicing, and global compliance so you can focus on the work.",
    },
    {
      question: "What happens if it isn’t a fit?",
      answer: "We offer a 30-day replacement guarantee and step in immediately to rematch talent.",
    },
  ],
  engineer: [
    {
      question: "How long does the process take?",
      answer: "Most engineers move from application to active opportunities within 1–2 weeks, depending on role demand.",
    },
    {
      question: "Is the challenge compensated?",
      answer: "Any trial projects run with clients are paid; our internal assessments are intentionally scoped to be lightweight.",
    },
    {
      question: "Can I choose part-time or contract work?",
      answer: "Yes. We staff both part-time and full-time engagements—tell us your availability and preferences.",
    },
  ],
};
