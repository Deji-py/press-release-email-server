import { Router, Request, Response, NextFunction } from "express";
import { EmailService } from "./email-service";
import { ErrorResponse } from "./types";
export declare function createRoutes(emailService: EmailService): Router;
/**
 * Error handling middleware
 */
export declare function errorHandler(err: Error, _req: Request, res: Response<ErrorResponse>, _next: NextFunction): void;
//# sourceMappingURL=routes.d.ts.map