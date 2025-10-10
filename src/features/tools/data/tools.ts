export type ToolSummary = {
  id: string; // slug
  name: string;
  tagline: string;
  isFree: boolean;
  tryUrl: string;
  website?: string;
  docsUrl?: string | null;
  logoUrl?: string | null;
  updatedAt?: string; // ISO date
};

export type ToolDetail = ToolSummary & {
  subtitle?: string;
  keyInfo?: {
    platforms: string[]; // e.g., ["Web"]
    accountRequired: boolean;
  };
  overview?: string;
  workflows?: Array<{ title: string; steps: string[] }>;
  tipsForGPs?: string[];
  relatedPromptsUrl?: string | null;
  communityUrl?: string | null;
  comingSoon?: {
    prompts?: boolean;
    community?: boolean;
    pricingDetails?: boolean;
  };
  lastReviewed?: string; // ISO date
};

// Minimal seed data; extend over time
export const TOOL_LIST: ToolDetail[] = [
  {
    id: 'perplexity',
    name: 'Perplexity',
    tagline: 'Fast answers with inline citations',
    subtitle: 'Research assistant with sources for most answers',
    isFree: true,
    tryUrl: 'https://www.perplexity.ai',
    website: 'https://www.perplexity.ai',
    docsUrl: null,
    logoUrl: null,
    keyInfo: { platforms: ['Web'], accountRequired: false },
    overview:
      'Perplexity provides concise answers with source citations. Useful for quick overviews; verify against local guidelines before acting clinically.',
    workflows: [
      { title: 'Clinical Q&A (with citations)', steps: ['Ask a clinical question', 'Check citations', 'Cross-check with local guidelines'] },
      { title: 'Summarise evidence quickly', steps: ['Query topic', 'Open key sources', 'Save links for review'] },
    ],
    tipsForGPs: [
      'Prefer questions requiring citations',
      'Avoid entering identifiable patient data',
      'State uncertainties in notes; verify with guidelines',
    ],
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'openevidence',
    name: 'OpenEvidence',
    tagline: 'Evidence summaries with references',
    subtitle: 'Guideline and paper summaries with source links',
    isFree: true,
    tryUrl: 'https://www.openevidence.com',
    website: 'https://www.openevidence.com',
    docsUrl: null,
    logoUrl: null,
    keyInfo: { platforms: ['Web'], accountRequired: true },
    overview:
      'Summarises clinical evidence with clear references. Best used for structured review; check date and applicability to NZ context.',
    workflows: [
      { title: 'Evidence check', steps: ['Search topic', 'Review referenced studies', 'Note practice implications'] },
    ],
    tipsForGPs: ['Record sources in notes', 'Check publication recency'],
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'elicit',
    name: 'Elicit',
    tagline: 'Literature discovery and synthesis',
    isFree: true,
    tryUrl: 'https://elicit.com',
    website: 'https://elicit.com',
    docsUrl: null,
    logoUrl: null,
    keyInfo: { platforms: ['Web'], accountRequired: true },
    overview:
      'Finds and structures relevant papers for a topic. Helpful for getting a lay of the land before deep reading.',
    tipsForGPs: ['Export citations for records'],
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'consensus',
    name: 'Consensus',
    tagline: 'Science search with consensus view',
    isFree: true,
    tryUrl: 'https://consensus.app',
    website: 'https://consensus.app',
    docsUrl: null,
    logoUrl: null,
    keyInfo: { platforms: ['Web'], accountRequired: true },
    overview:
      'Aggregates research findings to show a consensus stance. Good for quick sense-checks; still review underlying studies.',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'scispace',
    name: 'SciSpace Copilot',
    tagline: 'PDF Q&A with citations',
    isFree: true,
    tryUrl: 'https://typeset.io',
    website: 'https://typeset.io',
    docsUrl: null,
    logoUrl: null,
    keyInfo: { platforms: ['Web'], accountRequired: true },
    overview:
      'Question-and-answer on PDFs with citations. Useful for drilling into specific papers.',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'claude',
    name: 'Claude',
    tagline: 'Helpful assistant for drafting and analysis',
    isFree: true,
    tryUrl: 'https://claude.ai',
    website: 'https://claude.ai',
    docsUrl: null,
    logoUrl: null,
    keyInfo: { platforms: ['Web'], accountRequired: true },
    overview:
      'General assistant useful for drafting clinical communication and summarising. Request citations when needed.',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    tagline: 'General assistant; request citations',
    isFree: true,
    tryUrl: 'https://chat.openai.com',
    website: 'https://chat.openai.com',
    docsUrl: null,
    logoUrl: null,
    keyInfo: { platforms: ['Web'], accountRequired: true },
    overview:
      'Drafts, summaries, and general Q&A. Include safety-netting and request citations for clinical topics.',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
];

export function getToolById(slug: string): ToolDetail | undefined {
  return TOOL_LIST.find((t) => t.id === slug);
}
