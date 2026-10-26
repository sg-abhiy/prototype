import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Globe,
  Shuffle,
  Info,
} from 'lucide-react';
import {
  CompetitorRecord,
  AlternativeType,
  OpportunityGap,
  InternationalModel,
  ProjectData,
} from '../types/index.ts';

interface CompetitiveMapperProps {
  project: ProjectData;
  onUpdateCompetitors: (comps: CompetitorRecord[]) => void;
  onUpdateOpportunityGap: (gap: OpportunityGap) => void;
  onUpdateInternationalModel: (model: InternationalModel) => void;
}

export const CompetitiveMapper: React.FC<CompetitiveMapperProps> = ({
  project,
  onUpdateCompetitors,
  onUpdateOpportunityGap,
  onUpdateInternationalModel,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'gap' | 'international'>('matrix');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New competitor form
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [geographicMarket, setGeographicMarket] = useState('India');
  const [coreFunctionality, setCoreFunctionality] = useState('');
  const [pricing, setPricing] = useState('');
  const [distributionChannel, setDistributionChannel] = useState('');
  const [observedStrengths, setObservedStrengths] = useState('');
  const [verifiedLimitations, setVerifiedLimitations] = useState('');
  const [altType, setAltType] = useState<AlternativeType>('direct_software');
  const [confidence, setConfidence] = useState<'High' | 'Medium' | 'Low'>('High');

  const alternativeLabels: Record<AlternativeType, { label: string; color: string; desc: string }> = {
    direct_software: {
      label: 'Direct Software Competitor',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      desc: 'Purpose-built software competing for the same user workflow.',
    },
    indirect_solution: {
      label: 'Indirect Solution',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      desc: 'Solves part of the problem or approaches it tangentially (e.g. WhatsApp, UPI apps).',
    },
    manual_workaround: {
      label: 'Manual Workaround',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      desc: 'Spreadsheets, physical paper bahi-khata, phone calls, sticky notes.',
    },
    do_nothing: {
      label: 'Doing Nothing / Tolerating',
      color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      desc: 'Accepting the loss or delay as an inevitable cost of life or business.',
    },
  };

  const handleAddCompetitor = () => {
    if (!name.trim()) return;

    const newComp: CompetitorRecord = {
      id: `comp-${Date.now()}`,
      problemId: project.activeHypothesisId || 'hyp-1',
      name: name.trim(),
      website: website.trim() || undefined,
      targetCustomer: targetCustomer.trim() || project.context.targetAudience,
      geographicMarket: geographicMarket.trim(),
      coreFunctionality: coreFunctionality.trim(),
      pricing: pricing.trim() || 'Unverified / Freemium',
      distributionChannel: distributionChannel.trim(),
      observedStrengths: observedStrengths.trim(),
      verifiedLimitations: verifiedLimitations.trim(),
      alternativeType: altType,
      sourceLinks: website.trim() ? [website.trim()] : [],
      confidence,
      dateResearched: new Date().toISOString().split('T')[0],
    };

    onUpdateCompetitors([newComp, ...project.competitors]);
    setName('');
    setWebsite('');
    setCoreFunctionality('');
    setPricing('');
    setDistributionChannel('');
    setObservedStrengths('');
    setVerifiedLimitations('');
    setIsAddModalOpen(false);
  };

  const handleDeleteCompetitor = (id: string) => {
    onUpdateCompetitors(project.competitors.filter((c) => c.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Competitive & Market Opportunity Mapper
            </h1>
            <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
              Alternatives & Unmet Gaps
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Map direct rivals, indirect tools, manual workarounds (Excel, WhatsApp), and explore international precedents.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'matrix' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Competitor Matrix ({project.competitors.length})
          </button>
          <button
            onClick={() => setActiveSubTab('gap')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'gap' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Opportunity Gap Analysis
          </button>
          <button
            onClick={() => setActiveSubTab('international')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'international'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. International Model Explorer
          </button>
        </div>
      </div>

      {/* 1. COMPETITOR MATRIX VIEW */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Entrepreneurs must never claim: <em className="text-slate-300">"We have no competitors."</em> The primary competitor is almost always{' '}
              <strong className="text-amber-300">a spreadsheet, WhatsApp, or doing nothing</strong>.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Competitor / Alternative</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.competitors.map((comp) => {
              const altInfo = alternativeLabels[comp.alternativeType] || alternativeLabels.direct_software;

              return (
                <div
                  key={comp.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${altInfo.color}`}
                      >
                        {altInfo.label}
                      </span>
                      <h3 className="mt-1.5 text-base font-bold text-white tracking-tight">
                        {comp.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteCompetitor(comp.id)}
                      className="text-slate-600 hover:text-rose-400 p-1"
                      title="Delete competitor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                    <div>
                      <span className="font-bold text-slate-400 block text-[10px] uppercase">
                        Target Customer:
                      </span>
                      <span className="text-slate-200">{comp.targetCustomer}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block text-[10px] uppercase">
                        Pricing Model:
                      </span>
                      <span className="text-slate-200">{comp.pricing}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block text-[10px] uppercase">
                        Geography:
                      </span>
                      <span className="text-slate-200">{comp.geographicMarket}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block text-[10px] uppercase">
                        Confidence:
                      </span>
                      <span className="text-emerald-400 font-semibold">{comp.confidence} Confidence</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Core Functionality:
                      </span>
                      <p className="text-slate-300 text-xs">{comp.coreFunctionality}</p>
                    </div>

                    <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/30 p-2 text-emerald-300 text-[11px]">
                      <span className="font-bold text-emerald-400 block">Observed Strengths:</span>
                      {comp.observedStrengths}
                    </div>

                    <div className="rounded-lg bg-rose-950/20 border border-rose-900/30 p-2 text-rose-300 text-[11px]">
                      <span className="font-bold text-rose-400 block">Verified Limitations:</span>
                      {comp.verifiedLimitations}
                    </div>
                  </div>

                  {comp.website && (
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-indigo-400 truncate">
                      <ExternalLink className="h-3 w-3" />
                      <a href={comp.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                        {comp.website}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. OPPORTUNITY GAP ANALYSIS VIEW */}
      {activeSubTab === 'gap' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Opportunity-Gap Analysis</h2>
            <p className="text-xs text-slate-400">
              Evaluate what existing solutions leave unsolved, and articulate a defensible differentiation hypothesis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                What do existing solutions already handle well?
              </label>
              <textarea
                rows={3}
                value={project.opportunityGap.whatHandledWell}
                onChange={(e) =>
                  onUpdateOpportunityGap({
                    ...project.opportunityGap,
                    whatHandledWell: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                What remains difficult or painful for the target customer?
              </label>
              <textarea
                rows={3}
                value={project.opportunityGap.whatRemainsDifficult}
                onChange={(e) =>
                  onUpdateOpportunityGap({
                    ...project.opportunityGap,
                    whatRemainsDifficult: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Which specific customers are poorly served by incumbents?
              </label>
              <textarea
                rows={3}
                value={project.opportunityGap.poorlyServedCustomers}
                onChange={(e) =>
                  onUpdateOpportunityGap({
                    ...project.opportunityGap,
                    poorlyServedCustomers: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                Could an established incumbent easily copy this feature?
              </label>
              <textarea
                rows={3}
                value={project.opportunityGap.couldCompetitorCopy}
                onChange={(e) =>
                  onUpdateOpportunityGap({
                    ...project.opportunityGap,
                    couldCompetitorCopy: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Differentiation Hypothesis with Warning */}
          <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-300">
                Differentiation Hypothesis (Explicitly Labeled Example)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Note: This is an example hypothesis to be verified through interviews and direct comparison, not a verified market fact.
            </p>
            <textarea
              rows={3}
              value={project.opportunityGap.differentiationHypothesis}
              onChange={(e) =>
                onUpdateOpportunityGap({
                  ...project.opportunityGap,
                  differentiationHypothesis: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 3. INTERNATIONAL MODEL EXPLORER */}
      {activeSubTab === 'international' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">International Business Model Exploration</h2>
            </div>
            <p className="text-xs text-slate-400">
              Study a proven foreign company or business model and examine what Indian or local adaptations are mandatory.
              <strong className="text-amber-400"> The absence of a foreign brand does not mean the absence of local competition.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block mb-1">
                Foreign Company / Model Name
              </label>
              <input
                type="text"
                value={project.internationalModel.foreignModelName}
                onChange={(e) =>
                  onUpdateInternationalModel({
                    ...project.internationalModel,
                    foreignModelName: e.target.value,
                  })
                }
                placeholder="e.g. Klarna, Instacart, Faire, Toast, Substack"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block mb-1">
                Home Market
              </label>
              <input
                type="text"
                value={project.internationalModel.homeMarket}
                onChange={(e) =>
                  onUpdateInternationalModel({
                    ...project.internationalModel,
                    homeMarket: e.target.value,
                  })
                }
                placeholder="e.g. United States, Scandinavia, Japan"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Original Customer Need Addressed
              </label>
              <textarea
                rows={2}
                value={project.internationalModel.needAddressed}
                onChange={(e) =>
                  onUpdateInternationalModel({
                    ...project.internationalModel,
                    needAddressed: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Operating Model & Revenue Stream
              </label>
              <textarea
                rows={2}
                value={project.internationalModel.operatingModelSummary}
                onChange={(e) =>
                  onUpdateInternationalModel({
                    ...project.internationalModel,
                    operatingModelSummary: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                Existing Local Alternatives That Must Be Audited
              </label>
              <textarea
                rows={2}
                value={project.internationalModel.existingLocalAlternatives}
                onChange={(e) =>
                  onUpdateInternationalModel({
                    ...project.internationalModel,
                    existingLocalAlternatives: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                Local Workflow, Language & Infrastructure Differences
              </label>
              <textarea
                rows={2}
                value={project.internationalModel.localWorkflowDifferences}
                onChange={(e) =>
                  onUpdateInternationalModel({
                    ...project.internationalModel,
                    localWorkflowDifferences: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                Local Adaptation Hypothesis (Genuinely Different Customer Outcome)
              </label>
              <textarea
                rows={2}
                value={project.internationalModel.adaptationOpportunity}
                onChange={(e) =>
                  onUpdateInternationalModel({
                    ...project.internationalModel,
                    adaptationOpportunity: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                Regulatory or Distribution Barriers to Implement
              </label>
              <textarea
                rows={2}
                value={project.internationalModel.implementationBarriers}
                onChange={(e) =>
                  onUpdateInternationalModel({
                    ...project.internationalModel,
                    implementationBarriers: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white">Add Alternative or Competitor</h2>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Product / Alternative Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Khatabook, Paper Bahi-Khata, or Excel"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Alternative Type
                  </label>
                  <select
                    value={altType}
                    onChange={(e) => setAltType(e.target.value as AlternativeType)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                  >
                    <option value="direct_software">Direct Software</option>
                    <option value="indirect_solution">Indirect Solution (WhatsApp/UPI)</option>
                    <option value="manual_workaround">Manual Workaround (Notebooks/Excel)</option>
                    <option value="do_nothing">Doing Nothing / Tolerating</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Website URL (If applicable)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Observed Strengths
                </label>
                <input
                  type="text"
                  value={observedStrengths}
                  onChange={(e) => setObservedStrengths(e.target.value)}
                  placeholder="Fast, ubiquitous, zero software cost..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Verified Limitations
                </label>
                <input
                  type="text"
                  value={verifiedLimitations}
                  onChange={(e) => setVerifiedLimitations(e.target.value)}
                  placeholder="Disputes, zero backup, high manual effort..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompetitor}
                disabled={!name.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Add Alternative
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
