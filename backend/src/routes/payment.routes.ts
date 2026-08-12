import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// STEP 1: Create Razorpay order
router.post('/create-order', authenticateToken, createOrder);

// STEP 3: Verify Razorpay payment signature
router.post('/verify-payment', authenticateToken, verifyPayment);

export default router;
