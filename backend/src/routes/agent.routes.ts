import { Router } from 'express';
import {
  agentAuthMiddleware,
  verifyAgent,
  getPendingJobs,
  downloadJobFile,
  updateJobStatusByAgent,
} from '../controllers/agent.controller.js';

const router = Router();

router.use(agentAuthMiddleware);

router.get('/verify', verifyAgent);
router.get('/pending-jobs', getPendingJobs);
router.get('/jobs/:id/file', downloadJobFile);
router.patch('/jobs/:id/status', updateJobStatusByAgent);

export default router;
