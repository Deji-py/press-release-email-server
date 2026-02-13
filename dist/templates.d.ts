import { EmailTemplateConfig } from "./types";
/**
 * Email template IDs and configurations
 * These templates must be created in Resend dashboard first
 */
export declare const EMAIL_TEMPLATES: Record<string, EmailTemplateConfig>;
/**
 * Get template configuration by key
 */
export declare function getEmailTemplate(templateKey: string): EmailTemplateConfig | undefined;
/**
 * Get template ID by key
 */
export declare function getTemplateId(templateKey: string): string | undefined;
/**
 * Validate template key exists
 */
export declare function isValidTemplateKey(templateKey: string): boolean;
/**
 * Get all available template keys
 */
export declare function getAllTemplateKeys(): string[];
//# sourceMappingURL=templates.d.ts.map