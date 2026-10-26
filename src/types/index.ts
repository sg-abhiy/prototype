/**
 * ProblemForge Domain Types
 */

export type ProductMode = 'discover' | 'evaluate' | 'market_gap' | 'hackathon';

export type UserObjective =
  | 'scratch'
  | 'evaluate_idea'
  | 'market_gap'
  | 'international_model'
  | 'hackathon'
  | 'social_impact'
  | 'specific_customer';

export type EvidenceClassification =
  | 'VERIFIED SOURCE CLAIM'
  | 'DIRECT USER OBSERVATION'
  | 'USER-SUPPLIED CLAIM'
  | 'RESEARCH HYPOTHESIS'
  | 'UNKNOWN'
  | 'CONTRADICTED';

export type AlternativeType =
  | 'direct_software'
  | 'indirect_solution'
  | 'manual_workaround'
  | 'do_nothing';

export type ViabilityProfile =
  | 'commercial'
  | 'hackathon'
  | 'social_impact'
  | 'education';

export interface BuilderConstraints {
  technicalSkills: string[];
  programmingLanguages: string[];
  teamSize: number;
  availableHoursPerWeek: number;
  budgetINR: number;
  accessToPotentialUsers: 'direct_daily' | 'indirect_network' | 'no_existing_access' | 'cold_reach_only';
  canCollectInterviews: boolean;
  canContactBusinesses: boolean;
  canUseExternalApis: boolean;
  canUsePaidApis: boolean;
  deploymentTarget: 'web' | 'mobile_pwa' | 'telegram_bot' | 'whatsapp_workflow' | 'cli_or_script';
  projectGoal: 'learning' | 'hackathon' | 'portfolio' | 'business' | 'social_impact';
  // Hackathon-specific attributes
  hackathonDeadlineHours?: number;
  hackathonTheme?: string;
  hackathonJudgingCriteria?: string[];
  hackathonTechStack?: string[];
}

export interface OnboardingContext {
  id: string;
  projectName: string;
  mode: ProductMode;
  objective: UserObjective;
  targetAudience: string;
  geography: string;
  domain: string;
  constraints: BuilderConstraints;
  initialDescription?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProblemHypothesis {
  id: string;
  title: string;
  problemStatement: string;
  affectedUserGroup: string;
  situation: string;
  task: string;
  currentWorkaround: string;
  hypothesisedConsequence: string;
  whyItMatters: string;
  evidenceAvailable: string;
  largestUnansweredQuestion: string;
  suggestedNextResearchStep: string;
  evidenceStatus: EvidenceClassification;
  status: 'active' | 'saved' | 'rejected' | 'later';
  rejectionReason?: string;
  createdAt: number;
}

export interface ProblemCanvas {
  targetUser: string;
  specificSituation: string;
  coreJob: string;
  currentBehaviour: string;
  currentTools: string;
  sourceOfFriction: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional' | 'unknown';
  severity: 'blocking' | 'painful' | 'annoying' | 'negligible' | 'unknown';
  consequencesOfFailure: string;
  timeOrMoneyLost: string;
  emotionalBurden: string;
  existingAlternatives: string;
  desiredOutcome: string;
  suspectedUnmetNeed: string;
  evidenceSupporting: string;
  unansweredQuestions: string;
  // Template builder fields
  statementCause: string;
  statementConsequence: string;
  statementLimitation: string;
}

export interface ResearchRecord {
  id: string;
  problemId: string;
  title: string;
  url?: string;
  publicationDate?: string;
  accessDate: string;
  excerpt: string;
  classification: EvidenceClassification;
  specificClaimSupported: string;
  tags: string[];
  createdAt: number;
}

export interface CompetitorRecord {
  id: string;
  problemId: string;
  name: string;
  website?: string;
  targetCustomer: string;
  geographicMarket: string;
  coreFunctionality: string;
  pricing: string;
  distributionChannel: string;
  observedStrengths: string;
  verifiedLimitations: string;
  alternativeType: AlternativeType;
  sourceLinks: string[];
  confidence: 'High' | 'Medium' | 'Low';
  dateResearched: string;
}

export interface OpportunityGap {
  whatHandledWell: string;
  whatRemainsDifficult: string;
  poorlyServedCustomers: string;
  areLimitationsDocumented: boolean;
  whatMakesNewBetter: string;
  couldCompetitorCopy: string;
  wouldSwitchingCostsPrevent: string;
  requiredUnfairAdvantage: string;
  isLowCostFeasible: boolean;
  differentiationHypothesis: string;
}

export interface InternationalModel {
  foreignModelName: string;
  homeMarket: string;
  needAddressed: string;
  operatingModelSummary: string;
  dependenciesAndPartnerships: string;
  existingLocalAlternatives: string;
  localWorkflowDifferences: string;
  localAffordabilityAndDistribution: string;
  adaptationOpportunity: string;
  implementationBarriers: string;
}

export interface FrameworkArtefacts {
  designThinking: {
    problemDefinition: string;
    userContext: string;
    observationSummary: string;
    unresolvedQuestions: string;
  };
  jobsToBeDone: {
    mainTask: string;
    trigger: string;
    desiredProgress: string;
    existingBehaviour: string;
    constraints: string;
    reasonsCurrentFail: string;
  };
  marketAnalysis: {
    competitorMapSummary: string;
    alternativeSolutions: string;
    reachableCustomerSegment: string;
    potentialDifferentiation: string;
    marketUncertainties: string;
    explicitSizingAssumptions: string;
  };
  valueProposition: {
    customerJobs: string[];
    pains: string[];
    gains: string[];
    painRelievers: string[];
    gainCreators: string[];
    connectingAssumptions: string;
  };
  leanStartup: {
    riskiestAssumptions: string[];
    cheapestCredibleExperiments: string[];
    observableOutcomes: string[];
    decisionRule: string;
  };
}

export interface ProblemStrengthRatings {
  severityRating: number; // 1 to 5
  frequencyRating: number;
  costImpactRating: number;
  workaroundEffortRating: number;
  dissatisfactionRating: number;
  urgencyRating: number;
  explanations: {
    severity: string;
    frequency: string;
    costImpact: string;
    workaroundEffort: string;
    dissatisfaction: string;
    urgency: string;
  };
  isAssumed: {
    severity: boolean;
    frequency: boolean;
    costImpact: boolean;
    workaroundEffort: boolean;
    dissatisfaction: boolean;
    urgency: boolean;
  };
}

export interface OpportunityViabilityRatings {
  reachableCustomersRating: number; // 1 to 5
  willingnessToPayRating: number;
  differentiationRating: number;
  mvpFeasibilityRating: number;
  userAcquisitionRating: number;
  repeatValueRating: number;
  profile: ViabilityProfile;
  explanations: {
    reachableCustomers: string;
    willingnessToPay: string;
    differentiation: string;
    mvpFeasibility: string;
    userAcquisition: string;
    repeatValue: string;
  };
}

export interface ScoreBreakdown {
  problemStrength: number; // 0-100
  opportunityViability: number; // 0-100
  evidenceConfidence: number; // 0-100
  verdict: 'PROCEED_EXPERIMENT' | 'INVESTIGATE_FURTHER' | 'PIVOT_PROBLEM' | 'ABANDON';
  verdictTitle: string;
  verdictDescription: string;
  verdictAction: string;
  calculatedAt: number;
}

export interface CustomerInterviewRecord {
  id: string;
  problemId: string;
  intervieweeNameOrPseudonym: string;
  segmentOrRole: string;
  interviewDate: string;
  channel: 'in_person' | 'call' | 'whatsapp_chat' | 'campus_walkup' | 'field_visit';
  pastBehaviorObserved: string;
  actualMoneyOrTimeSpent: string;
  currentWorkaroundUsed: string;
  failedPriorAttempts: string;
  keyDirectQuotes: string[];
  takeaways: string;
  classificationAssigned: EvidenceClassification;
  createdAt: number;
}

export interface ValidationExperimentRecord {
  id: string;
  problemId: string;
  title: string;
  type:
    | 'landing_page_smoke_test'
    | 'concierge_manual_service'
    | 'wizard_of_oz'
    | 'cold_outreach_script'
    | 'paper_prototype_test'
    | 'preorder_or_loi'
    | 'community_poll';
  hypothesisToTest: string;
  description: string;
  estimatedCostINR: number;
  estimatedCostUSD: number;
  estimatedHours: number;
  targetMetric: string;
  passDecisionRule: string;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  outcomeVerdict?: 'PROCEED' | 'PIVOT' | 'KILL';
  actualResults?: string;
  notes?: string;
  createdAt: number;
}

export interface ProjectData {
  context: OnboardingContext;
  hypotheses: ProblemHypothesis[];
  activeHypothesisId: string | null;
  canvas: ProblemCanvas;
  research: ResearchRecord[];
  competitors: CompetitorRecord[];
  opportunityGap: OpportunityGap;
  internationalModel: InternationalModel;
  frameworks: FrameworkArtefacts;
  strengthRatings: ProblemStrengthRatings;
  viabilityRatings: OpportunityViabilityRatings;
  scores: ScoreBreakdown;
  interviews: CustomerInterviewRecord[];
  experiments: ValidationExperimentRecord[];
  history: string[]; // logged milestones
}
