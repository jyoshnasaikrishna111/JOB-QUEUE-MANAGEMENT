import React from 'react';
import { useJobs } from '../../context/JobContext';
import { useSimulation } from '../../context/SimulationContext';
import { InteractiveGanttChart } from '../gantt/InteractiveGanttChart';
import { Badge } from '../common/Badge';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sliders,
  Cpu,
  Clock,
  HelpCircle,
  BarChart3,
  CheckCircle,
  Eye,
  Info,
} from 'lucide-react';

export const SimulatorPage = ({ setActiveTab }) => {
  const { setSelectedJobId } = useJobs();
  const {
    algorithm,
    setAlgorithm,
    timeQuantum,
    setTimeQuantum,
    speedMultiplier,
    setSpeedMultiplier,
    currentTime,
    maxTime,
    isPlaying,
    isCompleted,
    currentFrame,
    ganttChart,
    results,
    summary,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    jumpToTime,
  } = useSimulation();

  const ALGO_DESCRIPTIONS = {
    FCFS: {
      title: 'First-Come, First-Served (FCFS)',
      type: 'Non-Preemptive',
      complexity: 'O(N log N)',
      desc: 'Executes processes strictly in the order of their arrival. Simple, fair, but suffers from the Convoy Effect if a long job arrives first.',
    },
    SJF: {
      title: 'Shortest Job First (SJF)',
      type: 'Non-Preemptive',
      complexity: 'O(N²)',
      desc: 'Selects the waiting process with the smallest burst time. Provably optimal for minimizing average waiting time among non-preemptive policies.',
    },
    SRTF: {
      title: 'Shortest Remaining Time First (SRTF)',
      type: 'Preemptive SJF',
      complexity: 'O(N²)',
      desc: 'Preemptive counterpart to SJF. Whenever a new job arrives with a burst time less than the running process’s remaining time, CPU context switches immediately.',
    },
    Priority: {
      title: 'Priority Scheduling (Non-Preemptive)',
      type: 'Non-Preemptive',
      complexity: 'O(N²)',
      desc: 'Allocates CPU to the highest-priority arrived process (Convention: lower integer = higher priority, e.g. Priority 1 > Priority 2).',
    },
    Priority_Preemptive: {
      title: 'Priority Scheduling (Preemptive)',
      type: 'Preemptive',
      complexity: 'O(N²)',
      desc: 'Preempts the running job if a newly arrived job has a strictly higher priority (lower priority number).',
    },
    RR: {
      title: 'Round Robin (RR)',
      type: 'Preemptive (Time Sliced)',
      complexity: 'O(N)',
      desc: 'Processes share the CPU cyclically in FIFO order, each granted a slice up to the specified Time Quantum (q). Arriving jobs enter ready queue before preempted jobs.',
    },
  };

  const algoInfo = ALGO_DESCRIPTIONS[algorithm] || ALGO_DESCRIPTIONS.FCFS;

  return (
    <div className="space-y-6">
      {/* Simulation Command Center Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/90 p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Algorithm selector and parameter inputs */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Scheduling Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => {
                  setAlgorithm(e.target.value);
                  reset();
                }}
                className="rounded-xl border border-cyan-500/30 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <option value="FCFS">First Come First Served (FCFS)</option>
                <option value="SJF">Shortest Job First (SJF Non-preemptive)</option>
                <option value="SRTF">Shortest Remaining Time First (SRTF Preemptive)</option>
                <option value="Priority">Priority Scheduling (Non-preemptive)</option>
                <option value="Priority_Preemptive">Priority Scheduling (Preemptive)</option>
                <option value="RR">Round Robin (RR)</option>
              </select>
            </div>

            {/* Time Quantum (Visible for RR) */}
            {algorithm === 'RR' && (
              <div>
                <label className="block text-[11px] font-mono uppercase text-cyan-300 mb-1">
                  Time Quantum (q)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={timeQuantum}
                    onChange={(e) => {
                      setTimeQuantum(Math.max(1, Number(e.target.value)));
                      reset();
                    }}
                    className="w-20 rounded-xl border border-cyan-500/40 bg-slate-900 px-3 py-2 font-mono text-xs font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-mono">ticks</span>
                </div>
              </div>
            )}

            {/* Speed Multiplier */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Speed
              </label>
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5">
                <Sliders className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
                <select
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                  className="bg-transparent text-xs text-white focus:outline-none"
                >
                  <option value={0.25} className="bg-slate-900">0.25x (Slow)</option>
                  <option value={0.5} className="bg-slate-900">0.5x</option>
                  <option value={1} className="bg-slate-900">1x (Normal)</option>
                  <option value={2} className="bg-slate-900">2x (Fast)</option>
                  <option value={4} className="bg-slate-900">4x (Instant)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Primary Simulation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={stepBackward}
              disabled={currentTime <= 0}
              title="Step Backward (t-1)"
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 transition-all"
            >
              <SkipBack className="h-4 w-4" />
              <span className="hidden sm:inline">Step Back</span>
            </button>

            {isPlaying ? (
              <button
                onClick={pause}
                className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/40 px-5 py-2 text-xs font-bold text-amber-300 shadow-md shadow-amber-950/40 hover:bg-amber-900/40 transition-all"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={play}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
              >
                <Play className="h-4 w-4" />
                <span>{currentTime > 0 && currentTime < maxTime ? 'Resume' : 'Run'}</span>
              </button>
            )}

            <button
              onClick={stepForward}
              disabled={currentTime >= maxTime}
              title="Step Forward (t+1)"
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 transition-all"
            >
              <span className="hidden sm:inline">Step</span>
              <SkipForward className="h-4 w-4" />
            </button>

            <button
              onClick={reset}
              title="Reset Simulation"
              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Algorithm Detail & Clock Strip */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-white">{algoInfo.title}</span>
            <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-[10px] text-cyan-300 border border-cyan-500/30">
              {algoInfo.type}
            </span>
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              Complexity: {algoInfo.complexity}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
            <span>Clock: <strong className="text-cyan-300">t={currentTime}</strong> / {maxTime}</span>
            <span>&bull;</span>
            <span className="truncate max-w-xs">{currentFrame.event}</span>
          </div>
        </div>
      </div>

      {/* Embedded Live Gantt Chart */}
      <InteractiveGanttChart
        ganttChart={ganttChart}
        currentTime={currentTime}
        maxTime={maxTime}
        onSelectJob={(id) => {
          setSelectedJobId(id);
          setActiveTab('process');
        }}
      />

      {/* Process Scheduling Metrics Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/90 p-5 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Process Scheduling Calculations & Metrics</h3>
            <p className="text-xs text-slate-400">
              Mathematically computed metrics based on standard OS equations:
              <span className="font-mono text-cyan-300 ml-1">TAT = CT − AT</span> |
              <span className="font-mono text-cyan-300 ml-1">WT = TAT − BT</span> |
              <span className="font-mono text-cyan-300 ml-1">RT = ST − AT</span>
            </p>
          </div>

          <span className="rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-xs font-mono text-emerald-300">
            CPU Util: {summary.cpuUtilization}%
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Process</th>
                <th className="px-4 py-3">Arrival (AT)</th>
                <th className="px-4 py-3">Burst (BT)</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">First Start (ST)</th>
                <th className="px-4 py-3">Completion (CT)</th>
                <th className="px-4 py-3 text-cyan-300 font-bold">Turnaround (TAT)</th>
                <th className="px-4 py-3 text-blue-300 font-bold">Waiting (WT)</th>
                <th className="px-4 py-3 text-violet-300 font-bold">Response (RT)</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {results.length > 0 ? (
                results.map((r) => {
                  return (
                    <tr key={r.jobId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: r.color || '#3b82f6' }}
                          />
                          <span className="text-white">{r.jobId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{r.arrivalTime}</td>
                      <td className="px-4 py-3 text-slate-300">{r.burstTime}</td>
                      <td className="px-4 py-3 text-slate-300">{r.priority}</td>
                      <td className="px-4 py-3 text-slate-300">{r.startTime >= 0 ? r.startTime : '—'}</td>
                      <td className="px-4 py-3 text-white font-semibold">{r.completionTime}</td>
                      <td className="px-4 py-3 text-cyan-300 font-bold">{r.turnaroundTime}</td>
                      <td className="px-4 py-3 text-blue-300 font-bold">{r.waitingTime}</td>
                      <td className="px-4 py-3 text-violet-300 font-bold">{r.responseTime}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedJobId(r.jobId);
                            setActiveTab('process');
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-slate-400 font-sans">
                    No simulation results available.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Averages Row */}
            {results.length > 0 && (
              <tfoot className="border-t-2 border-slate-700 bg-slate-900/80 font-mono text-xs font-bold">
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-white uppercase tracking-wider font-sans">
                    System Averages:
                  </td>
                  <td className="px-4 py-3 text-cyan-300">{summary.avgTurnaroundTime} ticks</td>
                  <td className="px-4 py-3 text-blue-300">{summary.avgWaitingTime} ticks</td>
                  <td className="px-4 py-3 text-violet-300">{summary.avgResponseTime} ticks</td>
                  <td className="px-4 py-3 text-right text-[11px] text-slate-400 font-sans">
                    {summary.contextSwitches} Switches
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* OS Scheduling Formula & Reference Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0d1527]/80 p-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold mb-1">
            <Info className="h-4 w-4" />
            <span>Turnaround Time (TAT)</span>
          </div>
          <p className="font-mono text-sm font-semibold text-white mt-1">TAT = CT − Arrival Time</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Total elapsed time from when the process submitted until its completion.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d1527]/80 p-4">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold mb-1">
            <Info className="h-4 w-4" />
            <span>Waiting Time (WT)</span>
          </div>
          <p className="font-mono text-sm font-semibold text-white mt-1">WT = TAT − Burst Time</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Total time spent waiting in the ready queue before receiving CPU time.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d1527]/80 p-4">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono font-bold mb-1">
            <Info className="h-4 w-4" />
            <span>Response Time (RT)</span>
          </div>
          <p className="font-mono text-sm font-semibold text-white mt-1">RT = First Start − Arrival</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Time from arrival until the process first gets allocated CPU time.
          </p>
        </div>
      </div>
    </div>
  );
};
