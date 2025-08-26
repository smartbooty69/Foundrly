# 🐳 Docker Development Environment for Foundrly

A complete Docker setup for developing the Foundrly Next.js application on Windows 11 with WSL2, featuring hot reload, optimized performance, and PostgreSQL database support.

## 🚀 Quick Start

### Prerequisites
- Windows 11 with WSL2 enabled
- Docker Desktop with WSL2 backend
- 8GB RAM system (optimized configuration included)

### 1. Start Development Environment
```bash
# Using the convenience script (Windows)
scripts\docker-dev.bat start

# Using the convenience script (WSL2/Linux)
./scripts/docker-dev.sh start

# Or manually
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Access Your Application
- **Next.js App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Hot reload is enabled** - changes to your code will automatically refresh

### 4. Memory Management
- Monitor Docker Desktop resource usage
- Restart Docker Desktop if memory usage is high
- Use `docker system prune` to clean up unused resources
- **For 8GB RAM**: Close browser tabs and other applications when developing
- **For 8GB RAM**: Use only essential services (app + database, skip Redis/pgAdmin if not needed)

## 💾 Memory Optimization for 8GB RAM

This setup is specifically optimized for systems with 8GB RAM:

### Container Memory Limits
- **Next.js App**: 2GB max, 1GB reserved
- **PostgreSQL**: 1GB max, 512MB reserved  
- **Redis**: 256MB max, 128MB reserved
- **pgAdmin**: 512MB max, 256MB reserved

### Total Memory Usage
- **Docker containers**: ~3.8GB max
- **Docker Desktop**: 6GB allocated
- **Windows system**: 2GB reserved

### Performance Optimizations
- Node.js heap size limited to 2GB
- PostgreSQL optimized for low memory usage
- Redis configured with LRU eviction policy
- Efficient volume mounts to reduce I/O overhead

## 📁 Project Structure

```
foundrly/
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Full stack with database
├── docker-compose.dev.yml     # Development-only setup
├── .dockerignore             # Optimized build context
├── scripts/
│   ├── docker-dev.sh         # Linux/WSL2 convenience script
│   └── docker-dev.bat        # Windows convenience script
├── docker/
│   └── postgres/
│       └── init/
│           └── 01-init.sql   # Database initialization
└── app/
    └── api/
        └── health/
            └── route.ts      # Health check endpoint
```

## 🛠️ Available Commands

### Using Convenience Scripts

#### Windows (Command Prompt)
```cmd
scripts\docker-dev.bat start      # Start development environment
scripts\docker-dev.bat stop       # Stop development environment
scripts\docker-dev.bat restart    # Restart development environment
scripts\docker-dev.bat logs       # View application logs
scripts\docker-dev.bat shell      # Access container shell
scripts\docker-dev.bat status     # Show container status
scripts\docker-dev.bat db-start   # Start with PostgreSQL
scripts\docker-dev.bat clean      # Clean up all resources
```

#### WSL2/Linux
```bash
./scripts/docker-dev.sh start     # Start development environment
./scripts/docker-dev.sh stop      # Stop development environment
./scripts/docker-dev.sh restart   # Restart development environment
./scripts/docker-dev.sh logs      # View application logs
./scripts/docker-dev.sh shell     # Access container shell
./scripts/docker-dev.sh status    # Show container status
./scripts/docker-dev.sh db-start  # Start with PostgreSQL
./scripts/docker-dev.sh clean     # Clean up all resources
```

### Manual Docker Commands
```bash
# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f app

# With Database
docker-compose -f docker-compose.yml --profile database up -d
docker-compose -f docker-compose.yml --profile database down

# Production
docker build --target runner -t foundrly:production .
docker run -p 3000:3000 foundrly:production
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` for local development:
```env
# Database (when using PostgreSQL)
DATABASE_URL=postgresql://foundrly_user:foundrly_password@postgres:5432/foundrly

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-token-here
```

### Docker Desktop Settings
Recommended settings for 8GB RAM system:

1. **Resources → Memory**: 6GB (leaving 2GB for Windows)
2. **Resources → CPUs**: 4 or more
3. **Resources → Disk image size**: 32GB or more
4. **Docker Engine** (add to `daemon.json`):
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

### WSL2 Performance Settings
Create `%UserProfile%\.wslconfig`:
```ini
[wsl2]
memory=6GB
processors=4
swap=1GB
localhostForwarding=true
```

## 🗄️ Database Setup

### PostgreSQL
```bash
# Start with database
scripts\docker-dev.bat db-start

# Access pgAdmin
# URL: http://localhost:8080
# Email: admin@foundrly.com
# Password: admin123

# Database connection
# Host: localhost
# Port: 5432
# Database: foundrly
# Username: foundrly_user
# Password: foundrly_password
```

### Database Initialization
The PostgreSQL container automatically runs initialization scripts from `docker/postgres/init/` on first startup.

## 🔍 Monitoring and Debugging

### Health Check
- **Endpoint**: http://localhost:3000/api/health
- **Response**: JSON with application status, memory usage, and uptime

### Container Logs
```bash
# Follow logs in real-time
scripts\docker-dev.bat logs -f

# View last 100 lines
scripts\docker-dev.bat logs --tail=100
```

### Container Status
```bash
# Show running containers and resource usage
scripts\docker-dev.bat status
```

### Access Container Shell
```bash
# Open shell in the application container
scripts\docker-dev.bat shell

# Inside container, you can run:
npm run typegen    # Regenerate Sanity types
npm install        # Install new dependencies
npm run build      # Build the application
```

## 🚨 Troubleshooting

### Memory Issues (8GB RAM Systems)
```bash
# Check container resource usage
docker stats foundrly-app-dev

# If containers are using too much memory:
# 1. Restart Docker Desktop
# 2. Close unnecessary applications
# 3. Use only essential services:
docker-compose -f docker-compose.dev.yml up -d  # App only
# OR
docker-compose -f docker-compose.yml --profile database up -d  # App + DB only

# Monitor memory usage in real-time
docker stats --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### Hot Reload Not Working
```bash
# Check if polling is enabled
docker exec -it foundrly-app-dev env | grep WATCHPACK

# Restart with polling enabled
scripts\docker-dev.bat restart
```

### Slow File System Performance
1. **Move project to WSL2 filesystem**:
   ```bash
   # In WSL2 terminal
   cp -r /mnt/c/Users/clanc/Websites/foundrly ~/projects/foundrly
   cd ~/projects/foundrly
   ```

2. **Update volume mount** in `docker-compose.dev.yml`:
   ```yaml
   volumes:
     - /home/username/projects/foundrly:/app
   ```

### Port Already in Use
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Change port in docker-compose.dev.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Node Modules Issues
```bash
# Clear npm cache
docker exec -it foundrly-app-dev npm cache clean --force

# Reinstall dependencies
docker exec -it foundrly-app-dev rm -rf node_modules package-lock.json
docker exec -it foundrly-app-dev npm install

# Rebuild container
scripts\docker-dev.bat rebuild
```

### Docker Desktop Issues
1. **Restart Docker Desktop**
2. **Reset Docker Desktop to factory defaults**
3. **Check WSL2 integration is enabled**
4. **Verify sufficient system resources**
5. **For 8GB RAM: Close other applications when using Docker**

## 🎯 Performance Optimizations

### Volume Mounts
- ✅ Source code mounted for hot reload
- ✅ `node_modules` excluded (uses container version)
- ✅ `.next` directory excluded for better performance
- ✅ npm cache persisted in named volume

### Build Optimizations
- ✅ Multi-stage build for smaller production images
- ✅ Alpine Linux base for smaller footprint
- ✅ BuildKit enabled for faster builds
- ✅ Layer caching for faster rebuilds

### Development Optimizations
- ✅ File watching with polling for Windows/WSL2
- ✅ Fast refresh enabled for React components
- ✅ TypeScript compilation in container
- ✅ Sanity type generation in container

## 🔄 Development Workflow

### Typical Development Session
1. **Start environment**: `scripts\docker-dev.bat start`
2. **Open browser**: http://localhost:3000
3. **Edit code**: Changes auto-reload
4. **View logs**: `scripts\docker-dev.bat logs -f`
5. **Stop environment**: `scripts\docker-dev.bat stop`

### Adding Dependencies
```bash
# Access container shell
scripts\docker-dev.bat shell

# Install new dependency
npm install new-package

# Exit shell and rebuild
exit
scripts\docker-dev.bat rebuild
```

### Database Changes
```bash
# Start with database
scripts\docker-dev.bat db-start

# Access pgAdmin for database management
# http://localhost:8080

# Or connect directly with your database client
# Connection string: postgresql://foundrly_user:foundrly_password@localhost:5432/foundrly
```

## 🚀 Production Deployment

### Build Production Image
```bash
# Build optimized production image
docker build --target runner -t foundrly:production .

# Run production container
docker run -p 3000:3000 foundrly:production
```

### Production Considerations
- Uses multi-stage build for minimal image size
- Includes only production dependencies
- Runs as non-root user for security
- Optimized for Next.js standalone output

## 📚 Additional Resources

- [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows/)
- [WSL2 Installation Guide](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify Docker Desktop and WSL2 configuration
3. Ensure sufficient system resources
4. Check container logs for specific errors
5. Review the comprehensive setup guide in `DOCKER_SETUP.md`
