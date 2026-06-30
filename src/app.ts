import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import watchDataRoutes from "./routes/watchDataRoutes";
import linkWatchRoutes from "./routes/linkWatchRoutes";
import audioRoutes from "./routes/audioRoutes";
import adminRoutes from "./routes/adminRoutes";
import cors from "cors";
import morgan from "morgan";
import { setupSwagger } from "./config/swagger";

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev")); //http request logger

setupSwagger(app);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/watch-data", watchDataRoutes);
app.use("/api/link-watch", linkWatchRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/admin", adminRoutes);

// Catch-all for unknown routes (invalid calls)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";
  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV === "development" ? err : undefined,
  });
});

export default app;
