import React from 'react';
import { useJobs } from '../../context/JobContext';
import { useSimulation } from '../../context/SimulationContext';
import { Badge } from '../common/Badge';
import {
  Activity,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

export const ProcessDetailPage = ({ setActiveTab }) => {
  const { jobs, selectedJobId, setSelectedJobId } = useJobs();
  const {
    algorithm,
    results,
    currentFrame,
    currentTime,
    ganttChart,
    toggleBlockJob,
    blockedJobIds,
  } = useSimulation();

  // If no job selected, pick first job
  const activeJobId = selectedJobId || (jobs.length > 0 ? jobs[0].jobId : null);
  const activeJob = jobs.find((j) => j.jobId === activeJobId) || null;
  const resultMetric = results.find((r) => r.jobId === activeJobId) || null;

  if (!activeJob) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#0d1527]/60 text-slate-400 text-xs">
        <p className="font-semibold text-white">No process selected for inspection.</p>
        <p className="mt-1">Add or select a job from the Job Management table.</p>
      </div>
    );
  }

  // Determine active state from current simulation frame
  let currentState = 'Waiting';
  if (currentFrame.completedQueue.some((j) => j.jobId === activeJobId)) {
    currentState = 'Completed';
  } else if (currentFrame.runningJob && currentFrame.runningJob.jobId === activeJobId) {
    currentState = 'Running';
  } else if (currentFrame.waitingQueue.some((j) => j.jobId === activeJobId)) {
    currentState = 'Blocked';
  } else if (currentFrame.readyQueue.some((j) => j.jobId === activeJobId)) {
    currentState = 'Ready';
  } else {
    currentState = 'Waiting';
  }

  // Find remaining time at current clock tick
  const remTime = (
    currentFrame.runningJob?.jobId === activeJobId
      ? currentFrame.runningJob.remainingTime
      : currentFrame.readyQueue.find((j) => j.jobId === activeJobId)?.remainingTime ??
        currentFrame.waitingQueue.find((j) => j.jobId === activeJobId)?.remainingTime ??
        (currentState === 'Completed' ? 0 : activeJob.burstTime)
  );

  // Time slices where this process executed in Gantt chart
  const executionSlices = ganttChart.filter((b) => b.jobId === activeJobId);

  return (
    <div className="space-y-6">
      {/* Header and Process Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Activity className="h-6 w-6 text-cyan-400" />
            Process Telemetry & Detailed Trace
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Deep operating system inspection of process execution states, timing formulas, and dispatch slices.
          </p>
        </div>

        {/* Process Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {jobs.map((j) => {
            const isSelected = j.jobId === activeJobId;
            return (
              <button
                key={j.jobId}
                onClick={() => setSelectedJobId(j.jobId)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                  isSelected
                    ? 'border border-cyan-400 bg-cyan-950/60 text-white shadow-md shadow-cyan-500/20'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: j.color || '#3b82f6' }}
                />
                <span>{j.jobId}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Process Overview Hero */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/90 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl font-mono text-2xl font-black text-white shadow-lg"
              style={{ backgroundColor: activeJob.color || '#3b82f6' }}
            >
              {activeJob.jobId}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{activeJob.jobName}</h2>
                <Badge status={currentState} size="sm" />
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Priority: <strong className="text-cyan-300">Level {activeJob.priority}</strong> |
                Arrival: <strong className="text-white">t={activeJob.arrivalTime}</strong> |
                Total Burst: <strong className="text-white">{activeJob.burstTime} ticks</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleBlockJob(activeJob.jobId)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-mono font-semibold transition-all ${
                blockedJobIds.includes(activeJob.jobId)
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40'
                  : 'border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40'
              }`}
            >
              {blockedJobIds.includes(activeJob.jobId) ? 'Resume / Unblock Process' : 'Simulate I/O Block'}
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Simulate</span>
            </button>
          </div>
        </div>

        {/* 10 Technical Process Metrics */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">Process ID</p>
            <p className="font-mono text-lg font-bold text-white mt-1">{activeJob.jobId}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">Arrival Time (AT)</p>
            <p className="font-mono text-lg font-bold text-slate-200 mt-1">{activeJob.arrivalTime} ticks</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">Total Burst (BT)</p>
            <p className="font-mono text-lg font-bold text-cyan-300 mt-1">{activeJob.burstTime} ticks</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">Remaining Burst</p>
            <p className="font-mono text-lg font-bold text-amber-300 mt-1">{remTime} ticks</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">Priority Level</p>
            <p className="font-mono text-lg font-bold text-violet-300 mt-1">{activeJob.priority}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">First Start (ST)</p>
            <p className="font-mono text-lg font-bold text-slate-200 mt-1">
              {resultMetric && resultMetric.startTime >= 0 ? `${resultMetric.startTime} ticks` : '—'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">Completion Time (CT)</p>
            <p className="font-mono text-lg font-bold text-emerald-300 mt-1">
              {resultMetric ? `${resultMetric.completionTime} ticks` : '—'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">Turnaround (TAT)</p>
            <p className="font-mono text-lg font-bold text-cyan-400 mt-1">
              {resultMetric ? `${resultMetric.turnaroundTime} ticks` : '—'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">Waiting Time (WT)</p>
            <p className="font-mono text-lg font-bold text-blue-400 mt-1">
              {resultMetric ? `${resultMetric.waitingTime} ticks` : '—'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <p className="text-[10px] font-mono uppercase text-slate-400">Response Time (RT)</p>
            <p className="font-mono text-lg font-bold text-violet-400 mt-1">
              {resultMetric ? `${resultMetric.responseTime} ticks` : '—'}
            </p>
          </div>
        </div>

        {/* CPU Execution Slices in Current Simulation */}
        <div className="mt-6 border-t border-slate-800/80 pt-5">
          <h3 className="text-sm font-semibold text-white mb-2">
            CPU Time Allocation Slices under {algorithm}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {executionSlices.length > 0 ? (
              executionSlices.map((slice, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3 py-2 text-xs font-mono"
                >
                  <span className="text-cyan-300 font-bold">Slice {idx + 1}:</span>{' '}
                  <span className="text-white">t={slice.startTime} &rarr; t={slice.endTime}</span>{' '}
                  <span className="text-slate-400">({slice.duration} ticks)</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No CPU execution slices registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
