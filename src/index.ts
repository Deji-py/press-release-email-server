import "dotenv/config";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import logger from "./logger.js";
import { createEmailService } from "./email-service.js";
import { createRoutes, errorHandler } from "./routes.js";

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGINS = process.env.CORS_ORIGINS || "http://localhost:5173";

const app: Express = express();

// CORS configuration
const corsOrigins = CORS_ORIGINS.split(",").map((origin) => origin.trim());

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Initialize email service
let emailService: ReturnType<typeof createEmailService>;
try {
  emailService = createEmailService();
  logger.info("Email service initialized successfully");
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  logger.error("Failed to initialize email service", {
    error: errorMsg,
  });
  process.exit(1);
}

// Routes
app.use("/api", createRoutes(emailService));

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "Resend Email Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "GET /health",
      send: "POST /api/send",
      sendBatch: "POST /api/send-batch",
      templates: "GET /api/templates",
    },
    documentation:
      "See /api/templates for available templates and send request format",
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    code: "NOT_FOUND",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Email server running`, {
    port: PORT,
    environment: NODE_ENV,
    corsOrigins,
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Email server stopped");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Email server stopped");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection", {
    reason: String(reason),
    promise: String(promise),
  });
  process.exit(1);
});

export default app;
