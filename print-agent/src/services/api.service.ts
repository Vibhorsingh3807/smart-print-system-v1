import axios from 'axios';
import fs from 'fs';
import { CONFIG } from '../config.js';

const api = axios.create({
  baseURL: `${CONFIG.BACKEND_URL}/api/v1/agent`,
  headers: {
    'x-agent-key': CONFIG.AGENT_API_KEY,
  },
});

export interface AgentPrintJob {
  id: string;
  jobId: string;
  originalFilename: string;
  storedFilename: string;
  copies: number;
  paperSize: 'A4' | 'A3';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  colorMode: 'BW' | 'COLOR';
  duplex: 'SINGLE' | 'DOUBLE';
  pageRange?: string;
  status: string;
  printer?: {
    id: string;
    name: string;
    displayName: string;
  };
}

export const verifyBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get('/verify');
    return response.data.success === true;
  } catch (error) {
    console.error('❌ Failed to connect to Backend API:', (error as Error).message);
    return false;
  }
};

export const fetchPendingJobs = async (): Promise<AgentPrintJob[]> => {
  try {
    const response = await api.get('/pending-jobs');
    return response.data.data.jobs || [];
  } catch (error) {
    console.error('⚠️ Error fetching pending jobs:', (error as Error).message);
    return [];
  }
};

export const downloadPrintFile = async (jobId: string, destPath: string): Promise<boolean> => {
  try {
    const response = await api.get(`/jobs/${jobId}/file`, {
      responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(destPath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => {
        console.error(`❌ File stream download error for job ${jobId}:`, err);
        reject(false);
      });
    });
  } catch (error) {
    console.error(`❌ Failed to download job file ${jobId}:`, (error as Error).message);
    return false;
  }
};

export const updateBackendJobStatus = async (
  jobId: string,
  status: 'PRINTING' | 'COMPLETED' | 'REJECTED' | 'READY_TO_COLLECT',
  errorReason?: string
): Promise<boolean> => {
  try {
    await api.patch(`/jobs/${jobId}/status`, {
      status,
      errorReason,
    });
    return true;
  } catch (error) {
    console.error(`⚠️ Failed to update job status for ${jobId}:`, (error as Error).message);
    return false;
  }
};
