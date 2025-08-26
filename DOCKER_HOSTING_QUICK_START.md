# Docker Hosting Quick Start

## Yes, you can host Foundrly with Docker! 🐳

Your application is already configured for Docker hosting. Here are the quickest ways to get started:

## 🚀 Quick Start (5 minutes)

### Option 1: Simple Docker Hosting
```bash
# Build and run production container
docker-compose -f docker-compose.prod.yml up -d

# Access your app at: http://localhost:3000
```

### Option 2: Using the Deployment Script (Windows)
```cmd
# Deploy with one command
scripts\deploy.bat

# Or with custom environment
scripts\deploy.bat production
```

### Option 3: Manual Docker Commands
```bash
# Build production image
docker build -t foundrly:latest .

# Run container
docker run -d \
  --name foundrly-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  foundrly:latest
```

## 🌐 Cloud Hosting Options

### DigitalOcean Droplet ($5-10/month)
1. Create Ubuntu 22.04 droplet
2. Install Docker: `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`
3. Clone your repo and run: `docker-compose -f docker-compose.prod.yml up -d`

### AWS EC2 (Free tier available)
1. Launch Ubuntu instance
2. Install Docker
3. Deploy with Docker Compose

### Google Cloud Platform
1. Create Compute Engine instance
2. Install Docker
3. Deploy application

## 📋 What You Need

### Environment Variables
Create a `.env.production` file:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
BLOB_READ_WRITE_TOKEN=your_blob_token
```

### Domain & SSL (Optional)
- Point your domain to your server IP
- Use Cloudflare for free SSL
- Or set up Let's Encrypt with Nginx

## 🔧 Management Commands

```bash
# Start application
docker-compose -f docker-compose.prod.yml up -d

# Stop application
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps

# Health check
curl http://localhost:3000/api/health

# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 💰 Cost Comparison

| Platform | Monthly Cost | Features |
|----------|-------------|----------|
| **Docker on VPS** | $5-20 | Full control, scalable |
| **Vercel** | $0-20 | Easy deployment, serverless |
| **AWS/GCP** | $0-50+ | Enterprise features |
| **DigitalOcean** | $5-50 | Developer-friendly |

## ✅ Why Docker Hosting Works Great

1. **Consistent Environment**: Same setup everywhere
2. **Easy Scaling**: Add more containers as needed
3. **Portable**: Move between cloud providers easily
4. **Production Ready**: Your Dockerfile is optimized
5. **Cost Effective**: Pay only for what you use

## 🎯 Recommended Setup

For most users, I recommend:
1. **DigitalOcean Droplet** ($5-10/month)
2. **Docker Compose** for easy management
3. **Cloudflare** for free SSL and CDN
4. **Automatic backups** with cron jobs

## 🚨 Important Notes

- Your Docker setup is **production-ready** with the `standalone` output
- Health checks are configured for monitoring
- File uploads work with Vercel Blob storage
- Authentication works with NextAuth.js
- All your existing features will work in Docker

## 📞 Need Help?

1. Check the full guide: `DOCKER_HOSTING_GUIDE.md`
2. View logs: `docker-compose -f docker-compose.prod.yml logs`
3. Health check: `curl http://localhost:3000/api/health`
4. Restart: `docker-compose -f docker-compose.prod.yml restart`

**Your Foundrly application is ready for Docker hosting! 🎉**
