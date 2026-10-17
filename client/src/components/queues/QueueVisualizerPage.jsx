import React from 'react';
import { useJobs } from '../../context/JobContext';
import { useSimulation } from '../../context/SimulationContext';
import { Badge } from '../common/Badge';
import {
  Cpu,
  Layers,
  ArrowRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  AlertCircle,
  Zap,
  Activity,
  CheckCircle2,
  Hourglass,
  Sliders,
} from 'lucide-react';

export const QueueVisualizerPage = ({ setActiveTab }) => {
  const { setSelectedJobId } = useJobs();
  const {
    algorithm,
    timeQuantum,
    currentTime,
    maxTime,
    isPlaying,
    isCompleted,
    currentFrame,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    jumpToTime,
    toggleBlockJob,
    speedMultiplier,
    setSpeedMultiplier,
  } = useSimulation();

  const runningJob = currentFrame.runningJob;
  const jobQueue = currentFrame.jobQueue;
  const readyQueue = currentFrame.readyQueue;
  const waitingQueue = currentFrame.waitingQueue;
  const completedQueue = currentFrame.completedQueue;

  return (
    <div className="space-y-6">
      {/* Visualizer Header with mini controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0d1527]/80 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Operating System 5-Queue Pipeline Visualizer
            </h1>
            <span className="rounded-lg bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono text-cyan-300">
              {algorithm} {algorithm === 'RR' ? `(q=${timeQuantum})` : ''}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Watch jobs dynamically transition from Job Queue &rarr; Ready Queue &rarr; CPU &rarr; Blocked/Waiting &rarr; Completed.
          </p>
        </div>

        {/* Playback Mini Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900/90 p-1">
            <button
              onClick={stepBackward}
              disabled={currentTime <= 0}
              title="Step Backward (t-1)"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            {isPlaying ? (
              <button
                onClick={pause}
                title="Pause Simulation"
                className="rounded-lg bg-amber-500/20 text-amber-300 p-2 hover:bg-amber-500/30 transition-colors"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={play}
                title="Play Simulation"
                className="rounded-lg bg-cyan-500/20 text-cyan-300 p-2 hover:bg-cyan-500/30 transition-colors"
              >
                <Play className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={stepForward}
              disabled={currentTime >= maxTime}
              title="Step Forward (t+1)"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <button
              onClick={reset}
              title="Reset Clock to t=0"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/90 px-2 py-1 text-xs">
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              className="bg-transparent text-xs text-white focus:outline-none"
            >
              <option value={0.5} className="bg-slate-900">0.5x</option>
              <option value={1} className="bg-slate-900">1x (Normal)</option>
              <option value={2} className="bg-slate-900">2x (Fast)</option>
              <option value={4} className="bg-slate-900">4x (Ultra)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clock Timeline Scrubber */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Clock className="h-3.5 w-3.5" /> Simulation Clock
          </span>
          <span className="font-bold text-white">t = {currentTime} / {maxTime} ticks</span>
        </div>

        <input
          type="range"
          min="0"
          max={maxTime || 1}
          value={currentTime}
          onChange={(e) => jumpToTime(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="mt-2 text-xs font-mono text-cyan-300/90 italic truncate">
          &bull; {currentFrame.event}
        </div>
      </div>

      {/* 5-Queues Visual Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 1. Job Queue (Submitted) */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <h3 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                1. Job Queue
              </h3>
            </div>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
              {jobQueue.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 mb-3">Submitted; awaiting arrival (t &lt; AT)</p>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {jobQueue.length > 0 ? (
              jobQueue.map((job) => (
                <div
                  key={job.jobId}
                  className="rounded-xl border border-slate-800 bg-slate-850/80 p-3 shadow-sm hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">{job.jobId}</span>
                    <span className="text-[10px] font-mono text-slate-400">Pri {job.priority}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 truncate">{job.jobName}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                    <span>Arrives at: t={job.arrivalTime}</span>
                    <span>Burst: {job.burstTime}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-44 text-slate-400 text-xs">
                <span>All submitted jobs have entered system</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Ready Queue */}
        <div className="flex flex-col rounded-2xl border border-blue-500/30 bg-blue-950/10 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <h3 className="text-xs font-mono font-bold tracking-wider text-blue-300 uppercase">
                2. Ready Queue
              </h3>
            </div>
            <span className="rounded-full bg-blue-900/40 px-2 py-0.5 font-mono text-[10px] text-blue-300">
              {readyQueue.length}
            </span>
          </div>
          <p className="text-[11px] text-blue-400/80 mt-2 mb-3">Waiting for CPU core allocation</p>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {readyQueue.length > 0 ? (
              readyQueue.map((job) => (
                <div
                  key={job.jobId}
                  className="rounded-xl border border-blue-500/25 bg-blue-950/30 p-3 shadow-sm hover:border-blue-400/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-200 text-sm">{job.jobId}</span>
                    <span className="rounded bg-blue-900/60 px-1.5 py-0.5 font-mono text-[10px] text-blue-300">
                      Pri {job.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 truncate">{job.jobName}</p>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-blue-500/20 pt-1.5">
                    <span>Rem: {job.remainingTime} ticks</span>
                    <button
                      onClick={() => toggleBlockJob(job.jobId)}
                      title="Simulate I/O request (moves to Waiting/Blocked queue)"
                      className="rounded bg-rose-950/40 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-mono text-rose-300 hover:bg-rose-900/40 transition-colors"
                    >
                      Block (I/O)
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-44 text-slate-400 text-xs text-center px-2">
                <span>No jobs waiting in ready queue</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Running Process (Hero Central CPU Core) */}
        <div className="flex flex-col rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-b from-[#0d2238] to-[#091524] p-4 backdrop-blur-md shadow-2xl shadow-cyan-950/60 glow-running-cpu">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400 animate-spin" />
              <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-200 uppercase">
                3. Running Process
              </h3>
            </div>
            <Badge status={runningJob ? 'Running' : 'Waiting'} size="sm" />
          </div>
          <p className="text-[11px] text-cyan-400/80 mt-2 mb-3">Active CPU processor allocation</p>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
            {runningJob ? (
              <div className="w-full space-y-3">
                {/* Central CPU Core Node */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-cyan-400 bg-cyan-950/60 shadow-xl shadow-cyan-500/30 animate-pulse">
                  <span className="font-mono text-2xl font-black tracking-tight text-white">
                    {runningJob.jobId}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{runningJob.jobName}</h4>
                  <p className="text-xs font-mono text-cyan-300 mt-0.5">
                    Priority: {runningJob.priority}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-300">
                    <span>Progress</span>
                    <span>
                      {runningJob.burstTime - runningJob.remainingTime} / {runningJob.burstTime} ticks
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                      style={{
                        width: `${Math.round(
                          ((runningJob.burstTime - runningJob.remainingTime) / runningJob.burstTime) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Block Trigger for Running Job */}
                <button
                  onClick={() => toggleBlockJob(runningJob.jobId)}
                  className="w-full rounded-xl border border-rose-500/40 bg-rose-950/30 py-2 text-xs font-mono font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors shadow-sm"
                >
                  Simulate I/O Interrupt
                </button>
              </div>
            ) : (
              <div className="space-y-2 py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/60 text-slate-400">
                  <Cpu className="h-8 w-8" />
                </div>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                  CPU IDLE
                </p>
                <p className="text-[11px] text-slate-400">Awaiting ready job dispatch</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Waiting / Blocked Queue */}
        <div className="flex flex-col rounded-2xl border border-rose-500/30 bg-rose-950/10 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <h3 className="text-xs font-mono font-bold tracking-wider text-rose-300 uppercase">
                4. Blocked Queue
              </h3>
            </div>
            <span className="rounded-full bg-rose-900/40 px-2 py-0.5 font-mono text-[10px] text-rose-300">
              {waitingQueue.length}
            </span>
          </div>
          <p className="text-[11px] text-rose-400/80 mt-2 mb-3">Suspended for I/O event completion</p>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {waitingQueue.length > 0 ? (
              waitingQueue.map((job) => (
                <div
                  key={job.jobId}
                  className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 shadow-sm hover:border-rose-400/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-200 text-sm">{job.jobId}</span>
                    <Badge status="Blocked" size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 truncate">{job.jobName}</p>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-rose-500/20 pt-1.5">
                    <span>Rem: {job.remainingTime} ticks</span>
                    <button
                      onClick={() => toggleBlockJob(job.jobId)}
                      className="rounded bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300 hover:bg-emerald-900/40 transition-colors"
                    >
                      Resume (Unblock)
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-44 text-slate-400 text-xs text-center px-2">
                <span>No jobs blocked on I/O</span>
              </div>
            )}
          </div>
        </div>

        {/* 5. Completed Queue */}
        <div className="flex flex-col rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold tracking-wider text-emerald-300 uppercase">
                5. Completed
              </h3>
            </div>
            <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
              {completedQueue.length}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-2 mb-3">Successfully terminated</p>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {completedQueue.length > 0 ? (
              completedQueue.map((job) => (
                <div
                  key={job.jobId}
                  className="rounded-xl border border-emerald-500/25 bg-emerald-950/30 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-200 text-sm">{job.jobId}</span>
                    <span className="text-[10px] font-mono text-emerald-400">Done</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 truncate">{job.jobName}</p>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-emerald-400/80 border-t border-emerald-500/20 pt-1.5">
                    <span>Burst: {job.burstTime}</span>
                    <button
                      onClick={() => {
                        setSelectedJobId(job.jobId);
                        setActiveTab('process');
                      }}
                      className="text-cyan-400 hover:underline"
                    >
                      Inspect &rarr;
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-44 text-slate-400 text-xs text-center px-2">
                <span>Completed processes will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
