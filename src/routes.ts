import { Router, Request, Response, NextFunction } from "express";
import logger from "./logger";
import { EmailService } from "./email-service";
import {
  SendEmailRequest,
  SendEmailResponse,
  ErrorResponse,
  ErrorCode,
} from "./types";
import { isValidVariables, sanitizeEmail } from "./utils";

export function createRoutes(emailService: EmailService): Router {
  const router = Router();

  /**
   * Health check endpoint
   */
  router.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "resend-email-server",
    });
  });

  /**
   * Send email endpoint
   */
  router.post(
    "/send",
    async (req: Request, res: Response<SendEmailResponse | ErrorResponse>) => {
      const timestamp = new Date().toISOString();

      try {
        const { templateId, recipientEmail, variables, overrideSubject } =
          req.body as unknown as SendEmailRequest;

        // Validation errors
        const errors: string[] = [];

        if (!templateId || typeof templateId !== "string") {
          errors.push("templateId is required and must be a string");
        }

        if (!recipientEmail || typeof recipientEmail !== "string") {
          errors.push("recipientEmail is required and must be a string");
        }

        if (variables && !isValidVariables(variables)) {
          errors.push(
            "variables must be an object with string, number, or boolean values",
          );
        }

        if (overrideSubject && typeof overrideSubject !== "string") {
          errors.push("overrideSubject must be a string if provided");
        }

        if (errors.length > 0) {
          logger.warn("Validation error in send request", {
            errors,
            body: req.body,
          });

          return res.status(400).json({
            success: false,
            error: `Validation failed: ${errors.join("; ")}`,
            code: ErrorCode.VALIDATION_ERROR,
            details: errors,
            timestamp,
          });
        }

        console.log(variables, "vraibles", overrideSubject, "overrideSubject");

        // Send email
        const result = await emailService.send({
          templateId: templateId!,
          recipientEmail: sanitizeEmail(recipientEmail!),
          variables: variables || undefined,
          overrideSubject: overrideSubject || undefined,
        });

        // Set appropriate status code
        const statusCode = result.success ? 200 : 400;
        return res.status(statusCode).json(result);
      } catch (error) {
        logger.error("Unexpected error in send endpoint", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });

        return res.status(500).json({
          success: false,
          error: "Internal server error while processing email request",
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          timestamp,
        });
      }
    },
  );

  /**
   * Batch send emails endpoint
   */
  router.post("/send-batch", async (req: Request, res: Response) => {
    const timestamp = new Date().toISOString();

    try {
      const { emails } = req.body as {
        emails: SendEmailRequest[] | undefined;
      };

      if (!Array.isArray(emails)) {
        return res.status(400).json({
          success: false,
          error: "emails must be an array of email send requests",
          code: ErrorCode.VALIDATION_ERROR,
          timestamp,
        });
      }

      if (emails.length === 0) {
        return res.status(400).json({
          success: false,
          error: "emails array cannot be empty",
          code: ErrorCode.VALIDATION_ERROR,
          timestamp,
        });
      }

      if (emails.length > 100) {
        return res.status(400).json({
          success: false,
          error: "Maximum 100 emails per batch",
          code: ErrorCode.VALIDATION_ERROR,
          timestamp,
        });
      }

      logger.info("Processing batch email send", {
        count: emails.length,
      });

      // Send all emails in parallel
      const results = await Promise.all(
        emails.map((email) => emailService.send(email)),
      );

      const successful = results.filter((r) => r.success).length;
      const failed = results.length - successful;

      logger.info("Batch email send completed", {
        total: results.length,
        successful,
        failed,
      });

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
    } catch (error) {
      logger.error("Unexpected error in batch send endpoint", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return res.status(500).json({
        success: false,
        error: "Internal server error while processing batch emails",
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        timestamp,
      });
    }
  });

  /**
   * Get available templates
   */
  router.get("/templates", (_req: Request, res: Response) => {
    res.json({
      templates: [
        "ADMIN_INVITE",
        "PRESS_RELEASE_APPROVED",
        "PRESS_RELEASE_REJECTED",
        "PRESS_RELEASE_OWNER_CUSTOM_EMAIL",
        "USER_CUSTOM_EMAIL",
        "BROADCAST_USERS",
      ],
      description:
        "Use template key (e.g., ADMIN_INVITE) in templateId field of send request",
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

/**
 * Error handling middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): void {
  const timestamp = new Date().toISOString();

  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    timestamp,
  });
}
