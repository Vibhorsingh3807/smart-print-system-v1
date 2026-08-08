import { Router } from 'express';
import { estimateCost, submitJob, getMyJobs, getJobById, cancelJob } from '../controllers/job.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { estimateCostSchema } from '../validators/job.validator.js';

const router = Router();

router.use(authenticateToken);

router.post('/estimate', validateRequest(estimateCostSchema), estimateCost);
// Accept multiple files up to 10 at once
router.post('/submit', upload.array('files', 10), submitJob);
router.get('/my-jobs', getMyJobs);
router.get('/:id', getJobById);
router.post('/:id/cancel', cancelJob);

export default router;
