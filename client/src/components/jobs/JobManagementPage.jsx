import React, { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { useSimulation } from '../../context/SimulationContext';
import { JobModal } from './JobModal';
import { Badge } from '../common/Badge';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Layers,
} from 'lucide-react';

export const JobManagementPage = ({ setActiveTab }) => {
  const {
    jobs,
    filteredJobs,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    addJob,
    updateJob,
    deleteJob,
    resetToSample,
    clearAllJobs,
    setSelectedJobId,
  } = useJobs();

  const { isPlaying, currentTime } = useSimulation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [sortField, setSortField] = useState('arrivalTime');
  const [sortAsc, setSortAsc] = useState(true);

  const handleOpenAdd = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (jobData) => {
    if (editingJob) {
      await updateJob(editingJob.jobId, jobData);
    } else {
      await addJob(jobData);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="space-y-6">
      {/* Header and Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Layers className="h-6 w-6 text-cyan-400" />
            Process & Job Management
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Define OS processes, configure burst times, priorities, arrival times, and deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={resetToSample}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Reload Samples (P1-P5)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all jobs?')) {
                clearAllJobs();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/40 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>New Job</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1527]/80 p-4 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Process ID (e.g. P1) or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All</option>
                <option value="Waiting" className="bg-slate-900">Waiting</option>
                <option value="Ready" className="bg-slate-900">Ready</option>
                <option value="Running" className="bg-slate-900">Running</option>
                <option value="Blocked" className="bg-slate-900">Blocked</option>
                <option value="Completed" className="bg-slate-900">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5">
              <span className="text-xs text-slate-400">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All Priorities</option>
                <option value="1" className="bg-slate-900">Priority 1 (High)</option>
                <option value="2" className="bg-slate-900">Priority 2</option>
                <option value="3" className="bg-slate-900">Priority 3</option>
                <option value="4" className="bg-slate-900">Priority 4 (Low)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Process Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1527]/90 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th
                  onClick={() => handleSort('jobId')}
                  className="cursor-pointer px-4 py-3.5 hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Job ID</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('jobName')}
                  className="cursor-pointer px-4 py-3.5 hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Job / Process Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('arrivalTime')}
                  className="cursor-pointer px-4 py-3.5 hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Arrival (AT)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('burstTime')}
                  className="cursor-pointer px-4 py-3.5 hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Burst (BT)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="cursor-pointer px-4 py-3.5 hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Deadline</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedJobs.length > 0 ? (
                sortedJobs.map((job) => {
                  return (
                    <tr
                      key={job.jobId}
                      className="group transition-colors hover:bg-slate-800/40"
                    >
                      {/* Job ID */}
                      <td className="px-4 py-3.5 font-mono font-bold">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: job.color || '#3b82f6' }}
                          />
                          <span className="text-white">{job.jobId}</span>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5 font-medium text-slate-200">
                        {job.jobName}
                      </td>

                      {/* Arrival */}
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {job.arrivalTime} ticks
                      </td>

                      {/* Burst */}
                      <td className="px-4 py-3.5 font-mono text-cyan-300 font-bold">
                        {job.burstTime} ticks
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 font-mono text-xs font-semibold text-slate-200">
                          Pri {job.priority}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {job.deadline ? `${job.deadline} ticks` : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <Badge status={job.status || 'Waiting'} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setSelectedJobId(job.jobId);
                              setActiveTab('process');
                            }}
                            title="Inspect Process Details"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(job)}
                            title="Edit Job"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-blue-300 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete process ${job.jobId}?`)) {
                                deleteJob(job.jobId);
                              }
                            }}
                            title="Delete Job"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No matching processes found.</p>
                    <p className="mt-1 text-xs">Adjust your search or filter criteria, or add a new process.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialJob={editingJob}
        existingJobIds={jobs.map((j) => j.jobId)}
      />
    </div>
  );
};
