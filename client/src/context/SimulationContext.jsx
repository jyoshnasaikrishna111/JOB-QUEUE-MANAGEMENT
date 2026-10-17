import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useJobs } from './JobContext';
import {
  generateSimulationTimeline,
  compareAlgorithms,
} from '../algorithms/scheduling';
import {
  playTick,
  playContextSwitch,
  playComplete,
  isSoundEnabled,
  setSoundEnabled,
} from '../utils/sound';

const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const { jobs } = useJobs();

  // Settings
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 0.25x, 0.5x, 1x, 2x, 4x
  const [soundActive, setSoundActive] = useState(true);
  const [blockedJobIds, setBlockedJobIds] = useState([]);

  // Simulation execution state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);
  const prevRunningJobRef = useRef(null);

  // Sync sound utility
  useEffect(() => {
    setSoundEnabled(soundActive);
  }, [soundActive]);

  // Compute full simulation model deterministically
  const simModel = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return {
        algorithm,
        timeQuantum,
        ganttChart: [],
        results: [],
        summary: {
          totalTime: 0,
          totalBurstTime: 0,
          idleTime: 0,
          cpuUtilization: 0,
          avgWaitingTime: 0,
          avgTurnaroundTime: 0,
          avgResponseTime: 0,
          contextSwitches: 0,
        },
        timeline: [
          {
            time: 0,
            runningJob: null,
            jobQueue: [],
            readyQueue: [],
            waitingQueue: [],
            completedQueue: [],
            event: 'No jobs available in queue',
          },
        ],
      };
    }

    return generateSimulationTimeline(jobs, algorithm, timeQuantum, blockedJobIds);
  }, [jobs, algorithm, timeQuantum, blockedJobIds]);

  const { ganttChart, results, summary, timeline } = simModel;
  const maxTime = summary.totalTime;

  // Safe frame accessor
  const currentFrame = useMemo(() => {
    if (!timeline || timeline.length === 0) {
      return {
        time: 0,
        runningJob: null,
        jobQueue: [],
        readyQueue: [],
        waitingQueue: [],
        completedQueue: [],
        event: 'Ready',
      };
    }
    const idx = Math.min(currentTime, timeline.length - 1);
    return timeline[idx];
  }, [timeline, currentTime]);

  const isCompleted = currentTime >= maxTime && maxTime > 0;

  // Trigger celebration confetti when reaching end
  const hasTriggeredEndRef = useRef(false);
  useEffect(() => {
    if (isCompleted && !hasTriggeredEndRef.current) {
      hasTriggeredEndRef.current = true;
      playComplete();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981'],
        });
      } catch (e) {
        // Ignore in non-canvas environments
      }
    }
    if (currentTime < maxTime) {
      hasTriggeredEndRef.current = false;
    }
  }, [isCompleted, currentTime, maxTime]);

  // Playback timer loop
  const tickIntervalMs = useMemo(() => {
    const baseMs = 700;
    return Math.max(100, Math.round(baseMs / speedMultiplier));
  }, [speedMultiplier]);

  useEffect(() => {
    if (isPlaying) {
      if (currentTime >= maxTime) {
        setIsPlaying(false);
        return;
      }

      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= maxTime) {
            setIsPlaying(false);
          }
          return next;
        });
      }, tickIntervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTime, maxTime, tickIntervalMs]);

  // Sound effects on frame advance
  useEffect(() => {
    if (currentTime > 0) {
      playTick();
    }
    const currentRunningId = currentFrame.runningJob ? currentFrame.runningJob.jobId : null;
    if (prevRunningJobRef.current !== currentRunningId && currentRunningId !== null) {
      playContextSwitch();
    }
    prevRunningJobRef.current = currentRunningId;
  }, [currentTime, currentFrame.runningJob]);

  // Controls
  const play = () => {
    if (currentTime >= maxTime) {
      setCurrentTime(0);
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    hasTriggeredEndRef.current = false;
  };

  const stepForward = () => {
    setIsPlaying(false);
    setCurrentTime((prev) => Math.min(prev + 1, maxTime));
  };

  const stepBackward = () => {
    setIsPlaying(false);
    setCurrentTime((prev) => Math.max(0, prev - 1));
  };

  const jumpToTime = (t) => {
    setIsPlaying(false);
    setCurrentTime(Math.max(0, Math.min(t, maxTime)));
  };

  const toggleBlockJob = (jobId) => {
    setBlockedJobIds((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  // Algorithm comparison data
  const comparisonData = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;
    return compareAlgorithms(jobs, timeQuantum);
  }, [jobs, timeQuantum]);

  return (
    <SimulationContext.Provider
      value={{
        algorithm,
        setAlgorithm,
        timeQuantum,
        setTimeQuantum,
        speedMultiplier,
        setSpeedMultiplier,
        soundActive,
        setSoundActive,
        currentTime,
        maxTime,
        isPlaying,
        isCompleted,
        currentFrame,
        ganttChart,
        results,
        summary,
        timeline,
        blockedJobIds,
        comparisonData,
        play,
        pause,
        reset,
        stepForward,
        stepBackward,
        jumpToTime,
        toggleBlockJob,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within SimulationProvider');
  return context;
};
