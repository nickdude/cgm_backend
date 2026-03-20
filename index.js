const app = require('./app');
const env = require('./configs/env');
const connectDB = require('./configs/db');

const startServer = async () => {
  await connectDB(env.mongoUri);

  const server = app.listen(env.port, () => {
    console.log(`🚀 Server running on http://localhost:${env.port}`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();
