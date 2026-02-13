/**
 * Email sending request payload
 */
export interface SendEmailRequest {
  templateId: string;
  recipientEmail: string;
  variables?: Record<string, string | number | boolean>;
  overrideSubject?: string;
}

/**
 * Email sending response
 */
export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  code?: string;
  timestamp: string;
}

/**
 * Server error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
}

/**
 * Email template configuration
 */
export interface EmailTemplateConfig {
  id: string;
  subject: string;
  variables?: TemplateVariable[];
}

/**
 * Template variable definition
 */
export interface TemplateVariable {
  key: string;
  type: "string" | "number" | "boolean";
  fallbackValue?: string | number | boolean;
}

/**
 * Enum for error codes
 */
export enum ErrorCode {
  MISSING_API_KEY = "MISSING_API_KEY",
  MISSING_FROM_EMAIL = "MISSING_FROM_EMAIL",
  INVALID_EMAIL = "INVALID_EMAIL",
  TEMPLATE_NOT_FOUND = "TEMPLATE_NOT_FOUND",
  RESEND_API_ERROR = "RESEND_API_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
