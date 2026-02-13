# Copilot Instructions for Resend Email Server

## Project Overview
A dedicated backend service bridging frontend applications and Resend API, handling email sending through templates while securely managing API keys server-side. Solves CORS issues with email APIs and provides structured error handling.

**Core Problem Solved**: Frontend apps cannot call Resend API directly (CORS + security). This server acts as a secure proxy.

## Architecture

### Component Map
- **`index.ts`** - Express app setup, middleware, graceful shutdown; exports app for both local and Vercel serverless
- **`routes.ts`** - HTTP endpoints (`/health`, `/api/send`, `/api/send-batch`, `/api/templates`)
- **`email-service.ts`** - Resend SDK wrapper; handles validation and API payload construction
- **`templates.ts`** - Template registry (key→Resend ID mapping); `EMAIL_TEMPLATES` is source of truth
- **`types.ts`** - TypeScript interfaces; defines all request/response/error shapes
- **`logger.ts`** - Winston logger; outputs to file + console (dev only)
- **`utils.ts`** - Pure validation & transformation functions

### Data Flow
1. Client sends `POST /api/send` with `{templateId, recipientEmail, variables, overrideSubject}`
2. Routes validate input against type guards in `utils.ts` (isValidEmail, isValidVariables)
3. Routes delegate to `EmailService.send()`
4. Service resolves template key→Resend ID via `templates.ts`
5. Service normalizes variables from camelCase→UPPERCASE_SNAKE_CASE (Resend expects `{{{VARIABLE_NAME}}}`)
6. Service calls Resend SDK and returns `SendEmailResponse`
7. Routes return response with appropriate HTTP status (200 for success, 400 for validation/template errors, 500 for unexpected)

## Critical Patterns

### Error Handling
- **Type-Safe Errors**: Use `ErrorCode` enum (never string literals)
- **Error Responses Always Include**: `success`, `error`, `code`, `timestamp`, optional `details` array
- **Status Codes Matter**: 400 for known errors (validation, template not found), 500 for unexpected
- **Logging Level**: Use `debug` logs for variable transformations, `info` for successful sends, `warn` for validation failures, `error` for API failures

Example:
```typescript
logger.warn("Invalid recipient email", { email: request.recipientEmail });
// Not: logger.warn(`Invalid email ${recipientEmail}`) - loses metadata
```

### Variable Normalization
**Critical Quirk**: Resend templates use `{{{UPPERCASE_SNAKE_CASE}}}` but clients send camelCase.
- Input: `{ signupUrl: "...", invitedBy: "..." }`
- Resend Expects: `{ SIGNUP_URL: "...", INVITED_BY: "..." }`
- Transformation happens in `utils.ts::normalizeVariableNames()`, called before sending to Resend API

### Template Registry Pattern
Templates are **NOT** fetched from Resend; they're locally mapped in `EMAIL_TEMPLATES` object.
- Keys must match client requests exactly (case-sensitive)
- IDs are what Resend knows about
- Adding new template: Update `EMAIL_TEMPLATES` object, verify template exists in Resend dashboard

```typescript
USER_CUSTOM_EMAIL: {
  id: "user-custom-email",        // Resend knows this ID
  subject: "{{subject}}"           // Can use variables in subject
}
```

### Environment Variables
Required for startup (throws on missing):
- `RESEND_API_KEY` - Validated with `re_` prefix check
- `RESEND_FROM_EMAIL` - Must be verified sender in Resend

Dev Convenience:
- `PORT` - Defaults to 3001
- `NODE_ENV` - Controls logging (console only in dev)
- `CORS_ORIGINS` - Comma-separated list of allowed domains
- `LOG_LEVEL` - winston levels: error, warn, info (default), debug

### Serverless Compatibility (Vercel)
- App only starts listening locally when `process.env.VERCEL !== "1"`
- App is **exported default** for Vercel to use as handler: `export default app`
- This allows same code to run as local server or serverless function
- TypeScript module format must be **CommonJS** for Vercel compatibility (not ES modules)

## Development Workflows

### Local Development
```bash
npm run dev              # Hot reload with tsx
# Runs on :3001, watches files
```

### Building for Deployment
```bash
npm run build            # TypeScript → dist/
npm run start            # Runs dist/index.js locally
npm run vercel-build     # Vercel deployment build (same as build)
```

### Testing Email Logic Locally
```bash
curl -X POST http://localhost:3001/api/send \
  -H "Content-Type: application/json" \
  -d '{"templateId":"ADMIN_INVITE","recipientEmail":"test@example.com","variables":{"signupUrl":"..."}}'
```

### Key Commands NOT Obvious
- `npm run build` must run before deployment (generates `dist/`)
- Log output: `logs/combined.log` (all), `logs/error.log` (errors only)
- "npm run inspect:resend-templates" in exit logs suggests there's a template inspection tool (if implementing, would normalize template checking)

## Common Tasks

### Adding New Email Template
1. Create template in Resend dashboard
2. Add entry to `EMAIL_TEMPLATES` in `templates.ts`
3. Document any required variables in comment above entry
4. Clients can immediately use with new `templateId`

### Modifying Variable Handling
1. Edit `normalizeVariableNames()` in `utils.ts` if transformation logic changes
2. Update comment documenting expected Resend variable format
3. All variable processing happens in one place; no scattered transforms

### Adding New Route
1. Routes are created via `createRoutes(emailService)` factory function in `routes.ts`
2. Always include validation BEFORE calling `emailService` methods
3. Always return response with `timestamp` field
4. Use request body casting: `req.body as unknown as SendEmailRequest` for type safety

### Debugging CORS Issues
- Check `CORS_ORIGINS` env variable - must match frontend domain exactly
- CORS is configured in `index.ts` with `credentials: true`
- Verify `GET /` root endpoint returns service info (confirms app is running)

## Integration Points

### With Resend API
- SDK initialized in `EmailService` constructor
- Only `send()` method calls Resend (no direct API calls elsewhere)
- Template payload structure: `{ template: { id: string, variables?: {} } }`
- Error handling: Resend errors wrapped in `SendEmailResponse` with `success: false`

### With Frontend Client
- Expects: `SendEmailRequest` shape (interface in `types.ts`)
- Receives: `SendEmailResponse` shape (includes `messageId` on success, `code` on failure)
- Batch endpoint: Returns `results` array + `summary` object

### With Resend Dashboard
- Templates created manually in dashboard
- Template IDs referenced in code (e.g., "admin-invite")
- Verify sender emails in Resend dashboard, reference in `RESEND_FROM_EMAIL`

## Key Files for Understanding Problems

| Issue | File | Key Function |
|-------|------|--------------|
| Email validation fails | `utils.ts` | `isValidEmail()` - uses basic regex |
| Variables not sent to Resend | `utils.ts` | `normalizeVariableNames()` - camelCase→UPPERCASE |
| Template not found errors | `templates.ts` | `EMAIL_TEMPLATES` object - source of truth |
| CORS errors | `index.ts` | `corsOptions` middleware config |
| Wrong HTTP status returned | `routes.ts` | Status code logic (200/400/500) |
| Startup failures | `email-service.ts` | Constructor validation checks |

## Deployment Considerations

- **Vercel**: Use `vercel.json` config; Node 20.x runtime; 60s timeout; builds to `dist/`
- **Local Ports**: Default 3001; configure via `PORT` env var
- **Logging in Production**: Only file logs (console disabled); read from `logs/combined.log`
- **Secrets Management**: Never commit `.env`; all keys injected at runtime
- **Cold Starts**: Vercel cold start loads TypeScript → CommonJS output; optimize node_modules if needed

## Conventions NOT to Break

1. **Always use logger** - Never `console.log()`, use appropriate `logger` level
2. **Validate at route layer first** - Don't let invalid data reach service layer  
3. **Return typed responses** - All responses use `SendEmailResponse` or `ErrorResponse` types
4. **Normalize before sending to Resend** - Variables must be transformed consistently
5. **Use strict TypeScript** - `tsconfig.json` has `strict: true`; maintain this
