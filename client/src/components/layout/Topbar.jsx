import React from 'react';
import {
  Menu,
  Search,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Server,
  User,
} from 'lucide-react';
import { useJobs } from '../../context/JobContext';
import { useSimulation } from '../../context/SimulationContext';

export const Topbar = ({ onToggleSidebar, activeTab }) => {
  const { searchTerm, setSearchTerm, resetToSample, backendStatus } = useJobs();
  const { currentTime, soundActive, setSoundActive, isPlaying, maxTime } = useSimulation();

  const TAB_TITLES = {
    dashboard: 'System Dashboard & Metrics',
    jobs: 'Process & Job Management',
    queues: 'Multi-Queue OS Visualizer',
    simulator: 'Interactive CPU Scheduler',
    gantt: 'CPU Execution Gantt Chart',
    comparison: 'Algorithm Benchmarks & Analysis',
    process: 'Process Inspection & Trace',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#070b14]/85 px-4 backdrop-blur-xl lg:px-6">
      {/* Left: Mobile Menu Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>KERNEL</span>
            <span>/</span>
            <span className="text-cyan-400 capitalize">{activeTab}</span>
          </div>
          <h2 className="text-sm font-semibold text-white tracking-tight hidden sm:block">
            {TAB_TITLES[activeTab] || 'Job Queue System'}
          </h2>
        </div>
      </div>

      {/* Center: Live Simulated OS Clock */}
      <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-1.5 backdrop-blur-md shadow-sm shadow-cyan-500/10">
        <Clock className={`h-4 w-4 text-cyan-400 ${isPlaying ? 'animate-spin' : ''}`} />
        <span className="text-xs font-mono text-slate-300">OS CLOCK:</span>
        <span className="font-mono text-sm font-bold text-cyan-300">
          t = {currentTime}
        </span>
        <span className="text-[10px] font-mono text-slate-400">/ {maxTime}</span>
      </div>

      {/* Right: Search, Sound, Sample Reset, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-44 rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 lg:w-56"
          />
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundActive(!soundActive)}
          title={soundActive ? 'Mute OS Sound Effects' : 'Enable OS Sound Effects'}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
            soundActive
              ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-900/30'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          {soundActive ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Reset Sample Jobs */}
        <button
          onClick={resetToSample}
          title="Restore standard sample processes (P1-P5)"
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
        >
          <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Reset Data</span>
        </button>

        {/* Backend status indicator */}
        <div
          title={`Backend: ${backendStatus === 'online' ? 'MongoDB REST API Connected' : 'Local Storage Mode'}`}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1.5 text-xs font-mono"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              backendStatus === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] text-slate-400">
            {backendStatus === 'online' ? 'API Online' : 'Local Mode'}
          </span>
        </div>

        {/* User / Profile Area */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 text-white font-bold text-xs shadow-sm">
            D
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-medium text-white leading-tight">Deepika</p>
            <p className="text-[10px] text-slate-400">OS Engineer</p>
          </div>
        </div>
      </div>
    </header>
  );
};
