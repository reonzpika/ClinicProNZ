export type ToolCategory = 'ai-scribe' | 'search';

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
  category: ToolCategory;
  subtitle?: string;
  keyInfo?: {
    platforms: string[]; // e.g., ["Web"]
    accountRequired: boolean;
  };
  goodFor?: string[];
  limits?: string[];
  citations?: 'inline' | 'references' | 'none';
  country?: string;
  privacyNote?: string;
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
    category: 'search',
    subtitle: 'Research assistant with sources for most answers',
    isFree: true,
    tryUrl: 'https://www.perplexity.ai',
    website: 'https://www.perplexity.ai',
    docsUrl: null,
    logoUrl: '/logos/perplexity.svg',
    keyInfo: { platforms: ['Web'], accountRequired: false },
    goodFor: [
      'Clinical Q&A (with citations)',
      'Evidence search (NZ sources)',
      'Web summaries of NZ guidance',
    ],
    limits: [
      'Needs “NZ sources first” prompting; defaults to US/UK',
      'Citation quality varies; verify source type',
      'HealthPathways often gated; may miss local pathways',
    ],
    citations: 'inline',
    country: 'US',
    privacyNote: 'Do not enter identifiable patient data',
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
    category: 'search',
    subtitle: 'Guideline and paper summaries with source links',
    isFree: true,
    tryUrl: 'https://www.openevidence.com',
    website: 'https://www.openevidence.com',
    docsUrl: null,
    logoUrl: '/logos/openevidence.svg',
    keyInfo: { platforms: ['Web'], accountRequired: true },
    goodFor: [
      'Evidence summaries',
      'Study comparisons',
    ],
    limits: [
      'Not localised to NZ; cross‑check with bpacnz/MOH/Te Whatu Ora',
      'May lag on very recent NZ‑specific updates',
      'Less useful for local referral thresholds/services',
    ],
    citations: 'references',
    country: 'US',
    privacyNote: 'Do not enter identifiable patient data',
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
  // Elicit removed
  {
    id: 'consensus',
    name: 'Consensus',
    tagline: 'Science search with consensus view',
    category: 'search',
    isFree: true,
    tryUrl: 'https://consensus.app',
    website: 'https://consensus.app',
    docsUrl: null,
    logoUrl: '/logos/consensus.svg',
    keyInfo: { platforms: ['Web'], accountRequired: true },
    overview:
      'Aggregates research findings to show a consensus stance. Good for quick sense-checks; still review underlying studies.',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    tagline: 'Google’s notebook with AI synthesis',
    category: 'search',
    isFree: true,
    tryUrl: 'https://notebooklm.google',
    website: 'https://notebooklm.google',
    docsUrl: null,
    logoUrl: '/logos/notebooklm.svg',
    keyInfo: { platforms: ['Web'], accountRequired: true },
    goodFor: ['Summarising own documents', 'Creating study notes'],
    limits: ['Not a citations-first search engine', 'Check sources manually'],
    citations: 'none',
    country: 'US',
    privacyNote: 'Avoid identifiable patient data',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  // SciSpace removed
  {
    id: 'claude',
    name: 'Claude',
    tagline: 'Helpful assistant for drafting and analysis',
    category: 'search',
    isFree: true,
    tryUrl: 'https://claude.ai',
    website: 'https://claude.ai',
    docsUrl: null,
    logoUrl: '/logos/claude.svg',
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
    category: 'search',
    isFree: true,
    tryUrl: 'https://chat.openai.com',
    website: 'https://chat.openai.com',
    docsUrl: null,
    logoUrl: '/logos/chatgpt.svg',
    keyInfo: { platforms: ['Web'], accountRequired: true },
    overview:
      'Drafts, summaries, and general Q&A. Include safety-netting and request citations for clinical topics.',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'clinicpro',
    name: 'ClinicPro',
    tagline: 'AI scribing for NZ GPs',
    category: 'ai-scribe',
    isFree: false,
    tryUrl: 'https://clinicpro.nz',
    website: 'https://clinicpro.nz',
    docsUrl: null,
    logoUrl: '/logos/clinicpro.svg',
    keyInfo: { platforms: ['Web'], accountRequired: true },
    goodFor: ['Consult notes in under 1 minute', 'NZ GP workflows'],
    limits: ['Verify against practice policies', 'Avoid PHI outside secured sessions'],
    citations: 'none',
    country: 'NZ',
    privacyNote: 'Designed for NZ general practice; follow local data policies',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'heidi',
    name: 'Heidi',
    tagline: 'AI medical scribe',
    category: 'ai-scribe',
    isFree: false,
    tryUrl: 'https://www.heidihealth.com',
    website: 'https://www.heidihealth.com',
    docsUrl: null,
    logoUrl: '/logos/heidi.svg',
    keyInfo: { platforms: ['Web'], accountRequired: true },
    goodFor: ['AI scribing', 'Consult summaries'],
    limits: ['Check privacy posture for NZ clinics'],
    citations: 'none',
    country: 'AU',
    privacyNote: 'Avoid identifiable patient data unless contract permits',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'nabla',
    name: 'Nabla',
    tagline: 'AI medical scribe and assistant',
    category: 'ai-scribe',
    isFree: true,
    tryUrl: 'https://www.nabla.com',
    website: 'https://www.nabla.com',
    docsUrl: null,
    logoUrl: '/logos/nabla.svg',
    keyInfo: { platforms: ['Web'], accountRequired: true },
    goodFor: ['AI scribing', 'SOAP summaries'],
    limits: ['Verify data residency and PHI handling'],
    citations: 'none',
    country: 'FR',
    privacyNote: 'Avoid identifiable patient data unless contract permits',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'medtech-intelitek',
    name: 'Medtech × Intelitek',
    tagline: 'AI-assisted clinical documentation for Medtech practices',
    category: 'ai-scribe',
    isFree: false,
    tryUrl: 'https://medtechglobal.com',
    website: 'https://medtechglobal.com',
    docsUrl: null,
    logoUrl: '/logos/medtech-intelitek.svg',
    keyInfo: { platforms: ['Web'], accountRequired: true },
    goodFor: ['Consult note drafting', 'Workflow templating'],
    limits: ['Confirm NZ data residency and vendor agreements'],
    citations: 'none',
    country: 'NZ',
    privacyNote: 'Check PHI handling and clinic agreements before use',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
  {
    id: 'indici',
    name: 'indici',
    tagline: 'Cloud PMS with AI-enabled documentation tools',
    category: 'ai-scribe',
    isFree: false,
    tryUrl: 'https://indici.co.nz',
    website: 'https://indici.co.nz',
    docsUrl: null,
    logoUrl: '/logos/indici.svg',
    keyInfo: { platforms: ['Web'], accountRequired: true },
    goodFor: ['Consult summaries', 'Clinical documentation assistance'],
    limits: ['Confirm privacy posture and data residency for NZ'],
    citations: 'none',
    country: 'NZ',
    privacyNote: 'Follow local PHI rules; verify vendor terms',
    relatedPromptsUrl: null,
    communityUrl: null,
    comingSoon: { prompts: true, community: true, pricingDetails: true },
    lastReviewed: new Date().toISOString(),
  },
];

export function getToolById(slug: string): ToolDetail | undefined {
  return TOOL_LIST.find((t) => t.id === slug);
}
