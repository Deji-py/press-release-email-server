"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
/**
 * Enum for error codes
 */
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["MISSING_API_KEY"] = "MISSING_API_KEY";
    ErrorCode["MISSING_FROM_EMAIL"] = "MISSING_FROM_EMAIL";
    ErrorCode["INVALID_EMAIL"] = "INVALID_EMAIL";
    ErrorCode["TEMPLATE_NOT_FOUND"] = "TEMPLATE_NOT_FOUND";
    ErrorCode["RESEND_API_ERROR"] = "RESEND_API_ERROR";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=types.js.map