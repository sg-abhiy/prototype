import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Target,
  BarChart3,
  HeartHandshake,
  Rocket,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { FrameworkArtefacts, ProjectData } from '../types/index.ts';

interface FrameworkAssessmentProps {
  project: ProjectData;
  onUpdateFrameworks: (frameworks: FrameworkArtefacts) => void;
}

export const FrameworkAssessment: React.FC<FrameworkAssessmentProps> = ({
  project,
  onUpdateFrameworks,
}) => {
  const [activeFramework, setActiveFramework] = useState<
    'design_thinking' | 'jtbd' | 'market_analysis' | 'value_prop' | 'lean_startup'
  >('design_thinking');

  const frameworks = project.frameworks;

  const updateDT = (field: keyof FrameworkArtefacts['designThinking'], val: string) => {
    onUpdateFrameworks({
      ...frameworks,
      designThinking: { ...frameworks.designThinking, [field]: val },
    });
  };

  const updateJTBD = (field: keyof FrameworkArtefacts['jobsToBeDone'], val: string) => {
    onUpdateFrameworks({
      ...frameworks,
      jobsToBeDone: { ...frameworks.jobsToBeDone, [field]: val },
    });
  };

  const updateMarket = (field: keyof FrameworkArtefacts['marketAnalysis'], val: string) => {
    onUpdateFrameworks({
      ...frameworks,
      marketAnalysis: { ...frameworks.marketAnalysis, [field]: val },
    });
  };

  const updateLean = (field: keyof FrameworkArtefacts['leanStartup'], val: any) => {
    onUpdateFrameworks({
      ...frameworks,
      leanStartup: { ...frameworks.leanStartup, [field]: val },
    });
  };

  const updateValueProp = (field: keyof FrameworkArtefacts['valueProposition'], val: any) => {
    onUpdateFrameworks({
      ...frameworks,
      valueProposition: { ...frameworks.valueProposition, [field]: val },
    });
  };

  const frameworkTabs = [
    { id: 'design_thinking', label: 'A. Design Thinking', icon: Target },
    { id: 'jtbd', label: 'B. Jobs to Be Done', icon: Layers },
    { id: 'market_analysis', label: 'C. Market Analysis', icon: BarChart3 },
    { id: 'value_prop', label: 'D. Value Proposition', icon: HeartHandshake },
    { id: 'lean_startup', label: 'E. Lean Startup', icon: Rocket },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Framework-Based Opportunity Assessment
            </h1>
            <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
              5 Entrepreneurial Lenses
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Each framework produces a usable, interactive artefact informing your validation decision.
          </p>
        </div>

        {/* Framework Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
          {frameworkTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeFramework === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveFramework(t.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* A. DESIGN THINKING */}
      {activeFramework === 'design_thinking' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" />
              Design Thinking: Empathy & Problem Reframing
            </h2>
            <p className="text-xs text-slate-400">
              Focus on observing actual human behavior in its natural context before proposing features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Problem Definition & Point of View (POV)
              </label>
              <textarea
                rows={3}
                value={frameworks.designThinking.problemDefinition}
                onChange={(e) => updateDT('problemDefinition', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                User Context & Environmental Pressures
              </label>
              <textarea
                rows={3}
                value={frameworks.designThinking.userContext}
                onChange={(e) => updateDT('userContext', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
                Summary of Direct Field Observations
              </label>
              <textarea
                rows={3}
                value={frameworks.designThinking.observationSummary}
                onChange={(e) => updateDT('observationSummary', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                Unresolved Questions & Contradictions
              </label>
              <textarea
                rows={3}
                value={frameworks.designThinking.unresolvedQuestions}
                onChange={(e) => updateDT('unresolvedQuestions', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* B. JOBS TO BE DONE */}
      {activeFramework === 'jtbd' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              Jobs to Be Done (JTBD): Progress & Triggers
            </h2>
            <p className="text-xs text-slate-400">
              Customers don’t buy products; they "hire" them to make progress in a specific struggling situation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                1. Core Functional Task
              </label>
              <textarea
                rows={2}
                value={frameworks.jobsToBeDone.mainTask}
                onChange={(e) => updateJTBD('mainTask', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                2. Trigger Moment
              </label>
              <textarea
                rows={2}
                value={frameworks.jobsToBeDone.trigger}
                onChange={(e) => updateJTBD('trigger', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                3. Desired Progress / Outcome
              </label>
              <textarea
                rows={2}
                value={frameworks.jobsToBeDone.desiredProgress}
                onChange={(e) => updateJTBD('desiredProgress', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                4. Existing Behaviour
              </label>
              <textarea
                rows={2}
                value={frameworks.jobsToBeDone.existingBehaviour}
                onChange={(e) => updateJTBD('existingBehaviour', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                5. Obstacles & Constraints
              </label>
              <textarea
                rows={2}
                value={frameworks.jobsToBeDone.constraints}
                onChange={(e) => updateJTBD('constraints', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                6. Why Current Solutions Fail
              </label>
              <textarea
                rows={2}
                value={frameworks.jobsToBeDone.reasonsCurrentFail}
                onChange={(e) => updateJTBD('reasonsCurrentFail', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* C. MARKET ANALYSIS */}
      {activeFramework === 'market_analysis' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Market & Competitive Analysis
            </h2>
            <p className="text-xs text-slate-400">
              Do not manufacture arbitrary TAM numbers. Make any required market-sizing assumptions explicit and traceable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Competitor Map Summary
              </label>
              <textarea
                rows={3}
                value={frameworks.marketAnalysis.competitorMapSummary}
                onChange={(e) => updateMarket('competitorMapSummary', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Alternative Solutions & Workarounds
              </label>
              <textarea
                rows={3}
                value={frameworks.marketAnalysis.alternativeSolutions}
                onChange={(e) => updateMarket('alternativeSolutions', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Reachable Beachhead Customer Segment
              </label>
              <textarea
                rows={3}
                value={frameworks.marketAnalysis.reachableCustomerSegment}
                onChange={(e) => updateMarket('reachableCustomerSegment', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                Market Uncertainties & Risks
              </label>
              <textarea
                rows={3}
                value={frameworks.marketAnalysis.marketUncertainties}
                onChange={(e) => updateMarket('marketUncertainties', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Explicit Bottom-Up Market Sizing Assumptions (Editable)
            </span>
            <p className="text-[11px] text-slate-400">
              State total population, realistic percentage accessible with current distribution, and estimated annual contract value:
            </p>
            <textarea
              rows={2}
              value={frameworks.marketAnalysis.explicitSizingAssumptions}
              onChange={(e) => updateMarket('explicitSizingAssumptions', e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-white"
            />
          </div>
        </div>
      )}

      {/* D. VALUE PROPOSITION DESIGN */}
      {activeFramework === 'value_prop' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-indigo-400" />
              Value Proposition Design Canvas
            </h2>
            <p className="text-xs text-slate-400">
              Map customer pains and gains directly to your proposed pain relievers and gain creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Customer Profile (Left) */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/10 p-4 space-y-3">
              <h3 className="font-bold text-blue-300 uppercase tracking-wider text-xs">
                Customer Profile
              </h3>

              <div>
                <label className="font-bold text-slate-300 text-[11px] block mb-1">
                  Customer Jobs:
                </label>
                <textarea
                  rows={2}
                  value={frameworks.valueProposition.customerJobs.join('\n')}
                  onChange={(e) =>
                    updateValueProp('customerJobs', e.target.value.split('\n').filter(Boolean))
                  }
                  placeholder="One job per line..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-rose-400 text-[11px] block mb-1">
                  Customer Pains & Frustrations:
                </label>
                <textarea
                  rows={2}
                  value={frameworks.valueProposition.pains.join('\n')}
                  onChange={(e) =>
                    updateValueProp('pains', e.target.value.split('\n').filter(Boolean))
                  }
                  placeholder="One pain per line..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-400 text-[11px] block mb-1">
                  Desired Gains & Aspirations:
                </label>
                <textarea
                  rows={2}
                  value={frameworks.valueProposition.gains.join('\n')}
                  onChange={(e) =>
                    updateValueProp('gains', e.target.value.split('\n').filter(Boolean))
                  }
                  placeholder="One gain per line..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Value Map (Right) */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/10 p-4 space-y-3">
              <h3 className="font-bold text-indigo-300 uppercase tracking-wider text-xs">
                Value Map
              </h3>

              <div>
                <label className="font-bold text-rose-400 text-[11px] block mb-1">
                  Proposed Pain Relievers:
                </label>
                <textarea
                  rows={2}
                  value={frameworks.valueProposition.painRelievers.join('\n')}
                  onChange={(e) =>
                    updateValueProp('painRelievers', e.target.value.split('\n').filter(Boolean))
                  }
                  placeholder="How specifically do you kill their pains?"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-400 text-[11px] block mb-1">
                  Proposed Gain Creators:
                </label>
                <textarea
                  rows={2}
                  value={frameworks.valueProposition.gainCreators.join('\n')}
                  onChange={(e) =>
                    updateValueProp('gainCreators', e.target.value.split('\n').filter(Boolean))
                  }
                  placeholder="What unexpected benefits do you create?"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="font-bold text-amber-400 text-[11px] block mb-1">
                  Critical Assumptions Connecting Them:
                </label>
                <textarea
                  rows={2}
                  value={frameworks.valueProposition.connectingAssumptions}
                  onChange={(e) => updateValueProp('connectingAssumptions', e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E. LEAN STARTUP */}
      {activeFramework === 'lean_startup' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Rocket className="h-4 w-4 text-indigo-400" />
              Lean Startup: Riskiest Assumption Test (RAT)
            </h2>
            <p className="text-xs text-slate-400">
              Identify the assumptions that could kill this venture, and construct the cheapest credible test.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                Riskiest Assumptions (What Must Be True For This To Work?)
              </label>
              <textarea
                rows={3}
                value={frameworks.leanStartup.riskiestAssumptions.join('\n')}
                onChange={(e) =>
                  updateLean('riskiestAssumptions', e.target.value.split('\n').filter(Boolean))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
                Cheapest Credible Validation Experiments
              </label>
              <textarea
                rows={3}
                value={frameworks.leanStartup.cheapestCredibleExperiments.join('\n')}
                onChange={(e) =>
                  updateLean(
                    'cheapestCredibleExperiments',
                    e.target.value.split('\n').filter(Boolean)
                  )
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                Observable Measurable Outcomes (Pass/Fail)
              </label>
              <textarea
                rows={3}
                value={frameworks.leanStartup.observableOutcomes.join('\n')}
                onChange={(e) =>
                  updateLean('observableOutcomes', e.target.value.split('\n').filter(Boolean))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                Explicit Decision Rule for Proceeding vs Pivoting
              </label>
              <textarea
                rows={3}
                value={frameworks.leanStartup.decisionRule}
                onChange={(e) => updateLean('decisionRule', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
