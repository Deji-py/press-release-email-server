"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = createRoutes;
exports.errorHandler = errorHandler;
const express_1 = require("express");
const types_1 = require("./types");
const utils_1 = require("./utils");
function createRoutes(emailService) {
    const router = (0, express_1.Router)();
    /**
     * Health check endpoint
     */
    router.get("/health", (_req, res) => {
        res.json({
            status: "OK",
            timestamp: new Date().toISOString(),
            service: "resend-email-server",
        });
    });
    /**
     * Send email endpoint
     */
    router.post("/send", async (req, res) => {
        const timestamp = new Date().toISOString();
        try {
            const { templateId, recipientEmail, variables, overrideSubject } = req.body;
            // Validation errors
            const errors = [];
            if (!templateId || typeof templateId !== "string") {
                errors.push("templateId is required and must be a string");
            }
            if (!recipientEmail || typeof recipientEmail !== "string") {
                errors.push("recipientEmail is required and must be a string");
            }
            if (variables && !(0, utils_1.isValidVariables)(variables)) {
                errors.push("variables must be an object with string, number, or boolean values");
            }
            if (overrideSubject && typeof overrideSubject !== "string") {
                errors.push("overrideSubject must be a string if provided");
            }
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: `Validation failed: ${errors.join("; ")}`,
                    code: types_1.ErrorCode.VALIDATION_ERROR,
                    details: errors,
                    timestamp,
                });
            }
            console.log(variables, "vraibles", overrideSubject, "overrideSubject");
            // Send email
            const result = await emailService.send({
                templateId: templateId,
                recipientEmail: (0, utils_1.sanitizeEmail)(recipientEmail),
                variables: variables || undefined,
                overrideSubject: overrideSubject || undefined,
            });
            // Set appropriate status code
            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: "Internal server error while processing email request",
                code: types_1.ErrorCode.INTERNAL_SERVER_ERROR,
                timestamp,
            });
        }
    });
    /**
     * Batch send emails endpoint
     */
    router.post("/send-batch", async (req, res) => {
        const timestamp = new Date().toISOString();
        try {
            const { emails } = req.body;
            if (!Array.isArray(emails)) {
                return res.status(400).json({
                    success: false,
                    error: "emails must be an array of email send requests",
                    code: types_1.ErrorCode.VALIDATION_ERROR,
                    timestamp,
                });
            }
            if (emails.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "emails array cannot be empty",
                    code: types_1.ErrorCode.VALIDATION_ERROR,
                    timestamp,
                });
            }
            if (emails.length > 100) {
                return res.status(400).json({
                    success: false,
                    error: "Maximum 100 emails per batch",
                    code: types_1.ErrorCode.VALIDATION_ERROR,
                    timestamp,
                });
            }
            // Send all emails in parallel
            const results = await Promise.all(emails.map((email) => emailService.send(email)));
            const successful = results.filter((r) => r.success).length;
            const failed = results.length - successful;
            return res.json({
                success: failed === 0,
                results,
                summary: {
                    total: results.length,
                    successful,
                    failed,
                },
                timestamp,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: "Internal server error while processing batch emails",
                code: types_1.ErrorCode.INTERNAL_SERVER_ERROR,
                timestamp,
            });
        }
    });
    /**
     * Get available templates
     */
    router.get("/templates", (_req, res) => {
        res.json({
            templates: [
                "ADMIN_INVITE",
                "PRESS_RELEASE_APPROVED",
                "PRESS_RELEASE_REJECTED",
                "PRESS_RELEASE_OWNER_CUSTOM_EMAIL",
                "USER_CUSTOM_EMAIL",
                "BROADCAST_USERS",
            ],
            description: "Use template key (e.g., ADMIN_INVITE) in templateId field of send request",
            timestamp: new Date().toISOString(),
        });
    });
    return router;
}
/**
 * Error handling middleware
 */
function errorHandler(err, _req, res, _next) {
    const timestamp = new Date().toISOString();
    res.status(500).json({
        success: false,
        error: err.message || "Internal server error",
        code: types_1.ErrorCode.INTERNAL_SERVER_ERROR,
        timestamp,
    });
}
//# sourceMappingURL=routes.js.map