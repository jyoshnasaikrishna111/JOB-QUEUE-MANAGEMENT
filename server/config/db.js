import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_queue_os';
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out')), 1500)
    );
    await Promise.race([
      mongoose.connect(uri, { serverSelectionTimeoutMS: 1500 }),
      timeoutPromise,
    ]);
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully`);
    return true;
  } catch (error) {
    console.log(`[Database] Operating in In-Memory / Local Fallback mode.`);
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => isConnected;
