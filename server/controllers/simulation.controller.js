import {
  runFCFS,
  runSJF,
  runSRTF,
  runPriority,
  runRoundRobin,
  compareAlgorithms,
  generateSimulationTimeline,
} from '../algorithms/scheduling.js';
import { Job } from '../models/Job.model.js';
import { getDBStatus } from '../config/db.js';
import { SAMPLE_JOBS } from './jobs.controller.js';

export const runSimulation = async (req, res) => {
  try {
    const { algorithm = 'FCFS', timeQuantum = 2, jobs: customJobs, blockedJobIds = [] } = req.body;

    let jobsToRun = customJobs;
    if (!jobsToRun || !Array.isArray(jobsToRun) || jobsToRun.length === 0) {
      if (getDBStatus()) {
        jobsToRun = await Job.find().lean();
      } else {
        jobsToRun = SAMPLE_JOBS;
      }
    }

    if (!jobsToRun || jobsToRun.length === 0) {
      return res.status(400).json({ success: false, message: 'No jobs available to simulate.' });
    }

    const tq = Math.max(1, Number(timeQuantum) || 2);
    const result = generateSimulationTimeline(jobsToRun, algorithm, tq, blockedJobIds);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const compareAllAlgorithms = async (req, res) => {
  try {
    const { jobs: customJobs, timeQuantum = 2 } = req.body;

    let jobsToRun = customJobs;
    if (!jobsToRun || !Array.isArray(jobsToRun) || jobsToRun.length === 0) {
      if (getDBStatus()) {
        jobsToRun = await Job.find().lean();
      } else {
        jobsToRun = SAMPLE_JOBS;
      }
    }

    if (!jobsToRun || jobsToRun.length === 0) {
      return res.status(400).json({ success: false, message: 'No jobs provided to compare.' });
    }

    const tq = Math.max(1, Number(timeQuantum) || 2);
    const comparison = compareAlgorithms(jobsToRun, tq);

    return res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
