import { EmailTemplateConfig } from "./types.js";

/**
 * Email template IDs and configurations
 * These templates must be created in Resend dashboard first
 */
export const EMAIL_TEMPLATES: Record<string, EmailTemplateConfig> = {
  ADMIN_INVITE: {
    id: "admin-invite",
    subject: "You're invited to join the Admin Dashboard",
  },

  PRESS_RELEASE_APPROVED: {
    id: "press-release-approved",
    subject: "Your Press Release Has Been Approved",
  },

  PRESS_RELEASE_REJECTED: {
    id: "press-release-rejected",
    subject: "Your Press Release Needs Revision",
  },

  PRESS_RELEASE_OWNER_CUSTOM_EMAIL: {
    id: "press-release-owner-custom-email-1",
    subject: "{{subject}}",
  },

  USER_CUSTOM_EMAIL: {
    id: "user-custom-email",
    subject: "{{subject}}",
  },

  BROADCAST_USERS: {
    id: "broadcast-users",
    subject: "{{subject}}",
  },

  SUPPORT_TICKET_RESPONSE: {
    id: "support-ticket-response",
    subject: "Response to Your Support Ticket #{{ticketId}}",
  },
};

/**
 * Get template configuration by key
 */
export function getEmailTemplate(
  templateKey: string,
): EmailTemplateConfig | undefined {
  return EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES];
}

/**
 * Get template ID by key
 */
export function getTemplateId(templateKey: string): string | undefined {
  const template = getEmailTemplate(templateKey);
  return template?.id;
}

/**
 * Validate template key exists
 */
export function isValidTemplateKey(templateKey: string): boolean {
  return templateKey in EMAIL_TEMPLATES;
}

/**
 * Get all available template keys
 */
export function getAllTemplateKeys(): string[] {
  return Object.keys(EMAIL_TEMPLATES);
}
