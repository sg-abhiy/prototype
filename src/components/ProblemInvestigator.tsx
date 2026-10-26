import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Wand2,
  RefreshCw,
  FileText,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { ProblemCanvas, ProjectData } from '../types/index.ts';
import { analyzeProblemStatement, ProblemStatementDiagnostic } from '../utils/heuristics.ts';

interface ProblemInvestigatorProps {
  project: ProjectData;
  onUpdateCanvas: (canvas: ProblemCanvas) => void;
  onUpdateStatement: (statement: string) => void;
}

export const ProblemInvestigator: React.FC<ProblemInvestigatorProps> = ({
  project,
  onUpdateCanvas,
  onUpdateStatement,
}) => {
  const canvas = project.canvas;
  const activeHypothesis = project.hypotheses.find(
    (h) => h.id === project.activeHypothesisId
  ) || project.hypotheses[0];

  // Derived structured problem statement from template
  const reconstructedStatement = useMemo(() => {
    const sit = canvas.specificSituation || '[specific situation]';
    const task = canvas.coreJob || '[specific task]';
    const cause = canvas.statementCause || canvas.sourceOfFriction || '[observed constraint/cause]';
    const con = canvas.statementConsequence || canvas.consequencesOfFailure || '[documented consequence]';
    const workaround = canvas.currentTools || canvas.currentBehaviour || '[method]';
    const limitation = canvas.statementLimitation || 'it fails to prevent recurrent errors';

    return `People in ${sit} struggle to ${task} because ${cause}, resulting in ${con}. Their current workaround is ${workaround}, which is inadequate because ${limitation}.`;
  }, [canvas]);

  // Real-time heuristic evaluation
  const diagnostic = useMemo<ProblemStatementDiagnostic>(() => {
    const currentStatement = activeHypothesis?.problemStatement || reconstructedStatement;
    return analyzeProblemStatement(
      currentStatement,
      canvas.targetUser,
      canvas.specificSituation,
      canvas.coreJob
    );
  }, [activeHypothesis?.problemStatement, reconstructedStatement, canvas.targetUser, canvas.specificSituation, canvas.coreJob]);

  const handleFieldChange = (field: keyof ProblemCanvas, value: any) => {
    onUpdateCanvas({
      ...canvas,
      [field]: value,
    });
  };

  const applySuggestedRevision = () => {
    if (diagnostic.suggestedRevision) {
      onUpdateStatement(diagnostic.suggestedRevision);
      if (!canvas.statementCause) {
        handleFieldChange('statementCause', 'manual processes lack automated validation');
      }
      if (!canvas.statementConsequence) {
        handleFieldChange('statementConsequence', 'preventable delays and financial loss');
      }
      if (!canvas.statementLimitation) {
        handleFieldChange('statementLimitation', 'it requires unscalable dual-entry');
      }
    }
  };

  const syncTemplateToStatement = () => {
    onUpdateStatement(reconstructedStatement);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Problem Investigator</h1>
            <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
              Design Thinking & JTBD Canvas
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Active Investigation:{' '}
            <strong className="text-white">{activeHypothesis?.title || 'Default Problem'}</strong>
          </p>
        </div>

        {/* Quality Score Indicator */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Problem Clarity Score
            </div>
            <div className="text-lg font-extrabold text-white">
              {diagnostic.score}
              <span className="text-xs font-normal text-slate-500">/100</span>
            </div>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border font-bold text-xs ${
              diagnostic.score >= 70
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : diagnostic.score >= 45
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
            }`}
          >
            {diagnostic.score >= 70 ? 'Sharp' : diagnostic.score >= 45 ? 'Fair' : 'Vague'}
          </div>
        </div>
      </div>

      {/* Problem Statement Builder & Live Diagnostic */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Statement Builder Form (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              Structured Problem Statement Builder
            </h2>
            <button
              onClick={syncTemplateToStatement}
              className="flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-300 hover:bg-indigo-500/20"
            >
              <RefreshCw className="h-3 w-3" />
              Update Active Statement
            </button>
          </div>

          <p className="text-xs text-slate-400">
            A battle-tested format that forces focus on the user constraint rather than the absence of your solution:
          </p>

          {/* Builder inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                [Specific Situation / Trigger]
              </label>
              <input
                type="text"
                value={canvas.specificSituation}
                onChange={(e) => handleFieldChange('specificSituation', e.target.value)}
                placeholder="e.g. evening shop closing or monthly settlement"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                [Core Task to Accomplish]
              </label>
              <input
                type="text"
                value={canvas.coreJob}
                onChange={(e) => handleFieldChange('coreJob', e.target.value)}
                placeholder="e.g. reconcile customer store credit dues"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                [Observed Cause or Constraint]
              </label>
              <input
                type="text"
                value={canvas.statementCause}
                onChange={(e) => handleFieldChange('statementCause', e.target.value)}
                placeholder="e.g. manual paper diaries lack timestamped item proof"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                [Documented or Hypothesised Consequence]
              </label>
              <input
                type="text"
                value={canvas.statementConsequence}
                onChange={(e) => handleFieldChange('statementConsequence', e.target.value)}
                placeholder="e.g. 5-8% uncollected bad debt and awkward neighborhood disputes"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                [Current Workaround Method]
              </label>
              <input
                type="text"
                value={canvas.currentTools}
                onChange={(e) => handleFieldChange('currentTools', e.target.value)}
                placeholder="e.g. paper bahi-khata and polite SMS reminders"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                [Why Workaround Is Inadequate]
              </label>
              <input
                type="text"
                value={canvas.statementLimitation}
                onChange={(e) => handleFieldChange('statementLimitation', e.target.value)}
                placeholder="e.g. customers dispute dates and storekeepers hate confronting neighbors"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Reconstructed Preview Box */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
              Active Formulated Statement:
            </span>
            <p className="text-xs font-medium text-slate-200 leading-relaxed">
              "{reconstructedStatement}"
            </p>
          </div>
        </div>

        {/* Real-Time Diagnostic & Critique (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Heuristic Diagnosis
            </h2>
          </div>

          {/* Solution bias check */}
          {diagnostic.isSolutionBiased ? (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <AlertTriangle className="h-4 w-4" /> Solution-Bias Warning!
              </div>
              <p className="mt-1 text-slate-300 text-[11px]">
                Your statement frames the problem as "lack of an app/platform". A missing app is NEVER a customer problem; focus on their actual workflow friction.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs flex items-center gap-2 text-emerald-300 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Problem-oriented: No premature solution-bias detected!</span>
            </div>
          )}

          {/* Checklist of components */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Defined Target User:</span>
              <span className={diagnostic.hasDefinedUser ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {diagnostic.hasDefinedUser ? 'Yes' : 'Vague'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Trigger Situation:</span>
              <span className={diagnostic.hasSpecificSituation ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {diagnostic.hasSpecificSituation ? 'Specific' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Root Cause/Constraint:</span>
              <span className={diagnostic.hasRootCause ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {diagnostic.hasRootCause ? 'Identified' : 'Ambiguous'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Measurable Consequence:</span>
              <span className={diagnostic.hasClearConsequence ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {diagnostic.hasClearConsequence ? 'High Stakes' : 'Unclear'}
              </span>
            </div>
          </div>

          {/* Actionable Suggestions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Refinement Advice:
            </span>
            {diagnostic.critique.map((c, i) => (
              <p key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{c}</span>
              </p>
            ))}
          </div>

          {diagnostic.suggestedRevision && (
            <div className="pt-2">
              <button
                onClick={applySuggestedRevision}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 transition"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Apply Refined Formulation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Problem Definition Canvas (Comprehensive 16 Fields) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            Problem Definition Canvas (JTBD & Design Thinking)
          </h2>
          <p className="text-xs text-slate-400">
            Differentiate what is an observed fact from what remains an assumption. Edit any field as new interview evidence emerges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Target User */}
          <div className="space-y-1">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              1. Target User Persona
            </label>
            <textarea
              rows={2}
              value={canvas.targetUser}
              onChange={(e) => handleFieldChange('targetUser', e.target.value)}
              placeholder="Who specifically experiences the friction?"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Trigger Situation */}
          <div className="space-y-1">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              2. Specific Situation / Trigger
            </label>
            <textarea
              rows={2}
              value={canvas.specificSituation}
              onChange={(e) => handleFieldChange('specificSituation', e.target.value)}
              placeholder="When does the user encounter the pain?"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Core Job */}
          <div className="space-y-1">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              3. Core Job to Be Done (JTBD)
            </label>
            <textarea
              rows={2}
              value={canvas.coreJob}
              onChange={(e) => handleFieldChange('coreJob', e.target.value)}
              placeholder="What progress is the user trying to make?"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Current Behaviour */}
          <div className="space-y-1">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              4. Current Behaviour & Habits
            </label>
            <textarea
              rows={2}
              value={canvas.currentBehaviour}
              onChange={(e) => handleFieldChange('currentBehaviour', e.target.value)}
              placeholder="What do they actually do today?"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Current Tools */}
          <div className="space-y-1">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              5. Current Tools & Workarounds
            </label>
            <textarea
              rows={2}
              value={canvas.currentTools}
              onChange={(e) => handleFieldChange('currentTools', e.target.value)}
              placeholder="Notebooks, WhatsApp, Excel, calculators, asking colleagues..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Source of Friction */}
          <div className="space-y-1">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              6. Source of Friction / Bottleneck
            </label>
            <textarea
              rows={2}
              value={canvas.sourceOfFriction}
              onChange={(e) => handleFieldChange('sourceOfFriction', e.target.value)}
              placeholder="Why does the workaround fail or break down?"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Frequency & Severity */}
          <div className="space-y-2">
            <div>
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block">
                7. Occurrence Frequency
              </label>
              <select
                value={canvas.frequency}
                onChange={(e) => handleFieldChange('frequency', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="daily">Daily (High habitual urgency)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly (e.g. tax filing, billing)</option>
                <option value="occasional">Occasional / Rare</option>
                <option value="unknown">Unknown (Needs customer verification)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block">
                8. Pain Severity
              </label>
              <select
                value={canvas.severity}
                onChange={(e) => handleFieldChange('severity', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="blocking">Blocking (Stops operations completely)</option>
                <option value="painful">Painful (Causes direct financial/time loss)</option>
                <option value="annoying">Annoying (Minor inconvenience)</option>
                <option value="negligible">Negligible (Users will not pay to fix)</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          {/* Consequences of Failure */}
          <div className="space-y-1">
            <label className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
              9. Consequences of Failure
            </label>
            <textarea
              rows={2}
              value={canvas.consequencesOfFailure}
              onChange={(e) => handleFieldChange('consequencesOfFailure', e.target.value)}
              placeholder="What goes wrong if the user fails this task?"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Time/Money Lost */}
          <div className="space-y-1">
            <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              10. Time or Money Potentially Lost
            </label>
            <textarea
              rows={2}
              value={canvas.timeOrMoneyLost}
              onChange={(e) => handleFieldChange('timeOrMoneyLost', e.target.value)}
              placeholder="e.g. ₹15,000 uncollected debt / 45 mins every evening"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Emotional Burden */}
          <div className="space-y-1">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              11. Emotional & Operational Burden
            </label>
            <textarea
              rows={2}
              value={canvas.emotionalBurden}
              onChange={(e) => handleFieldChange('emotionalBurden', e.target.value)}
              placeholder="Stress, awkward social friction, fear of penalties..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Desired Outcome */}
          <div className="space-y-1">
            <label className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
              12. Desired Customer Outcome
            </label>
            <textarea
              rows={2}
              value={canvas.desiredOutcome}
              onChange={(e) => handleFieldChange('desiredOutcome', e.target.value)}
              placeholder="What does success look like for the customer?"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Suspected Unmet Need */}
          <div className="space-y-1">
            <label className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
              13. Suspected Unmet Need
            </label>
            <textarea
              rows={2}
              value={canvas.suspectedUnmetNeed}
              onChange={(e) => handleFieldChange('suspectedUnmetNeed', e.target.value)}
              placeholder="What makes existing products insufficient?"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Evidence Supporting */}
          <div className="space-y-1">
            <label className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
              14. Evidence Currently Supporting
            </label>
            <textarea
              rows={2}
              value={canvas.evidenceSupporting}
              onChange={(e) => handleFieldChange('evidenceSupporting', e.target.value)}
              placeholder="Interviews, reports, or direct observations supporting this"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Unanswered Questions */}
          <div className="space-y-1">
            <label className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
              15. Questions That Remain Unanswered
            </label>
            <textarea
              rows={2}
              value={canvas.unansweredQuestions}
              onChange={(e) => handleFieldChange('unansweredQuestions', e.target.value)}
              placeholder="What assumption, if proven false, kills this idea?"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
