import React, { useState } from 'react';
import { X, Check, Sparkles, Clock, Globe, Users, ShieldAlert, Award } from 'lucide-react';
import { OnboardingContext, ProductMode, UserObjective } from '../types/index.ts';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: OnboardingContext;
  onSave: (updated: OnboardingContext) => void;
  isNewProject?: boolean;
}

const AUDIENCE_SUGGESTIONS = [
  'College students & recent graduates',
  'Kirana store owners & neighborhood retailers',
  'Job seekers & career switchers',
  'Working software engineers & developers',
  'Independent freelancers & digital contractors',
  'Small business owners & micro-manufacturers',
  'Farmers & agricultural input buyers',
  'District hospital patients & rural caregivers',
  'School teachers & coaching tutors',
  'Civic volunteers & neighborhood residents',
];

const DOMAIN_OPTIONS = [
  'Education',
  'Employment and careers',
  'Finance and payments',
  'Retail and commerce',
  'Small-business operations',
  'Agriculture',
  'Consumer protection',
  'Public services',
  'Healthcare administration',
  'Logistics and transport',
  'Productivity and devtools',
  'Energy and sustainability',
  'Digital safety and cyber',
  'Other',
];

const GEOGRAPHY_OPTIONS = [
  'India — Tier 2 & Tier 3 Cities',
  'India — Metro (Bengaluru, NCR, Mumbai)',
  'India — Rural and semi-urban',
  'Global / Remote',
  'Southeast Asia',
  'United States / North America',
  'Custom community or district',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  context,
  onSave,
  isNewProject = false,
}) => {
  const [formData, setFormData] = useState<OnboardingContext>({ ...context });
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const handleModeChange = (mode: ProductMode) => {
    let objective: UserObjective = 'scratch';
    if (mode === 'evaluate') objective = 'evaluate_idea';
    if (mode === 'market_gap') objective = 'market_gap';
    if (mode === 'hackathon') objective = 'hackathon';

    setFormData((prev) => ({
      ...prev,
      mode,
      objective,
      constraints: {
        ...prev.constraints,
        projectGoal: mode === 'hackathon' ? 'hackathon' : prev.constraints.projectGoal,
      },
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      updatedAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isNewProject ? 'Configure Project Context' : 'Project Settings & Builder Constraints'}
            </h2>
            <p className="text-xs text-slate-400">
              Tailor discovery and feasibility metrics to your real-world team constraints.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step navigation tabs */}
        <div className="my-4 flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveStep(1)}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeStep === 1
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            1. Mode & Focus
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeStep === 2
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            2. Audience & Market
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeStep === 3
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            3. Builder Constraints
          </button>
          {formData.mode === 'hackathon' && (
            <button
              onClick={() => setActiveStep(4)}
              className={`rounded-lg px-3 py-1.5 transition ${
                activeStep === 4
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-400 hover:bg-slate-800'
              }`}
            >
              4. Hackathon Rules
            </button>
          )}
        </div>

        {/* Step 1: Mode & Focus */}
        {activeStep === 1 && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g. KiranaCredit or CivicTrack"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Discovery Mode
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[
                  {
                    id: 'discover' as ProductMode,
                    title: 'A. Discover a Problem',
                    desc: 'For builders without a fixed idea who want to uncover genuine unaddressed pains.',
                    badge: 'Explore',
                    border: 'border-emerald-500/40',
                  },
                  {
                    id: 'evaluate' as ProductMode,
                    title: 'B. Evaluate My Idea',
                    desc: 'For users who already have a proposed concept and want to pressure-test it.',
                    badge: 'Stress Test',
                    border: 'border-blue-500/40',
                  },
                  {
                    id: 'market_gap' as ProductMode,
                    title: 'C. Research Market Gap',
                    desc: 'Study an incumbent sector or foreign business model and identify unmet local needs.',
                    badge: 'Gap Analysis',
                    border: 'border-purple-500/40',
                  },
                  {
                    id: 'hackathon' as ProductMode,
                    title: 'D. Hackathon Sprint',
                    desc: 'Identify a sharp, feasible problem and build a demonstrable prototype within 36-48h.',
                    badge: 'Time-Boxed',
                    border: 'border-amber-500/40',
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeChange(m.id)}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      formData.mode === m.id
                        ? `${m.border} bg-slate-800/90 shadow-md`
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{m.title}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                        {m.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Specific Objective
              </label>
              <select
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value as UserObjective })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="scratch">Find an unaddressed problem from scratch</option>
                <option value="evaluate_idea">Evaluate an existing startup or product idea</option>
                <option value="market_gap">Find an unmet gap in an existing competitive market</option>
                <option value="international_model">Adapt an international business model to India / local market</option>
                <option value="hackathon">Choose a winning, demonstrable hackathon project</option>
                <option value="social_impact">Explore a high-stakes social impact or public interest problem</option>
                <option value="specific_customer">Investigate an opportunity for a specific target audience</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Audience & Market */}
        {activeStep === 2 && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g. Kirana store owners or College students"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {AUDIENCE_SUGGESTIONS.slice(0, 6).map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetAudience: aud })}
                    className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-400 hover:border-indigo-500 hover:text-indigo-300 transition"
                  >
                    + {aud}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Target Geography
                </label>
                <select
                  value={formData.geography}
                  onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {GEOGRAPHY_OPTIONS.map((geo) => (
                    <option key={geo} value={geo}>
                      {geo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Industry / Domain
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Initial Observation or Concept Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.initialDescription || ''}
                onChange={(e) => setFormData({ ...formData, initialDescription: e.target.value })}
                placeholder="What prompted this exploration? e.g. 'I noticed my uncle spends 1 hour every evening tallying credit registers and arguing with neighbors.'"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Builder Constraints */}
        {activeStep === 3 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.constraints.teamSize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: { ...formData.constraints, teamSize: parseInt(e.target.value) || 1 },
                    })
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Hours/Week
                </label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={formData.constraints.availableHoursPerWeek}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        availableHoursPerWeek: parseInt(e.target.value) || 10,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Budget (INR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={formData.constraints.budgetINR}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: { ...formData.constraints, budgetINR: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Project Goal
                </label>
                <select
                  value={formData.constraints.projectGoal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        projectGoal: e.target.value as any,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-white"
                >
                  <option value="business">Commercial Startup</option>
                  <option value="hackathon">Hackathon Project</option>
                  <option value="social_impact">Social Impact</option>
                  <option value="portfolio">Portfolio Project</option>
                  <option value="learning">Skill Learning</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Access to Target Users
              </label>
              <select
                value={formData.constraints.accessToPotentialUsers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      accessToPotentialUsers: e.target.value as any,
                    },
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                <option value="direct_daily">Direct Daily Access (Family, classmates, daily routine)</option>
                <option value="indirect_network">Indirect Network (Friends of friends, campus clubs)</option>
                <option value="cold_reach_only">Cold Reach Only (Social media, store walk-ups)</option>
                <option value="no_existing_access">No Existing Access (Highly isolated persona)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.constraints.canCollectInterviews}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        canCollectInterviews: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Can do in-person / call interviews</span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.constraints.canContactBusinesses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        canContactBusinesses: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Can visit/cold-call local shops</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Hackathon Rules (Conditional) */}
        {activeStep === 4 && formData.mode === 'hackathon' && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Submission Deadline (Hours)
                </label>
                <input
                  type="number"
                  min={6}
                  max={120}
                  value={formData.constraints.hackathonDeadlineHours || 36}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        hackathonDeadlineHours: parseInt(e.target.value) || 36,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Challenge Theme / Track
                </label>
                <input
                  type="text"
                  value={formData.constraints.hackathonTheme || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      constraints: {
                        ...formData.constraints,
                        hackathonTheme: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. AI for Public Welfare, FinTech Inclusion"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Judging Criteria Emphasized
              </label>
              <input
                type="text"
                value={(formData.constraints.hackathonJudgingCriteria || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints: {
                      ...formData.constraints,
                      hackathonJudgingCriteria: e.target.value.split(',').map((s) => s.trim()),
                    },
                  })
                }
                placeholder="Practicality, Feasibility, Working Prototype, Innovation"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Previous
              </button>
            )}
            {activeStep < (formData.mode === 'hackathon' ? 4 : 3) && (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Next
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
            >
              <Check className="h-4 w-4" />
              Save Context
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
