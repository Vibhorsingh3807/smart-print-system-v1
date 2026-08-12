import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const CONFIG = {
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  AGENT_API_KEY: process.env.AGENT_API_KEY || 'print-helper-agent-secret-token-key',
  POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS || '5000', 10),
  TEMP_DOWNLOAD_DIR: path.resolve(process.env.TEMP_DOWNLOAD_DIR || './temp_downloads'),
};
