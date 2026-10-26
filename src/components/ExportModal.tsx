import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Award, Code } from 'lucide-react';
import { ProjectData } from '../types/index.ts';
import { exportProjectAsMarkdown, exportProjectAsJson } from '../services/storage.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [activeFormat, setActiveFormat] = useState<'markdown' | 'hackathon_pitch' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownContent = exportProjectAsMarkdown(project);
  const jsonContent = exportProjectAsJson(project);

  // Generate clean Hackathon 1-Pager Pitch summary
  const hackathonPitchContent = `# Hackathon Project Pitch: ${project.context.projectName}
**Challenge Track:** ${project.context.constraints.hackathonTheme || 'General Innovation'}
**Target User:** ${project.context.targetAudience} (${project.context.geography})
**Problem Depth:** ${project.scores.problemStrength}/100 | **MVP Feasibility:** ${project.viabilityRatings.mvpFeasibilityRating}/5

---

### 1. The Core Unsolved Problem
${project.canvas.statementCause ? `People in ${project.canvas.specificSituation} struggle to ${project.canvas.coreJob} because ${project.canvas.statementCause}, resulting in ${project.canvas.statementConsequence}.` : project.hypotheses[0]?.problemStatement}

### 2. Why Existing Solutions Fail
Current alternatives rely on ${project.canvas.currentTools || 'manual workarounds'}, which fail because ${project.canvas.statementLimitation || 'they lack real-time synchronization and tamper-proof verification'}.

### 3. Our Working Prototype Differentiation
- **Core Workflow:** ${project.opportunityGap.differentiationHypothesis || 'Focused 1-screen mobile web experience delivering immediate verified utility.'}
- **Tech Stack:** ${project.context.constraints.hackathonTechStack?.join(', ') || 'React, TypeScript, Express, Gemini Flash'}
- **Demonstrable Within 36h:** Yes, full end-to-end interactive journey ready to judge.

### 4. Validation & Early Evidence
- **Field Interviews Completed:** ${project.interviews.length}
- **Direct Observation:** "${project.interviews[0]?.takeaways || 'Observed direct friction in actual operations'}"
- **Decision Verdict:** ${project.scores.verdictTitle}

---
Aligned to Hackathon Judging Criteria: Practicality, Feasibility, Problem Depth, and Working Prototype.
`;

  const activeContent =
    activeFormat === 'markdown'
      ? markdownContent
      : activeFormat === 'hackathon_pitch'
      ? hackathonPitchContent
      : jsonContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeFormat === 'json' ? 'json' : 'md';
    const filename = `${project.context.projectName.toLowerCase().replace(/\s+/g, '_')}_dossier.${ext}`;
    const blob = new Blob([activeContent], {
      type: activeFormat === 'json' ? 'application/json' : 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="h-4 w-4 text-indigo-400" />
              Export Validation Dossier
            </h2>
            <p className="text-xs text-slate-400">
              Download or copy your complete entrepreneurial validation package.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="my-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
            <button
              onClick={() => setActiveFormat('markdown')}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                activeFormat === 'markdown'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Markdown Dossier
            </button>
            <button
              onClick={() => setActiveFormat('hackathon_pitch')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1 font-semibold transition ${
                activeFormat === 'hackathon_pitch'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-400 hover:text-white'
              }`}
            >
              <Award className="h-3 w-3" />
              <span>Hackathon 1-Pager</span>
            </button>
            <button
              onClick={() => setActiveFormat('json')}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                activeFormat === 'json'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw JSON Data
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4">
          <pre className="h-full overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
            {activeContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
