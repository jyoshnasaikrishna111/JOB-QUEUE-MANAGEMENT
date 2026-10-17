/**
 * OS CPU Scheduling Algorithms & Simulator Core
 * Supports: FCFS, SJF (non-preemptive), SRTF (preemptive), Priority (non-preemptive & preemptive), Round Robin
 */

// Helper to sanitize & clone input jobs
export const prepareJobs = (rawJobs) => {
  return rawJobs.map((j, idx) => ({
    jobId: String(j.jobId || `P${idx + 1}`),
    jobName: String(j.jobName || `Process ${idx + 1}`),
    arrivalTime: Math.max(0, Number(j.arrivalTime) || 0),
    burstTime: Math.max(1, Number(j.burstTime) || 1),
    priority: Math.max(1, Number(j.priority) || 1),
    deadline: j.deadline != null ? Number(j.deadline) : null,
    color: j.color || getDefaultColor(idx),
  }));
};

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
];

export const getDefaultColor = (idx) => DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

// Compute summary metrics from results and gantt chart
export const computeSummary = (results, ganttChart, totalBurstTime) => {
  const n = results.length;
  if (n === 0) {
    return {
      totalTime: 0,
      totalBurstTime: 0,
      idleTime: 0,
      cpuUtilization: 0,
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      contextSwitches: 0,
      throughput: 0,
    };
  }

  const totalTime = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1].endTime : 0;
  let idleTime = 0;
  let contextSwitches = 0;
  let prevJobId = null;

  for (const block of ganttChart) {
    if (block.isIdle) {
      idleTime += (block.endTime - block.startTime);
    } else {
      if (prevJobId !== null && prevJobId !== block.jobId) {
        contextSwitches++;
      }
      prevJobId = block.jobId;
    }
  }

  const cpuBusyTime = totalTime - idleTime;
  const cpuUtilization = totalTime > 0 ? Number(((cpuBusyTime / totalTime) * 100).toFixed(2)) : 0;

  const totalWT = results.reduce((acc, r) => acc + r.waitingTime, 0);
  const totalTAT = results.reduce((acc, r) => acc + r.turnaroundTime, 0);
  const totalRT = results.reduce((acc, r) => acc + r.responseTime, 0);

  return {
    totalTime,
    totalBurstTime,
    idleTime,
    cpuUtilization,
    avgWaitingTime: Number((totalWT / n).toFixed(2)),
    avgTurnaroundTime: Number((totalTAT / n).toFixed(2)),
    avgResponseTime: Number((totalRT / n).toFixed(2)),
    contextSwitches,
    throughput: totalTime > 0 ? Number((n / totalTime).toFixed(4)) : 0,
  };
};

/**
 * 1. FCFS (First Come First Served)
 */
export const runFCFS = (inputJobs) => {
  const jobs = prepareJobs(inputJobs);
  if (jobs.length === 0) return { ganttChart: [], results: [], summary: computeSummary([], [], 0) };

  // Sort by arrival time, then by jobId
  const sorted = [...jobs].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.jobId.localeCompare(b.jobId);
  });

  const ganttChart = [];
  const results = [];
  let currentTime = 0;
  let totalBurst = 0;

  for (const job of sorted) {
    totalBurst += job.burstTime;
    // CPU idle interval
    if (currentTime < job.arrivalTime) {
      ganttChart.push({
        jobId: 'IDLE',
        jobName: 'CPU Idle',
        startTime: currentTime,
        endTime: job.arrivalTime,
        duration: job.arrivalTime - currentTime,
        isIdle: true,
        color: '#334155', // slate-700
      });
      currentTime = job.arrivalTime;
    }

    const startTime = currentTime;
    const completionTime = startTime + job.burstTime;
    currentTime = completionTime;

    ganttChart.push({
      jobId: job.jobId,
      jobName: job.jobName,
      startTime,
      endTime: completionTime,
      duration: job.burstTime,
      isIdle: false,
      color: job.color,
    });

    const turnaroundTime = completionTime - job.arrivalTime;
    const waitingTime = turnaroundTime - job.burstTime;
    const responseTime = startTime - job.arrivalTime;

    results.push({
      ...job,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  }

  // Sort results back by jobId or arrivalTime
  results.sort((a, b) => a.jobId.localeCompare(b.jobId));
  const summary = computeSummary(results, ganttChart, totalBurst);

  return { ganttChart, results, summary };
};

/**
 * 2. SJF (Shortest Job First - Non-preemptive)
 */
export const runSJF = (inputJobs) => {
  const jobs = prepareJobs(inputJobs);
  if (jobs.length === 0) return { ganttChart: [], results: [], summary: computeSummary([], [], 0) };

  const ganttChart = [];
  const results = [];
  let currentTime = 0;
  let completedCount = 0;
  const n = jobs.length;
  const completed = new Set();
  const totalBurst = jobs.reduce((s, j) => s + j.burstTime, 0);

  while (completedCount < n) {
    // Find all arrived, uncompleted jobs
    const available = jobs.filter((j) => !completed.has(j.jobId) && j.arrivalTime <= currentTime);

    if (available.length === 0) {
      // Find the next arrival time
      const uncompleted = jobs.filter((j) => !completed.has(j.jobId));
      const nextArrival = Math.min(...uncompleted.map((j) => j.arrivalTime));
      ganttChart.push({
        jobId: 'IDLE',
        jobName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        duration: nextArrival - currentTime,
        isIdle: true,
        color: '#334155',
      });
      currentTime = nextArrival;
      continue;
    }

    // Pick job with shortest burstTime, tie-breaker: arrivalTime, then jobId
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.jobId.localeCompare(b.jobId);
    });

    const selected = available[0];
    const startTime = currentTime;
    const completionTime = startTime + selected.burstTime;
    currentTime = completionTime;

    ganttChart.push({
      jobId: selected.jobId,
      jobName: selected.jobName,
      startTime,
      endTime: completionTime,
      duration: selected.burstTime,
      isIdle: false,
      color: selected.color,
    });

    completed.add(selected.jobId);
    completedCount++;

    const turnaroundTime = completionTime - selected.arrivalTime;
    const waitingTime = turnaroundTime - selected.burstTime;
    const responseTime = startTime - selected.arrivalTime;

    results.push({
      ...selected,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  }

  results.sort((a, b) => a.jobId.localeCompare(b.jobId));
  const summary = computeSummary(results, ganttChart, totalBurst);

  return { ganttChart, results, summary };
};

/**
 * 3. SRTF (Shortest Remaining Time First - Preemptive SJF)
 */
export const runSRTF = (inputJobs) => {
  const jobs = prepareJobs(inputJobs);
  if (jobs.length === 0) return { ganttChart: [], results: [], summary: computeSummary([], [], 0) };

  const totalBurst = jobs.reduce((s, j) => s + j.burstTime, 0);
  const remainingTime = {};
  const firstStartTime = {};
  const completionTimeMap = {};

  jobs.forEach((j) => {
    remainingTime[j.jobId] = j.burstTime;
    firstStartTime[j.jobId] = -1;
  });

  let currentTime = 0;
  let completedCount = 0;
  const n = jobs.length;
  const rawSegments = []; // { jobId, time }

  while (completedCount < n) {
    const available = jobs.filter((j) => remainingTime[j.jobId] > 0 && j.arrivalTime <= currentTime);

    if (available.length === 0) {
      rawSegments.push({ jobId: 'IDLE', time: currentTime });
      currentTime++;
      continue;
    }

    // Pick job with minimum remaining time
    // Tie-breaker: earlier arrival time, then jobId
    available.sort((a, b) => {
      const remA = remainingTime[a.jobId];
      const remB = remainingTime[b.jobId];
      if (remA !== remB) return remA - remB;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.jobId.localeCompare(b.jobId);
    });

    const currentJob = available[0];
    if (firstStartTime[currentJob.jobId] === -1) {
      firstStartTime[currentJob.jobId] = currentTime;
    }

    rawSegments.push({ jobId: currentJob.jobId, time: currentTime });
    remainingTime[currentJob.jobId]--;

    if (remainingTime[currentJob.jobId] === 0) {
      completedCount++;
      completionTimeMap[currentJob.jobId] = currentTime + 1;
    }

    currentTime++;
  }

  // Compress raw 1-unit segments into ganttChart intervals
  const ganttChart = [];
  const jobMap = new Map(jobs.map((j) => [j.jobId, j]));

  for (let i = 0; i < rawSegments.length; i++) {
    const seg = rawSegments[i];
    const lastBlock = ganttChart[ganttChart.length - 1];

    if (lastBlock && lastBlock.jobId === seg.jobId) {
      lastBlock.endTime++;
      lastBlock.duration++;
    } else {
      const isIdle = seg.jobId === 'IDLE';
      const job = isIdle ? null : jobMap.get(seg.jobId);
      ganttChart.push({
        jobId: seg.jobId,
        jobName: isIdle ? 'CPU Idle' : job.jobName,
        startTime: seg.time,
        endTime: seg.time + 1,
        duration: 1,
        isIdle,
        color: isIdle ? '#334155' : job.color,
      });
    }
  }

  const results = jobs.map((job) => {
    const ct = completionTimeMap[job.jobId];
    const st = firstStartTime[job.jobId];
    const tat = ct - job.arrivalTime;
    const wt = tat - job.burstTime;
    const rt = st - job.arrivalTime;
    return {
      ...job,
      startTime: st,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    };
  });

  results.sort((a, b) => a.jobId.localeCompare(b.jobId));
  const summary = computeSummary(results, ganttChart, totalBurst);

  return { ganttChart, results, summary };
};

/**
 * 4. Priority Scheduling (Non-preemptive standard, lower number = higher priority)
 * Also supports preemptive mode if passed preemptive: true
 */
export const runPriority = (inputJobs, preemptive = false) => {
  if (preemptive) {
    return runPreemptivePriority(inputJobs);
  }

  const jobs = prepareJobs(inputJobs);
  if (jobs.length === 0) return { ganttChart: [], results: [], summary: computeSummary([], [], 0) };

  const ganttChart = [];
  const results = [];
  let currentTime = 0;
  let completedCount = 0;
  const n = jobs.length;
  const completed = new Set();
  const totalBurst = jobs.reduce((s, j) => s + j.burstTime, 0);

  while (completedCount < n) {
    const available = jobs.filter((j) => !completed.has(j.jobId) && j.arrivalTime <= currentTime);

    if (available.length === 0) {
      const uncompleted = jobs.filter((j) => !completed.has(j.jobId));
      const nextArrival = Math.min(...uncompleted.map((j) => j.arrivalTime));
      ganttChart.push({
        jobId: 'IDLE',
        jobName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        duration: nextArrival - currentTime,
        isIdle: true,
        color: '#334155',
      });
      currentTime = nextArrival;
      continue;
    }

    // Lower priority number = Higher priority
    // Tie-breaker: earlier arrivalTime, then jobId
    available.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.jobId.localeCompare(b.jobId);
    });

    const selected = available[0];
    const startTime = currentTime;
    const completionTime = startTime + selected.burstTime;
    currentTime = completionTime;

    ganttChart.push({
      jobId: selected.jobId,
      jobName: selected.jobName,
      startTime,
      endTime: completionTime,
      duration: selected.burstTime,
      isIdle: false,
      color: selected.color,
    });

    completed.add(selected.jobId);
    completedCount++;

    const turnaroundTime = completionTime - selected.arrivalTime;
    const waitingTime = turnaroundTime - selected.burstTime;
    const responseTime = startTime - selected.arrivalTime;

    results.push({
      ...selected,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  }

  results.sort((a, b) => a.jobId.localeCompare(b.jobId));
  const summary = computeSummary(results, ganttChart, totalBurst);

  return { ganttChart, results, summary };
};

export const runPreemptivePriority = (inputJobs) => {
  const jobs = prepareJobs(inputJobs);
  if (jobs.length === 0) return { ganttChart: [], results: [], summary: computeSummary([], [], 0) };

  const totalBurst = jobs.reduce((s, j) => s + j.burstTime, 0);
  const remainingTime = {};
  const firstStartTime = {};
  const completionTimeMap = {};

  jobs.forEach((j) => {
    remainingTime[j.jobId] = j.burstTime;
    firstStartTime[j.jobId] = -1;
  });

  let currentTime = 0;
  let completedCount = 0;
  const n = jobs.length;
  const rawSegments = [];

  while (completedCount < n) {
    const available = jobs.filter((j) => remainingTime[j.jobId] > 0 && j.arrivalTime <= currentTime);

    if (available.length === 0) {
      rawSegments.push({ jobId: 'IDLE', time: currentTime });
      currentTime++;
      continue;
    }

    // Lower priority number = Higher priority
    // Tie-breaker: earlier arrival time, then jobId
    available.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.jobId.localeCompare(b.jobId);
    });

    const currentJob = available[0];
    if (firstStartTime[currentJob.jobId] === -1) {
      firstStartTime[currentJob.jobId] = currentTime;
    }

    rawSegments.push({ jobId: currentJob.jobId, time: currentTime });
    remainingTime[currentJob.jobId]--;

    if (remainingTime[currentJob.jobId] === 0) {
      completedCount++;
      completionTimeMap[currentJob.jobId] = currentTime + 1;
    }

    currentTime++;
  }

  const ganttChart = [];
  const jobMap = new Map(jobs.map((j) => [j.jobId, j]));

  for (let i = 0; i < rawSegments.length; i++) {
    const seg = rawSegments[i];
    const lastBlock = ganttChart[ganttChart.length - 1];

    if (lastBlock && lastBlock.jobId === seg.jobId) {
      lastBlock.endTime++;
      lastBlock.duration++;
    } else {
      const isIdle = seg.jobId === 'IDLE';
      const job = isIdle ? null : jobMap.get(seg.jobId);
      ganttChart.push({
        jobId: seg.jobId,
        jobName: isIdle ? 'CPU Idle' : job.jobName,
        startTime: seg.time,
        endTime: seg.time + 1,
        duration: 1,
        isIdle,
        color: isIdle ? '#334155' : job.color,
      });
    }
  }

  const results = jobs.map((job) => {
    const ct = completionTimeMap[job.jobId];
    const st = firstStartTime[job.jobId];
    const tat = ct - job.arrivalTime;
    const wt = tat - job.burstTime;
    const rt = st - job.arrivalTime;
    return {
      ...job,
      startTime: st,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    };
  });

  results.sort((a, b) => a.jobId.localeCompare(b.jobId));
  const summary = computeSummary(results, ganttChart, totalBurst);

  return { ganttChart, results, summary };
};

/**
 * 5. Round Robin (RR)
 * Standard OS Ready Queue FIFO with Arrival at preemption boundary rule
 */
export const runRoundRobin = (inputJobs, timeQuantum = 2) => {
  const q = Math.max(1, Number(timeQuantum) || 2);
  const jobs = prepareJobs(inputJobs);
  if (jobs.length === 0) return { ganttChart: [], results: [], summary: computeSummary([], [], 0) };

  const totalBurst = jobs.reduce((s, j) => s + j.burstTime, 0);
  const remainingTime = {};
  const firstStartTime = {};
  const completionTimeMap = {};
  const isEnqueued = new Set();

  jobs.forEach((j) => {
    remainingTime[j.jobId] = j.burstTime;
    firstStartTime[j.jobId] = -1;
  });

  // Sort by arrival time initially
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.jobId.localeCompare(b.jobId);
  });

  const readyQueue = [];
  const ganttChart = [];
  let currentTime = 0;
  let completedCount = 0;
  const n = jobs.length;
  const jobMap = new Map(jobs.map((j) => [j.jobId, j]));

  // Helper to push arriving jobs up to time T into readyQueue
  const checkArrivingJobs = (time) => {
    for (const job of sortedJobs) {
      if (!isEnqueued.has(job.jobId) && job.arrivalTime <= time) {
        readyQueue.push(job.jobId);
        isEnqueued.add(job.jobId);
      }
    }
  };

  // Initial check at t=0
  checkArrivingJobs(currentTime);

  while (completedCount < n) {
    if (readyQueue.length === 0) {
      // Find the next job arriving
      const unarrived = sortedJobs.filter((j) => !isEnqueued.has(j.jobId));
      if (unarrived.length > 0) {
        const nextArrival = unarrived[0].arrivalTime;
        ganttChart.push({
          jobId: 'IDLE',
          jobName: 'CPU Idle',
          startTime: currentTime,
          endTime: nextArrival,
          duration: nextArrival - currentTime,
          isIdle: true,
          color: '#334155',
        });
        currentTime = nextArrival;
        checkArrivingJobs(currentTime);
      }
      continue;
    }

    const currentJobId = readyQueue.shift();
    const currentJob = jobMap.get(currentJobId);

    if (firstStartTime[currentJobId] === -1) {
      firstStartTime[currentJobId] = currentTime;
    }

    const runSlice = Math.min(q, remainingTime[currentJobId]);
    const sliceStart = currentTime;
    const sliceEnd = currentTime + runSlice;

    ganttChart.push({
      jobId: currentJobId,
      jobName: currentJob.jobName,
      startTime: sliceStart,
      endTime: sliceEnd,
      duration: runSlice,
      isIdle: false,
      color: currentJob.color,
    });

    currentTime = sliceEnd;
    remainingTime[currentJobId] -= runSlice;

    // IMPORTANT OS RULE: Arriving jobs at currentTime enter the ready queue BEFORE
    // the preempted job re-enters!
    checkArrivingJobs(currentTime);

    if (remainingTime[currentJobId] === 0) {
      completedCount++;
      completionTimeMap[currentJobId] = currentTime;
    } else {
      readyQueue.push(currentJobId);
    }
  }

  const results = jobs.map((job) => {
    const ct = completionTimeMap[job.jobId];
    const st = firstStartTime[job.jobId];
    const tat = ct - job.arrivalTime;
    const wt = tat - job.burstTime;
    const rt = st - job.arrivalTime;
    return {
      ...job,
      startTime: st,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    };
  });

  results.sort((a, b) => a.jobId.localeCompare(b.jobId));
  const summary = computeSummary(results, ganttChart, totalBurst);

  return { ganttChart, results, summary };
};

/**
 * Compare all algorithms for a given job set
 */
export const compareAlgorithms = (jobs, timeQuantum = 2) => {
  const algorithms = [
    { id: 'FCFS', name: 'First Come First Served (FCFS)', run: () => runFCFS(jobs) },
    { id: 'SJF', name: 'Shortest Job First (SJF Non-preemptive)', run: () => runSJF(jobs) },
    { id: 'SRTF', name: 'Shortest Remaining Time First (SRTF Preemptive)', run: () => runSRTF(jobs) },
    { id: 'Priority', name: 'Priority Scheduling (Non-preemptive)', run: () => runPriority(jobs, false) },
    { id: 'Priority_Preemptive', name: 'Priority Scheduling (Preemptive)', run: () => runPriority(jobs, true) },
    { id: 'RR', name: `Round Robin (RR, q=${timeQuantum})`, run: () => runRoundRobin(jobs, timeQuantum) },
  ];

  const comparisons = algorithms.map((algo) => {
    const result = algo.run();
    return {
      id: algo.id,
      name: algo.name,
      ...result.summary,
      ganttChart: result.ganttChart,
      results: result.results,
    };
  });

  // Find best algorithm based on lowest average waiting time
  let bestAlgo = comparisons[0];
  for (const c of comparisons) {
    if (c.avgWaitingTime < bestAlgo.avgWaitingTime) {
      bestAlgo = c;
    }
  }

  return {
    comparisons,
    bestAlgorithm: {
      id: bestAlgo.id,
      name: bestAlgo.name,
      avgWaitingTime: bestAlgo.avgWaitingTime,
      avgTurnaroundTime: bestAlgo.avgTurnaroundTime,
      cpuUtilization: bestAlgo.cpuUtilization,
    },
  };
};

/**
 * Generate Step-by-Step Simulation Frames
 * Simulates a discrete clock (t = 0, 1, 2, ...) and multi-queue state transitions:
 * - Job Queue: jobs not yet arrived (t < arrivalTime)
 * - Ready Queue: jobs arrived and waiting for CPU
 * - Running Process: job currently on CPU
 * - Waiting/Blocked Queue: jobs blocked (e.g. simulated I/O event)
 * - Completed Queue: jobs that finished execution
 */
export const generateSimulationTimeline = (inputJobs, algorithm = 'FCFS', timeQuantum = 2, blockedJobIds = []) => {
  // Obtain base simulation run
  let simResult;
  switch (algorithm) {
    case 'SJF':
      simResult = runSJF(inputJobs);
      break;
    case 'SRTF':
      simResult = runSRTF(inputJobs);
      break;
    case 'Priority':
      simResult = runPriority(inputJobs, false);
      break;
    case 'Priority_Preemptive':
      simResult = runPriority(inputJobs, true);
      break;
    case 'RR':
      simResult = runRoundRobin(inputJobs, timeQuantum);
      break;
    case 'FCFS':
    default:
      simResult = runFCFS(inputJobs);
      break;
  }

  const { ganttChart, results, summary } = simResult;
  const jobs = prepareJobs(inputJobs);
  const totalTime = summary.totalTime;

  // Build second-by-second execution log
  const timeline = [];
  const remainingMap = {};
  jobs.forEach((j) => {
    remainingMap[j.jobId] = j.burstTime;
  });

  for (let t = 0; t <= totalTime; t++) {
    // Determine which gantt block is active at time t
    // If t == totalTime, CPU has finished
    const activeBlock = t < totalTime ? ganttChart.find((b) => t >= b.startTime && t < b.endTime) : null;
    const runningJobId = (activeBlock && !activeBlock.isIdle) ? activeBlock.jobId : null;

    // Remaining time computation up to time t
    const currentRemaining = {};
    jobs.forEach((j) => {
      // count how many units this job ran before time t
      let unitsRan = 0;
      for (const block of ganttChart) {
        if (block.jobId === j.jobId) {
          if (t <= block.startTime) {
            // didn't start this block yet
          } else if (t >= block.endTime) {
            unitsRan += block.duration;
          } else {
            unitsRan += (t - block.startTime);
          }
        }
      }
      currentRemaining[j.jobId] = Math.max(0, j.burstTime - unitsRan);
    });

    const jobQueue = [];      // t < arrivalTime
    const readyQueue = [];    // arrived, remaining > 0, not running, not blocked
    const waitingQueue = [];  // blocked
    const completedQueue = [];// remaining == 0

    jobs.forEach((j) => {
      const rem = currentRemaining[j.jobId];
      if (t < j.arrivalTime) {
        jobQueue.push({ ...j, remainingTime: rem });
      } else if (rem === 0) {
        completedQueue.push({ ...j, remainingTime: 0 });
      } else if (j.jobId === runningJobId) {
        // currently running
      } else if (blockedJobIds.includes(j.jobId)) {
        waitingQueue.push({ ...j, remainingTime: rem });
      } else {
        readyQueue.push({ ...j, remainingTime: rem });
      }
    });

    const runningJobObj = runningJobId
      ? { ...jobs.find((j) => j.jobId === runningJobId), remainingTime: currentRemaining[runningJobId] }
      : null;

    let event = '';
    if (t === 0) event = 'Simulation initialized at t=0';
    else if (t === totalTime) event = 'All jobs executed successfully!';
    else if (!runningJobObj) event = `CPU is IDLE at t=${t}`;
    else event = `${runningJobObj.jobId} executing on CPU (Burst remaining: ${runningJobObj.remainingTime})`;

    timeline.push({
      time: t,
      runningJob: runningJobObj,
      jobQueue,
      readyQueue,
      waitingQueue,
      completedQueue,
      event,
    });
  }

  return {
    algorithm,
    timeQuantum,
    ganttChart,
    results,
    summary,
    timeline,
  };
};
