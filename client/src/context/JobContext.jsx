import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiFetchJobs,
  apiCreateJob,
  apiUpdateJob,
  apiDeleteJob,
  apiResetJobs,
  apiClearJobs,
  checkBackendHealth,
} from '../services/api';
import { SAMPLE_JOBS } from '../services/sampleData';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([]);

  // Toast notification helper
  const addNotification = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const isOnline = await checkBackendHealth();
      setBackendStatus(isOnline ? 'online' : 'offline');

      const { jobs: loadedJobs } = await apiFetchJobs();
      setJobs(loadedJobs);
      setLoading(false);
    };
    init();
  }, []);

  const addJob = async (jobData) => {
    try {
      const created = await apiCreateJob(jobData);
      setJobs((prev) => [...prev, created]);
      addNotification(`Job ${created.jobId} created successfully.`, 'success');
      return true;
    } catch (err) {
      addNotification(err.message || 'Failed to create job', 'error');
      return false;
    }
  };

  const updateJob = async (jobId, jobData) => {
    try {
      const updated = await apiUpdateJob(jobId, jobData);
      setJobs((prev) => prev.map((j) => (j.jobId === jobId ? updated : j)));
      addNotification(`Job ${jobId} updated successfully.`, 'success');
      return true;
    } catch (err) {
      addNotification(err.message || 'Failed to update job', 'error');
      return false;
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await apiDeleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
      if (selectedJobId === jobId) setSelectedJobId(null);
      addNotification(`Job ${jobId} removed from queue.`, 'info');
      return true;
    } catch (err) {
      addNotification(err.message || 'Failed to delete job', 'error');
      return false;
    }
  };

  const resetToSample = async () => {
    try {
      const sample = await apiResetJobs();
      setJobs(sample);
      addNotification('Preloaded sample jobs restored.', 'success');
    } catch (err) {
      addNotification('Failed to reset jobs', 'error');
    }
  };

  const clearAllJobs = async () => {
    try {
      await apiClearJobs();
      setJobs([]);
      setSelectedJobId(null);
      addNotification('All jobs cleared from workspace.', 'info');
    } catch (err) {
      addNotification('Failed to clear jobs', 'error');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || String(job.priority) === String(priorityFilter);
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const selectedJob = jobs.find((j) => j.jobId === selectedJobId) || null;

  return (
    <JobContext.Provider
      value={{
        jobs,
        filteredJobs,
        loading,
        backendStatus,
        selectedJobId,
        selectedJob,
        setSelectedJobId,
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
        notifications,
        removeNotification,
        addNotification,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJobs must be used within JobProvider');
  return context;
};
