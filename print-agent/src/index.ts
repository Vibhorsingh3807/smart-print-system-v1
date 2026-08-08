import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.js';
import {
  verifyBackendConnection,
  fetchPendingJobs,
  downloadPrintFile,
  updateBackendJobStatus,
  AgentPrintJob,
} from './services/api.service.js';
import { printDocumentToOS, listInstalledPrinters } from './services/printer.service.js';
import { initAgentSocket } from './services/socket.service.js';

let isProcessing = false;

const processSingleJob = async (job: AgentPrintJob) => {
  console.log(`\n========================================`);
  console.log(`🔄 Processing Job ID: ${job.jobId} ("${job.originalFilename}")`);
  console.log(`========================================`);

  // Step 1: Update status to PRINTING
  await updateBackendJobStatus(job.id, 'PRINTING');

  // Step 2: Download file to local temp
  const localFileName = `job_${job.id}.pdf`;
  const localFilePath = path.join(CONFIG.TEMP_DOWNLOAD_DIR, localFileName);

  const downloaded = await downloadPrintFile(job.id, localFilePath);

  if (!downloaded) {
    console.error(`❌ Download failed for job ${job.jobId}. Marking REJECTED.`);
    await updateBackendJobStatus(job.id, 'REJECTED', 'Failed to download file stream on Print Agent PC');
    return;
  }

  // Step 3: Print Document to OS Spooler
  const printSuccess = await printDocumentToOS(localFilePath, job);

  if (printSuccess) {
    console.log(`🎉 Job ${job.jobId} completed successfully!`);
    await updateBackendJobStatus(job.id, 'COMPLETED');
  } else {
    console.error(`❌ OS Print failed for job ${job.jobId}.`);
    await updateBackendJobStatus(job.id, 'REJECTED', 'Printer paper jam or OS spooler error');
  }
};

const runQueueCheck = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const jobs = await fetchPendingJobs();
    if (jobs.length > 0) {
      console.log(`📋 Found ${jobs.length} pending job(s) in backend queue`);
      for (const job of jobs) {
        await processSingleJob(job);
      }
    }
  } catch (error) {
    console.error('Error during print queue polling:', error);
  } finally {
    isProcessing = false;
  }
};

const startPrintAgentService = async () => {
  console.log(`
┌──────────────────────────────────────────────────────────┐
│   🖨️  SRM PRINT MANAGEMENT SYSTEM - DESKTOP PRINT AGENT  │
└──────────────────────────────────────────────────────────┘
`);
  console.log(`🔗 Target Backend API: ${CONFIG.BACKEND_URL}`);

  // Ensure temp download directory exists
  if (!fs.existsSync(CONFIG.TEMP_DOWNLOAD_DIR)) {
    fs.mkdirSync(CONFIG.TEMP_DOWNLOAD_DIR, { recursive: true });
  }

  // Check connection to backend
  const connected = await verifyBackendConnection();
  if (!connected) {
    console.warn(`⚠️ Warning: Backend API is not reachable yet at ${CONFIG.BACKEND_URL}. Retrying...`);
  }

  // List OS Printers
  const installedPrinters = await listInstalledPrinters();
  console.log(`🖨️ Found ${installedPrinters.length} installed OS printer(s):`);
  installedPrinters.forEach((p) => console.log(`   - ${p.name}`));

  // Initialize Socket.IO connection
  initAgentSocket((job) => {
    processSingleJob(job);
  });

  // Polling fallback
  setInterval(runQueueCheck, CONFIG.POLL_INTERVAL_MS);

  // Initial immediate check
  runQueueCheck();
};

startPrintAgentService();
