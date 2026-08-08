import { Response, NextFunction } from 'express';
import path from 'path';
import { prisma } from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { deleteFileSafely } from '../utils/file.js';
import { notifyAdminQueue, notifyUser } from '../socket/index.js';
import { processPrintQueue } from '../services/queue.service.js';
import { JobStatus, PrinterStatus } from '../types/enums.js';

export const getAllJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search, limit = '50', page = '1' } = req.query;

    const take = parseInt(limit as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * take;

    const where: any = {};

    if (status) {
      where.status = status as JobStatus;
    }

    if (search) {
      where.OR = [
        { jobId: { contains: search as string } },
        { originalFilename: { contains: search as string } },
        { user: { fullName: { contains: search as string } } },
        { user: { rollNumber: { contains: search as string } } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.printJob.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true, rollNumber: true } },
          printer: true,
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.printJob.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: parseInt(page as string, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateJobStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, rejectionReason } = req.body;

    const job = await prisma.printJob.findUnique({ where: { id } });
    if (!job) return next(new AppError('Job not found', 404));

    // If accepting cash job (moving WAITING -> QUEUED), mark isPaid as true
    const isNowPaid = status === JobStatus.QUEUED || job.isPaid;

    const updatedJob = await prisma.printJob.update({
      where: { id },
      data: {
        status: status as JobStatus,
        isPaid: isNowPaid,
        rejectionReason: rejectionReason || null,
      },
      include: {
        user: { select: { fullName: true, email: true } },
        printer: true,
      },
    });

    if (status === JobStatus.COMPLETED || status === JobStatus.READY_TO_COLLECT || status === JobStatus.REJECTED) {
      const filePath = path.join(process.cwd(), 'uploads/temp', job.storedFilename);
      deleteFileSafely(filePath);
    }

    await prisma.notification.create({
      data: {
        userId: job.userId,
        title: `Print Job Status: ${status.replace('_', ' ')}`,
        message: `Your job #${job.jobId} ("${job.originalFilename}") status updated to ${status}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      },
    });

    notifyAdminQueue('job:updated', updatedJob);
    notifyUser(job.userId, 'job:status', {
      jobId: updatedJob.jobId,
      status: updatedJob.status,
      rejectionReason,
      updatedAt: updatedJob.updatedAt,
    });

    // Automatically trigger queue processing so accepted jobs dispatch to Print Agent immediately!
    processPrintQueue();

    res.json({ success: true, message: 'Job status updated', data: { job: updatedJob } });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const job = await prisma.printJob.findUnique({ where: { id } });
    if (!job) return next(new AppError('Job not found', 404));

    const filePath = path.join(process.cwd(), 'uploads/temp', job.storedFilename);
    deleteFileSafely(filePath);

    await prisma.printJob.delete({ where: { id } });

    notifyAdminQueue('job:deleted', { id });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPrinters = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const printers = await prisma.printer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { printJobs: { where: { status: JobStatus.PRINTING } } } },
      },
    });

    res.json({ success: true, data: { printers } });
  } catch (error) {
    next(error);
  }
};

export const addPrinter = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, displayName, supportsColor, supportsA3, supportsA4, supportsDuplex, location } = req.body;

    const printer = await prisma.printer.create({
      data: {
        name,
        displayName,
        supportsColor: supportsColor ?? false,
        supportsA3: supportsA3 ?? false,
        supportsA4: supportsA4 ?? true,
        supportsDuplex: supportsDuplex ?? true,
        location,
        status: PrinterStatus.READY,
      },
    });

    processPrintQueue();

    res.status(201).json({ success: true, message: 'Printer added', data: { printer } });
  } catch (error) {
    next(error);
  }
};

export const updatePrinter = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { displayName, status, supportsColor, supportsA3, supportsA4, supportsDuplex, location } = req.body;

    const printer = await prisma.printer.update({
      where: { id },
      data: {
        displayName,
        status: status as PrinterStatus,
        supportsColor,
        supportsA3,
        supportsA4,
        supportsDuplex,
        location,
      },
    });

    if (status === PrinterStatus.READY) {
      processPrintQueue();
    }

    res.json({ success: true, message: 'Printer updated', data: { printer } });
  } catch (error) {
    next(error);
  }
};

export const deletePrinter = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.printer.delete({ where: { id } });
    res.json({ success: true, message: 'Printer removed' });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayJobs, pendingJobs, completedToday, revenueTodayRaw] = await Promise.all([
      prisma.printJob.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.printJob.count({ where: { status: { in: [JobStatus.WAITING, JobStatus.QUEUED, JobStatus.PRINTING] } } }),
      prisma.printJob.count({ where: { status: JobStatus.COMPLETED, updatedAt: { gte: startOfToday } } }),
      prisma.printJob.aggregate({
        _sum: { cost: true },
        where: { status: { in: [JobStatus.COMPLETED, JobStatus.READY_TO_COLLECT] }, createdAt: { gte: startOfToday } },
      }),
    ]);

    const revenueToday = revenueTodayRaw._sum.cost || 0;

    res.json({
      success: true,
      data: {
        todayJobs,
        pendingJobs,
        completedToday,
        revenueToday: parseFloat(revenueToday.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};
