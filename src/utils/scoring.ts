import {
  ProblemStrengthRatings,
  OpportunityViabilityRatings,
  ResearchRecord,
  CustomerInterviewRecord,
  ScoreBreakdown,
  ViabilityProfile,
} from '../types/index.ts';

/**
 * Calculates Problem Strength (0-100)
 * Severity (25%), Frequency (15%), Cost/Impact (20%), Workaround Effort (15%), Dissatisfaction (15%), Urgency (10%)
 */
export function calculateProblemStrength(ratings: ProblemStrengthRatings): number {
  const clamp5 = (val: number) => Math.max(1, Math.min(5, val || 1));

  const weights = {
    severity: 0.25,
    frequency: 0.15,
    costImpact: 0.2,
    workaroundEffort: 0.15,
    dissatisfaction: 0.15,
    urgency: 0.1,
  };

  const score =
    (clamp5(ratings.severityRating) / 5) * weights.severity * 100 +
    (clamp5(ratings.frequencyRating) / 5) * weights.frequency * 100 +
    (clamp5(ratings.costImpactRating) / 5) * weights.costImpact * 100 +
    (clamp5(ratings.workaroundEffortRating) / 5) * weights.workaroundEffort * 100 +
    (clamp5(ratings.dissatisfactionRating) / 5) * weights.dissatisfaction * 100 +
    (clamp5(ratings.urgencyRating) / 5) * weights.urgency * 100;

  return Math.round(score);
}

/**
 * Calculates Opportunity Viability (0-100)
 * Weighted according to the chosen assessment profile.
 */
export function calculateOpportunityViability(ratings: OpportunityViabilityRatings): number {
  const clamp5 = (val: number) => Math.max(1, Math.min(5, val || 1));

  const profileWeights: Record<
    ViabilityProfile,
    {
      reachable: number;
      wtp: number;
      diff: number;
      mvp: number;
      acq: number;
      repeat: number;
    }
  > = {
    commercial: {
      reachable: 0.15,
      wtp: 0.2,
      diff: 0.2,
      mvp: 0.2,
      acq: 0.15,
      repeat: 0.1,
    },
    hackathon: {
      reachable: 0.1,
      wtp: 0.1,
      diff: 0.25,
      mvp: 0.35, // High weight on MVP feasibility within deadline
      acq: 0.1,
      repeat: 0.1,
    },
    social_impact: {
      reachable: 0.25, // Large population benefit
      wtp: 0.15, // Adoption & systemic buy-in
      diff: 0.15,
      mvp: 0.2,
      acq: 0.15,
      repeat: 0.1,
    },
    education: {
      reachable: 0.1,
      wtp: 0.1,
      diff: 0.2,
      mvp: 0.3,
      acq: 0.1,
      repeat: 0.2,
    },
  };

  const w = profileWeights[ratings.profile] || profileWeights.commercial;

  const score =
    (clamp5(ratings.reachableCustomersRating) / 5) * w.reachable * 100 +
    (clamp5(ratings.willingnessToPayRating) / 5) * w.wtp * 100 +
    (clamp5(ratings.differentiationRating) / 5) * w.diff * 100 +
    (clamp5(ratings.mvpFeasibilityRating) / 5) * w.mvp * 100 +
    (clamp5(ratings.userAcquisitionRating) / 5) * w.acq * 100 +
    (clamp5(ratings.repeatValueRating) / 5) * w.repeat * 100;

  return Math.round(score);
}

/**
 * Calculates Evidence Confidence (0-100)
 * Based on concrete verification: sources, actual user interviews, and penalized for contradictions and blind assumptions.
 */
export function calculateEvidenceConfidence(
  research: ResearchRecord[],
  interviews: CustomerInterviewRecord[],
  assumedFactorCount = 0
): number {
  let score = 10; // Base floor

  const verifiedSources = research.filter(
    (r) => r.classification === 'VERIFIED SOURCE CLAIM'
  ).length;
  const directObservations = research.filter(
    (r) => r.classification === 'DIRECT USER OBSERVATION'
  ).length;
  const userClaims = research.filter(
    (r) => r.classification === 'USER-SUPPLIED CLAIM'
  ).length;
  const hypotheses = research.filter(
    (r) => r.classification === 'RESEARCH HYPOTHESIS'
  ).length;
  const contradictions = research.filter(
    (r) => r.classification === 'CONTRADICTED'
  ).length;

  const completedInterviews = interviews.length;

  // Add points for verified sources (capped at 35)
  score += Math.min(35, verifiedSources * 10);

  // Add points for direct interviews & observations (capped at 45)
  score += Math.min(45, (directObservations * 8) + (completedInterviews * 15));

  // Small credit for user-supplied items if balanced
  score += Math.min(10, userClaims * 2);

  // Penalty for high unverified hypotheses ratio
  if (hypotheses > (verifiedSources + directObservations + completedInterviews) && hypotheses > 2) {
    score -= 8;
  }

  // Heavy penalty for contradicted evidence (-15 per contradiction)
  score -= contradictions * 15;

  // Penalty for blind assumptions in problem scoring
  if (assumedFactorCount >= 4) {
    score -= 15;
  } else if (assumedFactorCount >= 2) {
    score -= 8;
  }

  return Math.max(5, Math.min(100, Math.round(score)));
}

/**
 * Calculates Final Transparent Recommendation
 */
export function evaluateProjectScores(
  problemStrength: number,
  viability: number,
  evidence: number,
  profile: ViabilityProfile = 'commercial'
): ScoreBreakdown {
  let verdict: ScoreBreakdown['verdict'] = 'INVESTIGATE_FURTHER';
  let verdictTitle = '';
  let verdictDescription = '';
  let verdictAction = '';

  if (evidence < 30) {
    verdict = 'INVESTIGATE_FURTHER';
    verdictTitle = 'High Assumption Risk — Verify Before Building';
    verdictDescription =
      'You have formulated an interesting problem hypothesis, but confidence is low because most data is unverified or assumed. Building software now risks solving a non-existent pain.';
    verdictAction =
      'Conduct 3-5 Mom Test interviews with actual target users and log verified research before writing any code.';
  } else if (problemStrength < 45) {
    verdict = 'PIVOT_PROBLEM';
    verdictTitle = 'Weak Problem Pain — Consider Pivoting';
    verdictDescription =
      'The current workarounds are acceptable or the consequence of failure is negligible. Users will rarely switch away from spreadsheets or "doing nothing" for a minor annoyance.';
    verdictAction =
      'Look for a higher-stakes customer segment where this failure creates urgent financial, legal, or emotional loss.';
  } else if (viability < 45) {
    if (profile === 'hackathon') {
      verdict = 'PIVOT_PROBLEM';
      verdictTitle = 'Prototype Feasibility Risk for Hackathon';
      verdictDescription =
        'The scope is too broad or depends on complex third-party dependencies that cannot be built and demonstrated reliably before the submission deadline.';
      verdictAction =
        'Scope down to 1 killer user journey with a working demo instead of an ambitious platform.';
    } else {
      verdict = 'INVESTIGATE_FURTHER';
      verdictTitle = 'Distribution or Monitization Bottleneck';
      verdictDescription =
        'The problem is real, but either target customers are hard to reach, willingness to pay is dubious, or incumbents can easily duplicate the workflow.';
      verdictAction =
        'Test a pre-order, LOI (letter of intent), or manual concierge service to prove adoption commitment.';
    }
  } else if (problemStrength >= 65 && viability >= 60 && evidence >= 50) {
    verdict = 'PROCEED_EXPERIMENT';
    verdictTitle = 'Ready for First Validation Experiment';
    verdictDescription =
      'High problem intensity with substantiated evidence and realistic build feasibility. You are ready to run a low-cost, high-signal validation experiment.';
    verdictAction =
      'Deploy a Concierge MVP or Smoke-Test Landing Page to observe actual user signups and payment intent.';
  } else {
    verdict = 'INVESTIGATE_FURTHER';
    verdictTitle = 'Promising Opportunity — Solidify Evidence';
    verdictDescription =
      'The opportunity shows solid initial promise across severity and viability, but a few key assumptions must be pressure-tested.';
    verdictAction =
      'Test your riskiest assumption using one of the recommended low-cost experiments.';
  }

  return {
    problemStrength,
    opportunityViability: viability,
    evidenceConfidence: evidence,
    verdict,
    verdictTitle,
    verdictDescription,
    verdictAction,
    calculatedAt: Date.now(),
  };
}
