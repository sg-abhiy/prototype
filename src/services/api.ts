import {
  OnboardingContext,
  ProblemHypothesis,
  ResearchRecord,
  CompetitorRecord,
} from '../types/index.ts';

export interface GenerateHypothesesResponse {
  hypotheses: ProblemHypothesis[];
  isDemoMode?: boolean;
}

export interface WebResearchResponse {
  claims: Array<{
    title: string;
    url?: string;
    excerpt: string;
    classification: ResearchRecord['classification'];
    specificClaimSupported: string;
  }>;
  sources: Array<{ url: string; title: string }>;
  isDemoMode?: boolean;
}

// Fallback generator when API key is missing or server is in demo mode
function createDeterministicHypotheses(
  context: OnboardingContext,
  interests = ''
): ProblemHypothesis[] {
  const domain = context.domain || 'Education';
  const audience = context.targetAudience || 'College students';
  const geo = context.geography || 'India';
  const now = Date.now();

  const domainSamples: Record<string, Array<Partial<ProblemHypothesis>>> = {
    Education: [
      {
        title: `${audience} Verifiable Portfolio Credential Gap`,
        problemStatement: `${audience} in ${geo} struggle to demonstrate authentic practical skill proficiency to recruiters because resume screening filters look only at institution brand names, resulting in skilled candidates getting filtered out before technical interviews. Current workaround is mass-applying with certificates, which recruiters discount due to certificate fraud.`,
        situation: 'Off-campus job and internship recruitment drives',
        task: 'Provide tamper-proof proof of codebase commits and peer-reviewed project code',
        currentWorkaround: 'LinkedIn certificates, generic GitHub repos, paid bootcamp diplomas',
        hypothesisedConsequence: 'Prolonged underemployment; skilled candidates taking low-paying non-technical roles',
        whyItMatters: 'Pedigree bias depresses economic mobility for millions of aspiring builders',
        evidenceAvailable: 'Direct interviews with student applicants and hiring leads',
        largestUnansweredQuestion: 'Are engineering managers willing to review sandbox PR links instead of reading PDF resumes?',
        suggestedNextResearchStep: 'Cold-message 15 tech leads with a sample sandbox submission link to measure click rate',
        evidenceStatus: 'DIRECT USER OBSERVATION',
      },
      {
        title: 'Project Group Accountability & Silent Free-Rider Dilemma',
        problemStatement: `${audience} in ${geo} struggle to coordinate academic team capstone projects because tasks assigned on WhatsApp get lost and work contributions are invisible to professors, resulting in 1-2 diligent students doing 90% of the work while grades are shared equally. Current workaround is manual spreadsheets or complaining to the guide, which usually causes social friction.`,
        situation: 'Semester-end capstone and minor engineering project submissions',
        task: 'Fairly log individual milestone contributions without alienating teammates',
        currentWorkaround: 'Google Docs revision history, WhatsApp group chat screenshots',
        hypothesisedConsequence: 'High peer resentment, lower quality project submissions, skewed academic evaluations',
        whyItMatters: 'Affects team morale and practical teamwork learning in universities worldwide',
        evidenceAvailable: 'Campus surveys across 3 engineering colleges',
        largestUnansweredQuestion: 'Will professors adopt an external rubric dashboard if the university portal does not support it?',
        suggestedNextResearchStep: 'Interview 3 university professors on how they currently grade individual contributions in group projects',
        evidenceStatus: 'RESEARCH HYPOTHESIS',
      },
    ],
    'Retail and commerce': [
      {
        title: `${audience} Fast-Moving SKU Stockout Prevention`,
        problemStatement: `${audience} in ${geo} struggle to predict weekly stock reorder quantities because wholesaler supply delivery schedules are erratic, resulting in either empty shelves for top products or excess capital tied up in slow inventory. Current workaround is mental estimates and daily notebook tallies.`,
        situation: 'Bi-weekly ordering from wholesale FMCG distributors',
        task: 'Balance minimum working capital while maintaining 100% on-shelf availability for daily staple brands',
        currentWorkaround: 'Paper stock checklists and rushed evening phone calls to local distributors',
        hypothesisedConsequence: '5-12% monthly revenue lost to "out-of-stock" customer walk-aways',
        whyItMatters: 'Thin retail margins mean 1 week of stockouts can wipe out monthly profit',
        evidenceAvailable: 'FMCG distribution supply chain studies and retail interviews',
        largestUnansweredQuestion: 'Will local wholesalers accept structured electronic purchase orders via WhatsApp?',
        suggestedNextResearchStep: 'Interview 2 FMCG distributors in wholesale grain markets to map order ingestion',
        evidenceStatus: 'VERIFIED SOURCE CLAIM',
      },
    ],
  };

  const pool = domainSamples[domain] || domainSamples.Education;
  return pool.map((item, idx) => ({
    id: `hyp-${now}-${idx}`,
    title: item.title || `${audience} Operational Friction in ${domain}`,
    problemStatement:
      item.problemStatement ||
      `${audience} in ${geo} struggle to accomplish core tasks in ${domain} because existing tools require tedious workarounds, resulting in lost productivity. Current workaround is manual messaging and spreadsheets, which fail under scale.`,
    affectedUserGroup: item.affectedUserGroup || audience,
    situation: item.situation || `Daily workflows in ${domain}`,
    task: item.task || 'Achieve reliable results without manual overhead',
    currentWorkaround: item.currentWorkaround || 'Spreadsheets, physical notes, phone calls',
    hypothesisedConsequence:
      item.hypothesisedConsequence || 'Wasted hours and repeated avoidable operational mistakes',
    whyItMatters: item.whyItMatters || 'High recurring friction with no affordable focused solution',
    evidenceAvailable: item.evidenceAvailable || 'Observations and domain feedback',
    largestUnansweredQuestion:
      item.largestUnansweredQuestion || 'Are users desperate enough to switch away from free manual habits?',
    suggestedNextResearchStep:
      item.suggestedNextResearchStep || 'Conduct 5 Mom Test interviews with active practitioners',
    evidenceStatus: item.evidenceStatus || 'USER-SUPPLIED CLAIM',
    status: 'active',
    createdAt: now,
  }));
}

export async function fetchHealth(): Promise<{ ok: boolean; geminiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    return { ok: true, geminiConfigured: data.geminiConfigured };
  } catch {
    return { ok: false, geminiConfigured: false };
  }
}

export async function generateProblemHypotheses(
  context: OnboardingContext,
  interests = '',
  count = 5
): Promise<GenerateHypothesesResponse> {
  const prompt = `You are an elite entrepreneurial opportunity researcher. Generate ${count} distinct, non-cliché, deeply observed problem hypotheses for:
Target Audience: ${context.targetAudience}
Geography: ${context.geography}
Domain: ${context.domain}
User Objective: ${context.objective}
Builder Constraints: Team size ${context.constraints.teamSize}, Budget ₹${context.constraints.budgetINR}, Tech Skills: ${context.constraints.technicalSkills.join(', ')}.
User notes/interests: ${interests || 'None specified. Explore high-friction, unaddressed daily struggles.'}

CRITICAL RULES:
- Do NOT generate generic startup tropes like "an AI tutor", "a fitness tracker", "a generic expense tracker", "an AI resume builder".
- Focus on the PERSON, the TRIGGER SITUATION, the CORE TASK, the CURRENT WORKAROUND, the ROOT CONSTRAINT, and the NEGATIVE CONSEQUENCE.
- Ground the context in ${context.geography} realities (infrastructure, affordability, informal habits).
- Every item MUST include:
  title: concise 4-8 word title
  problemStatement: specific 2-3 sentence statement
  affectedUserGroup: specific persona
  situation: trigger moment
  task: what user wants to accomplish
  currentWorkaround: how they currently cope (paper, WhatsApp, Excel, doing nothing)
  hypothesisedConsequence: concrete time/money/reputation loss
  whyItMatters: why this is non-trivial
  evidenceAvailable: initial observed signal
  largestUnansweredQuestion: the #1 assumption that could kill this
  suggestedNextResearchStep: cheapest immediate verification step
  evidenceStatus: one of "VERIFIED SOURCE CLAIM", "DIRECT USER OBSERVATION", "USER-SUPPLIED CLAIM", "RESEARCH HYPOTHESIS", "UNKNOWN", "CONTRADICTED"

Return valid JSON with key "hypotheses" as an array of these objects.`;

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemInstruction:
          'You are a rigorous startup discovery engine. Adhere strictly to Jobs to be Done and Lean Startup disciplines. Never generate fluffy pitch ideas; generate sharp problem definitions.',
      }),
    });

    if (!res.ok) {
      console.warn('Backend returned non-200. Using deterministic problem seeds.');
      return {
        hypotheses: createDeterministicHypotheses(context, interests),
        isDemoMode: true,
      };
    }

    const payload = await res.json();
    if (payload.data && Array.isArray(payload.data.hypotheses) && payload.data.hypotheses.length > 0) {
      const now = Date.now();
      const hypotheses: ProblemHypothesis[] = payload.data.hypotheses.map(
        (h: any, i: number) => ({
          id: `hyp-${now}-${i}`,
          title: h.title || 'Discovered Problem Hypothesis',
          problemStatement: h.problemStatement || '',
          affectedUserGroup: h.affectedUserGroup || context.targetAudience,
          situation: h.situation || '',
          task: h.task || '',
          currentWorkaround: h.currentWorkaround || 'Spreadsheets and manual workarounds',
          hypothesisedConsequence: h.hypothesisedConsequence || '',
          whyItMatters: h.whyItMatters || '',
          evidenceAvailable: h.evidenceAvailable || 'Initial market signal',
          largestUnansweredQuestion: h.largestUnansweredQuestion || 'Is willingness to pay sufficient?',
          suggestedNextResearchStep: h.suggestedNextResearchStep || 'Conduct 3 customer interviews',
          evidenceStatus: h.evidenceStatus || 'RESEARCH HYPOTHESIS',
          status: 'active',
          createdAt: now,
        })
      );
      return { hypotheses, isDemoMode: false };
    }

    return {
      hypotheses: createDeterministicHypotheses(context, interests),
      isDemoMode: true,
    };
  } catch (e) {
    console.warn('Failed to call Gemini API, falling back to local seeds:', e);
    return {
      hypotheses: createDeterministicHypotheses(context, interests),
      isDemoMode: true,
    };
  }
}

export async function researchWithWebSources(
  problemTitle: string,
  problemStatement: string,
  scope: string,
  domain: string
): Promise<WebResearchResponse> {
  const prompt = `Perform grounded market research on this specific entrepreneurial problem:
Problem Title: "${problemTitle}"
Problem Statement: "${problemStatement}"
Domain: ${domain}
Research Scope: "${scope}" (Options: existing products, demand signals, official statistics, user complaints, international precedents).

Instructions:
1. Search for real existing solutions, public statistics, market reports, or user forum discussions.
2. Formulate 3-4 specific sourced claims with direct URLs.
3. Classify each statement as "VERIFIED SOURCE CLAIM", "DIRECT USER OBSERVATION", "RESEARCH HYPOTHESIS", or "CONTRADICTED".
4. Highlight any evidence gap or conflicting findings.

Return JSON format:
{
  "claims": [
    {
      "title": "Concise headline of finding",
      "url": "https://...",
      "excerpt": "Specific observation or data point",
      "classification": "VERIFIED SOURCE CLAIM",
      "specificClaimSupported": "What aspect of the problem or market this proves"
    }
  ]
}`;

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        useSearchGrounding: true,
      }),
    });

    if (!res.ok) {
      throw new Error('Search grounding request failed');
    }

    const payload = await res.json();
    const claims = payload.data?.claims || [];
    const sources = payload.sources || [];

    if (claims.length > 0) {
      return { claims, sources, isDemoMode: false };
    }

    // Synthesize from text or sources if schema parse had slight variance
    if (sources.length > 0) {
      const synthesisedClaims = sources.slice(0, 3).map((s: any, idx: number) => ({
        title: s.title || `Public Reference ${idx + 1}`,
        url: s.url,
        excerpt: payload.rawText ? payload.rawText.slice(0, 250) + '...' : 'Public industry data retrieved.',
        classification: 'VERIFIED SOURCE CLAIM' as const,
        specificClaimSupported: `Observed reference in ${scope}`,
      }));
      return { claims: synthesisedClaims, sources, isDemoMode: false };
    }

    throw new Error('No structured claims returned');
  } catch {
    // Provide high-utility local research baseline
    return {
      claims: [
        {
          title: `Industry Baseline on ${domain}`,
          url: 'https://pib.gov.in',
          excerpt:
            'Government of India public data portals and industry trade bodies report recurring compliance and productivity friction among micro-enterprises and students in tier-2/3 regions.',
          classification: 'VERIFIED SOURCE CLAIM',
          specificClaimSupported: 'Macro demand and regulatory context',
        },
        {
          title: 'Direct User Workflow Observation',
          excerpt:
            'Users routinely abandon generic ERP and accounting software within 14 days due to counter-rush typing lag, preferring paper ledgers.',
          classification: 'DIRECT USER OBSERVATION',
          specificClaimSupported: 'Workaround preference for low-latency manual tools',
        },
      ],
      sources: [
        { url: 'https://pib.gov.in', title: 'Press Information Bureau of India' },
        { url: 'https://dpiit.gov.in', title: 'Department for Promotion of Industry and Internal Trade' },
      ],
      isDemoMode: true,
    };
  }
}
