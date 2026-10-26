import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Quote,
  Sparkles,
  HelpCircle,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { CustomerInterviewRecord, ProjectData } from '../types/index.ts';
import { MOM_TEST_GUIDELINES } from '../utils/templates.ts';

interface CustomerDiscoveryLabProps {
  project: ProjectData;
  onUpdateInterviews: (interviews: CustomerInterviewRecord[]) => void;
}

export const CustomerDiscoveryLab: React.FC<CustomerDiscoveryLabProps> = ({
  project,
  onUpdateInterviews,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Interview Form
  const [intervieweeName, setIntervieweeName] = useState('');
  const [segmentOrRole, setSegmentOrRole] = useState('');
  const [interviewDate, setInterviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState<CustomerInterviewRecord['channel']>('in_person');
  const [pastBehavior, setPastBehavior] = useState('');
  const [moneyTimeSpent, setMoneyTimeSpent] = useState('');
  const [workarounds, setWorkarounds] = useState('');
  const [failedAttempts, setFailedAttempts] = useState('');
  const [quotes, setQuotes] = useState('');
  const [takeaways, setTakeaways] = useState('');

  const activeHypothesis = project.hypotheses.find(
    (h) => h.id === project.activeHypothesisId
  ) || project.hypotheses[0];

  const handleSaveInterview = () => {
    if (!intervieweeName.trim() || !takeaways.trim()) return;

    const record: CustomerInterviewRecord = {
      id: `int-${Date.now()}`,
      problemId: activeHypothesis?.id || 'hyp-1',
      intervieweeNameOrPseudonym: intervieweeName.trim(),
      segmentOrRole: segmentOrRole.trim() || project.context.targetAudience,
      interviewDate,
      channel,
      pastBehaviorObserved: pastBehavior.trim(),
      actualMoneyOrTimeSpent: moneyTimeSpent.trim(),
      currentWorkaroundUsed: workarounds.trim(),
      failedPriorAttempts: failedAttempts.trim(),
      keyDirectQuotes: quotes
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean),
      takeaways: takeaways.trim(),
      classificationAssigned: 'DIRECT USER OBSERVATION',
      createdAt: Date.now(),
    };

    onUpdateInterviews([record, ...project.interviews]);
    setIsModalOpen(false);

    // Reset
    setIntervieweeName('');
    setSegmentOrRole('');
    setPastBehavior('');
    setMoneyTimeSpent('');
    setWorkarounds('');
    setFailedAttempts('');
    setQuotes('');
    setTakeaways('');
  };

  const handleDeleteInterview = (id: string) => {
    onUpdateInterviews(project.interviews.filter((i) => i.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Customer Discovery & Interview Lab
            </h1>
            <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-indigo-300">
              The Mom Test Protocol
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Never ask: <em className="text-slate-300">"Would you buy an app that does X?"</em> People lie to be polite. Ask about past behavior and actual money spent.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Log Customer Interview</span>
        </button>
      </div>

      {/* Mom Test Core Guidelines Card */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5 shadow-lg space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          The Mom Test Rules for {activeHypothesis?.affectedUserGroup || 'Target Users'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {MOM_TEST_GUIDELINES.map((g, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3.5 space-y-2">
              <span className="font-bold text-white text-xs block">{g.rule}</span>
              <div className="rounded bg-rose-950/30 border border-rose-900/40 p-2 text-rose-300 text-[11px]">
                <strong className="text-rose-400 block text-[10px] uppercase">Don't Ask:</strong>
                "{g.badQuestion}"
              </div>
              <div className="rounded bg-emerald-950/30 border border-emerald-900/40 p-2 text-emerald-300 text-[11px]">
                <strong className="text-emerald-400 block text-[10px] uppercase">Ask Instead:</strong>
                "{g.goodQuestion}"
              </div>
              <p className="text-[10px] text-slate-400 italic">{g.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logged Interviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            Completed Discovery Interviews ({project.interviews.length})
          </h2>
          <span className="text-xs text-emerald-400 font-semibold">
            Each logged interview directly reinforces Evidence Confidence.
          </span>
        </div>

        {project.interviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-300">No Customer Interviews Logged Yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Before writing code, talk to 3-5 real people who struggle with this problem today. Log what they actually do.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.interviews.map((int) => (
              <div
                key={int.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {int.intervieweeNameOrPseudonym}
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                        {int.segmentOrRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {int.channel.replace('_', ' ')} • {int.interviewDate}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteInterview(int.id)}
                    className="text-slate-600 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                    <span className="font-bold text-slate-400 block text-[10px] uppercase">
                      Observed Past Behavior:
                    </span>
                    <p className="text-slate-300 text-xs">{int.pastBehaviorObserved}</p>
                  </div>

                  {int.actualMoneyOrTimeSpent && (
                    <div className="bg-amber-950/20 p-2 rounded-lg border border-amber-900/30 text-amber-300 text-xs">
                      <span className="font-bold text-amber-400 block text-[10px] uppercase">
                        Real Money or Time Lost:
                      </span>
                      {int.actualMoneyOrTimeSpent}
                    </div>
                  )}

                  {int.keyDirectQuotes.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-bold text-indigo-400 block text-[10px] uppercase">
                        Direct Verbatim Quotes:
                      </span>
                      {int.keyDirectQuotes.map((q, idx) => (
                        <p key={idx} className="text-xs italic text-indigo-200/90 flex items-start gap-1">
                          <Quote className="h-3 w-3 shrink-0 text-indigo-400 mt-0.5" />
                          <span>"{q}"</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-2">
                    <span className="font-bold text-emerald-400 block text-[10px] uppercase">
                      Key Takeaway for Product:
                    </span>
                    <p className="text-slate-300 text-xs">{int.takeaways}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Interview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white">Log Customer Discovery Interview</h2>
            <p className="text-xs text-slate-400 mt-1">
              Capture concrete facts and past actions instead of polite hypotheticals.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Participant Name / Pseudonym *
                  </label>
                  <input
                    type="text"
                    value={intervieweeName}
                    onChange={(e) => setIntervieweeName(e.target.value)}
                    placeholder="e.g. Rahul S. (Grocery Store Owner)"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Segment or Role
                  </label>
                  <input
                    type="text"
                    value={segmentOrRole}
                    onChange={(e) => setSegmentOrRole(e.target.value)}
                    placeholder="e.g. Retailer, Student, Freelancer"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Interview Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                  >
                    <option value="in_person">In-Person Field Visit</option>
                    <option value="call">Phone Call</option>
                    <option value="whatsapp_chat">WhatsApp / Messaging</option>
                    <option value="campus_walkup">Campus Walk-up</option>
                    <option value="field_visit">Store Observation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Date Conducted
                  </label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Observed Past Behavior (What did they actually do last time?)
                </label>
                <textarea
                  rows={2}
                  value={pastBehavior}
                  onChange={(e) => setPastBehavior(e.target.value)}
                  placeholder="e.g. 'Showed me their register with 14 customer credit entries made yesterday evening.'"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Actual Money or Time Spent / Lost
                </label>
                <input
                  type="text"
                  value={moneyTimeSpent}
                  onChange={(e) => setMoneyTimeSpent(e.target.value)}
                  placeholder="e.g. Lost ₹18,000 to bad debt in 2025; spends 45 mins each night"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Direct Verbatim Quotes (One per line)
                </label>
                <textarea
                  rows={2}
                  value={quotes}
                  onChange={(e) => setQuotes(e.target.value)}
                  placeholder="Exact words they said..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  Key Strategic Takeaway *
                </label>
                <textarea
                  rows={2}
                  value={takeaways}
                  onChange={(e) => setTakeaways(e.target.value)}
                  placeholder="What does this mean for our product hypothesis?"
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
                onClick={handleSaveInterview}
                disabled={!intervieweeName.trim() || !takeaways.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Save Interview Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
