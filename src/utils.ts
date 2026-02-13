/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize template ID to prevent injection
 */
export function sanitizeTemplateId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate variables object
 */
export function isValidVariables(
  variables: unknown,
): variables is Record<string, string | number | boolean> {
  if (typeof variables !== "object" || variables === null) {
    return false;
  }

  for (const value of Object.values(variables)) {
    if (
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean"
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Get friendly error message
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }

  return "Unknown error occurred";
}

/**
 * Normalize variable names for Resend (convert to UPPERCASE_SNAKE_CASE)
 * Resend templates use UPPERCASE variable names like {{{INVITED_BY}}}
 * Example: signupUrl -> SIGNUP_URL, invitedBy -> INVITED_BY, expiresIn -> EXPIRES_IN
 */
export function normalizeVariableNames(
  variables: Record<string, string | number | boolean>,
): Record<string, string | number | boolean> {
  const normalized: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(variables)) {
    // Convert camelCase to UPPER_SNAKE_CASE
    // Insert underscore before uppercase letters and convert to uppercase
    const normalizedKey = key
      .replace(/([a-z])([A-Z])/g, "$1_$2") // Add underscore before capital letters
      .toUpperCase(); // Convert to uppercase

    normalized[normalizedKey] = value;
  }

  return normalized;
}

/**
 * Check if error is network related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("socket hang up")
    );
  }
  return false;
}

/**
 * Check if error is timeout related
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("timeout") || error.message.includes("ETIMEDOUT")
    );
  }
  return false;
}
