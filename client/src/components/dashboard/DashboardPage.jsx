import React from 'react';
import {
  Briefcase,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Cpu,
  Hourglass,
  ArrowRight,
  Plus,
  BarChart3,
  Scale,
  Zap,
} from 'lucide-react';
import { useJobs } from '../../context/JobContext';
import { useSimulation } from '../../context/SimulationContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const DashboardPage = ({ setActiveTab, onOpenAddJob }) => {
  const { jobs } = useJobs();
  const {
    algorithm,
    summary,
    currentFrame,
    currentTime,
    maxTime,
    play,
    isPlaying,
  } = useSimulation();

  // Metrics computation
  const totalJobs = jobs.length;
  const waitingJobsCount = currentFrame.readyQueue.length + currentFrame.jobQueue.length;
  const runningJob = currentFrame.runningJob;
  const completedCount = currentFrame.completedQueue.length;
  const blockedCount = currentFrame.waitingQueue.length;
  const failedCount = 0; // standard OS scheduler

  // Pie chart data for queue distribution
  const queueDistribution = [
    { name: 'Ready / Waiting', value: waitingJobsCount, color: '#3b82f6' },
    { name: 'Running', value: runningJob ? 1 : 0, color: '#06b6d4' },
    { name: 'Blocked (I/O)', value: blockedCount, color: '#f43f5e' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
  ].filter((d) => d.value > 0);

  // Bar chart data comparing burst vs turnaround for current algorithm
  const chartData = (currentFrame.completedQueue || []).length > 0
    ? currentFrame.completedQueue.map((j) => ({
        id: j.jobId,
        burst: j.burstTime,
        tat: (j.completionTime || (currentTime - j.arrivalTime)),
        wt: Math.max(0, (j.completionTime || (currentTime - j.arrivalTime)) - j.burstTime),
      }))
    : jobs.map((j) => ({
        id: j.jobId,
        burst: j.burstTime,
        tat: j.burstTime + 2, // estimated preview
        wt: 2,
      }));

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-[#0d172e] to-slate-900 p-6 backdrop-blur-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-300 mb-3">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>OS KERNEL SCHEDULER ACTIVE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Operating System Job Queue & CPU Engine
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time multi-queue state transitions, deterministic CPU scheduling simulations,
              Gantt analysis, and algorithm comparative benchmarking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('simulator');
                if (!isPlaying) play();
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Launch Simulator</span>
            </button>

            <button
              onClick={onOpenAddJob}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4 text-cyan-400" />
              <span>Create Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary 8 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          subtitle="Registered in workspace"
          icon={Briefcase}
          color="blue"
        />

        {/* Jobs Waiting in Queue */}
        <StatCard
          title="Waiting In Queues"
          value={waitingJobsCount}
          subtitle="Job & Ready queues"
          icon={Hourglass}
          color="amber"
          badge={
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span>Ready: {currentFrame.readyQueue.length}</span>
              <span>•</span>
              <span>Submitted: {currentFrame.jobQueue.length}</span>
            </div>
          }
        />

        {/* Currently Running Job */}
        <StatCard
          title="Running Process"
          value={runningJob ? runningJob.jobId : 'IDLE'}
          subtitle={runningJob ? runningJob.jobName : 'CPU currently idle'}
          icon={PlayCircle}
          color="cyan"
          badge={
            runningJob ? (
              <Badge status="Running" size="sm" />
            ) : (
              <span className="text-[11px] font-mono text-slate-400">Waiting for next arrival</span>
            )
          }
        />

        {/* Completed Jobs */}
        <StatCard
          title="Completed Jobs"
          value={completedCount}
          subtitle={`Progress: ${totalJobs > 0 ? Math.round((completedCount / totalJobs) * 100) : 0}%`}
          icon={CheckCircle2}
          color="emerald"
        />

        {/* Failed Jobs */}
        <StatCard
          title="Failed Jobs"
          value={failedCount}
          subtitle="Zero fault interruptions"
          icon={XCircle}
          color="violet"
        />

        {/* CPU Utilization */}
        <StatCard
          title="CPU Utilization"
          value={summary.cpuUtilization}
          unit="%"
          subtitle={`Idle time: ${summary.idleTime} ticks`}
          icon={Cpu}
          color="cyan"
        />

        {/* Average Waiting Time */}
        <StatCard
          title="Avg Waiting Time"
          value={summary.avgWaitingTime}
          unit="ticks"
          subtitle="Formula: WT = TAT - Burst"
          icon={Clock}
          color="blue"
        />

        {/* Average Turnaround Time */}
        <StatCard
          title="Avg Turnaround Time"
          value={summary.avgTurnaroundTime}
          unit="ticks"
          subtitle="Formula: TAT = CT - Arrival"
          icon={BarChart3}
          color="violet"
        />
      </div>

      {/* Middle Section: Queue Preview + Live Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: CPU & Workload Analysis */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#0d1527]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-base font-semibold text-white">Process Workload & Turnaround Analysis</h2>
              <p className="text-xs text-slate-400">Burst Time vs Completed Turnaround Time</p>
            </div>
            <span className="rounded-lg bg-cyan-950/60 border border-cyan-500/20 px-2.5 py-1 text-xs font-mono text-cyan-300">
              Algo: {algorithm}
            </span>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="id"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="burst" name="Burst Time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tat" name="Turnaround Time" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-2 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-blue-500" />
              <span>Burst Time (CPU needed)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-cyan-500" />
              <span>Turnaround Time (CT − AT)</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Process State Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/80 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Queue Distribution</h2>
            <p className="text-xs text-slate-400">Current state breakdown at t = {currentTime}</p>

            <div className="h-48 mt-2 w-full flex items-center justify-center">
              {queueDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={queueDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {queueDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">No active jobs in queue</p>
              )}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs">
            {queueDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Quick OS Process Queue Strip */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/80 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-white">Live Queue Pipeline Preview</h2>
            <p className="text-xs text-slate-400">
              Operating system flow: Job Queue &rarr; Ready Queue &rarr; Running &rarr; Completed
            </p>
          </div>

          <button
            onClick={() => setActiveTab('queues')}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Open Full 5-Queue Visualizer</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Job Queue */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">1. JOB QUEUE</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                {currentFrame.jobQueue.length}
              </span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {currentFrame.jobQueue.length > 0 ? (
                currentFrame.jobQueue.map((j) => (
                  <div
                    key={j.jobId}
                    className="flex items-center justify-between rounded-lg bg-slate-800/60 px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-mono font-bold text-white">{j.jobId}</span>
                    <span className="text-[10px] text-slate-400">AT: {j.arrivalTime}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">Empty</p>
              )}
            </div>
          </div>

          {/* Ready Queue */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-blue-300">2. READY QUEUE</span>
              <span className="rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] font-mono text-blue-300">
                {currentFrame.readyQueue.length}
              </span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {currentFrame.readyQueue.length > 0 ? (
                currentFrame.readyQueue.map((j) => (
                  <div
                    key={j.jobId}
                    className="flex items-center justify-between rounded-lg bg-blue-900/20 border border-blue-500/20 px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-mono font-bold text-blue-200">{j.jobId}</span>
                    <span className="text-[10px] text-blue-300">Rem: {j.remainingTime}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No ready jobs</p>
              )}
            </div>
          </div>

          {/* Running Process */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 glow-running-cpu">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-cyan-300">3. RUNNING PROCESS</span>
              <Badge status="Running" size="sm" />
            </div>
            {runningJob ? (
              <div className="rounded-lg bg-cyan-900/30 border border-cyan-500/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-white">{runningJob.jobId}</span>
                  <span className="text-xs font-mono text-cyan-300">
                    Rem: {runningJob.remainingTime} ticks
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 truncate">{runningJob.jobName}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        ((runningJob.burstTime - runningJob.remainingTime) / runningJob.burstTime) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                CPU IDLE
              </div>
            )}
          </div>

          {/* Completed Queue */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-emerald-300">5. COMPLETED</span>
              <span className="rounded bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300">
                {currentFrame.completedQueue.length}
              </span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {currentFrame.completedQueue.length > 0 ? (
                currentFrame.completedQueue.map((j) => (
                  <div
                    key={j.jobId}
                    className="flex items-center justify-between rounded-lg bg-emerald-900/20 border border-emerald-500/20 px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-mono font-bold text-emerald-200">{j.jobId}</span>
                    <span className="text-[10px] text-emerald-300">Done</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">None completed yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
