import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: [true, 'Job ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    jobName: {
      type: String,
      required: [true, 'Job Name is required'],
      trim: true,
    },
    arrivalTime: {
      type: Number,
      required: [true, 'Arrival Time is required'],
      min: [0, 'Arrival Time cannot be negative'],
      default: 0,
    },
    burstTime: {
      type: Number,
      required: [true, 'Burst Time is required'],
      min: [1, 'Burst Time must be at least 1'],
      default: 1,
    },
    priority: {
      type: Number,
      required: [true, 'Priority is required'],
      min: [1, 'Priority must be at least 1'],
      default: 1,
    },
    deadline: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['Waiting', 'Ready', 'Running', 'Blocked', 'Completed', 'Failed'],
      default: 'Waiting',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
  },
  {
    timestamps: true,
  }
);

// Fallback in-memory schema handling if Mongoose is initialized without db
export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
