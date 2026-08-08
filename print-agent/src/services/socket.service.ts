import { io, Socket } from 'socket.io-client';
import { CONFIG } from '../config.js';
import { AgentPrintJob } from './api.service.js';

let socket: Socket | null = null;

export const initAgentSocket = (onJobAssigned: (job: AgentPrintJob) => void): Socket => {
  socket = io(CONFIG.BACKEND_URL, {
    reconnection: true,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log(`⚡ Print Agent connected to WebSocket Gateway (${socket?.id})`);
    socket?.emit('join:agent', CONFIG.AGENT_API_KEY);
  });

  socket.on('job:assigned', (job: AgentPrintJob) => {
    console.log(`📥 Received real-time print assignment for Job ID ${job.jobId}`);
    onJobAssigned(job);
  });

  socket.on('disconnect', () => {
    console.log('⚠️ Disconnected from Backend WebSocket');
  });

  return socket;
};
