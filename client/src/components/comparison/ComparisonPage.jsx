import React from 'react';
import { useJobs } from '../../context/JobContext';
import { useSimulation } from '../../context/SimulationContext';
import {
  Scale,
  Award,
  Zap,
  TrendingDown,
  Clock,
  Cpu,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ComparisonPage = ({ setActiveTab }) => {
  const { jobs } = useJobs();
  const { comparisonData, timeQuantum, setAlgorithm } = useSimulation();

  if (!comparisonData || !comparisonData.comparisons) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-[#0d1527]/60 text-slate-400 text-xs">
        No job workload available to compare. Add processes to see benchmark analysis.
      </div>
    );
  }

  const { comparisons, bestAlgorithm } = comparisonData;

  // Chart data formatting
  const chartData = comparisons.map((c) => ({
    name: c.id.replace('_Preemptive', ' (P)'),
    fullName: c.name,
    avgWT: c.avgWaitingTime,
    avgTAT: c.avgTurnaroundTime,
    avgRT: c.avgResponseTime,
    cpuUtil: c.cpuUtilization,
    contextSwitches: c.contextSwitches,
  }));

  return (
    <div className="space-y-6">
      {/* Header and Recommendation Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Scale className="h-6 w-6 text-cyan-400" />
            Scheduling Algorithm Comparison & Benchmarks
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Evaluating FCFS, SJF, SRTF, Priority (Non-preemptive & Preemptive), and Round Robin on the current {jobs.length} jobs.
          </p>
        </div>

        {/* Best Algorithm Badge */}
        {bestAlgorithm && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 backdrop-blur-md shadow-lg shadow-emerald-950/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                <Zap className="h-3 w-3" /> Optimal Performance
              </div>
              <h3 className="text-sm font-bold text-white">{bestAlgorithm.name}</h3>
              <p className="text-[11px] text-slate-400">
                Lowest Avg Waiting Time: <strong className="text-emerald-300 font-mono">{bestAlgorithm.avgWaitingTime} ticks</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/90 p-5 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Algorithm Performance Matrix</h3>
            <p className="text-xs text-slate-400">Standardized metrics across identical workloads</p>
          </div>
          <span className="rounded-lg bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 text-xs font-mono text-cyan-300">
            Workload: {jobs.length} Processes
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Algorithm</th>
                <th className="px-4 py-3.5 text-blue-300 font-bold">Avg Waiting Time</th>
                <th className="px-4 py-3.5 text-cyan-300 font-bold">Avg Turnaround Time</th>
                <th className="px-4 py-3.5 text-violet-300 font-bold">Avg Response Time</th>
                <th className="px-4 py-3.5 text-emerald-300 font-bold">CPU Utilization</th>
                <th className="px-4 py-3.5">Context Switches</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {comparisons.map((item) => {
                const isBest = bestAlgorithm && item.id === bestAlgorithm.id;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      isBest ? 'bg-emerald-950/15' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-sans font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {isBest && (
                          <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 text-[9px] font-mono border border-emerald-500/40">
                            BEST
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-blue-300 font-bold">{item.avgWaitingTime} ticks</td>
                    <td className="px-4 py-3.5 text-cyan-300 font-bold">{item.avgTurnaroundTime} ticks</td>
                    <td className="px-4 py-3.5 text-violet-300 font-bold">{item.avgResponseTime} ticks</td>
                    <td className="px-4 py-3.5 text-emerald-300 font-bold">{item.cpuUtilization}%</td>
                    <td className="px-4 py-3.5 text-slate-300">{item.contextSwitches}</td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <button
                        onClick={() => {
                          setAlgorithm(item.id);
                          setActiveTab('simulator');
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-cyan-950/40 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                      >
                        Simulate &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Time Metrics Comparison */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-white">Waiting vs Turnaround vs Response Time</h3>
            <p className="text-xs text-slate-400">Lower values indicate superior scheduling efficiency.</p>
          </div>

          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="avgWT" name="Avg Waiting Time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgTAT" name="Avg Turnaround Time" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgRT" name="Avg Response Time" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: CPU Utilization & Context Switches */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/90 p-5 backdrop-blur-md shadow-xl">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-white">CPU Overhead & Utilization</h3>
            <p className="text-xs text-slate-400">Context switches impact cache locality and dispatch overhead.</p>
          </div>

          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="contextSwitches" name="Context Switches" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cpuUtil" name="CPU Utilization %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
