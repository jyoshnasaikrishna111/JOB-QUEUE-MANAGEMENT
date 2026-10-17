import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Clock } from 'lucide-react';

export const InteractiveGanttChart = ({
  ganttChart = [],
  currentTime = 0,
  maxTime = 0,
  onSelectJob,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1); // 0.75, 1, 1.5, 2
  const [hoveredBlock, setHoveredBlock] = useState(null);

  if (!ganttChart || ganttChart.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800 bg-[#0d1527]/60 text-slate-400 text-xs">
        No execution timeline available. Add jobs to view the Gantt chart.
      </div>
    );
  }

  // Calculate pixel scale per time unit
  const basePxPerTick = 42 * zoomLevel;
  const totalChartWidth = Math.max(700, maxTime * basePxPerTick);

  // Time ruler tick marks (0, 1, 2, ... maxTime)
  const timeTicks = [];
  for (let t = 0; t <= maxTime; t++) {
    timeTicks.push(t);
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/90 p-5 backdrop-blur-md shadow-xl">
      {/* Gantt Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white">CPU Execution Timeline</h3>
          <p className="text-xs text-slate-400">
            Interactive Gantt chart showing process allocation slices and idle intervals.
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Zoom:</span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
            disabled={zoomLevel <= 0.6}
            className="rounded-lg border border-slate-700 bg-slate-850 p-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-xs text-cyan-300 w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.2).toFixed(2))))}
            disabled={zoomLevel >= 2.5}
            className="rounded-lg border border-slate-700 bg-slate-850 p-1.5 text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title="Reset Zoom"
            className="rounded-lg border border-slate-700 bg-slate-850 p-1.5 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Gantt Scroll Container */}
      <div className="mt-5 overflow-x-auto pb-4 pt-2">
        <div style={{ width: `${totalChartWidth}px` }} className="relative select-none">
          {/* Active OS Clock Marker Line */}
          {currentTime <= maxTime && (
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none transition-all duration-300"
              style={{ left: `${currentTime * basePxPerTick}px` }}
            >
              <div className="h-full w-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
              <div className="absolute -top-3 -left-3 flex items-center justify-center rounded-full bg-cyan-400 text-slate-950 px-1.5 py-0.5 text-[9px] font-mono font-bold shadow-md">
                t={currentTime}
              </div>
            </div>
          )}

          {/* Gantt Process Blocks Track */}
          <div className="relative flex h-16 w-full rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-inner">
            {ganttChart.map((block, idx) => {
              const blockWidth = block.duration * basePxPerTick;
              const isPast = currentTime >= block.endTime;
              const isCurrent = currentTime >= block.startTime && currentTime < block.endTime;

              return (
                <div
                  key={`${block.jobId}-${block.startTime}-${idx}`}
                  style={{
                    width: `${blockWidth}px`,
                    backgroundColor: block.isIdle ? 'transparent' : block.color || '#3b82f6',
                  }}
                  onMouseEnter={() => setHoveredBlock(block)}
                  onMouseLeave={() => setHoveredBlock(null)}
                  onClick={() => onSelectJob && !block.isIdle && onSelectJob(block.jobId)}
                  className={`relative flex flex-col items-center justify-center border-r border-slate-900/60 font-mono transition-all cursor-pointer ${
                    block.isIdle
                      ? 'bg-[repeating-linear-gradient(45deg,#1e293b,#1e293b_10px,#0f172a_10px,#0f172a_20px)] text-slate-400'
                      : 'text-white hover:brightness-110 shadow-sm'
                  } ${isCurrent ? 'ring-2 ring-cyan-300 z-10' : ''}`}
                >
                  <span className="font-bold text-xs truncate px-1 drop-shadow-sm">
                    {block.jobId}
                  </span>
                  <span className="text-[10px] opacity-80 drop-shadow-sm">
                    {block.duration}t
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time Ruler (Tick markers and numbers) */}
          <div className="relative mt-2 h-7 w-full border-t border-slate-700/60 font-mono text-[10px] text-slate-400">
            {timeTicks.map((t) => (
              <div
                key={t}
                className="absolute flex flex-col items-center -translate-x-1/2"
                style={{ left: `${t * basePxPerTick}px` }}
              >
                <div className="h-1.5 w-px bg-slate-600" />
                <span className="mt-0.5">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip Details Card */}
      {hoveredBlock && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-2 text-xs">
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: hoveredBlock.color || '#06b6d4' }}
            />
            <span className="font-bold text-white font-mono">{hoveredBlock.jobId}</span>
            <span className="text-slate-300">{hoveredBlock.jobName}</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-slate-300 text-[11px]">
            <span>Start: <strong className="text-white">{hoveredBlock.startTime}</strong></span>
            <span>End: <strong className="text-white">{hoveredBlock.endTime}</strong></span>
            <span>Duration: <strong className="text-cyan-300">{hoveredBlock.duration} ticks</strong></span>
            <span>Type: <strong className={hoveredBlock.isIdle ? 'text-amber-400' : 'text-emerald-400'}>{hoveredBlock.isIdle ? 'IDLE' : 'BURST'}</strong></span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-4 rounded bg-[repeating-linear-gradient(45deg,#334155,#334155_3px,#0f172a_3px,#0f172a_6px)]" />
            <span>CPU Idle Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-4 rounded bg-cyan-400" />
            <span>Active Process Slice</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-1 bg-cyan-400" />
            <span>Live Clock Cursor (t)</span>
          </div>
        </div>

        <span className="text-[11px] font-mono">
          Total Simulation Duration: <strong className="text-white">{maxTime} ticks</strong>
        </span>
      </div>
    </div>
  );
};
