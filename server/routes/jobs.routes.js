import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  resetSampleJobs,
  clearJobs,
} from '../controllers/jobs.controller.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/action/reset', resetSampleJobs);
router.post('/action/clear', clearJobs);

export default router;
