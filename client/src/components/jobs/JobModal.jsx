import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Edit2, AlertCircle } from 'lucide-react';
import { getDefaultColor } from '../../algorithms/scheduling';

export const JobModal = ({ isOpen, onClose, onSubmit, initialJob = null, existingJobIds = [] }) => {
  const isEditing = Boolean(initialJob);

  const [jobId, setJobId] = useState('');
  const [jobName, setJobName] = useState('');
  const [arrivalTime, setArrivalTime] = useState(0);
  const [burstTime, setBurstTime] = useState(4);
  const [priority, setPriority] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialJob) {
      setJobId(initialJob.jobId || '');
      setJobName(initialJob.jobName || '');
      setArrivalTime(initialJob.arrivalTime ?? 0);
      setBurstTime(initialJob.burstTime ?? 4);
      setPriority(initialJob.priority ?? 1);
      setDeadline(initialJob.deadline != null ? initialJob.deadline : '');
      setColor(initialJob.color || '#3b82f6');
    } else {
      // Suggest next available P number
      const nextId = `P${existingJobIds.length + 1}`;
      setJobId(nextId);
      setJobName(`Process ${existingJobIds.length + 1}`);
      setArrivalTime(0);
      setBurstTime(4);
      setPriority(1);
      setDeadline('');
      setColor(getDefaultColor(existingJobIds.length));
    }
    setError('');
  }, [initialJob, isOpen, existingJobIds]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanId = jobId.trim().toUpperCase();
    if (!cleanId) {
      setError('Job ID is required.');
      return;
    }

    if (!isEditing && existingJobIds.includes(cleanId)) {
      setError(`Job ID "${cleanId}" already exists. Please choose a unique ID.`);
      return;
    }

    if (!jobName.trim()) {
      setError('Job Name is required.');
      return;
    }

    const numAT = Number(arrivalTime);
    const numBT = Number(burstTime);
    const numPri = Number(priority);

    if (isNaN(numAT) || numAT < 0) {
      setError('Arrival Time cannot be negative.');
      return;
    }

    if (isNaN(numBT) || numBT <= 0) {
      setError('Burst Time must be a positive integer greater than 0.');
      return;
    }

    if (isNaN(numPri) || numPri < 1) {
      setError('Priority must be at least 1 (1 = Highest Priority).');
      return;
    }

    onSubmit({
      jobId: cleanId,
      jobName: jobName.trim(),
      arrivalTime: numAT,
      burstTime: numBT,
      priority: numPri,
      deadline: deadline !== '' ? Number(deadline) : null,
      color,
      status: initialJob ? initialJob.status : 'Waiting',
    });

    onClose();
  };

  const PRESET_COLORS = [
    '#3b82f6', // blue
    '#06b6d4', // cyan
    '#8b5cf6', // violet
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#f97316', // orange
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Job: ${initialJob?.jobId}` : 'Create New OS Process / Job'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Job ID */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Job ID <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              disabled={isEditing}
              value={jobId}
              onChange={(e) => setJobId(e.target.value.toUpperCase())}
              placeholder="e.g. P1, P2"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white font-mono placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* Job Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Job / Process Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g. Video Render, DB Query"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Arrival Time */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Arrival Time (t) <span className="text-cyan-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">Clock time when job enters Job Queue</p>
          </div>

          {/* Burst Time */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Burst Time (CPU ticks) <span className="text-cyan-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={burstTime}
              onChange={(e) => setBurstTime(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">Total CPU cycles required</p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Priority Level <span className="text-cyan-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">1 = Highest Priority (Standard OS rule)</p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Deadline (Optional)
            </label>
            <input
              type="number"
              min="1"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g. 15"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-white font-mono placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">Target completion clock deadline</p>
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">Process Gantt Color</label>
          <div className="flex items-center gap-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full border-2 transition-all ${
                  color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            {isEditing ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{isEditing ? 'Save Changes' : 'Add to Job Queue'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
