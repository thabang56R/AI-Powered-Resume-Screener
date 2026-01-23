// index.js
import 'dotenv/config';

import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

(async function startServer() {
  try {
    console.log(`[${ENV.toUpperCase()}] Connecting to MongoDB...`);
    await connectDB();
    console.log('MongoDB connection established');

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`───────────────────────────────────────────────────────────────`);
      console.log(`  Server running in ${ENV} mode`);
      console.log(`  Listening on http://localhost:${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/health`);
      console.log(`───────────────────────────────────────────────────────────────`);
    });

    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Force shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
})();