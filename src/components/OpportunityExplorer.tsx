import React, { useState } from 'react';
import {
  Sparkles,
  Bookmark,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Columns,
  Share2,
  ChevronDown,
  Layers,
  Search,
} from 'lucide-react';
import { ProblemHypothesis, EvidenceClassification, ProjectData } from '../types/index.ts';
import { generateProblemHypotheses } from '../services/api.ts';

interface OpportunityExplorerProps {
  project: ProjectData;
  onUpdateProject: (updated: ProjectData) => void;
  onSelectHypothesisForCanvas: (hyp: ProblemHypothesis) => void;
}

export const OpportunityExplorer: React.FC<OpportunityExplorerProps> = ({
  project,
  onUpdateProject,
  onSelectHypothesisForCanvas,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  const evidenceStatusBadgeColors: Record<EvidenceClassification, { bg: string; text: string; border: string }> = {
    'VERIFIED SOURCE CLAIM': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    'DIRECT USER OBSERVATION': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    'USER-SUPPLIED CLAIM': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    'RESEARCH HYPOTHESIS': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    UNKNOWN: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    CONTRADICTED: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  };

  const handleGenerateBatch = async (interestOverride?: string) => {
    setIsGenerating(true);
    try {
      const res = await generateProblemHypotheses(
        project.context,
        interestOverride || customInterest,
        5
      );
      if (res.hypotheses && res.hypotheses.length > 0) {
        // Filter out immediate duplicates by title similarity
        const existingTitles = new Set(project.hypotheses.map((h) => h.title.toLowerCase()));
        const uniqueNew = res.hypotheses.filter(
          (h) => !existingTitles.has(h.title.toLowerCase())
        );

        const updatedHypotheses = [...uniqueNew, ...project.hypotheses];
        onUpdateProject({
          ...project,
          hypotheses: updatedHypotheses,
          history: [
            `Generated ${uniqueNew.length} new problem hypotheses for ${project.context.domain}`,
            ...project.history,
          ],
        });
      }
    } catch (e) {
      console.error('Error generating hypotheses:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveHypothesis = (id: string) => {
    const updated = project.hypotheses.map((h) =>
      h.id === id ? { ...h, status: 'saved' as const } : h
    );
    onUpdateProject({
      ...project,
      hypotheses: updated,
      history: [`Saved problem hypothesis ${id}`, ...project.history],
    });
  };

  const handleMarkLater = (id: string) => {
    const updated = project.hypotheses.map((h) =>
      h.id === id ? { ...h, status: 'later' as const } : h
    );
    onUpdateProject({
      ...project,
      hypotheses: updated,
    });
  };

  const handleConfirmReject = () => {
    if (!rejectingId) return;
    const updated = project.hypotheses.map((h) =>
      h.id === rejectingId
        ? {
            ...h,
            status: 'rejected' as const,
            rejectionReason: rejectReason || 'Not sufficiently painful or feasible for current team.',
          }
        : h
    );
    onUpdateProject({
      ...project,
      hypotheses: updated,
      history: [`Rejected hypothesis with reason: ${rejectReason}`, ...project.history],
    });
    setRejectingId(null);
    setRejectReason('');
  };

  const toggleSelectForComparison = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((x) => x !== id));
    } else {
      if (selectedForComparison.length >= 2) {
        setSelectedForComparison([selectedForComparison[1], id]);
      } else {
        setSelectedForComparison([...selectedForComparison, id]);
      }
    }
  };

  // Filter hypotheses
  const filtered = project.hypotheses.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.problemStatement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.affectedUserGroup.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return h.status === statusFilter;
  });

  const comparisonItems = project.hypotheses.filter((h) =>
    selectedForComparison.includes(h.id)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Banner & Generation Bar */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Opportunity Explorer
              </h1>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
                {project.context.geography}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl">
              Discover verified problem hypotheses across <strong>{project.context.targetAudience}</strong> in{' '}
              <strong>{project.context.domain}</strong>. Every card identifies the person, situation, task, workaround, and consequence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleGenerateBatch()}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Discover 5 Fresh Problems'}</span>
            </button>

            {selectedForComparison.length === 2 && (
              <button
                onClick={() => setIsComparing(true)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-3 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/25"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Compare (2 Selected)</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom refinement prompt */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-slate-800/80">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="Focus discovery (e.g. 'unpaid freelance invoices', 'high electricity bills in solar units', 'tier-2 campus ATS rejections')"
            className="w-full flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => handleGenerateBatch(customInterest)}
            disabled={isGenerating || !customInterest.trim()}
            className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
          >
            Narrow Focus
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems, users, or tasks..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-8 pr-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Status:
          </span>
          {['all', 'active', 'saved', 'later', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Hypotheses Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {filtered.map((hyp) => {
          const badge = evidenceStatusBadgeColors[hyp.evidenceStatus] || evidenceStatusBadgeColors.UNKNOWN;
          const isSelected = selectedForComparison.includes(hyp.id);

          return (
            <div
              key={hyp.id}
              className={`flex flex-col justify-between rounded-2xl border transition shadow-lg ${
                hyp.status === 'saved'
                  ? 'border-indigo-500/50 bg-slate-900/95 ring-1 ring-indigo-500/30'
                  : hyp.status === 'rejected'
                  ? 'border-slate-800/80 bg-slate-950/60 opacity-60'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {hyp.evidenceStatus}
                      </span>
                      {hyp.status === 'saved' && (
                        <span className="inline-flex items-center gap-1 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                          <Bookmark className="h-3 w-3" /> Saved
                        </span>
                      )}
                      {hyp.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                          <XCircle className="h-3 w-3" /> Rejected
                        </span>
                      )}
                      {hyp.status === 'later' && (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                          <Clock className="h-3 w-3" /> For Later
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">{hyp.title}</h3>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectForComparison(hyp.id)}
                    title="Select to compare"
                    className="mt-1 h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* 12 Required Fields Displayed Structured */}
                <p className="mt-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                  <span className="font-semibold text-slate-200">Problem Statement: </span>
                  {hyp.problemStatement}
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-slate-950/50 p-2 border border-slate-800/80">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                      Target User:
                    </span>
                    <span className="text-slate-200">{hyp.affectedUserGroup}</span>
                  </div>

                  <div className="rounded-lg bg-slate-950/50 p-2 border border-slate-800/80">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                      Trigger Situation:
                    </span>
                    <span className="text-slate-200">{hyp.situation}</span>
                  </div>

                  <div className="rounded-lg bg-slate-950/50 p-2 border border-slate-800/80">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                      Core Task:
                    </span>
                    <span className="text-slate-200">{hyp.task}</span>
                  </div>

                  <div className="rounded-lg bg-slate-950/50 p-2 border border-slate-800/80">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                      Current Workaround:
                    </span>
                    <span className="text-slate-200">{hyp.currentWorkaround}</span>
                  </div>
                </div>

                {/* Consequences & Why It Matters */}
                <div className="mt-2.5 space-y-1.5 text-[11px]">
                  <div className="text-rose-300/90 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30">
                    <span className="font-bold text-rose-400">Hypothesised Consequence: </span>
                    {hyp.hypothesisedConsequence}
                  </div>

                  <div className="text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                    <span className="font-bold text-indigo-400">Why It Matters: </span>
                    {hyp.whyItMatters}
                  </div>
                </div>

                {/* Unanswered Question & Next Research Step */}
                <div className="mt-2.5 border-t border-slate-800/60 pt-2 text-[11px] space-y-1">
                  <div className="text-amber-300/90">
                    <span className="font-bold text-amber-400">#1 Unanswered Question: </span>
                    {hyp.largestUnansweredQuestion}
                  </div>
                  <div className="text-emerald-300/90">
                    <span className="font-bold text-emerald-400">Next Research Step: </span>
                    {hyp.suggestedNextResearchStep}
                  </div>
                </div>

                {hyp.rejectionReason && (
                  <div className="mt-2 rounded bg-rose-950/40 p-2 text-[11px] text-rose-300 border border-rose-800/30">
                    <span className="font-bold">Rejection Note: </span>
                    {hyp.rejectionReason}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-950/60 p-3 rounded-b-2xl">
                <div className="flex items-center gap-1.5">
                  {hyp.status !== 'saved' && (
                    <button
                      onClick={() => handleSaveHypothesis(hyp.id)}
                      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-indigo-500 hover:text-white"
                      title="Save to Project"
                    >
                      <Bookmark className="h-3 w-3" /> Save
                    </button>
                  )}
                  {hyp.status !== 'later' && (
                    <button
                      onClick={() => handleMarkLater(hyp.id)}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                      title="Mark for later"
                    >
                      Later
                    </button>
                  )}
                  {hyp.status !== 'rejected' && (
                    <button
                      onClick={() => setRejectingId(hyp.id)}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-rose-400 hover:bg-rose-950/30"
                      title="Reject with reason"
                    >
                      Reject
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onSelectHypothesisForCanvas(hyp)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-500 transition"
                >
                  <span>Investigate in Canvas</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Record Reason for Rejecting Hypothesis</h3>
            <p className="mt-1 text-xs text-slate-400">
              Good entrepreneurs disqualify weak ideas quickly. Why does this problem not warrant further exploration?
            </p>
            <div className="mt-3 space-y-2">
              {[
                'Existing workarounds are already adequate (low switching incentive)',
                'Target customers lack willingness or ability to pay',
                'Too difficult or expensive to acquire customers with our budget',
                'Requires complex regulatory / institutional dependencies',
                'Too crowded by well-funded incumbents',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setRejectReason(reason)}
                  className={`w-full rounded-lg border p-2 text-left text-xs transition ${
                    rejectReason === reason
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-200'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Or write custom reason..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="rounded-lg px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side comparison modal */}
      {isComparing && comparisonItems.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Columns className="h-4 w-4 text-indigo-400" />
                Side-by-Side Opportunity Comparison
              </h2>
              <button
                onClick={() => setIsComparing(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {comparisonItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <h3 className="font-bold text-sm text-indigo-300">{item.title}</h3>
                  <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    {item.problemStatement}
                  </p>
                  <div className="text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">User & Trigger:</span>
                      <span className="text-slate-200">{item.affectedUserGroup} — {item.situation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Current Workaround:</span>
                      <span className="text-slate-200">{item.currentWorkaround}</span>
                    </div>
                    <div>
                      <span className="text-rose-400 block font-bold text-[10px] uppercase">Consequence of Failure:</span>
                      <span className="text-rose-300">{item.hypothesisedConsequence}</span>
                    </div>
                    <div>
                      <span className="text-amber-400 block font-bold text-[10px] uppercase">Largest Unanswered Question:</span>
                      <span className="text-amber-300">{item.largestUnansweredQuestion}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSelectHypothesisForCanvas(item);
                      setIsComparing(false);
                    }}
                    className="w-full rounded-lg bg-indigo-600 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    Select this Problem for Canvas
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
