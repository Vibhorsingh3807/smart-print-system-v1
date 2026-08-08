import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma.js';
import { CONFIG } from '../config/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { deleteFileSafely } from '../utils/file.js';
import { notifyAdminQueue, notifyUser } from '../socket/index.js';
import { JobStatus } from '../types/enums.js';

export const agentAuthMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-agent-key'] || req.headers['authorization'];
  if (!apiKey || apiKey !== CONFIG.AGENT_API_KEY) {
    return next(new AppError('Unauthorized Print Agent Key', 401));
  }
  next();
};

export const verifyAgent = (_req: Request, res: Response): void => {
  res.json({ success: true, message: 'Print Agent authenticated successfully' });
};

export const getPendingJobs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobs = await prisma.printJob.findMany({
      where: {
        status: { in: [JobStatus.QUEUED, JobStatus.PRINTING] },
      },
      include: { printer: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: { jobs } });
  } catch (error) {
    next(error);
  }
};

export const downloadJobFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const job = await prisma.printJob.findUnique({ where: { id } });
    if (!job) return next(new AppError('Job not found', 404));

    const filePath = path.join(process.cwd(), 'uploads/temp', job.storedFilename);

    if (!fs.existsSync(filePath)) {
      return next(new AppError('File not found or already purged', 404));
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${job.originalFilename}"`);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

export const updateJobStatusByAgent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, errorReason } = req.body;

    const job = await prisma.printJob.findUnique({ where: { id } });
    if (!job) return next(new AppError('Job not found', 404));

    const updatedJob = await prisma.printJob.update({
      where: { id },
      data: {
        status: status as JobStatus,
        rejectionReason: errorReason || null,
      },
      include: { printer: true },
    });

    if (status === JobStatus.COMPLETED || status === JobStatus.READY_TO_COLLECT || status === JobStatus.REJECTED) {
      const filePath = path.join(process.cwd(), 'uploads/temp', job.storedFilename);
      deleteFileSafely(filePath);
    }

    notifyAdminQueue('job:updated', updatedJob);
    notifyUser(job.userId, 'job:status', {
      jobId: updatedJob.jobId,
      status: updatedJob.status,
      rejectionReason: errorReason,
      updatedAt: updatedJob.updatedAt,
    });

    res.json({ success: true, message: 'Status updated by Print Agent', data: { job: updatedJob } });
  } catch (error) {
    next(error);
  }
};
