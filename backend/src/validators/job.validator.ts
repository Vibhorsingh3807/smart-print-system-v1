import { z } from 'zod';
import { PaperSize, Orientation, ColorMode, DuplexMode } from '../types/enums.js';

export const estimateCostSchema = z.object({
  body: z.object({
    pageCount: z.number().int().min(1),
    copies: z.number().int().min(1).default(1),
    paperSize: z.nativeEnum(PaperSize).default(PaperSize.A4),
    colorMode: z.nativeEnum(ColorMode).default(ColorMode.BW),
    duplex: z.nativeEnum(DuplexMode).default(DuplexMode.SINGLE),
  }),
});

export const submitJobSchema = z.object({
  body: z.object({
    paperSize: z.nativeEnum(PaperSize).optional().default(PaperSize.A4),
    orientation: z.nativeEnum(Orientation).optional().default(Orientation.PORTRAIT),
    colorMode: z.nativeEnum(ColorMode).optional().default(ColorMode.BW),
    duplex: z.nativeEnum(DuplexMode).optional().default(DuplexMode.SINGLE),
    copies: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1)).optional().default('1' as any),
    pageRange: z.string().optional().default('all'),
  }),
});
