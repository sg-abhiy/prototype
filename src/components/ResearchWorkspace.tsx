import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Globe,
  Tag,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  ResearchRecord,
  EvidenceClassification,
  ProjectData,
} from '../types/index.ts';
import { researchWithWebSources } from '../services/api.ts';

interface ResearchWorkspaceProps {
  project: ProjectData;
  onUpdateProject: (updated: ProjectData) => void;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  project,
  onUpdateProject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiveResearchModalOpen, setIsLiveResearchModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchScope, setSearchScope] = useState('Find existing products and competitors');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');

  // New manual record form
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newSpecificClaim, setNewSpecificClaim] = useState('');
  const [newPubDate, setNewPubDate] = useState('');
  const [newClassification, setNewClassification] = useState<EvidenceClassification>('USER-SUPPLIED CLAIM');
  const [newTags, setNewTags] = useState('');

  const activeHypothesis = project.hypotheses.find(
    (h) => h.id === project.activeHypothesisId
  ) || project.hypotheses[0];

  const classificationStyles: Record<
    EvidenceClassification,
    { badge: string; text: string; bg: string; border: string; desc: string }
  > = {
    'VERIFIED SOURCE CLAIM': {
      badge: 'Verified Source',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      desc: 'Supported by an identifiable external public source, report, or official document.',
    },
    'DIRECT USER OBSERVATION': {
      badge: 'Direct Observation',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      desc: 'Recorded from an actual customer interview, experiment, or on-site field study.',
    },
    'USER-SUPPLIED CLAIM': {
      badge: 'User Claim',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      desc: 'Information entered by the builder that has not yet been independently verified.',
    },
    'RESEARCH HYPOTHESIS': {
      badge: 'Hypothesis',
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      desc: 'A plausible interpretation or inference requiring field verification.',
    },
    UNKNOWN: {
      badge: 'Unknown',
      text: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      desc: 'A material question or data point that cannot currently be established.',
    },
    CONTRADICTED: {
      badge: 'Contradicted',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      desc: 'An assumption challenged or disproven by credible field evidence.',
    },
  };

  const handleAddManualRecord = () => {
    if (!newTitle.trim() || !newExcerpt.trim()) return;

    const record: ResearchRecord = {
      id: `res-${Date.now()}`,
      problemId: activeHypothesis?.id || 'hyp-1',
      title: newTitle.trim(),
      url: newUrl.trim() || undefined,
      publicationDate: newPubDate.trim() || undefined,
      accessDate: new Date().toISOString().split('T')[0],
      excerpt: newExcerpt.trim(),
      classification: newClassification,
      specificClaimSupported: newSpecificClaim.trim() || 'General domain context',
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: Date.now(),
    };

    onUpdateProject({
      ...project,
      research: [record, ...project.research],
      history: [`Added research record: "${record.title}"`, ...project.history],
    });

    // Reset
    setNewTitle('');
    setNewUrl('');
    setNewExcerpt('');
    setNewSpecificClaim('');
    setNewPubDate('');
    setNewTags('');
    setIsModalOpen(false);
  };

  const handleDeleteRecord = (id: string) => {
    onUpdateProject({
      ...project,
      research: project.research.filter((r) => r.id !== id),
    });
  };

  const handleExecuteLiveResearch = async () => {
    setIsSearching(true);
    try {
      const res = await researchWithWebSources(
        activeHypothesis?.title || 'Target Market Problem',
        activeHypothesis?.problemStatement || project.canvas.coreJob,
        searchScope,
        project.context.domain
      );

      const now = Date.now();
      const newItems: ResearchRecord[] = res.claims.map((claim, idx) => ({
        id: `res-web-${now}-${idx}`,
        problemId: activeHypothesis?.id || 'hyp-1',
        title: claim.title,
        url: claim.url,
        accessDate: new Date().toISOString().split('T')[0],
        excerpt: claim.excerpt,
        classification: claim.classification || 'VERIFIED SOURCE CLAIM',
        specificClaimSupported: claim.specificClaimSupported,
        tags: ['Grounded Search', searchScope.slice(0, 15)],
        createdAt: now,
      }));

      onUpdateProject({
        ...project,
        research: [...newItems, ...project.research],
        history: [
          `Performed grounded web research on "${searchScope}" (${newItems.length} sources added)`,
          ...project.history,
        ],
      });
      setIsLiveResearchModalOpen(false);
    } catch (e) {
      console.error('Web research failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Collect all unique tags
  const allTags = Array.from(new Set(project.research.flatMap((r) => r.tags)));

  // Filter records
  const filteredRecords = project.research.filter((r) => {
    if (selectedClassification !== 'all' && r.classification !== selectedClassification) return false;
    if (selectedTag !== 'all' && !r.tags.includes(selectedTag)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Problem Radar & Research Workspace</h1>
            <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
              Evidence Dossier
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Audit evidence supporting or contradicting{' '}
            <strong className="text-white">{activeHypothesis?.title || 'active problem'}</strong>.
            Distinguish verified citations from assumptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLiveResearchModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3.5 py-2 text-xs font-bold text-indigo-300 shadow-md hover:bg-indigo-600/30 transition"
          >
            <Globe className="h-4 w-4 text-indigo-400" />
            <span>Research with web sources</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Manual Note / Source</span>
          </button>
        </div>
      </div>

      {/* Classification Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {Object.entries(classificationStyles).map(([key, style]) => {
          const count = project.research.filter((r) => r.classification === key).length;
          return (
            <button
              key={key}
              onClick={() =>
                setSelectedClassification(selectedClassification === key ? 'all' : key)
              }
              className={`rounded-xl border p-2.5 text-left transition ${
                selectedClassification === key
                  ? `${style.border} ${style.bg} ring-1 ring-white/20`
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase ${style.text}`}>
                  {style.badge}
                </span>
                <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                  {count}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 line-clamp-2">{style.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Filter and Tags Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-y border-slate-800/80 py-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter by:
          </span>
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-white focus:outline-none"
          >
            <option value="all">All Classifications ({project.research.length})</option>
            {Object.keys(classificationStyles).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Tags:</span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                selectedTag === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Research Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-300">No Research Records Found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Log notes from articles, user complaints, interview observations, or click "Research with web sources" to query public references.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((item) => {
            const style =
              classificationStyles[item.classification] ||
              classificationStyles.UNKNOWN;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-md hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}
                    >
                      {item.classification}
                    </span>
                    <button
                      onClick={() => handleDeleteRecord(item.id)}
                      className="text-slate-600 hover:text-rose-400 p-1"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-white tracking-tight">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                    "{item.excerpt}"
                  </p>

                  <div className="mt-2.5 text-[11px] space-y-1">
                    <div className="text-indigo-300">
                      <span className="font-bold text-indigo-400">Claim Supported: </span>
                      {item.specificClaimSupported}
                    </div>

                    {item.url && (
                      <div className="flex items-center gap-1 text-slate-400 truncate">
                        <Globe className="h-3 w-3 shrink-0 text-slate-500" />
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-300 underline truncate"
                        >
                          {item.url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span key={t} className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span>Accessed: {item.accessDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Manual Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white">Add Evidence or Research Note</h2>
            <p className="text-xs text-slate-400 mt-1">
              Log an external article excerpt, official report stat, or direct observation.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Source Title / Headline *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. RBI Report on Retail Payments or Field Interview with Local Shopkeeper"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Source URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Publication Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newPubDate}
                    onChange={(e) => setNewPubDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Verbatim Excerpt / Observed Note *
                </label>
                <textarea
                  rows={3}
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  placeholder="Copy exact quotation, survey stat, or concrete observation..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Specific Claim Supported
                </label>
                <input
                  type="text"
                  value={newSpecificClaim}
                  onChange={(e) => setNewSpecificClaim(e.target.value)}
                  placeholder="e.g. Confirms that 80% of stores offer informal credit"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Classification
                  </label>
                  <select
                    value={newClassification}
                    onChange={(e) => setNewClassification(e.target.value as EvidenceClassification)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="VERIFIED SOURCE CLAIM">VERIFIED SOURCE CLAIM</option>
                    <option value="DIRECT USER OBSERVATION">DIRECT USER OBSERVATION</option>
                    <option value="USER-SUPPLIED CLAIM">USER-SUPPLIED CLAIM</option>
                    <option value="RESEARCH HYPOTHESIS">RESEARCH HYPOTHESIS</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                    <option value="CONTRADICTED">CONTRADICTED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Retail, Credit, India"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
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
                onClick={handleAddManualRecord}
                disabled={!newTitle.trim() || !newExcerpt.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Save Evidence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Research Confirmation & Scope Modal */}
      {isLiveResearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Research with Web Sources</h2>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Performs grounded Google Search queries to discover existing products, public statistics, and verifiable user complaints for:{' '}
              <strong className="text-white">"{activeHypothesis?.title}"</strong>.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Choose Research Scope:
              </label>
              {[
                'Find existing products and direct competitors',
                'Investigate real customer demand signals & complaints',
                'Find official government & industry statistics',
                'Study international precedents and foreign business models',
                'Compare Indian vs international market approaches',
                'Investigate a specific riskiest assumption',
              ].map((scope) => (
                <label
                  key={scope}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs cursor-pointer transition ${
                    searchScope === scope
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    checked={searchScope === scope}
                    onChange={() => setSearchScope(scope)}
                    className="text-indigo-600 focus:ring-0"
                  />
                  <span>{scope}</span>
                </label>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
              <span className="text-[10px] text-slate-500">
                Powered by Gemini 3.8 Flash + Search Grounding
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsLiveResearchModalOpen(false)}
                  disabled={isSearching}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteLiveResearch}
                  disabled={isSearching}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Search className={`h-3.5 w-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                  <span>{isSearching ? 'Querying Web...' : 'Start Grounded Research'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
