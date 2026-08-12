import http from 'http';
import { createApp } from './app.js';
import { CONFIG } from './config/index.js';
import { initSocket } from './socket/index.js';

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.IO engine
initSocket(server);

const PORT = Number(CONFIG.PORT) || 5000;

// Listen on 0.0.0.0 to enable mobile devices on local Wi-Fi to connect
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Print Helper Backend API listening on http://0.0.0.0:${PORT}`);
  console.log(`📡 Environment: ${CONFIG.NODE_ENV}`);
  console.log(`🔌 Socket.IO Server active on port ${PORT}`);
});
