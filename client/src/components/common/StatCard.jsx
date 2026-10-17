import React from 'react';

export const StatCard = ({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  color = 'cyan', // 'cyan' | 'blue' | 'violet' | 'emerald' | 'amber'
  badge,
  className = '',
}) => {
  const COLOR_MAP = {
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      valueColor: 'text-cyan-400',
    },
    blue: {
      border: 'hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      valueColor: 'text-blue-400',
    },
    violet: {
      border: 'hover:border-violet-500/40',
      iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
      valueColor: 'text-violet-400',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      valueColor: 'text-emerald-400',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      valueColor: 'text-amber-400',
    },
  };

  const scheme = COLOR_MAP[color] || COLOR_MAP.cyan;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 ${scheme.border} ${scheme.glow} ${className}`}
    >
      {/* Background soft ambient gradient */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-xl" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-white lg:text-3xl">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-110 ${scheme.iconBg}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {badge && <div className="mt-3">{badge}</div>}
    </div>
  );
};
