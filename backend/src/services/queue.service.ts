import { prisma } from '../utils/prisma.js';
import { ColorMode, PaperSize, DuplexMode, PrinterStatus, JobStatus } from '../types/enums.js';
import { notifyAdminQueue, notifyPrintAgent, notifyUser } from '../socket/index.js';

export const processPrintQueue = async (): Promise<void> => {
  try {
    const pendingJobs = await prisma.printJob.findMany({
      where: { status: JobStatus.QUEUED, printerId: null },
      orderBy: { createdAt: 'asc' },
    });

    if (pendingJobs.length === 0) return;

    const availablePrinters = await prisma.printer.findMany({
      where: { status: PrinterStatus.AVAILABLE },
    });

    for (const job of pendingJobs) {
      const matchedPrinter = availablePrinters.find((p) => {
        const matchesColor = job.colorMode === ColorMode.COLOR ? p.supportsColor : true;
        const matchesA3 = job.paperSize === PaperSize.A3 ? p.supportsA3 : true;
        const matchesDuplex = job.duplex === DuplexMode.DOUBLE ? p.supportsDuplex : true;
        return matchesColor && matchesA3 && matchesDuplex;
      });

      if (matchedPrinter) {
        const updatedJob = await prisma.printJob.update({
          where: { id: job.id },
          data: { printerId: matchedPrinter.id },
          include: { printer: true, user: { select: { fullName: true, email: true, rollNumber: true } } },
        });

        notifyPrintAgent('job:assigned', updatedJob);
        notifyAdminQueue('job:updated', updatedJob);
        notifyUser(job.userId, 'job:status', {
          jobId: updatedJob.jobId,
          status: updatedJob.status,
          printerName: matchedPrinter.displayName,
          updatedAt: updatedJob.updatedAt,
        });
      }
    }
  } catch (error) {
    console.error('Error processing print queue:', error);
  }
};
