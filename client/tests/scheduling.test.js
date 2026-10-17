import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  runFCFS,
  runSJF,
  runSRTF,
  runPriority,
  runRoundRobin,
  compareAlgorithms,
} from '../src/algorithms/scheduling.js';

const SAMPLE_JOBS = [
  { jobId: 'P1', jobName: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
  { jobId: 'P2', jobName: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
  { jobId: 'P3', jobName: 'P3', arrivalTime: 2, burstTime: 8, priority: 4 },
  { jobId: 'P4', jobName: 'P4', arrivalTime: 3, burstTime: 2, priority: 3 },
  { jobId: 'P5', jobName: 'P5', arrivalTime: 4, burstTime: 4, priority: 2 },
];

describe('OS CPU Scheduling Algorithms Unit & Edge Case Tests', () => {
  it('handles empty job lists gracefully', () => {
    const fcfs = runFCFS([]);
    assert.equal(fcfs.results.length, 0);
    assert.equal(fcfs.ganttChart.length, 0);
    assert.equal(fcfs.summary.cpuUtilization, 0);

    const sjf = runSJF([]);
    assert.equal(sjf.results.length, 0);

    const srtf = runSRTF([]);
    assert.equal(srtf.results.length, 0);

    const rr = runRoundRobin([], 2);
    assert.equal(rr.results.length, 0);
  });

  it('correctly calculates metrics for a single job with initial idle time', () => {
    const single = [{ jobId: 'P1', arrivalTime: 2, burstTime: 4, priority: 1 }];
    const fcfs = runFCFS(single);

    assert.equal(fcfs.ganttChart.length, 2);
    assert.equal(fcfs.ganttChart[0].isIdle, true);
    assert.equal(fcfs.ganttChart[0].startTime, 0);
    assert.equal(fcfs.ganttChart[0].endTime, 2);

    assert.equal(fcfs.results[0].startTime, 2);
    assert.equal(fcfs.results[0].completionTime, 6);
    assert.equal(fcfs.results[0].turnaroundTime, 4);
    assert.equal(fcfs.results[0].waitingTime, 0);
    assert.equal(fcfs.results[0].responseTime, 0);
  });

  it('accurately inserts CPU IDLE intervals when jobs arrive with gaps', () => {
    const gapJobs = [
      { jobId: 'P1', arrivalTime: 0, burstTime: 2, priority: 1 },
      { jobId: 'P2', arrivalTime: 5, burstTime: 3, priority: 1 },
    ];
    const res = runFCFS(gapJobs);

    assert.equal(res.ganttChart.length, 3);
    assert.equal(res.ganttChart[0].jobId, 'P1');
    assert.equal(res.ganttChart[0].endTime, 2);

    assert.equal(res.ganttChart[1].isIdle, true);
    assert.equal(res.ganttChart[1].startTime, 2);
    assert.equal(res.ganttChart[1].endTime, 5);

    assert.equal(res.ganttChart[2].jobId, 'P2');
    assert.equal(res.ganttChart[2].startTime, 5);
    assert.equal(res.ganttChart[2].endTime, 8);
  });

  it('correctly schedules simultaneous arrivals at t=0', () => {
    const simultaneous = [
      { jobId: 'P1', arrivalTime: 0, burstTime: 4, priority: 3 },
      { jobId: 'P2', arrivalTime: 0, burstTime: 2, priority: 1 },
      { jobId: 'P3', arrivalTime: 0, burstTime: 6, priority: 2 },
    ];

    // Under SJF: P2 (BT 2) -> P1 (BT 4) -> P3 (BT 6)
    const sjf = runSJF(simultaneous);
    assert.equal(sjf.ganttChart[0].jobId, 'P2');
    assert.equal(sjf.ganttChart[1].jobId, 'P1');
    assert.equal(sjf.ganttChart[2].jobId, 'P3');

    // Under Priority (lower number = higher): P2 (pri 1) -> P3 (pri 2) -> P1 (pri 3)
    const pri = runPriority(simultaneous, false);
    assert.equal(pri.ganttChart[0].jobId, 'P2');
    assert.equal(pri.ganttChart[1].jobId, 'P3');
    assert.equal(pri.ganttChart[2].jobId, 'P1');
  });

  it('resolves equal burst times deterministically with tie-breaking', () => {
    const equalBT = [
      { jobId: 'P2', arrivalTime: 0, burstTime: 3, priority: 1 },
      { jobId: 'P1', arrivalTime: 0, burstTime: 3, priority: 1 },
    ];
    const sjf = runSJF(equalBT);
    assert.equal(sjf.ganttChart[0].jobId, 'P1');
    assert.equal(sjf.ganttChart[1].jobId, 'P2');
  });

  it('preempts running process when a shorter burst arrives in SRTF', () => {
    const preemptJobs = [
      { jobId: 'P1', arrivalTime: 0, burstTime: 8, priority: 2 },
      { jobId: 'P2', arrivalTime: 1, burstTime: 2, priority: 1 },
    ];
    const srtf = runSRTF(preemptJobs);

    assert.equal(srtf.ganttChart[0].jobId, 'P1');
    assert.equal(srtf.ganttChart[0].startTime, 0);
    assert.equal(srtf.ganttChart[0].endTime, 1);

    assert.equal(srtf.ganttChart[1].jobId, 'P2');
    assert.equal(srtf.ganttChart[1].startTime, 1);
    assert.equal(srtf.ganttChart[1].endTime, 3);

    assert.equal(srtf.ganttChart[2].jobId, 'P1');
    assert.equal(srtf.ganttChart[2].startTime, 3);
    assert.equal(srtf.ganttChart[2].endTime, 10);
  });

  it('slices CPU time correctly with Round Robin and enforces FIFO arrival order', () => {
    const rrJobs = [
      { jobId: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
      { jobId: 'P2', arrivalTime: 0, burstTime: 3, priority: 1 },
    ];
    const rr = runRoundRobin(rrJobs, 2);

    assert.equal(rr.ganttChart.length, 5);
    assert.deepEqual(
      rr.ganttChart.map((b) => b.jobId),
      ['P1', 'P2', 'P1', 'P2', 'P1']
    );
    assert.equal(rr.results.find((r) => r.jobId === 'P2').completionTime, 7);
    assert.equal(rr.results.find((r) => r.jobId === 'P1').completionTime, 8);
  });

  it('verifies standard sample jobs metrics and formula consistency', () => {
    const fcfs = runFCFS(SAMPLE_JOBS);

    for (const res of fcfs.results) {
      assert.equal(res.turnaroundTime, res.completionTime - res.arrivalTime);
      assert.equal(res.waitingTime, res.turnaroundTime - res.burstTime);
      assert.equal(res.responseTime, res.startTime - res.arrivalTime);
      assert.ok(res.waitingTime >= 0);
      assert.ok(res.turnaroundTime >= res.burstTime);
    }

    const comp = compareAlgorithms(SAMPLE_JOBS, 2);
    assert.equal(comp.comparisons.length, 6);
    assert.ok(comp.bestAlgorithm);
    assert.ok(comp.bestAlgorithm.avgWaitingTime >= 0);
  });
});
