import { SendEmailRequest, SendEmailResponse } from "./types";
/**
 * Email service for handling Resend API interactions
 */
export declare class EmailService {
    private resend;
    private fromEmail;
    constructor(apiKey: string, fromEmail: string);
    /**
     * Send email using Resend template
     */
    send(request: SendEmailRequest): Promise<SendEmailResponse>;
    /**
     * Health check for email service
     */
    healthCheck(): Promise<boolean>;
}
/**
 * Create and export singleton instance
 */
export declare function createEmailService(): EmailService;
//# sourceMappingURL=email-service.d.ts.map