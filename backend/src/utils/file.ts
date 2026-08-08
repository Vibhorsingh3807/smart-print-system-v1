import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { PaperSize, ColorMode, DuplexMode } from '../types/enums.js';

export interface PrintCostOptions {
  pageCount: number;
  copies: number;
  paperSize: PaperSize | string;
  colorMode: ColorMode | string;
  duplex: DuplexMode | string;
}

export const calculatePrintCost = (options: PrintCostOptions): number => {
  const { pageCount, copies, paperSize, colorMode, duplex } = options;

  let baseRatePerPage = 2.0;

  if (colorMode === ColorMode.COLOR) {
    baseRatePerPage = 10.0;
  }

  if (paperSize === PaperSize.A3) {
    baseRatePerPage *= 2.0;
  }

  if (duplex === DuplexMode.DOUBLE) {
    baseRatePerPage *= 0.85;
  }

  const totalCost = pageCount * copies * baseRatePerPage;
  return parseFloat(totalCost.toFixed(2));
};

export const getPdfPageCount = async (filePath: string): Promise<number> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.numpages || 1;
  } catch (error) {
    console.error('Error parsing PDF page count:', error);
    return 1;
  }
};

export const deleteFileSafely = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Failed to delete temporary file ${filePath}:`, err);
  }
};

export const sanitizeFilename = (filename: string): string => {
  return path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, '_');
};
