"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_TEMPLATES = void 0;
exports.getEmailTemplate = getEmailTemplate;
exports.getTemplateId = getTemplateId;
exports.isValidTemplateKey = isValidTemplateKey;
exports.getAllTemplateKeys = getAllTemplateKeys;
/**
 * Email template IDs and configurations
 * These templates must be created in Resend dashboard first
 */
exports.EMAIL_TEMPLATES = {
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
function getEmailTemplate(templateKey) {
    return exports.EMAIL_TEMPLATES[templateKey];
}
/**
 * Get template ID by key
 */
function getTemplateId(templateKey) {
    const template = getEmailTemplate(templateKey);
    return template?.id;
}
/**
 * Validate template key exists
 */
function isValidTemplateKey(templateKey) {
    return templateKey in exports.EMAIL_TEMPLATES;
}
/**
 * Get all available template keys
 */
function getAllTemplateKeys() {
    return Object.keys(exports.EMAIL_TEMPLATES);
}
//# sourceMappingURL=templates.js.map