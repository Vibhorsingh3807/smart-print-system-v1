import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Require authentication for payment operations
router.use(authenticateToken);

// STEP 1: Create Razorpay order
router.post('/create-order', createOrder);

// STEP 3: Verify Razorpay payment signature
router.post('/verify-payment', verifyPayment);

export default router;
