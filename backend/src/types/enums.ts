export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export enum JobStatus {
  WAITING = 'WAITING',
  QUEUED = 'QUEUED',
  PRINTING = 'PRINTING',
  COMPLETED = 'COMPLETED',
  READY_TO_COLLECT = 'READY_TO_COLLECT',
  REJECTED = 'REJECTED',
}

export enum PaperSize {
  A4 = 'A4',
  A3 = 'A3',
}

export enum Orientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE',
}

export enum ColorMode {
  BW = 'BW',
  COLOR = 'COLOR',
}

export enum DuplexMode {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
}

export enum PrinterStatus {
  READY = 'READY',
  NOT_READY = 'NOT_READY',
  COMPLETED = 'COMPLETED',
  AVAILABLE = 'READY',
  BUSY = 'COMPLETED',
  OFFLINE = 'NOT_READY',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  CASH = 'CASH',
}
