import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProblemStrength,
  calculateOpportunityViability,
  calculateEvidenceConfidence,
  evaluateProjectScores,
} from './scoring.ts';
import { analyzeProblemStatement } from './heuristics.ts';
import {
  ProblemStrengthRatings,
  OpportunityViabilityRatings,
  ResearchRecord,
  CustomerInterviewRecord,
} from '../types/index.ts';

test('calculateProblemStrength returns 20 on minimum ratings (all 1s)', () => {
  const minRatings: ProblemStrengthRatings = {
    severityRating: 1,
    frequencyRating: 1,
    costImpactRating: 1,
    workaroundEffortRating: 1,
    dissatisfactionRating: 1,
    urgencyRating: 1,
    explanations: {
      severity: '',
      frequency: '',
      costImpact: '',
      workaroundEffort: '',
      dissatisfaction: '',
      urgency: '',
    },
    isAssumed: {
      severity: false,
      frequency: false,
      costImpact: false,
      workaroundEffort: false,
      dissatisfaction: false,
      urgency: false,
    },
  };

  assert.equal(calculateProblemStrength(minRatings), 20);
});

test('calculateProblemStrength returns 100 on maximum ratings (all 5s)', () => {
  const maxRatings: ProblemStrengthRatings = {
    severityRating: 5,
    frequencyRating: 5,
    costImpactRating: 5,
    workaroundEffortRating: 5,
    dissatisfactionRating: 5,
    urgencyRating: 5,
    explanations: {
      severity: '',
      frequency: '',
      costImpact: '',
      workaroundEffort: '',
      dissatisfaction: '',
      urgency: '',
    },
    isAssumed: {
      severity: false,
      frequency: false,
      costImpact: false,
      workaroundEffort: false,
      dissatisfaction: false,
      urgency: false,
    },
  };

  assert.equal(calculateProblemStrength(maxRatings), 100);
});

test('calculateOpportunityViability prioritizes MVP feasibility in hackathon mode', () => {
  const hackathonRatings: OpportunityViabilityRatings = {
    reachableCustomersRating: 2,
    willingnessToPayRating: 2,
    differentiationRating: 5,
    mvpFeasibilityRating: 5, // Heavy 35% weight
    userAcquisitionRating: 2,
    repeatValueRating: 2,
    profile: 'hackathon',
    explanations: {
      reachableCustomers: '',
      willingnessToPay: '',
      differentiation: '',
      mvpFeasibility: '',
      userAcquisition: '',
      repeatValue: '',
    },
  };

  const commercialRatings: OpportunityViabilityRatings = {
    ...hackathonRatings,
    profile: 'commercial',
  };

  const hackathonScore = calculateOpportunityViability(hackathonRatings);
  const commercialScore = calculateOpportunityViability(commercialRatings);

  // In hackathon mode, high differentiation + MVP feasibility yields higher score than in commercial mode
  assert.ok(hackathonScore > commercialScore);
});

test('calculateEvidenceConfidence penalizes contradictions and rewards user interviews', () => {
  const emptyResearch: ResearchRecord[] = [];
  const emptyInterviews: CustomerInterviewRecord[] = [];

  const baseScore = calculateEvidenceConfidence(emptyResearch, emptyInterviews, 0);
  assert.equal(baseScore, 10);

  const researchWithVerified: ResearchRecord[] = [
    {
      id: 'r1',
      problemId: 'p1',
      title: 'RBI Report',
      accessDate: '2026-10-26',
      excerpt: 'Over 80% micro-retailers extend informal credit',
      classification: 'VERIFIED SOURCE CLAIM',
      specificClaimSupported: 'Market credit frequency',
      tags: [],
      createdAt: Date.now(),
    },
  ];

  const interviews: CustomerInterviewRecord[] = [
    {
      id: 'i1',
      problemId: 'p1',
      intervieweeNameOrPseudonym: 'Ramesh Store',
      segmentOrRole: 'Kirana Owner',
      interviewDate: '2026-10-25',
      channel: 'in_person',
      pastBehaviorObserved: 'Showed bahi-khata ledger with ₹22k overdue',
      actualMoneyOrTimeSpent: 'Lost ₹18,000 bad debt in 2025',
      currentWorkaroundUsed: 'Notebook and chalk',
      failedPriorAttempts: 'Tried Khatabook but forgot to input every day',
      keyDirectQuotes: ['Customers get angry if I send automatic SMS'],
      takeaways: 'Needs gentle WhatsApp balance check',
      classificationAssigned: 'DIRECT USER OBSERVATION',
      createdAt: Date.now(),
    },
  ];

  const verifiedScore = calculateEvidenceConfidence(researchWithVerified, interviews, 0);
  assert.ok(verifiedScore >= 35);

  // Add contradiction
  const contradictedResearch: ResearchRecord[] = [
    ...researchWithVerified,
    {
      id: 'r2',
      problemId: 'p1',
      title: 'Local Survey',
      accessDate: '2026-10-26',
      excerpt: 'Store owners refuse to share phone numbers with software',
      classification: 'CONTRADICTED',
      specificClaimSupported: 'SMS adoption',
      tags: [],
      createdAt: Date.now(),
    },
  ];

  const penalizedScore = calculateEvidenceConfidence(contradictedResearch, interviews, 0);
  assert.ok(penalizedScore < verifiedScore);
});

test('evaluateProjectScores marks high-assumption projects as INVESTIGATE_FURTHER', () => {
  // High problem strength and viability, but very low evidence
  const result = evaluateProjectScores(85, 80, 15, 'commercial');
  assert.equal(result.verdict, 'INVESTIGATE_FURTHER');
  assert.match(result.verdictTitle, /High Assumption Risk/);
});

test('evaluateProjectScores marks solid verified opportunities as PROCEED_EXPERIMENT', () => {
  const result = evaluateProjectScores(80, 75, 65, 'commercial');
  assert.equal(result.verdict, 'PROCEED_EXPERIMENT');
  assert.match(result.verdictTitle, /Ready for First Validation Experiment/);
});

test('analyzeProblemStatement detects solution-bias correctly', () => {
  const biasedStatement = 'College students need an AI app to find internships.';
  const diagnostic = analyzeProblemStatement(biasedStatement);
  assert.equal(diagnostic.isSolutionBiased, true);
  assert.ok(diagnostic.score < 50);

  const wellFormedStatement =
    'College students in tier-2 engineering colleges struggle to pass automated ATS filters because resumes lack pedigree brand signals, resulting in 80% rejection before technical review. Current workaround is mass applying on LinkedIn, which fails due to credential noise.';
  const wellFormedDiag = analyzeProblemStatement(
    wellFormedStatement,
    'College students',
    'Off-campus placements',
    'Pass ATS filters'
  );
  assert.equal(wellFormedDiag.isSolutionBiased, false);
  assert.ok(wellFormedDiag.score >= 80);
});
