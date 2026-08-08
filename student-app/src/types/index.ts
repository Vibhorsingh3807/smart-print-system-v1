export type Role = 'STUDENT' | 'ADMIN';

export type JobStatus =
  | 'WAITING'
  | 'QUEUED'
  | 'PRINTING'
  | 'COMPLETED'
  | 'READY_TO_COLLECT'
  | 'REJECTED';

export type PaperSize = 'A4' | 'A3';
export type Orientation = 'PORTRAIT' | 'LANDSCAPE';
export type ColorMode = 'BW' | 'COLOR';
export type DuplexMode = 'SINGLE' | 'DOUBLE';
export type PaymentMethod = 'ONLINE' | 'CASH';

export interface User {
  id: string;
  email: string;
  fullName: string;
  rollNumber?: string;
  role: Role;
  createdAt?: string;
}

export interface PrintJob {
  id: string;
  jobId: string;
  userId: string;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  pageCount: number;
  paperSize: PaperSize;
  orientation: Orientation;
  colorMode: ColorMode;
  duplex: DuplexMode;
  copies: number;
  pageRange?: string;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  cost: number;
  status: JobStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  printer?: {
    displayName: string;
    name: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
