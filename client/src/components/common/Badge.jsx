import React from 'react';

const STATUS_CONFIGS = {
  Waiting: {
    bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    label: 'Waiting',
  },
  Ready: {
    bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
    label: 'Ready',
  },
  Running: {
    bg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 glow-cyan',
    dot: 'bg-cyan-400 animate-ping',
    label: 'Running',
  },
  Blocked: {
    bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    label: 'Blocked (I/O)',
  },
  Completed: {
    bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'Completed',
  },
  Failed: {
    bg: 'bg-red-500/10 text-red-400 border-red-500/30',
    dot: 'bg-red-500',
    label: 'Failed',
  },
};

export const Badge = ({ status = 'Waiting', className = '', size = 'sm' }) => {
  const conf = STATUS_CONFIGS[status] || STATUS_CONFIGS.Waiting;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-wide transition-all ${
        isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${conf.bg} ${className}`}
    >
      <span className={`inline-block rounded-full ${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${conf.dot}`} />
      <span>{conf.label}</span>
    </span>
  );
};
