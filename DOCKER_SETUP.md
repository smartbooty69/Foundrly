# Docker Development Environment Setup for Foundrly

This guide will help you set up a Dockerized development environment for the Foundrly Next.js project on Windows 11 with WSL2.

## Prerequisites

### 1. Install Docker Desktop
- Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
- Ensure WSL2 backend is enabled in Docker Desktop settings
- Make sure Docker Desktop is running

### 2. WSL2 Setup (if not already configured)
```bash
# Enable WSL2
wsl --install

# Set WSL2 as default
wsl --set-default-version 2

# Install Ubuntu (recommended)
wsl --install -d Ubuntu
```

### 3. Docker Desktop WSL2 Integration
1. Open Docker Desktop
2. Go to Settings → Resources → WSL Integration
3. Enable integration with your WSL2 distribution
4. Apply & Restart

## Quick Start

### 1. Clone and Navigate to Project
```bash
# If using WSL2 terminal
cd /mnt/c/Users/clanc/Websites/foundrly

# Or if using Windows Command Prompt
cd C:\Users\clanc\Websites\foundrly
```

### 2. Build and Start Development Environment
```bash
# Build the development image
docker-compose -f docker-compose.dev.yml build

# Start the development environment
docker-compose -f docker-compose.dev.yml up

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Access Your Application
- **Next.js App**: http://localhost:3000
- **Application will automatically reload on code changes**

## Development Workflow

### Starting Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop environment
docker-compose -f docker-compose.dev.yml down
```

### Hot Reload Features
- ✅ **File watching**: Changes to your source code automatically trigger rebuilds
- ✅ **Fast refresh**: React components update without losing state
- ✅ **TypeScript compilation**: Automatic type checking and compilation
- ✅ **Sanity type generation**: Automatic schema type updates

### Common Commands
```bash
# Rebuild container after dependency changes
docker-compose -f docker-compose.dev.yml build --no-cache

# Access container shell
docker exec -it foundrly-app-dev sh

# View container logs
docker logs -f foundrly-app-dev

# Restart just the app service
docker-compose -f docker-compose.dev.yml restart app
```

## Database Setup (Optional)

### Start with PostgreSQL
```bash
# Start app + database
docker-compose -f docker-compose.yml --profile database up

# Access pgAdmin (if enabled)
# http://localhost:8080
# Email: admin@foundrly.com
# Password: admin123
```

### Database Connection Details
- **Host**: `postgres` (container name)
- **Port**: `5432`
- **Database**: `foundrly`
- **Username**: `foundrly_user`
- **Password**: `foundrly_password`

## Performance Optimizations for Windows/WSL2

### 1. WSL2 Performance Settings
Create or edit `%UserProfile%\.wslconfig`:
```ini
[wsl2]
memory=6GB
processors=4
swap=1GB
localhostForwarding=true
```

### 2. Docker Desktop Settings
- **Resources → Memory**: Set to 6GB (leaving 2GB for Windows)
- **Resources → CPUs**: Set to 4 or more
- **Resources → Disk image size**: 32GB or more
- **Docker Engine**: Add these settings to `daemon.json`:
```json
{
  "experimental": true,
  "features": {
    "buildkit": true
  },
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5
}
```

### 3. Volume Mount Performance
The setup uses optimized volume mounts:
- Source code is mounted for hot reload
- `node_modules` is excluded to use container version
- `.next` directory is excluded for better performance
- npm cache is persisted in a named volume

## Troubleshooting

### Hot Reload Not Working
```bash
# Check if polling is enabled
docker exec -it foundrly-app-dev env | grep WATCHPACK

# Restart with polling enabled
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up
```

### Slow File System Performance
1. Ensure your project is in the WSL2 filesystem, not Windows filesystem
2. Move project to `/home/username/projects/foundrly` in WSL2
3. Update volume mount in docker-compose.dev.yml:
```yaml
volumes:
  - /home/username/projects/foundrly:/app
```

### Port Already in Use
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process or change port in docker-compose.dev.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Memory Issues
```bash
# Check container resource usage
docker stats foundrly-app-dev

# Increase memory limit in docker-compose.dev.yml
deploy:
  resources:
    limits:
      memory: 4G
```

### Node Modules Issues
```bash
# Clear npm cache
docker exec -it foundrly-app-dev npm cache clean --force

# Reinstall dependencies
docker exec -it foundrly-app-dev rm -rf node_modules package-lock.json
docker exec -it foundrly-app-dev npm install

# Rebuild container
docker-compose -f docker-compose.dev.yml build --no-cache
```

## Environment Variables

### Development Environment
Create `.env.local` for local development:
```env
# Database (if using PostgreSQL)
DATABASE_URL=postgresql://foundrly_user:foundrly_password@postgres:5432/foundrly

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-token-here
```

## Production Build

### Build Production Image
```bash
# Build production image
docker build --target runner -t foundrly:production .

# Run production container
docker run -p 3000:3000 foundrly:production
```

### Multi-stage Build Benefits
- **deps stage**: Installs only production dependencies
- **builder stage**: Builds the application
- **runner stage**: Creates minimal production image
- **dev stage**: Optimized for development with hot reload

## Monitoring and Logs

### View Application Logs
```bash
# Follow logs in real-time
docker-compose -f docker-compose.dev.yml logs -f app

# View last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 app
```

### Health Checks
The development setup includes health checks:
- Checks if the application is responding on port 3000
- Runs every 30 seconds
- Useful for monitoring container health

## Tips for Faster Development

### 1. Use WSL2 Terminal
- Use Windows Terminal with WSL2 Ubuntu
- Better performance than Windows Command Prompt
- Native Linux commands and tools

### 2. IDE Integration
- Use VS Code with Remote WSL extension
- Open project in WSL2 filesystem for better performance
- Enable Docker extension for container management

### 3. Browser Development Tools
- Use Chrome DevTools for debugging
- Enable source maps for better debugging experience
- Use React Developer Tools extension

### 4. Memory Management
- Monitor Docker Desktop resource usage
- Restart Docker Desktop if memory usage is high
- Use `docker system prune` to clean up unused resources

## Next Steps

1. **Start Development**: Run `docker-compose -f docker-compose.dev.yml up`
2. **Access Application**: Open http://localhost:3000
3. **Make Changes**: Edit files and see hot reload in action
4. **Add Database**: Uncomment PostgreSQL service when needed
5. **Customize**: Modify docker-compose files for your specific needs

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify Docker Desktop and WSL2 are properly configured
3. Ensure sufficient system resources are allocated
4. Check container logs for specific error messages
