import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';
import jobsRoutes from './routes/jobs.routes.js';
import simulationRoutes from './routes/simulation.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/simulation', simulationRoutes);

// Health and System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    dbConnected: getDBStatus(),
    service: 'OS Job Queue Management Server',
  });
});

// Root friendly welcome
app.get('/', (req, res) => {
  res.send('OS Job Queue Management API Server is running.');
});

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` OS Job Queue Management Backend Server`);
    console.log(` Running on: http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Database: ${getDBStatus() ? 'MongoDB Connected' : 'In-Memory / Local Mode'}`);
    console.log(`=======================================================`);
  });
};

startServer();
