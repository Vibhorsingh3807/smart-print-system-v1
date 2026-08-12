import { Response, NextFunction } from 'express';
import path from 'path';
import { prisma } from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { calculatePrintCost, getPdfPageCount, deleteFileSafely } from '../utils/file.js';
import { processPrintQueue } from '../services/queue.service.js';
import { notifyAdminQueue, notifyUser } from '../socket/index.js';
import { JobStatus, PaperSize, Orientation, ColorMode, DuplexMode, PaymentMethod } from '../types/enums.js';

const generateSequentialJobId = async (): Promise<string> => {
  const lastJob = await prisma.printJob.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { jobId: true },
  });

  let nextNum = 1;
  if (lastJob && lastJob.jobId) {
    const numericPart = parseInt(lastJob.jobId.replace(/\D/g, ''), 10);
    if (!isNaN(numericPart)) {
      nextNum = (numericPart % 9999) + 1;
    }
  }

  return String(nextNum).padStart(4, '0');
};

export const estimateCost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { pageCount, copies, paperSize, colorMode, duplex, fileCount = 1 } = req.body;
    const singleCost = calculatePrintCost({ pageCount, copies, paperSize, colorMode, duplex });
    const totalCost = parseFloat((singleCost * fileCount).toFixed(2));
    res.json({ success: true, data: { estimatedCost: totalCost } });
  } catch (error) {
    next(error);
  }
};

export const submitJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    const {
      paperSize = PaperSize.A4,
      orientation = Orientation.PORTRAIT,
      colorMode = ColorMode.BW,
      duplex = DuplexMode.SINGLE,
      copies = 1,
      pageRange = 'all',
      paymentMethod = PaymentMethod.CASH,
    } = req.body;

    const isPrepaid = paymentMethod === PaymentMethod.ONLINE;
    const initialStatus = isPrepaid ? JobStatus.QUEUED : JobStatus.WAITING;

    const numCopies = typeof copies === 'string' ? parseInt(copies, 10) : copies;
    const createdJobs = [];

    let currentSeqNum = parseInt((await generateSequentialJobId()), 10);

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      let pageCount = 1;
      if (ext === '.pdf') {
        pageCount = await getPdfPageCount(file.path);
      }

      const cost = calculatePrintCost({ pageCount, copies: numCopies, paperSize, colorMode, duplex });
      const sequentialJobId = String(currentSeqNum).padStart(4, '0');
      currentSeqNum = (currentSeqNum % 9999) + 1;

      const job = await prisma.printJob.create({
        data: {
          jobId: sequentialJobId,
          userId: req.user.userId,
          originalFilename: file.originalname,
          storedFilename: file.filename,
          fileSize: file.size,
          pageCount,
          paperSize,
          orientation,
          colorMode,
          duplex,
          copies: numCopies,
          pageRange,
          paymentMethod,
          isPaid: isPrepaid,
          cost,
          status: initialStatus,
        },
        include: {
          user: { select: { fullName: true, email: true, rollNumber: true } },
        },
      });

      await prisma.notification.create({
        data: {
          userId: req.user.userId,
          title: isPrepaid ? 'Prepaid Order Sent to Print Queue' : 'Cash Order Created (Pending Staff Approval)',
          message: isPrepaid
            ? `Your prepaid order #${job.jobId} ("${file.originalname}") was paid online and sent directly to automatic printing.`
            : `Order #${job.jobId} created. Please pay ₹${cost.toFixed(2)} cash at the stationery counter for staff approval.`,
        },
      });

      // Broadcast to Admin UI with full payment details
      notifyAdminQueue('job:new', job);
      createdJobs.push(job);
    }

    // Only auto-dispatch to printer queue if prepaid online!
    if (isPrepaid) {
      processPrintQueue();
    }

    res.status(201).json({
      success: true,
      message: isPrepaid
        ? `${createdJobs.length} prepaid print job(s) sent to print queue`
        : `${createdJobs.length} cash print job(s) created. Waiting for counter acceptance.`,
      data: { jobs: createdJobs },
    });
  } catch (error) {
    const reqAny = req as any;
    if (reqAny.files && Array.isArray(reqAny.files)) {
      reqAny.files.forEach((f: any) => deleteFileSafely(f.path));
    } else if (reqAny.file) {
      deleteFileSafely(reqAny.file.path);
    }
    next(error);
  }
};

export const getMyJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const jobs = await prisma.printJob.findMany({
      where: { userId: req.user.userId },
      include: { printer: { select: { displayName: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { jobs } });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const id = req.params.id as string;

    const job = await prisma.printJob.findUnique({
      where: { id },
      include: { printer: true, user: { select: { fullName: true, email: true, rollNumber: true } } },
    });

    if (!job) return next(new AppError('Job not found', 404));

    if (job.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return next(new AppError('Forbidden', 403));
    }

    res.json({ success: true, data: { job } });
  } catch (error) {
    next(error);
  }
};

export const cancelJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    const id = req.params.id as string;

    const job = await prisma.printJob.findUnique({ where: { id } });
    if (!job) return next(new AppError('Job not found', 404));

    if (job.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return next(new AppError('Forbidden', 403));
    }

    if (job.status === JobStatus.PRINTING || job.status === JobStatus.COMPLETED) {
      return next(new AppError('Cannot cancel a job that is printing or already completed', 400));
    }

    const updatedJob = await prisma.printJob.update({
      where: { id },
      data: { status: JobStatus.REJECTED, rejectionReason: 'Cancelled by user' },
    });

    const filePath = path.join(process.cwd(), 'uploads/temp', job.storedFilename);
    deleteFileSafely(filePath);

    notifyAdminQueue('job:updated', updatedJob);
    notifyUser(job.userId, 'job:status', { jobId: job.jobId, status: JobStatus.REJECTED });

    res.json({ success: true, message: 'Print job cancelled', data: { job: updatedJob } });
  } catch (error) {
    next(error);
  }
};
