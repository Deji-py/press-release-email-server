# Deployment Guide to Vercel

Your Resend Email Server has been configured for deployment to Vercel. Here's what was done and how to deploy.

## Changes Made

### 1. **TypeScript Configuration** (`tsconfig.json`)
   - Changed module format from ES2020 to **CommonJS** for better Vercel serverless compatibility
   - CommonJS is the standard for Node.js environments on Vercel

### 2. **Application Entry Point** (`src/index.ts`)
   - Modified to support both local development and Vercel serverless execution
   - Server only starts locally (when `VERCEL !== "1"`)
   - Express app is exported for Vercel to use as a handler

### 3. **Import Statements** (All source files)
   - Removed `.js` extensions from all relative imports (required for CommonJS)
   - Updated in: `index.ts`, `routes.ts`, `email-service.ts`, `templates.ts`

### 4. **Vercel Configuration** (`vercel.json`)
   - Configured to build with `npm run build`
   - Node.js runtime: 20.x
   - Memory allocation: 1024 MB
   - Maximum function timeout: 60 seconds
   - All requests routed to the Express app

### 5. **Build Scripts** (`package.json`)
   - Added `vercel-build` script for Vercel deployment

### 6. **Deployment Ignore** (`.vercelignore`)
   - Excludes unnecessary files from deployment (logs, .git, etc.)

## Deployment Steps

### Step 1: Push to Git Repository
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel
You have three options:

#### Option A: Connect via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your account
3. Click "Add New..." → "Project"
4. Import your Git repository
5. Vercel will auto-detect your configuration
6. Set environment variables (see below)
7. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

#### Option C: GitHub Integration
1. Connect your GitHub account to Vercel
2. Select this repository
3. Vercel will auto-deploy on every push to main branch

### Step 3: Configure Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:

```
RESEND_API_KEY=<your-resend-api-key>
CORS_ORIGINS=<your-frontend-domains>
NODE_ENV=production
```

**Key environment variables:**
- `RESEND_API_KEY` - Your Resend API key (required)
- `CORS_ORIGINS` - Comma-separated list of allowed domains (e.g., `https://example.com,https://app.example.com`)
- `NODE_ENV` - Set to `production`

### Step 4: Verify Deployment
After deployment:

1. Visit your Vercel deployment URL (e.g., `https://your-project.vercel.app/`)
2. You should see the service status JSON
3. Test the `/health` endpoint
4. Check logs: Vercel Dashboard → Deployments → Functions logs

## Local Development

You can still run locally with:

```bash
npm install
npm run dev
```

The server will start on `http://localhost:3001` and work exactly as before.

## Monitoring & Debugging

### Check Deployment Logs
```bash
vercel logs --tail
```

### Check Function Performance
Vercel Dashboard → Deployments → Function Analytics

### Environment: Production vs Staging

- **Preview Deployments**: Automatic for PRs and feature branches
- **Production**: Main branch deployments go to `.vercel.app` domain

## Cost Considerations

- **Free Tier**: Includes 100GB bandwidth, 100k functions executions/month
- **Pro Tier**: Unlimited executions, better performance
- Resend API usage (emails sent) billed separately by Resend

## Troubleshooting

### "Module not found" errors
- Ensure all imports use CommonJS format (no `.js` extensions for relative imports)
- Check `tsconfig.json` has `"module": "CommonJS"`

### Environment variables not loading
- Verify they're set in Vercel Dashboard → Environment Variables
- Don't commit `.env` files (they're in `.gitignore`)

### Timeout errors
- Current timeout: 60 seconds
- Adjust in `vercel.json` if needed (max 60s on free tier, 900s on Pro)

### CORS errors
- Update `CORS_ORIGINS` environment variable with your frontend domain
- Format: `https://domain1.com,https://domain2.com` (comma-separated, no spaces)

## Rollback

If you need to rollback to a previous version:
1. Go to Vercel Dashboard → Deployments
2. Click on the previous deployment
3. Click "Promote to Production"

## Additional Resources

- [Vercel Node.js Documentation](https://vercel.com/docs/functions/nodejs)
- [Resend Documentation](https://resend.com/docs)
- [Express on Serverless Functions](https://vercel.com/examples/express)
