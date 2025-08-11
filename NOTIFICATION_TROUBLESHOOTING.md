# Notification System Troubleshooting Guide

## Error: "Failed to fetch notifications"

This error occurs when the notification system cannot connect to Sanity or the notification schema is not properly deployed.

## 🔍 Diagnosis Steps

### 1. Check Environment Variables
Create a `.env.local` file in your project root with these variables:

```bash
# Sanity Configuration (REQUIRED)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-02
SANITY_WRITE_TOKEN=your_sanity_write_token_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Test Sanity Connection
Visit `/api/test-sanity` in your browser to check if Sanity is working:
- If it shows "Sanity is working and notification schema is accessible" → Schema is deployed
- If it shows "Sanity is working but notification schema has issues" → Schema needs deployment
- If it shows "Failed to connect to Sanity" → Environment variables are missing

### 3. Deploy Notification Schema
If the schema isn't deployed, run:

```bash
# Install Sanity CLI globally (if not already installed)
npm install -g @sanity/cli

# Login to Sanity
sanity login

# Deploy the schema
node deploy-notification-schema.js
```

## 🚀 Quick Fix Steps

1. **Set up environment variables** in `.env.local`
2. **Deploy the notification schema** to Sanity
3. **Restart your development server**
4. **Test the notification system**

## 🔧 Manual Schema Deployment

If the script doesn't work, manually deploy:

```bash
# From project root
sanity schema deploy
```

## 📋 Environment Variables Setup

### Get Sanity Credentials:
1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to API section
4. Copy:
   - Project ID
   - Dataset name (usually "production")
   - API version
   - Write token (for mutations)

### Create .env.local:
```bash
# Copy from .env.example (if exists)
cp .env.example .env.local

# Or create manually
touch .env.local
```

## 🧪 Testing

After setup, test these endpoints:
- `/api/test-sanity` - Sanity connection test
- `/api/notifications` - Notifications API
- `/notifications` - Notifications page

## 🐛 Common Issues

### "Missing environment variable" errors:
- Check `.env.local` file exists
- Verify variable names are correct
- Restart development server after changes

### "Schema not found" errors:
- Deploy schema to Sanity
- Check schema is included in `sanity/schemaTypes/index.ts`

### Authentication errors:
- Verify `NEXTAUTH_SECRET` is set
- Check user session is valid

## 📞 Need Help?

If issues persist:
1. Check browser console for detailed errors
2. Check server logs for API errors
3. Verify Sanity project permissions
4. Ensure you're logged into Sanity CLI

## ✅ Success Checklist

- [ ] `.env.local` file created with Sanity variables
- [ ] Sanity CLI installed and logged in
- [ ] Notification schema deployed to Sanity
- [ ] Development server restarted
- [ ] `/api/test-sanity` returns success
- [ ] Notification bell shows in navbar
- [ ] Notifications page loads without errors 