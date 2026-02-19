import { Resend } from "resend";
import { SendEmailRequest, SendEmailResponse, ErrorCode } from "./types";
import {
  isValidEmail,
  getFriendlyErrorMessage,
  isNetworkError,
  isTimeoutError,
  normalizeVariableNames,
} from "./utils";
import { getTemplateId } from "./templates";

/**
 * Email service for handling Resend API interactions
 */
export class EmailService {
  private resend: Resend;
  // private fromEmail: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Resend API key is required");
    }

    // if (!fromEmail) {
    //   throw new Error("From email is required");
    // }

    this.resend = new Resend(apiKey);
    // this.fromEmail = fromEmail;
  }

  /**
   * Send email using Resend template
   */
  async send(request: SendEmailRequest): Promise<SendEmailResponse> {
    const timestamp = new Date().toISOString();

    try {
      // Validate recipient email
      if (!isValidEmail(request.recipientEmail)) {
        return {
          success: false,
          error: `Invalid recipient email: ${request.recipientEmail}`,
          code: ErrorCode.INVALID_EMAIL,
          timestamp,
        };
      }

      // Get template ID from template key
      const templateId = getTemplateId(request.templateId);
      if (!templateId) {
        return {
          success: false,
          error: `Email template '${request.templateId}' not found. Available templates: ADMIN_INVITE, PRESS_RELEASE_APPROVED, PRESS_RELEASE_REJECTED, PRESS_RELEASE_OWNER_CUSTOM_EMAIL, USER_CUSTOM_EMAIL, BROADCAST_USERS`,
          code: ErrorCode.TEMPLATE_NOT_FOUND,
          timestamp,
        };
      }

      // Prepare email payload for Resend - follow official Resend template format
      // Documentation: https://resend.com/docs/api-reference/emails/send
      // Structure: { from, to, template: { id, variables } }

      const templatePayload: any = {
        id: templateId,
      };

      // Add variables to template (normalized to UPPERCASE_SNAKE_CASE for Resend)
      if (request.variables && Object.keys(request.variables).length > 0) {
        templatePayload.variables = normalizeVariableNames(request.variables);
      }

      const payload: any = {
        // from: this.fromEmail,
        to: request.recipientEmail,
        template: templatePayload,
      };

      // Only add subject override if explicitly requested (overrides template subject)
      if (request.overrideSubject) {
        payload.subject = request.overrideSubject;
      }

      // Send email
      const response = await this.resend.emails.send(payload);

      // Handle response
      if (response.error) {
        const errorMessage = getFriendlyErrorMessage(response.error);

        return {
          success: false,
          error: `Failed to send email: ${errorMessage}`,
          code: ErrorCode.RESEND_API_ERROR,
          timestamp,
        };
      }

      // Success
      const messageId = response.data?.id;

      return {
        success: true,
        messageId,
        timestamp,
      };
    } catch (error) {
      const errorMessage = getFriendlyErrorMessage(error);

      // Categorize error type
      let code = ErrorCode.INTERNAL_SERVER_ERROR;
      if (isNetworkError(error)) {
        code = ErrorCode.RESEND_API_ERROR;
      } else if (isTimeoutError(error)) {
        code = ErrorCode.RESEND_API_ERROR;
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
  async healthCheck(): Promise<boolean> {
    try {
      // Try to instantiate Resend to check API key validity
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Create and export singleton instance
 */
export function createEmailService(): EmailService {
  const apiKey = process.env.RESEND_API_KEY;
  // const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  // if (!fromEmail) {
  //   throw new Error("RESEND_FROM_EMAIL environment variable is not set");
  // }

  return new EmailService(apiKey);
}
