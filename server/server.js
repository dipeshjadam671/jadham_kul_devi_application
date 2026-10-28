const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Startup sequence
const startServer = async () => {
  console.log('---------------------------------------------------------');
  console.log('🕉️  जादम परिवार कुलदेवी मंदिर, खलघाट - Server Initialization');
  console.log('---------------------------------------------------------');

  // Connect to Database
  await connectDB();

  // Start HTTP Listener
  server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`🏥 Health Check Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('---------------------------------------------------------');
  });
};

// Graceful Shutdown Handler
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('🔒 HTTP server closed.');
    process.exit(0);
  });

  // Force close after 10s if stuck
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
