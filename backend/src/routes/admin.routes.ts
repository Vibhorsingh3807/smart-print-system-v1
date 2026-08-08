import { Router } from 'express';
import {
  getAllJobs,
  updateJobStatus,
  deleteJob,
  getPrinters,
  addPrinter,
  updatePrinter,
  deletePrinter,
  getAnalytics,
} from '../controllers/admin.controller.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';
import { Role } from '../types/enums.js';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles(Role.ADMIN));

router.get('/jobs', getAllJobs);
router.patch('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

router.get('/printers', getPrinters);
router.post('/printers', addPrinter);
router.patch('/printers/:id', updatePrinter);
router.delete('/printers/:id', deletePrinter);

router.get('/analytics', getAnalytics);

export default router;
