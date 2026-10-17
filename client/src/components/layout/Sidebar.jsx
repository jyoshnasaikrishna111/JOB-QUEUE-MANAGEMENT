import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Network,
  Cpu,
  BarChartHorizontal,
  Scale,
  Activity,
  Terminal,
  Database,
  Info,
} from 'lucide-react';
import { useJobs } from '../../context/JobContext';
import { useSimulation } from '../../context/SimulationContext';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { jobs, backendStatus } = useJobs();
  const { algorithm, timeQuantum } = useSimulation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Management', icon: Layers, badge: jobs.length },
    { id: 'queues', label: 'Queue Visualizer', icon: Network },
    { id: 'simulator', label: 'CPU Simulator', icon: Cpu },
    { id: 'gantt', label: 'Gantt Chart', icon: BarChartHorizontal },
    { id: 'comparison', label: 'Algorithm Comparison', icon: Scale },
    { id: 'process', label: 'Process Details', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-[#070b14]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-md shadow-cyan-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white">OS JOB QUEUE</h1>
              <p className="text-[10px] font-mono tracking-widest text-cyan-400">KERNEL SIMULATOR</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* System Info Box */}
          <div className="pt-6 px-1">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono mb-2">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" /> ACTIVE ALGO
                </span>
                <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-cyan-300 font-bold">
                  {algorithm}
                </span>
              </div>
              {algorithm === 'RR' && (
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono mb-2">
                  <span>TIME QUANTUM</span>
                  <span className="text-white font-bold">{timeQuantum} ticks</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-slate-400" /> STORAGE
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    backendStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {backendStatus === 'online' ? 'MongoDB / Express' : 'Local Storage'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-400">System Ready</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">OS Project</span>
          </div>
        </div>
      </aside>
    </>
  );
};
