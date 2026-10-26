import React from 'react';
import {
  Compass,
  Layers,
  Sparkles,
  Download,
  Settings,
  Plus,
  Trash2,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { ProductMode, ProjectData } from '../types/index.ts';

interface NavbarProps {
  currentProject: ProjectData;
  projects: ProjectData[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onOpenSettings,
  onOpenExport,
  activeTab,
  onTabChange,
  isAiConnected,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const modeBadges: Record<ProductMode, { label: string; color: string }> = {
    discover: { label: 'Discover Problem', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    evaluate: { label: 'Evaluate Idea', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    market_gap: { label: 'Market Gap', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    hackathon: { label: 'Hackathon Sprint', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  };

  const navItems = [
    { id: 'discover', label: '1. Discover', icon: Compass },
    { id: 'investigate', label: '2. Canvas', icon: Layers },
    { id: 'research', label: '3. Evidence Radar', icon: Sparkles },
    { id: 'competitors', label: '4. Alternatives & Gaps', icon: FolderOpen },
    { id: 'frameworks', label: '5. Frameworks', icon: Layers },
    { id: 'scoring', label: '6. Scores & Verdict', icon: CheckCircle2 },
    { id: 'interviews', label: '7. Mom Test Lab', icon: AlertTriangle },
    { id: 'experiments', label: '8. Experiments', icon: Flame },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Project Dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-indigo-600 p-0.5 shadow-lg shadow-orange-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Flame className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white sm:text-lg">ProblemForge</span>
                <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-300">
                  v1.0
                </span>
              </div>
              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Evidence before enthusiasm
              </p>
            </div>
          </div>

          {/* Project Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
              aria-label="Switch project"
            >
              <span className="max-w-[140px] truncate sm:max-w-[190px]">
                {currentProject.context.projectName}
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                  modeBadges[currentProject.context.mode]?.color || 'bg-slate-800 text-slate-300'
                }`}
              >
                {modeBadges[currentProject.context.mode]?.label}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="mb-2 flex items-center justify-between px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Projects</span>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNewProject();
                    }}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus className="h-3 w-3" /> New
                  </button>
                </div>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {projects.map((p) => (
                    <div
                      key={p.context.id}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                        p.context.id === currentProject.context.id
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectProject(p.context.id);
                          setDropdownOpen(false);
                        }}
                        className="flex-1 text-left truncate font-medium"
                      >
                        {p.context.projectName}
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${p.context.projectName}"?`)) {
                              onDeleteProject(p.context.id);
                            }
                          }}
                          className="ml-2 text-slate-500 hover:text-rose-400"
                          title="Delete Project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* AI Status Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              isAiConnected
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
            }`}
            title={
              isAiConnected
                ? 'Gemini 3.8 Flash API Ready'
                : 'Operational Demo Mode (Local Heuristics Active)'
            }
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                isAiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isAiConnected ? 'Gemini 3.8 Flash' : 'Demo Mode'}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            title="Project Context & Constraints"
          >
            <Settings className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Context & Settings</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="border-t border-slate-800/80 bg-slate-950/60 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-inner shadow-slate-900 border border-slate-700/80'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? 'text-indigo-400' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
