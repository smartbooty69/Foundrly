# 🚀 Deployment Guide

This guide covers deploying Foundrly to production environments, including Vercel, Docker, and other hosting platforms.

## 🎯 **Deployment Options**

### **Recommended: Vercel (Easiest)**
- **Zero configuration** deployment
- **Automatic scaling** and CDN
- **Built-in analytics** and monitoring
- **Git integration** for continuous deployment

### **Alternative: Docker**
- **Containerized deployment** for any platform
- **Consistent environments** across development and production
- **Scalable architecture** for high-traffic applications

### **Other Options**
- **Netlify** - Similar to Vercel
- **Railway** - Full-stack platform
- **AWS/GCP/Azure** - Cloud providers
- **Self-hosted** - VPS or dedicated server

## 🚀 **Vercel Deployment (Recommended)**

### **Prerequisites**
- [Vercel account](https://vercel.com)
- [GitHub repository](https://github.com) with your code
- All environment variables configured

### **Step 1: Prepare Your Repository**

#### **1.1 Update package.json**
Ensure your `package.json` has the correct build scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

#### **1.2 Create vercel.json (Optional)**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### **Step 2: Deploy to Vercel**

#### **2.1 Connect Repository**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and branch

#### **2.2 Configure Project**
1. **Project Name**: Choose a name for your project
2. **Framework Preset**: Next.js (auto-detected)
3. **Root Directory**: Leave empty (if project is in root)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `.next` (default)
6. **Install Command**: `npm install` (default)

#### **2.3 Environment Variables**
Add all required environment variables in the Vercel dashboard:

```env
# Core Application
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-api-token

# File Storage
BLOB_READ_WRITE_TOKEN=your-blob-token

# Optional Services
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

#### **2.4 Deploy**
Click "Deploy" and wait for the build to complete.

### **Step 3: Post-Deployment Setup**

#### **3.1 Custom Domain (Optional)**
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

#### **3.2 Environment Verification**
1. Visit your deployed application
2. Test authentication flow
3. Verify file uploads work
4. Check notification system
5. Test all major features

## 🐳 **Docker Deployment**

### **Prerequisites**
- Docker and Docker Compose installed
- Server with Docker support
- Domain name (optional but recommended)

### **Step 1: Prepare Docker Configuration**

#### **1.1 Production Dockerfile**
```dockerfile
# Use the existing Dockerfile or create a production version
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### **1.2 Production Docker Compose**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXT_PUBLIC_SANITY_PROJECT_ID=${NEXT_PUBLIC_SANITY_PROJECT_ID}
      - NEXT_PUBLIC_SANITY_DATASET=${NEXT_PUBLIC_SANITY_DATASET}
      - SANITY_API_TOKEN=${SANITY_API_TOKEN}
      - BLOB_READ_WRITE_TOKEN=${BLOB_READ_WRITE_TOKEN}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

#### **1.3 Nginx Configuration**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### **Step 2: Deploy with Docker**

#### **2.1 Build and Deploy**
```bash
# Build the production image
docker-compose -f docker-compose.prod.yml build

# Start the services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### **2.2 SSL Certificate (Optional)**
```bash
# Using Let's Encrypt with Certbot
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot certonly \
  --standalone \
  -d your-domain.com
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**

#### **Core Application**
```env
# Next.js Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-api-token

# File Storage
BLOB_READ_WRITE_TOKEN=your-blob-token
```

#### **Optional Services**
```env
# Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### **Environment Variable Management**

#### **Vercel**
- Use the Vercel dashboard to add environment variables
- Variables are automatically available at build time
- Use `NEXT_PUBLIC_` prefix for client-side variables

#### **Docker**
- Use `.env` files or Docker secrets
- Pass variables through Docker Compose
- Use environment-specific files (`.env.production`)

#### **Other Platforms**
- Follow platform-specific documentation
- Use their environment variable management systems
- Ensure proper security practices

## 🔒 **Security Configuration**

### **SSL/HTTPS Setup**

#### **Vercel**
- Automatic SSL certificates
- Custom domains supported
- Force HTTPS redirects

#### **Docker/Nginx**
```nginx
# Force HTTPS redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

#### **Other Platforms**
- Enable SSL certificates
- Configure HTTPS redirects
- Use secure headers

### **Security Headers**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

## 📊 **Monitoring & Analytics**

### **Sentry Integration**
```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### **Health Checks**
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await sanityClient.fetch('*[_type == "user"][0]');
    
    return Response.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: 'Service unhealthy',
        details: error.message,
      },
      { status: 503 }
    );
  }
}
```

### **Performance Monitoring**
- **Vercel Analytics** - Built-in performance monitoring
- **Sentry Performance** - Error and performance tracking
- **Custom Metrics** - Application-specific monitoring

## 🔄 **Continuous Deployment**

### **GitHub Actions (Vercel)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### **Docker CI/CD**
```yaml
# .github/workflows/docker-deploy.yml
name: Deploy with Docker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker image
        run: |
          docker build -t your-registry/foundrly:${{ github.sha }} .
          docker push your-registry/foundrly:${{ github.sha }}
      
      - name: Deploy to server
        run: |
          ssh user@server "docker pull your-registry/foundrly:${{ github.sha }}"
          ssh user@server "docker-compose -f docker-compose.prod.yml up -d"
```

## 🚨 **Troubleshooting**

### **Common Deployment Issues**

#### **Build Failures**
```bash
# Check build logs
npm run build

# Verify dependencies
npm ci

# Check TypeScript errors
npm run type-check
```

#### **Environment Variables**
- Ensure all required variables are set
- Check variable names and values
- Verify `NEXT_PUBLIC_` prefix for client-side variables

#### **Database Connection**
- Verify Sanity project is active
- Check API token permissions
- Test connection with Sanity CLI

#### **File Upload Issues**
- Verify Vercel Blob configuration
- Check file size limits
- Test upload functionality

### **Debug Commands**
```bash
# Check application status
curl -f http://localhost:3000/api/health

# View application logs
docker-compose logs -f app

# Check environment variables
docker-compose exec app env | grep NEXT

# Test database connection
docker-compose exec app npm run sanity:check
```

## 📈 **Performance Optimization**

### **Build Optimization**
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  images: {
    domains: ['cdn.sanity.io', 'vercel.blob.core.windows.net'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
};
```

### **Caching Strategy**
- **Static Generation** for public pages
- **Incremental Static Regeneration** for dynamic content
- **CDN caching** through Vercel's edge network
- **Browser caching** for static assets

### **Database Optimization**
- **Query optimization** with Sanity's GROQ
- **Image optimization** with Sanity's image API
- **Caching** for frequently accessed data
- **Pagination** for large datasets

## 🔄 **Backup & Recovery**

### **Database Backup**
```bash
# Export Sanity data
npx sanity dataset export production backup-$(date +%Y%m%d)

# Import data
npx sanity dataset import backup-file.tar.gz production
```

### **File Backup**
- **Vercel Blob** - Automatic redundancy
- **Local backups** - Regular exports
- **Version control** - Code and configuration

### **Disaster Recovery**
1. **Code recovery** - Git repository
2. **Database recovery** - Sanity backups
3. **File recovery** - Vercel Blob redundancy
4. **Environment recovery** - Environment variable documentation

---

**Need help with deployment?** Check our [Troubleshooting Guide](./troubleshooting/common-issues.md) or [open an issue](https://github.com/yourusername/foundrly/issues).
