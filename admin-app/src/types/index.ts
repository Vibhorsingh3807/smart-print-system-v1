export type Role = 'STUDENT' | 'ADMIN';

export type JobStatus =
  | 'WAITING'
  | 'QUEUED'
  | 'PRINTING'
  | 'COMPLETED'
  | 'READY_TO_COLLECT'
  | 'REJECTED';

export type PrinterStatus = 'READY' | 'NOT_READY' | 'COMPLETED' | 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type PaymentMethod = 'ONLINE' | 'CASH';

export interface User {
  id: string;
  email: string;
  fullName: string;
  rollNumber?: string;
  role: Role;
}

export interface Printer {
  id: string;
  name: string;
  displayName: string;
  status: PrinterStatus;
  supportsColor: boolean;
  supportsA3: boolean;
  supportsA4: boolean;
  supportsDuplex: boolean;
  location?: string;
  createdAt: string;
  _count?: {
    printJobs: number;
  };
}

export interface PrintJob {
  id: string;
  jobId: string;
  userId: string;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  pageCount: number;
  paperSize: 'A4' | 'A3';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  colorMode: 'BW' | 'COLOR';
  duplex: 'SINGLE' | 'DOUBLE';
  copies: number;
  pageRange?: string;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  cost: number;
  status: JobStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    rollNumber?: string;
  };
  printer?: Printer;
}

export interface AdminAnalytics {
  todayJobs: number;
  pendingJobs: number;
  completedToday: number;
  revenueToday: number;
}
