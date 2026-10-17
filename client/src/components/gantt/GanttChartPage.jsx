import React from 'react';
import { useJobs } from '../../context/JobContext';
import { useSimulation } from '../../context/SimulationContext';
import { InteractiveGanttChart } from './InteractiveGanttChart';
import { BarChartHorizontal, Play, Pause, RotateCcw, Clock, Cpu } from 'lucide-react';

export const GanttChartPage = ({ setActiveTab }) => {
  const { setSelectedJobId } = useJobs();
  const {
    algorithm,
    timeQuantum,
    currentTime,
    maxTime,
    ganttChart,
    summary,
    isPlaying,
    play,
    pause,
    reset,
  } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <BarChartHorizontal className="h-6 w-6 text-cyan-400" />
            CPU Execution Gantt Chart
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Chronological CPU time slice allocation, context switch points, and idle periods under {algorithm}.
          </p>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={pause}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 transition-colors"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={play}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Simulate Timeline</span>
            </button>
          )}

          <button
            onClick={reset}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Gantt View */}
      <InteractiveGanttChart
        ganttChart={ganttChart}
        currentTime={currentTime}
        maxTime={maxTime}
        onSelectJob={(id) => {
          setSelectedJobId(id);
          setActiveTab('process');
        }}
      />

      {/* Execution Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0d1527]/80 p-4">
          <p className="text-xs font-mono uppercase text-slate-400">Total Simulation Time</p>
          <p className="mt-1 font-mono text-2xl font-bold text-white">{summary.totalTime} ticks</p>
          <p className="mt-1 text-[11px] text-slate-400">Makespan of all jobs</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d1527]/80 p-4">
          <p className="text-xs font-mono uppercase text-slate-400">CPU Busy / Idle Ratio</p>
          <p className="mt-1 font-mono text-2xl font-bold text-cyan-300">
            {summary.totalBurstTime} / {summary.idleTime}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">{summary.cpuUtilization}% active utilization</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d1527]/80 p-4">
          <p className="text-xs font-mono uppercase text-slate-400">Context Switches</p>
          <p className="mt-1 font-mono text-2xl font-bold text-violet-300">
            {summary.contextSwitches}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">CPU register reload events</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d1527]/80 p-4">
          <p className="text-xs font-mono uppercase text-slate-400">Scheduling Policy</p>
          <p className="mt-1 font-mono text-xl font-bold text-emerald-300">
            {algorithm} {algorithm === 'RR' ? `(q=${timeQuantum})` : ''}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Deterministic OS scheduler</p>
        </div>
      </div>
    </div>
  );
};
