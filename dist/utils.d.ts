/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Sanitize template ID to prevent injection
 */
export declare function sanitizeTemplateId(id: string): string;
/**
 * Sanitize email address
 */
export declare function sanitizeEmail(email: string): string;
/**
 * Validate variables object
 */
export declare function isValidVariables(variables: unknown): variables is Record<string, string | number | boolean>;
/**
 * Get friendly error message
 */
export declare function getFriendlyErrorMessage(error: unknown): string;
/**
 * Normalize variable names for Resend (convert to UPPERCASE_SNAKE_CASE)
 * Resend templates use UPPERCASE variable names like {{{INVITED_BY}}}
 * Example: signupUrl -> SIGNUP_URL, invitedBy -> INVITED_BY, expiresIn -> EXPIRES_IN
 */
export declare function normalizeVariableNames(variables: Record<string, string | number | boolean>): Record<string, string | number | boolean>;
/**
 * Check if error is network related
 */
export declare function isNetworkError(error: unknown): boolean;
/**
 * Check if error is timeout related
 */
export declare function isTimeoutError(error: unknown): boolean;
//# sourceMappingURL=utils.d.ts.map