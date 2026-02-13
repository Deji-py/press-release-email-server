# Resend Email Server

A dedicated backend server for handling email sending via the Resend API. This server acts as a bridge between your frontend application and Resend, solving CORS issues and keeping your API key secure on the backend.

## Features

- ✅ Dedicated email sending backend
- ✅ Template-based email system
- ✅ Batch email sending support
- ✅ Comprehensive error handling
- ✅ CORS-configured for your frontend
- ✅ Winston logger with file and console output
- ✅ TypeScript support
- ✅ Graceful error recovery

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
PORT=3001
NODE_ENV=development
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=hello@pressrelease.in
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=info
```

### 3. Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will run on `http://localhost:3001`

### 4. Production Build

```bash
npm run build
npm run start
```

## API Endpoints

### GET `/health`

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2026-02-12T10:30:00.000Z",
  "service": "resend-email-server"
}
```

### POST `/api/send`

Send a single email using a template.

**Request Body:**

```json
{
  "templateId": "ADMIN_INVITE",
  "recipientEmail": "user@example.com",
  "variables": {
    "email": "user@example.com",
    "signupUrl": "https://example.com/signup?token=abc123",
    "expiresIn": "2 hours",
    "invitedBy": "Admin Name"
  },
  "overrideSubject": "Optional custom subject"
}
```

**Response (Success):**

```json
{
  "success": true,
  "messageId": "abc123def456",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Invalid recipient email: not-an-email",
  "code": "INVALID_EMAIL",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

### POST `/api/send-batch`

Send multiple emails in a single request (max 100).

**Request Body:**

```json
{
  "emails": [
    {
      "templateId": "ADMIN_INVITE",
      "recipientEmail": "user1@example.com",
      "variables": { ... }
    },
    {
      "templateId": "USER_CUSTOM_EMAIL",
      "recipientEmail": "user2@example.com",
      "variables": { ... }
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    { "success": true, "messageId": "msg1", ... },
    { "success": false, "error": "...", ... }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1
  },
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

### GET `/api/templates`

Get available email templates.

**Response:**

```json
{
  "templates": [
    "ADMIN_INVITE",
    "PRESS_RELEASE_APPROVED",
    "PRESS_RELEASE_REJECTED",
    "PRESS_RELEASE_OWNER_CUSTOM_EMAIL",
    "USER_CUSTOM_EMAIL",
    "BROADCAST_USERS"
  ],
  "description": "Use template key (e.g., ADMIN_INVITE) in templateId field of send request",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

## Available Templates

| Template Key                       | Resend ID                          | Purpose                     |
| ---------------------------------- | ---------------------------------- | --------------------------- |
| `ADMIN_INVITE`                     | `admin-invite`                     | Admin invitation emails     |
| `PRESS_RELEASE_APPROVED`           | `press-release-approved`           | PR approval notifications   |
| `PRESS_RELEASE_REJECTED`           | `press-release-rejected`           | PR rejection notifications  |
| `PRESS_RELEASE_OWNER_CUSTOM_EMAIL` | `press-release-owner-custom-email` | Custom emails to PR owners  |
| `USER_CUSTOM_EMAIL`                | `user-custom-email`                | Custom emails to users      |
| `BROADCAST_USERS`                  | `broadcast-users`                  | Broadcast messages to users |

## Error Codes

| Code                    | Meaning                           |
| ----------------------- | --------------------------------- |
| `MISSING_API_KEY`       | RESEND_API_KEY not configured     |
| `MISSING_FROM_EMAIL`    | RESEND_FROM_EMAIL not configured  |
| `INVALID_EMAIL`         | Invalid recipient or sender email |
| `TEMPLATE_NOT_FOUND`    | Template ID doesn't exist         |
| `RESEND_API_ERROR`      | Resend API returned an error      |
| `VALIDATION_ERROR`      | Request validation failed         |
| `INTERNAL_SERVER_ERROR` | Server error                      |

## Project Structure

```
src/
├── index.ts           # Express server setup
├── routes.ts          # API routes
├── email-service.ts   # Resend API wrapper
├── templates.ts       # Email template configs
├── types.ts           # TypeScript interfaces
├── logger.ts          # Winston logger setup
└── utils.ts           # Utility functions
```

## Logging

Logs are written to:

- **Console**: Development environment (colored output)
- **File**: `logs/combined.log` (all logs)
- **File**: `logs/error.log` (errors only)

Set `LOG_LEVEL` in `.env` to control verbosity:

- `error` - Only errors
- `warn` - Warnings and errors
- `info` - General information, warnings, and errors (default)
- `debug` - Detailed debug information

## Security Considerations

1. **API Key Security**: Keep `RESEND_API_KEY` in `.env` (never commit)
2. **CORS**: Configure `CORS_ORIGINS` to allow only your frontend domain
3. **Rate Limiting**: Consider adding rate limiting middleware in production
4. **Input Validation**: All inputs are validated before processing
5. **Error Messages**: Production errors don't expose sensitive details

## Deployment

### Vercel

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "express"
}
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["npm", "start"]
```

### Environment Variables (Production)

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Set to "production"
- `RESEND_API_KEY`: Your Resend API key
- `RESEND_FROM_EMAIL`: Verified sender email
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `LOG_LEVEL`: Logging level

## Troubleshooting

### "VITE_RESEND_API_KEY is not configured"

Your client app is still trying to use Resend directly. Use the email server instead.

### "CORS error from api.resend.com"

This was the original issue - the email server solves this by running requests server-side.

### "401 Unauthorized from Resend"

Check that `RESEND_API_KEY` is correct and starts with `re_`.

### "Email not sent as a template"

Ensure the template exists in Resend dashboard and the template ID matches exactly.

## License

MIT
"# press-release-email-server" 
