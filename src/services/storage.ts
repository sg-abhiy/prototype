import { ProjectData, ProductMode } from '../types/index.ts';
import {
  SEED_PROBLEM_HYPOTHESES,
  DEFAULT_CANVAS,
  DEFAULT_COMPETITORS,
} from '../utils/templates.ts';
import {
  calculateProblemStrength,
  calculateOpportunityViability,
  calculateEvidenceConfidence,
  evaluateProjectScores,
} from '../utils/scoring.ts';

const DB_NAME = 'ProblemForgeDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const CURRENT_PROJECT_KEY = 'problemforge_current_project_id';
const LOCAL_STORAGE_FALLBACK_KEY = 'problemforge_projects_data';

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'context.id' });
      }
    };
  });
}

// Fallback to localStorage if IndexedDB is unavailable or restricted
function getLocalStorageProjects(): ProjectData[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageProjects(projects: ProjectData[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

export function createInitialProject(mode: ProductMode = 'discover'): ProjectData {
  const projectId = `proj-${Date.now()}`;
  const initialHypotheses = [...(SEED_PROBLEM_HYPOTHESES[mode] || SEED_PROBLEM_HYPOTHESES.discover)];
  const activeHypothesis = initialHypotheses[0] || null;

  const initialStrength = {
    severityRating: 4,
    frequencyRating: 5,
    costImpactRating: 4,
    workaroundEffortRating: 4,
    dissatisfactionRating: 4,
    urgencyRating: 3,
    explanations: {
      severity: 'Causes direct working capital blockage and bad debt losses for retailers with tight margins.',
      frequency: 'Occurs every single evening closing and weekend settlement.',
      costImpact: 'Average ₹15,000–₹30,000 unrecovered dues per quarter per retail unit.',
      workaroundEffort: 'Manual paper register entry takes 30-45 minutes of evening tallying plus awkward phone calls.',
      dissatisfaction: 'Customers dispute unitemized paper bills; shopkeeper hates sending harsh reminders.',
      urgency: 'Moderate to high during month-end inventory restock.',
    },
    isAssumed: {
      severity: false,
      frequency: false,
      costImpact: false,
      workaroundEffort: false,
      dissatisfaction: false,
      urgency: true,
    },
  };

  const initialViability = {
    reachableCustomersRating: 4,
    willingnessToPayRating: 3,
    differentiationRating: 4,
    mvpFeasibilityRating: 4,
    userAcquisitionRating: 3,
    repeatValueRating: 5,
    profile: mode === 'hackathon' ? 'hackathon' : ('commercial' as const),
    explanations: {
      reachableCustomers: '12M+ micro-retailers in India; high concentration in every neighborhood bazaar.',
      willingnessToPay: 'Low tolerance for recurring SaaS fees; willing to pay via micro-transaction fees or loan commission.',
      differentiation: 'Focuses on customer-side trust and instant WhatsApp balance receipts rather than heavy ERP.',
      mvpFeasibility: 'Can be built with a lightweight WhatsApp Cloud API webhook and Supabase/Firebase in 2 weeks.',
      userAcquisition: 'Requires neighborhood walk-ins or merchant referral loops; cold digital ads struggle.',
      repeatValue: 'Daily operational lock-in once ledger history is established.',
    },
  };

  const initialResearch = [
    {
      id: 'res-1',
      problemId: initialHypotheses[0]?.id || 'hyp-1',
      title: 'CAIT Survey on Informal Credit in Indian Retail',
      url: 'https://cait.in/reports',
      accessDate: '2026-10-24',
      excerpt:
        'Over 72% of Indian micro-retailers extend informal unsecured credit (udhaari) to build customer loyalty, but 4-8% turns into bad debt yearly.',
      classification: 'VERIFIED SOURCE CLAIM' as const,
      specificClaimSupported: 'High frequency and credit default rate in neighborhood retail',
      tags: ['Retail', 'Credit', 'India'],
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'res-2',
      problemId: initialHypotheses[0]?.id || 'hyp-1',
      title: 'Field Observation: Ramesh Kirana Store, Indore',
      accessDate: '2026-10-25',
      excerpt:
        'Storekeeper spends 40 minutes flipping through a 200-page notebook. When a customer contested ₹450 from last week, the owner could not read the scribbled date and had to give a discount.',
      classification: 'DIRECT USER OBSERVATION' as const,
      specificClaimSupported: 'Paper legibility failure and dispute-driven losses',
      tags: ['Field Observation', 'Dispute'],
      createdAt: Date.now() - 43200000,
    },
  ];

  const initialInterviews = [
    {
      id: 'int-1',
      problemId: initialHypotheses[0]?.id || 'hyp-1',
      intervieweeNameOrPseudonym: 'Mahesh Sharma',
      segmentOrRole: 'Grocery Store Owner (25 years in business)',
      interviewDate: '2026-10-25',
      channel: 'in_person' as const,
      pastBehaviorObserved: 'Showed two separate registers: one for wholesale, one for customer credit.',
      actualMoneyOrTimeSpent: 'Lost ₹24,000 to three families who moved away in 2025.',
      currentWorkaroundUsed: 'Notebook and handwritten slips folded inside the register.',
      failedPriorAttempts: 'Downloaded Khatabook but stopped after 3 days because typing each customer name during rush hour was too slow.',
      keyDirectQuotes: [
        'When 4 customers are waiting for milk and bread at 7 PM, I cannot type names on a mobile screen.',
        'I only care about knowing total debt when a customer asks "bhaiya kitna hua".',
      ],
      takeaways:
        'Input speed at counter rush is the dealbreaker. Speed trumps detailed itemization.',
      classificationAssigned: 'DIRECT USER OBSERVATION' as const,
      createdAt: Date.now() - 40000000,
    },
  ];

  const strengthScore = calculateProblemStrength(initialStrength);
  const viabilityScore = calculateOpportunityViability(initialViability);
  const evidenceScore = calculateEvidenceConfidence(initialResearch, initialInterviews, 1);
  const scores = evaluateProjectScores(strengthScore, viabilityScore, evidenceScore, initialViability.profile);

  return {
    context: {
      id: projectId,
      projectName:
        mode === 'hackathon'
          ? 'CivicTrack — Geotagged Hazard Resolution'
          : 'KiranaCredit — Zero-Dispute Bahi-Khata',
      mode,
      objective: mode === 'hackathon' ? 'hackathon' : 'scratch',
      targetAudience:
        mode === 'hackathon'
          ? 'Urban residents & civic volunteers'
          : 'Kirana store owners & neighborhood retailers',
      geography: 'India — Tier 2 & Tier 3 Cities',
      domain: mode === 'hackathon' ? 'Public services' : 'Retail and commerce',
      constraints: {
        technicalSkills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
        programmingLanguages: ['TypeScript', 'JavaScript'],
        teamSize: 2,
        availableHoursPerWeek: 15,
        budgetINR: 1500,
        accessToPotentialUsers: 'direct_daily',
        canCollectInterviews: true,
        canContactBusinesses: true,
        canUseExternalApis: true,
        canUsePaidApis: false,
        deploymentTarget: 'web',
        projectGoal: mode === 'hackathon' ? 'hackathon' : 'business',
        hackathonDeadlineHours: 36,
        hackathonTheme: 'Empowering Local Communities',
        hackathonJudgingCriteria: ['Practicality', 'Feasibility', 'Working Prototype', 'Problem Depth'],
        hackathonTechStack: ['React', 'Tailwind', 'Express', 'Gemini Flash'],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    hypotheses: initialHypotheses,
    activeHypothesisId: activeHypothesis?.id || null,
    canvas: { ...DEFAULT_CANVAS },
    research: initialResearch,
    competitors: [...DEFAULT_COMPETITORS],
    opportunityGap: {
      whatHandledWell: 'Digital ledger apps (Khatabook/OkCredit) handle SMS payment reminders and cloud backup well.',
      whatRemainsDifficult: 'Counter-rush entry friction and awkward relationship dynamics with known neighborhood elders.',
      poorlyServedCustomers: 'Solo-operated neighborhood stores with high footfall between 6 PM - 9 PM.',
      areLimitationsDocumented: true,
      whatMakesNewBetter: 'Voice/audio credit logging and interactive WhatsApp 1-tap confirmation with zero app install needed for the customer.',
      couldCompetitorCopy: 'Incumbents could add voice input, but their product architecture is geared towards merchant accounting, not consumer relationship trust.',
      wouldSwitchingCostsPrevent: 'Yes, if the merchant already has months of historical ledger data locked in another app.',
      requiredUnfairAdvantage: 'Direct distribution in local wholesale grain & FMCG markets.',
      isLowCostFeasible: true,
      differentiationHypothesis:
        'Example Hypothesis: A voice-first WhatsApp ledger bot where the storekeeper speaks "Sharma ji 240 rupaye doodh aur tel" and it logs the ledger with an audio note link for mutual trust.',
    },
    internationalModel: {
      foreignModelName: 'Klarna / Afterpay (Micro-BNPL)',
      homeMarket: 'Sweden / Australia / US',
      needAddressed: 'Point-of-sale consumer credit without credit cards',
      operatingModelSummary: 'Consumer splits purchase into 4 interest-free installments; merchant pays 3-5% interchange fee to get guaranteed upfront payment.',
      dependenciesAndPartnerships: 'Requires institutional debt facilities, algorithmic credit scoring bureau data, and digital payment rails.',
      existingLocalAlternatives: 'PayTM Postpaid, Simpl, LazyPay, Traditional informal shopkeeper credit (udhaari).',
      localWorkflowDifferences: 'In India, 80% of neighborhood retail credit is relationship-based and interest-free, not a financialized consumer lending contract.',
      localAffordabilityAndDistribution: 'Micro-retailers will never pay a 3-5% merchant discount rate because their gross margin is only 8-12%.',
      adaptationOpportunity: 'Instead of underwriting consumer debt with NBFCs, digitize the existing social relationship with automated trust notifications.',
      implementationBarriers: 'Regulatory restrictions on digital lending (RBI guidelines) if credit risk is assumed directly.',
    },
    frameworks: {
      designThinking: {
        problemDefinition:
          'Solo Kirana retailers struggle to reconcile informal store credit without creating tension with neighborhood regulars.',
        userContext:
          'High stress evening rush; cramped shop counter; manual cash and digital UPI mix; personal neighbor relationships.',
        observationSummary:
          'Shopkeepers prefer absorbing minor discrepancies over confronting customers with ambiguous handwritten notes.',
        unresolvedQuestions:
          'Will customers perceive an automated WhatsApp balance card as helpful or offensive?',
      },
      jobsToBeDone: {
        mainTask: 'Maintain customer credit relationships without losing money to bad debt.',
        trigger: 'Customer leaves counter saying "khate mein likh lena" (write it on my tab).',
        desiredProgress: 'Accurate record created in under 5 seconds with zero customer pushback.',
        existingBehaviour: 'Scribbling on paper or relying on memory until shop closes.',
        constraints: 'Cannot delay the queue; cannot appear distrustful or pushy.',
        reasonsCurrentFail: 'Typing on smartphone keyboards during rush hour is 3x slower than pen on paper.',
      },
      marketAnalysis: {
        competitorMapSummary:
          'Dominant players (Khatabook, OkCredit) saturated the digital ledger wave. Second-order opportunity lies in workflow speed and consumer-side experience.',
        alternativeSolutions: 'Paper registers, WhatsApp photos, mental tallies, cash-only policy.',
        reachableCustomerSegment: '1.2M tech-curious retailers in Tier-2 Indian commercial hubs.',
        potentialDifferentiation: 'Voice ledger entry and zero-install customer WhatsApp balance view.',
        marketUncertainties: 'Whether retailers will pay ₹99/month for a utility that doesn’t directly increase sales.',
        explicitSizingAssumptions:
          'Assume 12M kirana stores in India. 20% are smartphone-first. 10% experience acute credit disputes = ~240,000 prime target stores.',
      },
      valueProposition: {
        customerJobs: [
          'Record credit quickly at rush hour',
          'Avoid disputes during payment settlement',
          'Get paid on time without awkward confrontations',
        ],
        pains: [
          'Customers forgetting purchases or disputing dates',
          '30-45 minutes lost every night balancing books',
          'Capital locked in overdue receivables',
        ],
        gains: [
          'Zero-dispute settlement',
          'More working capital to restock wholesale',
          'Peace of mind and cordial neighbor relationships',
        ],
        painRelievers: [
          '3-second voice-to-ledger entry',
          'Shared timestamped WhatsApp receipt with itemized photo',
          'Friendly neighborhood-tone settlement reminders',
        ],
        gainCreators: [
          '1-tap UPI payment directly from the receipt',
          'Weekly cash flow health dashboard',
        ],
        connectingAssumptions:
          'Merchants will trust voice recognition in regional dialects (Hindi, Hinglish, Marathi, Tamil).',
      },
      leanStartup: {
        riskiestAssumptions: [
          'Shopkeepers will adopt voice or WhatsApp logging instead of physical pen and paper.',
          'Customers will not take offense at receiving digital receipts for neighborhood credit.',
          'Shopkeepers will pay ₹199/month or a micro-fee once bad debt is visibly reduced.',
        ],
        cheapestCredibleExperiments: [
          'Concierge WhatsApp test: digitize paper receipts manually for 5 shops for 1 week (Cost: ₹200).',
          'Paper slip test: test customer reaction to printed QR receipts at 1 store (Cost: ₹50).',
        ],
        observableOutcomes: [
          '4 out of 5 shops continue sending receipts after 5 days.',
          'Zero customer complaints about receiving digital balance cards.',
        ],
        decisionRule:
          'If >= 70% of test merchants say it saved them >20 minutes daily, proceed to build WhatsApp bot MVP.',
      },
    },
    strengthRatings: initialStrength,
    viabilityRatings: initialViability,
    scores,
    interviews: initialInterviews,
    experiments: [
      {
        id: 'exp-1',
        problemId: initialHypotheses[0]?.id || 'hyp-1',
        title: '5-Store WhatsApp Concierge Ledger Test',
        type: 'concierge_manual_service',
        hypothesisToTest:
          'Shopkeepers will gladly offload evening reconciliation if they only have to snap a photo of their notebook page.',
        description:
          'Act as human backend for 5 local merchants in Indore. Every evening, they send a photo of their credit page; we type it into a ledger and send friendly WhatsApp balance cards to customers.',
        estimatedCostINR: 200,
        estimatedCostUSD: 3,
        estimatedHours: 8,
        targetMetric: '4 out of 5 stores send photos daily for 7 consecutive days',
        passDecisionRule: '80% participation validates that entry burden is the real blocker.',
        status: 'completed',
        outcomeVerdict: 'PROCEED',
        actualResults: 'All 5 stores sent photos for 6 days. 4 reported customer disputes dropped to zero.',
        createdAt: Date.now() - 86400000 * 3,
      },
    ],
    history: ['Project created', 'Initial problem hypotheses generated', 'Concierge experiment completed'],
  };
}

export async function getProjects(): Promise<ProjectData[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as ProjectData[];
        if (results && results.length > 0) {
          resolve(results);
        } else {
          // Initialize with default project
          const defaultProj = createInitialProject('discover');
          saveProject(defaultProj).then(() => resolve([defaultProj]));
        }
      };
      req.onerror = () => {
        const local = getLocalStorageProjects();
        if (local.length > 0) {
          resolve(local);
        } else {
          const defaultProj = createInitialProject('discover');
          saveLocalStorageProjects([defaultProj]);
          resolve([defaultProj]);
        }
      };
    });
  } catch {
    const local = getLocalStorageProjects();
    if (local.length > 0) {
      return local;
    }
    const defaultProj = createInitialProject('discover');
    saveLocalStorageProjects([defaultProj]);
    return [defaultProj];
  }
}

export async function getProject(id: string): Promise<ProjectData | null> {
  const projects = await getProjects();
  return projects.find((p) => p.context.id === id) || projects[0] || null;
}

export async function saveProject(project: ProjectData): Promise<void> {
  project.context.updatedAt = Date.now();
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(project);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('IndexedDB write failed, falling back to localStorage:', e);
  }

  // Also write to localStorage for backup & instant sync
  const existing = getLocalStorageProjects();
  const index = existing.findIndex((p) => p.context.id === project.context.id);
  if (index >= 0) {
    existing[index] = project;
  } else {
    existing.push(project);
  }
  saveLocalStorageProjects(existing);
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('IndexedDB delete failed:', e);
  }

  const existing = getLocalStorageProjects().filter((p) => p.context.id !== id);
  saveLocalStorageProjects(existing);
}

export function getCurrentProjectId(): string | null {
  try {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentProjectId(id: string): void {
  try {
    localStorage.setItem(CURRENT_PROJECT_KEY, id);
  } catch (e) {
    console.warn('Failed to set current project id:', e);
  }
}

export function exportProjectAsJson(project: ProjectData): string {
  return JSON.stringify(project, null, 2);
}

export function exportProjectAsMarkdown(project: ProjectData): string {
  const c = project.context;
  const canvas = project.canvas;
  const s = project.scores;
  return `# ProblemForge Dossier: ${c.projectName}
**Mode:** ${c.mode.toUpperCase()} | **Domain:** ${c.domain} | **Geography:** ${c.geography}
**Target Audience:** ${c.targetAudience}

---

## 1. Problem Definition & Core Friction
**Specific Situation:** ${canvas.specificSituation}
**Core Job:** ${canvas.coreJob}
**Source of Friction:** ${canvas.sourceOfFriction}
**Frequency:** ${canvas.frequency} | **Severity:** ${canvas.severity}
**Lost Time or Money:** ${canvas.timeOrMoneyLost}
**Emotional Burden:** ${canvas.emotionalBurden}

### Structured Problem Statement
> People in ${canvas.specificSituation} struggle to ${canvas.coreJob} because ${canvas.statementCause || canvas.sourceOfFriction}, resulting in ${canvas.statementConsequence || canvas.consequencesOfFailure}. Current workaround is ${canvas.currentTools || canvas.currentBehaviour}, which is inadequate because ${canvas.statementLimitation || 'it fails to prevent recurrent errors'}.

---

## 2. Transparent Validation Scores
- **Problem Strength:** ${s.problemStrength}/100
- **Opportunity Viability:** ${s.opportunityViability}/100
- **Evidence Confidence:** ${s.evidenceConfidence}/100
- **Strategic Recommendation:** **${s.verdictTitle}** (${s.verdict})
- **Why:** ${s.verdictDescription}
- **Mandatory Next Step:** ${s.verdictAction}

---

## 3. Competitive & Alternative Landscape
${project.competitors
  .map(
    (comp) =>
      `### ${comp.name} (${comp.alternativeType})
- **Target Customer:** ${comp.targetCustomer}
- **Strengths:** ${comp.observedStrengths}
- **Verified Limitations:** ${comp.verifiedLimitations}
- **Pricing:** ${comp.pricing}
`
  )
  .join('\n')}

---

## 4. Opportunity Gap & Differentiation
- **What Existing Handle Well:** ${project.opportunityGap.whatHandledWell}
- **What Remains Difficult:** ${project.opportunityGap.whatRemainsDifficult}
- **Differentiation Hypothesis:** ${project.opportunityGap.differentiationHypothesis}

---

## 5. Customer Discovery Evidence (The Mom Test)
${project.interviews
  .map(
    (int) =>
      `- **${int.intervieweeNameOrPseudonym}** (${int.segmentOrRole}, ${int.interviewDate})
  - Past behavior: ${int.pastBehaviorObserved}
  - Real cost/time lost: ${int.actualMoneyOrTimeSpent}
  - Key Quote: "${int.keyDirectQuotes.join('" | "')}"
`
  )
  .join('\n')}

---

## 6. Validation Experiments
${project.experiments
  .map(
    (exp) =>
      `### ${exp.title} (${exp.status.toUpperCase()})
- **Type:** ${exp.type}
- **Hypothesis:** ${exp.hypothesisToTest}
- **Budget:** ₹${exp.estimatedCostINR} (~$${exp.estimatedCostUSD}) | **Time:** ${exp.estimatedHours}h
- **Metric:** ${exp.targetMetric}
- **Outcome Verdict:** ${exp.outcomeVerdict || 'In Progress'}
`
  )
  .join('\n')}

Generated by ProblemForge — Evidence Before Enthusiasm.
`;
}
