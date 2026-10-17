/**
 * API Service with seamless Dual Mode (Backend REST API + LocalStorage Fallback)
 * Automatically attempts to communicate with Node/Express backend at http://localhost:5000/api.
 * If backend is unreachable or offline, transparently falls back to localStorage & client algorithms.
 */

import {
  SAMPLE_JOBS as DEFAULT_SAMPLE_JOBS,
} from './sampleData.js';

import {
  generateSimulationTimeline,
  compareAlgorithms as runClientCompare,
} from '../algorithms/scheduling.js';

const API_BASE_URL = 'http://localhost:5000/api';
const STORAGE_KEY = 'os_job_queue_jobs_v1';

let isBackendAvailable = null;

export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      isBackendAvailable = true;
      return true;
    }
    isBackendAvailable = false;
    return false;
  } catch (e) {
    isBackendAvailable = false;
    return false;
  }
};

export const getStoredJobs = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage read error, using sample jobs', e);
  }
  return DEFAULT_SAMPLE_JOBS;
};

export const saveStoredJobs = (jobs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }
};

// Jobs API
export const apiFetchJobs = async () => {
  if (isBackendAvailable !== false) {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const json = await res.json();
        isBackendAvailable = true;
        saveStoredJobs(json.data);
        return { jobs: json.data, source: 'backend' };
      }
    } catch (e) {
      isBackendAvailable = false;
    }
  }
  return { jobs: getStoredJobs(), source: 'local' };
};

export const apiCreateJob = async (jobData) => {
  if (isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create job');
      return json.data;
    } catch (e) {
      // Fallback
      console.warn('Backend create failed, fallback to local', e);
    }
  }

  // Local storage creation
  const jobs = getStoredJobs();
  if (jobs.some((j) => j.jobId.toUpperCase() === String(jobData.jobId).toUpperCase())) {
    throw new Error(`Job ID ${jobData.jobId} already exists`);
  }
  const newJob = {
    ...jobData,
    jobId: String(jobData.jobId).trim().toUpperCase(),
    arrivalTime: Math.max(0, Number(jobData.arrivalTime) || 0),
    burstTime: Math.max(1, Number(jobData.burstTime) || 1),
    priority: Math.max(1, Number(jobData.priority) || 1),
    status: 'Waiting',
  };
  const updated = [...jobs, newJob];
  saveStoredJobs(updated);
  return newJob;
};

export const apiUpdateJob = async (jobId, jobData) => {
  if (isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update job');
      return json.data;
    } catch (e) {
      console.warn('Backend update failed, fallback to local', e);
    }
  }

  const jobs = getStoredJobs();
  const index = jobs.findIndex((j) => j.jobId.toUpperCase() === String(jobId).toUpperCase());
  if (index === -1) throw new Error(`Job ${jobId} not found`);

  jobs[index] = {
    ...jobs[index],
    ...jobData,
    ...(jobData.arrivalTime !== undefined && { arrivalTime: Math.max(0, Number(jobData.arrivalTime)) }),
    ...(jobData.burstTime !== undefined && { burstTime: Math.max(1, Number(jobData.burstTime)) }),
    ...(jobData.priority !== undefined && { priority: Math.max(1, Number(jobData.priority)) }),
  };
  saveStoredJobs(jobs);
  return jobs[index];
};

export const apiDeleteJob = async (jobId) => {
  if (isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Backend delete failed, fallback to local', e);
    }
  }

  const jobs = getStoredJobs();
  const filtered = jobs.filter((j) => j.jobId.toUpperCase() !== String(jobId).toUpperCase());
  saveStoredJobs(filtered);
  return true;
};

export const apiResetJobs = async () => {
  if (isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/action/reset`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        saveStoredJobs(json.data);
        return json.data;
      }
    } catch (e) {
      console.warn('Backend reset failed, fallback to local', e);
    }
  }

  saveStoredJobs(DEFAULT_SAMPLE_JOBS);
  return DEFAULT_SAMPLE_JOBS;
};

export const apiClearJobs = async () => {
  if (isBackendAvailable) {
    try {
      await fetch(`${API_BASE_URL}/jobs/action/clear`, { method: 'POST' });
    } catch (e) {
      console.warn('Backend clear failed', e);
    }
  }
  saveStoredJobs([]);
  return [];
};

// Simulation API
export const apiRunSimulation = async (jobs, algorithm, timeQuantum, blockedJobIds) => {
  if (isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE_URL}/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs, algorithm, timeQuantum, blockedJobIds }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Backend simulation failed, calculating client-side', e);
    }
  }

  // Client calculation
  return generateSimulationTimeline(jobs, algorithm, timeQuantum, blockedJobIds);
};

export const apiCompareAlgorithms = async (jobs, timeQuantum) => {
  if (isBackendAvailable) {
    try {
      const res = await fetch(`${API_BASE_URL}/simulation/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs, timeQuantum }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Backend compare failed, calculating client-side', e);
    }
  }

  // Client calculation
  return runClientCompare(jobs, timeQuantum);
};
