import React from 'react';
import { useJobs } from '../../context/JobContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast = () => {
  const { notifications, removeNotification } = useJobs();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        const isSuccess = n.type === 'success';
        const isError = n.type === 'error';

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
              isSuccess
                ? 'border-emerald-500/40 bg-slate-900/90 text-emerald-300'
                : isError
                ? 'border-rose-500/40 bg-slate-900/90 text-rose-300'
                : 'border-cyan-500/40 bg-slate-900/90 text-cyan-300'
            }`}
          >
            {isSuccess && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />}
            {isError && <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />}
            {!isSuccess && !isError && <Info className="h-5 w-5 shrink-0 text-cyan-400 mt-0.5" />}

            <div className="flex-1 text-sm font-medium leading-snug">{n.message}</div>

            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
