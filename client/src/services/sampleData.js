export const SAMPLE_JOBS = [
  {
    jobId: 'P1',
    jobName: 'Process 1 (Compiler)',
    arrivalTime: 0,
    burstTime: 5,
    priority: 2,
    deadline: 12,
    status: 'Waiting',
    color: '#3b82f6', // blue
  },
  {
    jobId: 'P2',
    jobName: 'Process 2 (DB Query)',
    arrivalTime: 1,
    burstTime: 3,
    priority: 1,
    deadline: 8,
    status: 'Waiting',
    color: '#06b6d4', // cyan
  },
  {
    jobId: 'P3',
    jobName: 'Process 3 (Video Encoder)',
    arrivalTime: 2,
    burstTime: 8,
    priority: 4,
    deadline: 20,
    status: 'Waiting',
    color: '#8b5cf6', // violet
  },
  {
    jobId: 'P4',
    jobName: 'Process 4 (Network Sync)',
    arrivalTime: 3,
    burstTime: 2,
    priority: 3,
    deadline: 10,
    status: 'Waiting',
    color: '#10b981', // emerald
  },
  {
    jobId: 'P5',
    jobName: 'Process 5 (File Compression)',
    arrivalTime: 4,
    burstTime: 4,
    priority: 2,
    deadline: 15,
    status: 'Waiting',
    color: '#f59e0b', // amber
  },
];
