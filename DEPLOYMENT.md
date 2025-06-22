# Deployment Guide - Image Upload Setup

## Vercel Deployment with Image Upload

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Step 1: Enable Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Blob**
3. Click **Create Blob Store**
4. Give your store a name (e.g., "foundrly-uploads")
5. Copy the `BLOB_READ_WRITE_TOKEN` that's generated

### Step 2: Set Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

```env
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

### Step 3: Redeploy

After setting the environment variable, redeploy your application:

1. Go to **Deployments** tab
2. Click **Redeploy** on your latest deployment
3. Or push a new commit to trigger automatic deployment

### Step 4: Test Image Upload

1. Navigate to your deployed application
2. Go to the startup form
3. Click "Upload Image" button
4. Try uploading an image file
5. Verify the image appears in the preview

## Environment Variables Reference

### Required for Image Upload
- `BLOB_READ_WRITE_TOKEN`: Token for Vercel Blob storage access

### Required for Full Application
- `NEXT_PUBLIC_SANITY_PROJECT_ID`: Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET`: Your Sanity dataset (usually "production")
- `SANITY_API_TOKEN`: Your Sanity API token
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your application URL (e.g., https://your-app.vercel.app)

### Optional
- `GITHUB_ID` & `GITHUB_SECRET`: For GitHub authentication
- `SENTRY_DSN`: For error tracking

## Troubleshooting

### Image Upload Not Working
1. **Check Environment Variables**: Ensure `BLOB_READ_WRITE_TOKEN` is set correctly
2. **Check Vercel Blob Store**: Verify the blob store is created and active
3. **Check Network Tab**: Look for any API errors in browser dev tools
4. **Check Vercel Logs**: Review function logs in Vercel dashboard

### Common Issues
- **"Upload failed"**: Usually means missing or invalid `BLOB_READ_WRITE_TOKEN`
- **"File size too large"**: Images must be under 5MB
- **"Invalid file type"**: Only image files (PNG, JPG, GIF) are accepted

### Local Development
Image uploads work automatically in local development without any additional setup. Files are stored in the `public/uploads/` directory.

## Support

If you're still having issues:
1. Check the Vercel function logs in your dashboard
2. Verify all environment variables are set correctly
3. Ensure your Vercel Blob store is active and accessible 