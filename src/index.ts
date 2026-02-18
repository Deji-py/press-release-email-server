import "dotenv/config";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { createEmailService } from "./email-service";
import { createRoutes, errorHandler } from "./routes";

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

app.use(cors());

// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next) => {
  next();
});

// Initialize email service
let emailService: ReturnType<typeof createEmailService>;
try {
  emailService = createEmailService();
} catch (error) {
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

// Start server - Vercel will set PORT env var automatically
const server = app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

export default app;
