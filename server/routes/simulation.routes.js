import express from 'express';
import { runSimulation, compareAllAlgorithms } from '../controllers/simulation.controller.js';

const router = express.Router();

router.post('/run', runSimulation);
router.post('/compare', compareAllAlgorithms);

export default router;
