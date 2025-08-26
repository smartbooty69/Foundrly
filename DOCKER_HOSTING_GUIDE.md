# Docker Hosting Guide for Foundrly

## Overview

Yes, you can absolutely host your Foundrly application through Docker! This guide covers multiple hosting options using Docker, from simple single-server deployments to more complex production setups.

## Hosting Options

### 1. **Simple Single-Server Hosting**

Perfect for small to medium applications.

#### Quick Start
```bash
# Build and run production container
docker-compose -f docker-compose.prod.yml up -d

# Access your application
# http://your-server-ip:3000
```

#### Manual Docker Commands
```bash
# Build production image
docker build -t foundrly:latest .

# Run container
docker run -d \
  --name foundrly-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id \
  -e NEXTAUTH_SECRET=your_secret \
  -e NEXTAUTH_URL=http://your-domain.com \
  foundrly:latest
```

### 2. **Production Hosting with Nginx**

For better performance and SSL support.

#### Setup Nginx Configuration
```bash
# Create nginx config directory
mkdir -p docker/nginx

# Create nginx configuration
cat > docker/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream foundrly {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://foundrly;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
```

#### Start with Nginx
```bash
# Start with nginx profile
docker-compose -f docker-compose.prod.yml --profile nginx up -d

# Access via nginx
# http://your-domain.com
```

### 3. **Cloud Hosting Options**

#### A. **DigitalOcean Droplet**
```bash
# 1. Create a droplet (Ubuntu 22.04 recommended)
# 2. SSH into your droplet
ssh root@your-droplet-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Clone your repository
git clone https://github.com/your-username/foundrly.git
cd foundrly

# 6. Create .env file with production variables
cp .env.local .env.prod
# Edit .env.prod with your production values

# 7. Start the application
docker-compose -f docker-compose.prod.yml up -d
```

#### B. **AWS EC2**
```bash
# 1. Launch EC2 instance (Amazon Linux 2 or Ubuntu)
# 2. Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Deploy application
git clone https://github.com/your-username/foundrly.git
cd foundrly
docker-compose -f docker-compose.prod.yml up -d
```

#### C. **Google Cloud Platform**
```bash
# 1. Create Compute Engine instance
# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Deploy application
git clone https://github.com/your-username/foundrly.git
cd foundrly
docker-compose -f docker-compose.prod.yml up -d
```

### 4. **Container Orchestration**

#### A. **Docker Swarm (Simple Orchestration)**
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml foundrly

# Scale services
docker service scale foundrly_app=3
```

#### B. **Kubernetes (Advanced)**
```bash
# Create deployment.yaml
cat > k8s/deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foundrly
spec:
  replicas: 3
  selector:
    matchLabels:
      app: foundrly
  template:
    metadata:
      labels:
        app: foundrly
    spec:
      containers:
      - name: foundrly
        image: foundrly:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
EOF

# Apply deployment
kubectl apply -f k8s/deployment.yaml
```

## Environment Variables for Production

Create a `.env.prod` file with your production environment variables:

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# File Upload (for local hosting)
BLOB_READ_WRITE_TOKEN=your_blob_token

# GitHub OAuth (optional)
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn

# Database (if using PostgreSQL)
POSTGRES_DB=foundrly
POSTGRES_USER=foundrly_user
POSTGRES_PASSWORD=secure_password
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare (Recommended)
1. Point your domain to Cloudflare
2. Enable SSL/TLS encryption mode: "Full"
3. Your site will automatically have SSL

## Monitoring and Maintenance

### Health Checks
```bash
# Check container status
docker ps

# View logs
docker logs -f foundrly-app-prod

# Monitor resource usage
docker stats
```

### Backup Strategy
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec foundrly-postgres-prod pg_dump -U foundrly_user foundrly > backup_$DATE.sql
EOF

# Make executable
chmod +x backup.sh

# Run backup
./backup.sh
```

### Updates and Deployment
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Or use rolling update (with multiple replicas)
docker service update --image foundrly:latest foundrly_app
```

## Performance Optimization

### 1. **Resource Limits**
```yaml
# In docker-compose.prod.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### 2. **Caching**
```yaml
# Add Redis for caching
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    profiles:
      - cache
```

### 3. **CDN Setup**
- Use Cloudflare for global CDN
- Configure static asset caching
- Enable image optimization

## Security Best Practices

### 1. **Container Security**
```bash
# Run as non-root user (already configured in Dockerfile)
# Use secrets for sensitive data
docker secret create db_password ./db_password.txt
```

### 2. **Network Security**
```yaml
# Use internal networks
networks:
  foundrly-network:
    driver: bridge
    internal: true  # No external access
```

### 3. **Regular Updates**
```bash
# Update base images regularly
docker pull node:20-alpine
docker-compose -f docker-compose.prod.yml build --no-cache
```

## Troubleshooting

### Common Issues

1. **Container won't start**
```bash
# Check logs
docker logs foundrly-app-prod

# Check environment variables
docker exec foundrly-app-prod env
```

2. **Memory issues**
```bash
# Monitor memory usage
docker stats

# Increase memory limits
docker-compose -f docker-compose.prod.yml down
# Edit docker-compose.prod.yml to increase memory limits
docker-compose -f docker-compose.prod.yml up -d
```

3. **Port conflicts**
```bash
# Check what's using port 3000
sudo netstat -tulpn | grep :3000

# Change port in docker-compose.prod.yml
ports:
  - "8080:3000"  # Use port 8080 instead
```

## Cost Optimization

### 1. **Resource Sizing**
- Start with minimal resources
- Scale up based on actual usage
- Use auto-scaling where available

### 2. **Cloud Provider Selection**
- **DigitalOcean**: Good for small-medium apps
- **AWS**: Best for enterprise features
- **Google Cloud**: Good for AI/ML features
- **Vultr**: Cost-effective alternative

### 3. **Reserved Instances**
- Commit to 1-3 year terms for significant savings
- Use spot instances for non-critical workloads

## Next Steps

1. **Choose your hosting platform** based on your needs
2. **Set up environment variables** for production
3. **Configure SSL/HTTPS** for security
4. **Set up monitoring** and alerting
5. **Create backup strategy** for data protection
6. **Plan for scaling** as your application grows

Your Docker setup is already production-ready with the standalone output configuration, making it perfect for hosting on any platform that supports Docker!
