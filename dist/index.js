"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const email_service_1 = require("./email-service");
const routes_1 = require("./routes");
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGINS = process.env.CORS_ORIGINS || "http://localhost:5173";
const app = (0, express_1.default)();
// CORS configuration
const corsOrigins = CORS_ORIGINS.split(",").map((origin) => origin.trim());
const corsOptions = {
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
};
app.use((0, cors_1.default)(corsOptions));
// Middleware
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ limit: "10kb", extended: true }));
// Request logging middleware
app.use((req, _res, next) => {
    next();
});
// Initialize email service
let emailService;
try {
    emailService = (0, email_service_1.createEmailService)();
}
catch (error) {
    process.exit(1);
}
// Routes
app.use("/api", (0, routes_1.createRoutes)(emailService));
// Root endpoint
app.get("/", (_req, res) => {
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
        documentation: "See /api/templates for available templates and send request format",
    });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found",
        code: "NOT_FOUND",
        timestamp: new Date().toISOString(),
    });
});
// Error handler
app.use(routes_1.errorHandler);
// Start server only if not in Vercel environment
if (process.env.VERCEL !== "1") {
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
}
exports.default = app;
//# sourceMappingURL=index.js.map