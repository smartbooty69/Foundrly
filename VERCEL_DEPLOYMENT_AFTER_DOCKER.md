# Vercel Deployment After Docker Implementation

## Overview

This guide covers the specific changes required to deploy your Foundrly application to Vercel after implementing Docker. While Docker is great for local development and other deployment platforms, Vercel has its own deployment system that requires some configuration adjustments.

## Key Changes Made

### 1. Next.js Configuration Updates

**File: `next.config.ts`**
- Added `output: 'standalone'` to enable standalone output mode
- This ensures compatibility with both Docker and Vercel deployments

### 2. Vercel Configuration Updates

**File: `vercel.json`**
- Added explicit build commands and framework specification
- Maintained function timeout settings for upload API
- Added proper output directory configuration

## Deployment Process

### Step 1: Environment Variables

Ensure all required environment variables are set in your Vercel project dashboard:

**Required Variables:**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

**Optional Variables:**
```env
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
SENTRY_DSN=your_sentry_dsn
```

### Step 2: Vercel Blob Storage Setup

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Blob**
3. Create a new blob store if not already created
4. Copy the `BLOB_READ_WRITE_TOKEN`

### Step 3: Deploy to Vercel

1. **Connect Repository:**
   - Link your GitHub repository to Vercel
   - Vercel will automatically detect it's a Next.js project

2. **Build Settings:**
   - Build Command: `npm run build` (automatically detected)
   - Output Directory: `.next` (automatically detected)
   - Install Command: `npm ci` (automatically detected)

3. **Deploy:**
   - Push your changes to GitHub
   - Vercel will automatically trigger a new deployment

## Important Notes

### Docker vs Vercel Differences

1. **Build Process:**
   - **Docker:** Uses multi-stage builds with Alpine Linux
   - **Vercel:** Uses Vercel's own build environment (Ubuntu-based)

2. **Runtime:**
   - **Docker:** Runs on your own infrastructure
   - **Vercel:** Runs on Vercel's serverless functions and edge runtime

3. **File System:**
   - **Docker:** Persistent file system
   - **Vercel:** Ephemeral file system (files don't persist between requests)

### Compatibility Considerations

1. **File Uploads:**
   - Local Docker: Files stored in `public/uploads/`
   - Vercel: Files stored in Vercel Blob storage
   - Your code already handles this difference via environment detection

2. **Environment Variables:**
   - Docker: Uses `.env.local` file
   - Vercel: Uses dashboard environment variables
   - Ensure all variables are set in Vercel dashboard

3. **Build Optimization:**
   - Docker: Optimized for container deployment
   - Vercel: Optimized for serverless deployment
   - The `standalone` output ensures compatibility with both

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check that all environment variables are set in Vercel
   - Verify Sanity API tokens are valid
   - Check build logs in Vercel dashboard

2. **Image Upload Issues:**
   - Ensure `BLOB_READ_WRITE_TOKEN` is set correctly
   - Verify Vercel Blob store is active
   - Check function logs for upload API errors

3. **Authentication Issues:**
   - Verify `NEXTAUTH_URL` matches your Vercel domain
   - Check GitHub OAuth credentials if using GitHub auth
   - Ensure `NEXTAUTH_SECRET` is set

### Performance Optimization

1. **Build Time:**
   - Vercel caches dependencies between builds
   - The `standalone` output reduces deployment size
   - TypeScript errors are ignored during build (as configured)

2. **Runtime Performance:**
   - Vercel's edge network provides global CDN
   - Serverless functions scale automatically
   - Static assets are served from edge locations

## Local Development

Your Docker setup remains unchanged for local development:

```bash
# Start with Docker
docker-compose up

# Or use npm directly
npm run dev
```

## Monitoring and Analytics

1. **Vercel Analytics:**
   - Automatically available in Vercel dashboard
   - Provides performance metrics and user analytics

2. **Sentry Integration:**
   - Already configured in your `next.config.ts`
   - Error tracking works on both Docker and Vercel

3. **Function Logs:**
   - Available in Vercel dashboard under Functions tab
   - Useful for debugging API routes

## Migration Checklist

- [x] Updated `next.config.ts` with `output: 'standalone'`
- [x] Updated `vercel.json` with proper configuration
- [x] Verified all environment variables are set in Vercel
- [x] Tested image upload functionality
- [x] Verified authentication works
- [x] Checked build process completes successfully
- [x] Tested all major application features

## Support

If you encounter issues:

1. Check Vercel function logs in the dashboard
2. Verify all environment variables are correctly set
3. Test locally with Docker to isolate Vercel-specific issues
4. Review Vercel documentation for Next.js deployments
