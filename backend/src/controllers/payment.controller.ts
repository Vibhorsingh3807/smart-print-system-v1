import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { CONFIG } from '../config/index.js';
import { prisma } from '../utils/prisma.js';
import { getIO } from '../socket/index.js';
import { JobStatus } from '../types/enums.js';

// Initialize Razorpay client
const getRazorpayInstance = () => {
  if (!CONFIG.RAZORPAY_KEY_ID || !CONFIG.RAZORPAY_KEY_SECRET) {
    throw new AppError('Razorpay credentials not configured', 500);
  }
  return new Razorpay({
    key_id: CONFIG.RAZORPAY_KEY_ID,
    key_secret: CONFIG.RAZORPAY_KEY_SECRET,
  });
};

/**
 * STEP 1: Create Razorpay Order
 * Endpoint: POST /api/v1/payments/create-order
 */
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { amount, currency = 'INR', receipt, jobId } = req.body;

    if (amount === undefined || amount === null) {
      return next(new AppError('Amount is required', 400));
    }

    // Convert amount to paise (e.g. ₹5.00 -> 500 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // Minimum amount: 100 paise (₹1)
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return next(new AppError('Minimum transaction amount is ₹1 (100 paise)', 400));
    }

    const razorpay = getRazorpayInstance();

    const options = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt || (jobId ? `job_${jobId}` : `rcpt_${Date.now()}`),
      notes: {
        userId: req.user.userId,
        jobId: jobId || '',
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: CONFIG.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    return next(new AppError(error.message || 'Failed to create Razorpay order', 500));
  }
};

/**
 * STEP 3: Verify Razorpay Payment Signature
 * Endpoint: POST /api/v1/payments/verify-payment
 */
export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, jobId } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return next(new AppError('Missing required payment verification fields (payment_id, order_id, signature)', 400));
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generatedSignature = crypto
      .createHmac('sha256', CONFIG.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Timing-safe comparison to prevent side-channel attacks
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isSignatureValid) {
      return next(new AppError('Payment signature verification failed. Invalid transaction.', 400));
    }

    // If jobId is provided, mark job as PAID & QUEUED in database
    let updatedJob = null;
    if (jobId) {
      updatedJob = await prisma.printJob.update({
        where: { id: jobId },
        data: {
          isPaid: true,
          paymentMethod: 'ONLINE',
          status: JobStatus.QUEUED,
        },
        include: {
          user: { select: { fullName: true, email: true, rollNumber: true } },
          printer: true,
        },
      });

      // Notify Admin & Print Agent via WebSocket
      try {
        const io = getIO();
        io.emit('job:created', updatedJob);
        io.emit('job:status_updated', { jobId: updatedJob.id, status: JobStatus.QUEUED, isPaid: true });
      } catch (_wsErr) {
        // Socket.io might not be connected in unit tests
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        job: updatedJob,
      },
    });
  } catch (error: any) {
    console.error('Razorpay Verify Payment Error:', error);
    return next(new AppError(error.message || 'Payment verification failed', 500));
  }
};
