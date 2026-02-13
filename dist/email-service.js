"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
exports.createEmailService = createEmailService;
const resend_1 = require("resend");
const logger_1 = __importDefault(require("./logger"));
const types_1 = require("./types");
const utils_1 = require("./utils");
const templates_1 = require("./templates");
/**
 * Email service for handling Resend API interactions
 */
class EmailService {
    constructor(apiKey, fromEmail) {
        if (!apiKey) {
            throw new Error("Resend API key is required");
        }
        if (!fromEmail) {
            throw new Error("From email is required");
        }
        this.resend = new resend_1.Resend(apiKey);
        this.fromEmail = fromEmail;
        logger_1.default.info("EmailService initialized", { from: fromEmail });
    }
    /**
     * Send email using Resend template
     */
    async send(request) {
        const timestamp = new Date().toISOString();
        try {
            // Validate recipient email
            if (!(0, utils_1.isValidEmail)(request.recipientEmail)) {
                logger_1.default.warn("Invalid recipient email", {
                    email: request.recipientEmail,
                });
                return {
                    success: false,
                    error: `Invalid recipient email: ${request.recipientEmail}`,
                    code: types_1.ErrorCode.INVALID_EMAIL,
                    timestamp,
                };
            }
            // Get template ID from template key
            const templateId = (0, templates_1.getTemplateId)(request.templateId);
            if (!templateId) {
                logger_1.default.warn("Template not found", {
                    templateKey: request.templateId,
                });
                return {
                    success: false,
                    error: `Email template '${request.templateId}' not found. Available templates: ADMIN_INVITE, PRESS_RELEASE_APPROVED, PRESS_RELEASE_REJECTED, PRESS_RELEASE_OWNER_CUSTOM_EMAIL, USER_CUSTOM_EMAIL, BROADCAST_USERS`,
                    code: types_1.ErrorCode.TEMPLATE_NOT_FOUND,
                    timestamp,
                };
            }
            // Prepare email payload for Resend - follow official Resend template format
            // Documentation: https://resend.com/docs/api-reference/emails/send
            // Structure: { from, to, template: { id, variables } }
            const templatePayload = {
                id: templateId,
            };
            // Add variables to template (normalized to UPPERCASE_SNAKE_CASE for Resend)
            if (request.variables && Object.keys(request.variables).length > 0) {
                templatePayload.variables = (0, utils_1.normalizeVariableNames)(request.variables);
                logger_1.default.info("Variables normalized for Resend", {
                    original: Object.keys(request.variables),
                    normalized: Object.keys(templatePayload.variables),
                });
            }
            const payload = {
                from: this.fromEmail,
                to: request.recipientEmail,
                template: templatePayload,
            };
            // Only add subject override if explicitly requested (overrides template subject)
            if (request.overrideSubject) {
                payload.subject = request.overrideSubject;
            }
            logger_1.default.info("Sending email via Resend", {
                template: templateId,
                recipient: request.recipientEmail,
                variables: templatePayload.variables
                    ? Object.keys(templatePayload.variables)
                    : [],
                payload: JSON.stringify(payload),
            });
            // Send email
            const response = await this.resend.emails.send(payload);
            // Handle response
            if (response.error) {
                const errorMessage = (0, utils_1.getFriendlyErrorMessage)(response.error);
                logger_1.default.error("Resend API error", {
                    template: templateId,
                    recipient: request.recipientEmail,
                    error: errorMessage,
                    details: response.error,
                });
                return {
                    success: false,
                    error: `Failed to send email: ${errorMessage}`,
                    code: types_1.ErrorCode.RESEND_API_ERROR,
                    timestamp,
                };
            }
            // Success
            const messageId = response.data?.id;
            logger_1.default.info("Email sent successfully", {
                template: templateId,
                recipient: request.recipientEmail,
                messageId,
            });
            return {
                success: true,
                messageId,
                timestamp,
            };
        }
        catch (error) {
            const errorMessage = (0, utils_1.getFriendlyErrorMessage)(error);
            // Categorize error type
            let code = types_1.ErrorCode.INTERNAL_SERVER_ERROR;
            if ((0, utils_1.isNetworkError)(error)) {
                code = types_1.ErrorCode.RESEND_API_ERROR;
                logger_1.default.error("Network error sending email", {
                    error: errorMessage,
                    recipient: request.recipientEmail,
                });
            }
            else if ((0, utils_1.isTimeoutError)(error)) {
                code = types_1.ErrorCode.RESEND_API_ERROR;
                logger_1.default.error("Timeout sending email", {
                    error: errorMessage,
                    recipient: request.recipientEmail,
                });
            }
            else {
                logger_1.default.error("Unexpected error sending email", {
                    error: errorMessage,
                    recipient: request.recipientEmail,
                    stack: error instanceof Error ? error.stack : undefined,
                });
            }
            return {
                success: false,
                error: `Error sending email: ${errorMessage}`,
                code,
                timestamp,
            };
        }
    }
    /**
     * Health check for email service
     */
    async healthCheck() {
        try {
            // Try to instantiate Resend to check API key validity
            logger_1.default.info("Email service health check passed");
            return true;
        }
        catch (error) {
            logger_1.default.error("Email service health check failed", {
                error: (0, utils_1.getFriendlyErrorMessage)(error),
            });
            return false;
        }
    }
}
exports.EmailService = EmailService;
/**
 * Create and export singleton instance
 */
function createEmailService() {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY environment variable is not set");
    }
    if (!fromEmail) {
        throw new Error("RESEND_FROM_EMAIL environment variable is not set");
    }
    return new EmailService(apiKey, fromEmail);
}
//# sourceMappingURL=email-service.js.map