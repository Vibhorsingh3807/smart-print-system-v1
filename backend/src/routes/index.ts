import { Router } from 'express';
import authRoutes from './auth.routes.js';
import jobRoutes from './job.routes.js';
import adminRoutes from './admin.routes.js';
import agentRoutes from './agent.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/admin', adminRoutes);
router.use('/agent', agentRoutes);
router.use('/notifications', notificationRoutes);

export default router;
