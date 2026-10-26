import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Award,
  Zap,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  ProjectData,
  ProblemStrengthRatings,
  OpportunityViabilityRatings,
  ViabilityProfile,
} from '../types/index.ts';
import {
  calculateProblemStrength,
  calculateOpportunityViability,
  calculateEvidenceConfidence,
  evaluateProjectScores,
} from '../utils/scoring.ts';

interface ScoringDashboardProps {
  project: ProjectData;
  onUpdateRatings: (
    strength: ProblemStrengthRatings,
    viability: OpportunityViabilityRatings
  ) => void;
}

export const ScoringDashboard: React.FC<ScoringDashboardProps> = ({
  project,
  onUpdateRatings,
}) => {
  const strength = project.strengthRatings;
  const viability = project.viabilityRatings;

  // Calculate scores dynamically
  const strengthScore = calculateProblemStrength(strength);
  const viabilityScore = calculateOpportunityViability(viability);

  // Count assumed factors in strength
  const assumedCount = Object.values(strength.isAssumed).filter(Boolean).length;
  const evidenceScore = calculateEvidenceConfidence(
    project.research,
    project.interviews,
    assumedCount
  );

  const scoreBreakdown = evaluateProjectScores(
    strengthScore,
    viabilityScore,
    evidenceScore,
    viability.profile
  );

  const handleStrengthRatingChange = (field: keyof ProblemStrengthRatings, value: number) => {
    const updated: ProblemStrengthRatings = {
      ...strength,
      [field]: value,
    };
    onUpdateRatings(updated, viability);
  };

  const handleStrengthExplanationChange = (field: string, text: string) => {
    const updated: ProblemStrengthRatings = {
      ...strength,
      explanations: {
        ...strength.explanations,
        [field]: text,
      },
    };
    onUpdateRatings(updated, viability);
  };

  const toggleStrengthAssumed = (field: string) => {
    const updated: ProblemStrengthRatings = {
      ...strength,
      isAssumed: {
        ...strength.isAssumed,
        [field]: !(strength.isAssumed as any)[field],
      },
    };
    onUpdateRatings(updated, viability);
  };

  const handleViabilityRatingChange = (field: keyof OpportunityViabilityRatings, value: number) => {
    const updated: OpportunityViabilityRatings = {
      ...viability,
      [field]: value,
    };
    onUpdateRatings(strength, updated);
  };

  const handleProfileChange = (profile: ViabilityProfile) => {
    const updated: OpportunityViabilityRatings = {
      ...viability,
      profile,
    };
    onUpdateRatings(strength, updated);
  };

  const verdictColors: Record<
    typeof scoreBreakdown.verdict,
    { border: string; bg: string; text: string; badge: string }
  > = {
    PROCEED_EXPERIMENT: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/30',
      text: 'text-emerald-300',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    INVESTIGATE_FURTHER: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/30',
      text: 'text-amber-300',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    PIVOT_PROBLEM: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/30',
      text: 'text-rose-300',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    ABANDON: {
      border: 'border-slate-700',
      bg: 'bg-slate-900',
      text: 'text-slate-400',
      badge: 'bg-slate-800 text-slate-400 border-slate-700',
    },
  };

  const currentVerdictStyle = verdictColors[scoreBreakdown.verdict];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Banner & Transparent Principles */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Transparent Three-Part Scoring System
              </h1>
              <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
                Traceable Math
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl">
              No black-box "AI Startup Success Score". Every metric is separated into Problem Strength, Opportunity Viability, and Evidence Confidence.
            </p>
          </div>

          {/* Profile Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 pl-1.5">Profile:</span>
            {[
              { id: 'commercial', label: 'Commercial' },
              { id: 'hackathon', label: 'Hackathon Sprint' },
              { id: 'social_impact', label: 'Social Impact' },
              { id: 'education', label: 'Learning' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleProfileChange(p.id as ViabilityProfile)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  viability.profile === p.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Recommendation Banner */}
      <div
        className={`rounded-2xl border p-5 shadow-xl transition ${currentVerdictStyle.border} ${currentVerdictStyle.bg}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`rounded border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${currentVerdictStyle.badge}`}
              >
                Decision Rule: {scoreBreakdown.verdict.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-medium">Traceable Recommendation</span>
            </div>
            <h2 className="text-lg font-bold text-white">{scoreBreakdown.verdictTitle}</h2>
            <p className="mt-1 text-xs text-slate-300 max-w-3xl leading-relaxed">
              {scoreBreakdown.verdictDescription}
            </p>
          </div>

          <div className="shrink-0 rounded-xl bg-slate-950/80 border border-slate-800 p-3 max-w-md">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
              Mandatory Next Action:
            </span>
            <p className="text-xs text-slate-200 font-semibold">{scoreBreakdown.verdictAction}</p>
          </div>
        </div>
      </div>

      {/* 3 Core Metric Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Problem Strength */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              A. Problem Strength
            </span>
            <span className="text-xs font-semibold text-indigo-400">0–100 Scale</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{strengthScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${strengthScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Measures intrinsic pain intensity: severity, frequency, direct financial/time loss, and dissatisfaction with current workarounds.
          </p>
        </div>

        {/* Metric 2: Opportunity Viability */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              B. Opportunity Viability
            </span>
            <span className="text-xs font-semibold text-indigo-400">
              {viability.profile.toUpperCase()}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{viabilityScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${viabilityScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Measures venture feasibility: customer reachability, willingness-to-pay signals, differentiation defensibility, and MVP build speed.
          </p>
        </div>

        {/* Metric 3: Evidence Confidence */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              C. Evidence Confidence
            </span>
            <span className="text-xs font-semibold text-indigo-400">Audit Status</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{evidenceScore}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${evidenceScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Ground truth check: {project.research.filter((r) => r.classification === 'VERIFIED SOURCE CLAIM').length} verified sources, {project.interviews.length} customer interviews, {assumedCount} assumed factors.
          </p>
        </div>
      </div>

      {/* Part A: Problem Strength Factor Sliders (Transparent 6 Factors) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              Part A: Problem Strength Breakdown (Weights Total 100%)
            </h2>
            <p className="text-xs text-slate-400">
              Adjust ratings from 1 to 5. Check "Assumed" if you lack direct customer proof for a factor.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-300">
            Current Score: {strengthScore}/100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {[
            {
              field: 'severityRating' as keyof ProblemStrengthRatings,
              key: 'severity',
              label: '1. Severity of Consequences (Weight: 25%)',
              desc: 'How damaging is failure? (1 = Negligible inconvenience, 5 = Severe financial or legal hazard)',
              rating: strength.severityRating,
              explanation: strength.explanations.severity,
              isAssumed: strength.isAssumed.severity,
            },
            {
              field: 'frequencyRating' as keyof ProblemStrengthRatings,
              key: 'frequency',
              label: '2. Frequency of Occurrence (Weight: 15%)',
              desc: 'How often does this happen? (1 = Once a year, 5 = Daily or weekly habit)',
              rating: strength.frequencyRating,
              explanation: strength.explanations.frequency,
              isAssumed: strength.isAssumed.frequency,
            },
            {
              field: 'costImpactRating' as keyof ProblemStrengthRatings,
              key: 'costImpact',
              label: '3. Cost or Impact of Problem (Weight: 20%)',
              desc: 'Direct or indirect money/time lost. If money is unmeasurable, explain impact in note.',
              rating: strength.costImpactRating,
              explanation: strength.explanations.costImpact,
              isAssumed: strength.isAssumed.costImpact,
            },
            {
              field: 'workaroundEffortRating' as keyof ProblemStrengthRatings,
              key: 'workaroundEffort',
              label: '4. Effort Required by Workarounds (Weight: 15%)',
              desc: 'How painful are current spreadsheets, physical paper, or manual calls?',
              rating: strength.workaroundEffortRating,
              explanation: strength.explanations.workaroundEffort,
              isAssumed: strength.isAssumed.workaroundEffort,
            },
            {
              field: 'dissatisfactionRating' as keyof ProblemStrengthRatings,
              key: 'dissatisfaction',
              label: '5. Dissatisfaction with Alternatives (Weight: 15%)',
              desc: 'Are customers actively frustrated with existing software or workarounds?',
              rating: strength.dissatisfactionRating,
              explanation: strength.explanations.dissatisfaction,
              isAssumed: strength.isAssumed.dissatisfaction,
            },
            {
              field: 'urgencyRating' as keyof ProblemStrengthRatings,
              key: 'urgency',
              label: '6. Urgency of Resolution (Weight: 10%)',
              desc: 'Do users need this fixed immediately, or can they delay indefinitely?',
              rating: strength.urgencyRating,
              explanation: strength.explanations.urgency,
              isAssumed: strength.isAssumed.urgency,
            },
          ].map((item) => (
            <div
              key={item.key}
              className={`rounded-xl border p-4 space-y-2.5 transition ${
                item.isAssumed
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-white">{item.label}</span>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-extrabold text-indigo-400">{item.rating}</span>
                  <span className="text-[10px] text-slate-500">/5</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={item.rating}
                onChange={(e) =>
                  handleStrengthRatingChange(item.field, parseInt(e.target.value))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />

              {/* Explanation & Assumed Toggle */}
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={item.explanation}
                  onChange={(e) => handleStrengthExplanationChange(item.key, e.target.value)}
                  placeholder="Supporting rationale or evidence reference..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />

                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-400">
                  <input
                    type="checkbox"
                    checked={item.isAssumed}
                    onChange={() => toggleStrengthAssumed(item.key)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>
                    Currently an assumption (needs interview verification)
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part B: Opportunity Viability Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Part B: Opportunity Viability Breakdown ({viability.profile.toUpperCase()} Profile)
            </h2>
            <p className="text-xs text-slate-400">
              Weights automatically recalibrated for{' '}
              {viability.profile === 'hackathon'
                ? 'speed of demonstrable MVP prototype'
                : viability.profile === 'social_impact'
                ? 'beneficiary reach and systemic adoption'
                : 'commercial unit economics and distribution'}.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-300">
            Current Score: {viabilityScore}/100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            {
              field: 'reachableCustomersRating' as keyof OpportunityViabilityRatings,
              label: '1. Reachable Target Customers',
              desc: 'Can your team realistically access this audience without massive ad spend?',
              rating: viability.reachableCustomersRating,
            },
            {
              field: 'willingnessToPayRating' as keyof OpportunityViabilityRatings,
              label: '2. Willingness-to-Pay / Adoption Intent',
              desc: 'Will users pay or commit significant time to adopt?',
              rating: viability.willingnessToPayRating,
            },
            {
              field: 'differentiationRating' as keyof OpportunityViabilityRatings,
              label: '3. Differentiation Defensibility',
              desc: 'Can incumbents easily copy this, or do you have a structural angle?',
              rating: viability.differentiationRating,
            },
            {
              field: 'mvpFeasibilityRating' as keyof OpportunityViabilityRatings,
              label: '4. MVP Build Feasibility',
              desc: 'Can your team build a demonstrable test version within your constraints?',
              rating: viability.mvpFeasibilityRating,
            },
            {
              field: 'userAcquisitionRating' as keyof OpportunityViabilityRatings,
              label: '5. Organic Acquisition Ease',
              desc: 'Can word of mouth, campus channels, or local referrals drive users?',
              rating: viability.userAcquisitionRating,
            },
            {
              field: 'repeatValueRating' as keyof OpportunityViabilityRatings,
              label: '6. Repeat Value / Retention',
              desc: 'Will users return weekly, or is it a one-time utility?',
              rating: viability.repeatValueRating,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-200">{item.label}</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {item.rating}/5
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{item.desc}</p>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={item.rating}
                onChange={(e) =>
                  handleViabilityRatingChange(item.field, parseInt(e.target.value))
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
