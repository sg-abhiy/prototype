import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  IndianRupee,
  DollarSign,
  TrendingUp,
  Tag,
  FileCheck,
} from 'lucide-react';
import { ValidationExperimentRecord, ProjectData } from '../types/index.ts';
import { VALIDATION_EXPERIMENT_PRESETS } from '../utils/templates.ts';

interface ExperimentEngineProps {
  project: ProjectData;
  onUpdateExperiments: (experiments: ValidationExperimentRecord[]) => void;
}

export const ExperimentEngine: React.FC<ExperimentEngineProps> = ({
  project,
  onUpdateExperiments,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ValidationExperimentRecord['type']>('concierge_manual_service');
  const [hypothesisToTest, setHypothesisToTest] = useState('');
  const [description, setDescription] = useState('');
  const [costINR, setCostINR] = useState(200);
  const [costUSD, setCostUSD] = useState(3);
  const [hours, setHours] = useState(6);
  const [targetMetric, setTargetMetric] = useState('');
  const [passRule, setPassRule] = useState('');
  const [status, setStatus] = useState<ValidationExperimentRecord['status']>('draft');
  const [outcomeVerdict, setOutcomeVerdict] = useState<ValidationExperimentRecord['outcomeVerdict'] | undefined>(undefined);
  const [actualResults, setActualResults] = useState('');

  const activeHypothesis = project.hypotheses.find(
    (h) => h.id === project.activeHypothesisId
  ) || project.hypotheses[0];

  const experimentTypeLabels: Record<
    ValidationExperimentRecord['type'],
    { label: string; desc: string; badge: string; color: string }
  > = {
    concierge_manual_service: {
      label: 'Concierge MVP (Manual Service)',
      desc: 'Deliver value manually to 5-10 users before writing any automated backend code.',
      badge: 'Zero-Code',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    landing_page_smoke_test: {
      label: 'Smoke-Test Landing Page',
      desc: '1-page site with a value prop and "Request Access" button to measure click intent.',
      badge: 'Demand Signal',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
    wizard_of_oz: {
      label: 'Wizard of Oz Test',
      desc: 'Frontend appears automated, but your team acts as the "algorithm" manually.',
      badge: 'Fast Demo',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
    cold_outreach_script: {
      label: 'Mom Test Cold Outreach',
      desc: 'Direct calls or walk-ups to test past customer behaviors and current workarounds.',
      badge: 'Qualitative',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    paper_prototype_test: {
      label: 'Paper Prototype Walk-up',
      desc: 'Print physical cards, slips, or wireframes to test customer usability in 2 hours.',
      badge: 'Ultra Low Cost',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    },
    preorder_or_loi: {
      label: 'Pre-Order / Letter of Intent (LOI)',
      desc: 'Ask business owners to sign a non-binding intent or ₹100 deposit.',
      badge: 'Commitment',
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
    community_poll: {
      label: 'Community / Forum Deep Dive',
      desc: 'Post in Reddit/X/college groups to measure discussion volume and frustration.',
      badge: 'Exploratory',
      color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    },
  };

  const handleApplyPreset = (preset: Partial<ValidationExperimentRecord>) => {
    setTitle(preset.title || '');
    setType(preset.type || 'concierge_manual_service');
    setHypothesisToTest(preset.hypothesisToTest || '');
    setDescription(preset.description || '');
    setCostINR(preset.estimatedCostINR || 0);
    setCostUSD(preset.estimatedCostUSD || 0);
    setHours(preset.estimatedHours || 4);
    setTargetMetric(preset.targetMetric || '');
    setPassRule(preset.passDecisionRule || '');
  };

  const handleSaveExperiment = () => {
    if (!title.trim() || !hypothesisToTest.trim()) return;

    const record: ValidationExperimentRecord = {
      id: `exp-${Date.now()}`,
      problemId: activeHypothesis?.id || 'hyp-1',
      title: title.trim(),
      type,
      hypothesisToTest: hypothesisToTest.trim(),
      description: description.trim(),
      estimatedCostINR: costINR,
      estimatedCostUSD: costUSD,
      estimatedHours: hours,
      targetMetric: targetMetric.trim(),
      passDecisionRule: passRule.trim(),
      status,
      outcomeVerdict,
      actualResults: actualResults.trim() || undefined,
      createdAt: Date.now(),
    };

    onUpdateExperiments([record, ...project.experiments]);
    setIsModalOpen(false);

    // Reset
    setTitle('');
    setHypothesisToTest('');
    setDescription('');
    setTargetMetric('');
    setPassRule('');
    setActualResults('');
    setOutcomeVerdict(undefined);
  };

  const handleUpdateStatus = (
    id: string,
    newStatus: ValidationExperimentRecord['status'],
    verdict?: ValidationExperimentRecord['outcomeVerdict']
  ) => {
    const updated = project.experiments.map((e) =>
      e.id === id ? { ...e, status: newStatus, outcomeVerdict: verdict || e.outcomeVerdict } : e
    );
    onUpdateExperiments(updated);
  };

  const handleDeleteExperiment = (id: string) => {
    onUpdateExperiments(project.experiments.filter((e) => e.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Validation Experiment Engine</h1>
            <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
              Low-Cost Validation
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Design the cheapest credible experiment before building full software. Keep budgets under ₹1,500 ($20).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Design New Experiment</span>
        </button>
      </div>

      {/* Preset Inspiration Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Recommended Low-Cost Presets for Early Founders
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {VALIDATION_EXPERIMENT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                handleApplyPreset(p);
                setIsModalOpen(true);
              }}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left hover:border-indigo-500 hover:bg-slate-900 transition flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  {p.type?.replace(/_/g, ' ')}
                </span>
                <span className="font-bold text-white text-xs block">{p.title}</span>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-emerald-400 border-t border-slate-800/80 pt-2">
                <span>Budget: ₹{p.estimatedCostINR} (~${p.estimatedCostUSD})</span>
                <span className="text-slate-400">{p.estimatedHours}h build</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            Designed Validation Experiments ({project.experiments.length})
          </h2>
        </div>

        {project.experiments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center">
            <Flame className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-300">No Experiments Designed Yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Never build a 3-month product based on pure intuition. Test your riskiest assumption in 7 days.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.experiments.map((exp) => {
              const meta =
                experimentTypeLabels[exp.type] ||
                experimentTypeLabels.concierge_manual_service;

              return (
                <div
                  key={exp.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.color}`}
                        >
                          {meta.badge} • {exp.status.toUpperCase()}
                        </span>
                        <h3 className="mt-1.5 text-base font-bold text-white tracking-tight">
                          {exp.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleDeleteExperiment(exp.id)}
                        className="text-slate-600 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-850">
                      <span className="font-semibold text-slate-400 block text-[10px] uppercase">
                        Hypothesis Under Test:
                      </span>
                      {exp.hypothesisToTest}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">{exp.description}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="font-bold text-slate-500 block text-[10px] uppercase">
                          Target Metric:
                        </span>
                        <span className="text-indigo-300 font-semibold">{exp.targetMetric}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block text-[10px] uppercase">
                          Pass/Fail Decision Rule:
                        </span>
                        <span className="text-emerald-300 font-semibold">{exp.passDecisionRule}</span>
                      </div>
                    </div>

                    {exp.actualResults && (
                      <div className="mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <span className="font-bold text-slate-400 block text-[10px] uppercase">
                          Observed Outcome & Log:
                        </span>
                        <p className="text-slate-200 text-xs mt-0.5">{exp.actualResults}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer & Verdict Actions */}
                  <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <span>Est. ₹{exp.estimatedCostINR} (~${exp.estimatedCostUSD})</span>
                      <span>•</span>
                      <span>{exp.estimatedHours} hours</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {exp.status !== 'completed' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(exp.id, 'running')}
                            className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-2 py-1 text-[11px] font-bold text-indigo-300 hover:bg-indigo-600/30"
                          >
                            Mark Running
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(exp.id, 'completed', 'PROCEED')}
                            className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-2 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-600/30"
                          >
                            Passed (Proceed)
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(exp.id, 'completed', 'PIVOT')}
                            className="rounded-lg bg-amber-600/20 border border-amber-500/30 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-600/30"
                          >
                            Pivot
                          </button>
                        </>
                      ) : (
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold ${
                            exp.outcomeVerdict === 'PROCEED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : exp.outcomeVerdict === 'PIVOT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          Verdict: {exp.outcomeVerdict}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Experiment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white">Design Validation Experiment</h2>
            <p className="text-xs text-slate-400 mt-1">
              Construct a low-cost, observable test to prove or invalidate your riskiest assumption.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Experiment Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5-Store WhatsApp Concierge Ledger Test"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Experiment Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                >
                  {Object.entries(experimentTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Specific Hypothesis to Test *
                </label>
                <textarea
                  rows={2}
                  value={hypothesisToTest}
                  onChange={(e) => setHypothesisToTest(e.target.value)}
                  placeholder="e.g. Shopkeepers will send daily photos of their paper ledger if someone else digitizes it and sends WhatsApp receipts."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Budget (INR)
                  </label>
                  <input
                    type="number"
                    value={costINR}
                    onChange={(e) => setCostINR(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={costUSD}
                    onChange={(e) => setCostUSD(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Hours to Run
                  </label>
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Target Measurable Metric
                </label>
                <input
                  type="text"
                  value={targetMetric}
                  onChange={(e) => setTargetMetric(e.target.value)}
                  placeholder="e.g. 4 out of 5 stores send photos daily for 7 days"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  Pass/Fail Decision Rule
                </label>
                <input
                  type="text"
                  value={passRule}
                  onChange={(e) => setPassRule(e.target.value)}
                  placeholder="e.g. >= 80% daily retention confirms real operational pain."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExperiment}
                disabled={!title.trim() || !hypothesisToTest.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Save Experiment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
