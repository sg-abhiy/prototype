import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { OpportunityExplorer } from './components/OpportunityExplorer.tsx';
import { ProblemInvestigator } from './components/ProblemInvestigator.tsx';
import { ResearchWorkspace } from './components/ResearchWorkspace.tsx';
import { CompetitiveMapper } from './components/CompetitiveMapper.tsx';
import { FrameworkAssessment } from './components/FrameworkAssessment.tsx';
import { ScoringDashboard } from './components/ScoringDashboard.tsx';
import { CustomerDiscoveryLab } from './components/CustomerDiscoveryLab.tsx';
import { ExperimentEngine } from './components/ExperimentEngine.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import {
  ProjectData,
  ProblemHypothesis,
  ProblemCanvas,
  CompetitorRecord,
  OpportunityGap,
  InternationalModel,
  FrameworkArtefacts,
  ProblemStrengthRatings,
  OpportunityViabilityRatings,
  CustomerInterviewRecord,
  ValidationExperimentRecord,
  ProductMode,
} from './types/index.ts';
import {
  getProjects,
  saveProject,
  deleteProject,
  createInitialProject,
  getCurrentProjectId,
  setCurrentProjectId,
} from './services/storage.ts';
import { fetchHealth } from './services/api.ts';

export default function App() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [isAiConnected, setIsAiConnected] = useState<boolean>(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);

  // Load initial projects and test server connection
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const loaded = await getProjects();
        if (!mounted) return;
        setProjects(loaded);

        const currentId = getCurrentProjectId();
        const found = loaded.find((p) => p.context.id === currentId) || loaded[0];
        setCurrentProject(found || null);
        if (found) setCurrentProjectId(found.context.id);

        // Check health
        const health = await fetchHealth();
        if (mounted) {
          setIsAiConnected(health.geminiConfigured);
        }
      } catch (e) {
        console.error('Initialization error:', e);
        const fallback = createInitialProject('discover');
        if (mounted) {
          setProjects([fallback]);
          setCurrentProject(fallback);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateCurrentProject = (updated: ProjectData) => {
    setCurrentProject(updated);
    setProjects((prev) =>
      prev.map((p) => (p.context.id === updated.context.id ? updated : p))
    );
    saveProject(updated).catch((e) => console.warn('Save failed:', e));
  };

  const handleSelectProject = (id: string) => {
    const target = projects.find((p) => p.context.id === id);
    if (target) {
      setCurrentProject(target);
      setCurrentProjectId(target.context.id);
    }
  };

  const handleCreateNewProject = (mode: ProductMode = 'discover') => {
    const newProj = createInitialProject(mode);
    const updated = [newProj, ...projects];
    setProjects(updated);
    setCurrentProject(newProj);
    setCurrentProjectId(newProj.context.id);
    saveProject(newProj).catch((e) => console.warn('Save failed:', e));
    setIsNewProjectModalOpen(false);
  };

  const handleDeleteProject = async (id: string) => {
    if (projects.length <= 1) return;
    await deleteProject(id);
    const remaining = projects.filter((p) => p.context.id !== id);
    setProjects(remaining);
    setCurrentProject(remaining[0]);
    setCurrentProjectId(remaining[0].context.id);
  };

  // Canvas investigation handoff
  const handleSelectHypothesisForCanvas = (hyp: ProblemHypothesis) => {
    if (!currentProject) return;

    const updatedCanvas: ProblemCanvas = {
      ...currentProject.canvas,
      targetUser: hyp.affectedUserGroup || currentProject.canvas.targetUser,
      specificSituation: hyp.situation || currentProject.canvas.specificSituation,
      coreJob: hyp.task || currentProject.canvas.coreJob,
      currentTools: hyp.currentWorkaround || currentProject.canvas.currentTools,
      consequencesOfFailure: hyp.hypothesisedConsequence || currentProject.canvas.consequencesOfFailure,
      evidenceSupporting: hyp.evidenceAvailable || currentProject.canvas.evidenceSupporting,
      unansweredQuestions: hyp.largestUnansweredQuestion || currentProject.canvas.unansweredQuestions,
    };

    handleUpdateCurrentProject({
      ...currentProject,
      activeHypothesisId: hyp.id,
      canvas: updatedCanvas,
    });
    setActiveTab('investigate');
  };

  if (!currentProject) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-sm font-semibold text-slate-300">Loading ProblemForge Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      <Navbar
        currentProject={currentProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onDeleteProject={handleDeleteProject}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAiConnected={isAiConnected}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'discover' && (
          <OpportunityExplorer
            project={currentProject}
            onUpdateProject={handleUpdateCurrentProject}
            onSelectHypothesisForCanvas={handleSelectHypothesisForCanvas}
          />
        )}

        {activeTab === 'investigate' && (
          <ProblemInvestigator
            project={currentProject}
            onUpdateCanvas={(canvas) =>
              handleUpdateCurrentProject({ ...currentProject, canvas })
            }
            onUpdateStatement={(statement) => {
              const activeId = currentProject.activeHypothesisId;
              const updatedHypotheses = currentProject.hypotheses.map((h) =>
                h.id === activeId ? { ...h, problemStatement: statement } : h
              );
              handleUpdateCurrentProject({
                ...currentProject,
                hypotheses: updatedHypotheses,
              });
            }}
          />
        )}

        {activeTab === 'research' && (
          <ResearchWorkspace
            project={currentProject}
            onUpdateProject={handleUpdateCurrentProject}
          />
        )}

        {activeTab === 'competitors' && (
          <CompetitiveMapper
            project={currentProject}
            onUpdateCompetitors={(competitors) =>
              handleUpdateCurrentProject({ ...currentProject, competitors })
            }
            onUpdateOpportunityGap={(opportunityGap) =>
              handleUpdateCurrentProject({ ...currentProject, opportunityGap })
            }
            onUpdateInternationalModel={(internationalModel) =>
              handleUpdateCurrentProject({ ...currentProject, internationalModel })
            }
          />
        )}

        {activeTab === 'frameworks' && (
          <FrameworkAssessment
            project={currentProject}
            onUpdateFrameworks={(frameworks) =>
              handleUpdateCurrentProject({ ...currentProject, frameworks })
            }
          />
        )}

        {activeTab === 'scoring' && (
          <ScoringDashboard
            project={currentProject}
            onUpdateRatings={(strengthRatings, viabilityRatings) =>
              handleUpdateCurrentProject({
                ...currentProject,
                strengthRatings,
                viabilityRatings,
              })
            }
          />
        )}

        {activeTab === 'interviews' && (
          <CustomerDiscoveryLab
            project={currentProject}
            onUpdateInterviews={(interviews) =>
              handleUpdateCurrentProject({ ...currentProject, interviews })
            }
          />
        )}

        {activeTab === 'experiments' && (
          <ExperimentEngine
            project={currentProject}
            onUpdateExperiments={(experiments) =>
              handleUpdateCurrentProject({ ...currentProject, experiments })
            }
          />
        )}
      </main>

      {/* Settings / Context Modal */}
      <OnboardingModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        context={currentProject.context}
        onSave={(updatedContext) =>
          handleUpdateCurrentProject({ ...currentProject, context: updatedContext })
        }
      />

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white">Create New ProblemForge Investigation</h2>
            <p className="mt-1 text-xs text-slate-400">
              Select an entry mode. All modes share the same evidence radar, canvas, and transparent scoring system.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {[
                {
                  id: 'discover' as ProductMode,
                  title: 'A. Discover Problem',
                  desc: 'Uncover unaddressed problems from scratch.',
                },
                {
                  id: 'evaluate' as ProductMode,
                  title: 'B. Evaluate Idea',
                  desc: 'Pressure-test a known problem or product idea.',
                },
                {
                  id: 'market_gap' as ProductMode,
                  title: 'C. Market Gap',
                  desc: 'Study incumbent sectors or international models.',
                },
                {
                  id: 'hackathon' as ProductMode,
                  title: 'D. Hackathon Sprint',
                  desc: 'Find a high-impact demoable prototype in 36h.',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleCreateNewProject(m.id)}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-left hover:border-indigo-500 hover:bg-slate-900 transition"
                >
                  <span className="font-bold text-sm text-white block">{m.title}</span>
                  <p className="text-[11px] text-slate-400 mt-1">{m.desc}</p>
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dossier Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={currentProject}
      />
    </div>
  );
}
