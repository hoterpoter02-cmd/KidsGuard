// src/server.ts
import http from "http";
import app from "../app";
import { connectDB } from "./db";

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  // Connect DB for the running app (not done during unit tests)
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
    // optional: add DB disconnect here if connectDB returns a handle
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  return server;
}

// Only start when run directly (so tests can import file without starting)
if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
}

// export start function / server for integration tests if needed
export { start };
