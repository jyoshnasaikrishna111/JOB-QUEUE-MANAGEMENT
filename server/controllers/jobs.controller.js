import { Job } from '../models/Job.model.js';
import { getDBStatus } from '../config/db.js';

// Preloaded sample jobs per specification
export const SAMPLE_JOBS = [
  { jobId: 'P1', jobName: 'Process 1 (Compiler)', arrivalTime: 0, burstTime: 5, priority: 2, status: 'Waiting', color: '#3b82f6' },
  { jobId: 'P2', jobName: 'Process 2 (DB Query)', arrivalTime: 1, burstTime: 3, priority: 1, status: 'Waiting', color: '#06b6d4' },
  { jobId: 'P3', jobName: 'Process 3 (Video Encoder)', arrivalTime: 2, burstTime: 8, priority: 4, status: 'Waiting', color: '#8b5cf6' },
  { jobId: 'P4', jobName: 'Process 4 (Network Sync)', arrivalTime: 3, burstTime: 2, priority: 3, status: 'Waiting', color: '#10b981' },
  { jobId: 'P5', jobName: 'Process 5 (File Compression)', arrivalTime: 4, burstTime: 4, priority: 2, status: 'Waiting', color: '#f59e0b' },
];

// In-Memory store for when MongoDB is unavailable or as local fallback
let memoryJobs = [...SAMPLE_JOBS];

export const getJobs = async (req, res) => {
  try {
    if (getDBStatus()) {
      const jobs = await Job.find().sort({ arrivalTime: 1, jobId: 1 });
      return res.status(200).json({ success: true, count: jobs.length, data: jobs, source: 'mongodb' });
    }
    return res.status(200).json({ success: true, count: memoryJobs.length, data: memoryJobs, source: 'in-memory' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDBStatus()) {
      const job = await Job.findOne({ jobId: id.toUpperCase() });
      if (!job) return res.status(404).json({ success: false, message: `Job ${id} not found` });
      return res.status(200).json({ success: true, data: job });
    }

    const job = memoryJobs.find((j) => j.jobId.toUpperCase() === id.toUpperCase());
    if (!job) return res.status(404).json({ success: false, message: `Job ${id} not found` });
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const { jobId, jobName, arrivalTime, burstTime, priority, deadline, color } = req.body;

    if (!jobId || !jobName) {
      return res.status(400).json({ success: false, message: 'Job ID and Job Name are required.' });
    }

    const cleanJobId = String(jobId).trim().toUpperCase();
    const cleanAT = Number(arrivalTime);
    const cleanBT = Number(burstTime);
    const cleanPri = Number(priority);

    if (isNaN(cleanAT) || cleanAT < 0) {
      return res.status(400).json({ success: false, message: 'Arrival Time must be a non-negative number.' });
    }
    if (isNaN(cleanBT) || cleanBT <= 0) {
      return res.status(400).json({ success: false, message: 'Burst Time must be a positive number greater than 0.' });
    }
    if (isNaN(cleanPri) || cleanPri < 1) {
      return res.status(400).json({ success: false, message: 'Priority must be an integer greater than or equal to 1.' });
    }

    // Check duplicate ID
    if (getDBStatus()) {
      const existing = await Job.findOne({ jobId: cleanJobId });
      if (existing) {
        return res.status(400).json({ success: false, message: `Job ID ${cleanJobId} already exists.` });
      }
      const newJob = await Job.create({
        jobId: cleanJobId,
        jobName: String(jobName).trim(),
        arrivalTime: cleanAT,
        burstTime: cleanBT,
        priority: cleanPri,
        deadline: deadline ? Number(deadline) : null,
        color: color || '#3b82f6',
        status: 'Waiting',
      });
      return res.status(201).json({ success: true, data: newJob, message: 'Job created successfully.' });
    }

    const existingMem = memoryJobs.find((j) => j.jobId.toUpperCase() === cleanJobId);
    if (existingMem) {
      return res.status(400).json({ success: false, message: `Job ID ${cleanJobId} already exists.` });
    }

    const newJob = {
      jobId: cleanJobId,
      jobName: String(jobName).trim(),
      arrivalTime: cleanAT,
      burstTime: cleanBT,
      priority: cleanPri,
      deadline: deadline ? Number(deadline) : null,
      color: color || '#3b82f6',
      status: 'Waiting',
    };
    memoryJobs.push(newJob);
    return res.status(201).json({ success: true, data: newJob, message: 'Job created successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.toUpperCase();
    const { jobName, arrivalTime, burstTime, priority, deadline, color, status } = req.body;

    if (burstTime !== undefined && Number(burstTime) <= 0) {
      return res.status(400).json({ success: false, message: 'Burst time must be positive.' });
    }
    if (arrivalTime !== undefined && Number(arrivalTime) < 0) {
      return res.status(400).json({ success: false, message: 'Arrival time cannot be negative.' });
    }

    if (getDBStatus()) {
      const job = await Job.findOne({ jobId: cleanId });
      if (!job) return res.status(404).json({ success: false, message: `Job ${cleanId} not found` });

      if (jobName) job.jobName = jobName;
      if (arrivalTime !== undefined) job.arrivalTime = Number(arrivalTime);
      if (burstTime !== undefined) job.burstTime = Number(burstTime);
      if (priority !== undefined) job.priority = Number(priority);
      if (deadline !== undefined) job.deadline = deadline ? Number(deadline) : null;
      if (color) job.color = color;
      if (status) job.status = status;

      await job.save();
      return res.status(200).json({ success: true, data: job, message: 'Job updated successfully.' });
    }

    const index = memoryJobs.findIndex((j) => j.jobId.toUpperCase() === cleanId);
    if (index === -1) return res.status(404).json({ success: false, message: `Job ${cleanId} not found` });

    memoryJobs[index] = {
      ...memoryJobs[index],
      ...(jobName && { jobName }),
      ...(arrivalTime !== undefined && { arrivalTime: Number(arrivalTime) }),
      ...(burstTime !== undefined && { burstTime: Number(burstTime) }),
      ...(priority !== undefined && { priority: Number(priority) }),
      ...(deadline !== undefined && { deadline: deadline ? Number(deadline) : null }),
      ...(color && { color }),
      ...(status && { status }),
    };

    return res.status(200).json({ success: true, data: memoryJobs[index], message: 'Job updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.toUpperCase();

    if (getDBStatus()) {
      const result = await Job.findOneAndDelete({ jobId: cleanId });
      if (!result) return res.status(404).json({ success: false, message: `Job ${cleanId} not found` });
      return res.status(200).json({ success: true, message: `Job ${cleanId} deleted.` });
    }

    const index = memoryJobs.findIndex((j) => j.jobId.toUpperCase() === cleanId);
    if (index === -1) return res.status(404).json({ success: false, message: `Job ${cleanId} not found` });

    memoryJobs.splice(index, 1);
    return res.status(200).json({ success: true, message: `Job ${cleanId} deleted.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetSampleJobs = async (req, res) => {
  try {
    if (getDBStatus()) {
      await Job.deleteMany({});
      const created = await Job.insertMany(SAMPLE_JOBS);
      return res.status(200).json({ success: true, data: created, message: 'Sample jobs reloaded successfully.' });
    }

    memoryJobs = JSON.parse(JSON.stringify(SAMPLE_JOBS));
    return res.status(200).json({ success: true, data: memoryJobs, message: 'Sample jobs reloaded successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const clearJobs = async (req, res) => {
  try {
    if (getDBStatus()) {
      await Job.deleteMany({});
    }
    memoryJobs = [];
    return res.status(200).json({ success: true, data: [], message: 'All jobs cleared.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
