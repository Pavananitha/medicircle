import app from './app';
import { config } from './config';
import { startMissedDoseCron } from './cron/missedDose.cron';

const PORT = config.port;
const HOST = config.host;

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 MediCircle Server running at http://${HOST}:${PORT}`);
  console.log(`📋 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://${HOST}:${PORT}/api/auth/login`);
  
  // Start background jobs
  startMissedDoseCron();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
