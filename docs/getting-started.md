# 🚀 Getting Started with Foundrly

Welcome to Foundrly! This guide will help you set up your development environment and get the application running locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### **Required Software**
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (comes with Node.js)
- **Git** for version control
- **Code Editor** (VS Code recommended)

### **Optional but Recommended**
- **Docker Desktop** - For containerized development
- **PostgreSQL** - For local database development
- **Sanity CLI** - For CMS management

## 🛠️ Installation Methods

Choose your preferred installation method:

### **Method 1: Standard Installation (Recommended)**
```bash
# Clone the repository
git clone https://github.com/yourusername/foundrly.git
cd foundrly

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### **Method 2: Docker Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/foundrly.git
cd foundrly

# Build and start with Docker
docker-compose -f docker-compose.dev.yml up --build
```

## ⚙️ Environment Configuration

### **1. Create Environment File**
```bash
cp .env.example .env.local
```

### **2. Required Environment Variables**

#### **Core Application**
```env
# Next.js Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-api-token

# File Storage (Development)
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

### **3. Sanity CMS Setup**

#### **Create a Sanity Project**
1. Go to [sanity.io](https://sanity.io) and create an account
2. Create a new project
3. Copy your project ID and dataset name
4. Generate an API token with read/write permissions

#### **Deploy Sanity Schema**
```bash
# Install Sanity CLI globally
npm install -g @sanity/cli

# Login to Sanity
sanity login

# Deploy schema to your project
sanity deploy
```

## 🏃‍♂️ Running the Application

### **Development Mode**
```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### **Production Build**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Docker Development**
```bash
# Start with Docker
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop containers
docker-compose -f docker-compose.dev.yml down
```

## 🔧 Development Workflow

### **Available Scripts**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Sanity
npm run sanity:deploy # Deploy Sanity schema
npm run sanity:start  # Start Sanity Studio
```

### **Hot Reload Features**
- ✅ **File watching** - Changes trigger automatic rebuilds
- ✅ **Fast refresh** - React components update without losing state
- ✅ **TypeScript compilation** - Automatic type checking
- ✅ **Sanity type generation** - Automatic schema type updates

## 🗄️ Database Setup

### **Local PostgreSQL (Optional)**
```bash
# Start PostgreSQL with Docker
docker-compose --profile database up -d

# Access pgAdmin (if enabled)
# http://localhost:8080
```

### **Sanity CMS (Required)**
The application uses Sanity CMS as its primary database. No additional setup is required beyond the environment configuration above.

## 📱 Testing the Application

### **1. Authentication**
- Visit `http://localhost:3000`
- Click "Sign In" and authenticate with GitHub
- Verify your profile is created

### **2. Create a Startup**
- Click "Create Startup" in the navigation
- Fill out the form with sample data
- Upload an image
- Submit and verify it appears in the feed

### **3. Test Social Features**
- Like/dislike startups
- Add comments
- Follow other users
- Test the messaging system

### **4. Check Notifications**
- Perform actions that trigger notifications
- Check the notification bell in the navbar
- Visit the notifications page

## 🐛 Troubleshooting

### **Common Issues**

#### **Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

#### **Sanity Connection Issues**
- Verify your `SANITY_API_TOKEN` has correct permissions
- Check that your project ID and dataset are correct
- Ensure your Sanity project is active

#### **Docker Issues**
```bash
# Clean up Docker containers
docker-compose down -v
docker system prune -f

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml build --no-cache
```

#### **Node Modules Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Getting Help**
- Check the [Troubleshooting Guide](../troubleshooting/common-issues.md)
- Search existing [GitHub Issues](https://github.com/yourusername/foundrly/issues)
- Join our [Discord Community](https://discord.gg/foundrly)

## 🎯 Next Steps

Once you have the application running:

1. **Explore the Codebase** - Check out the [Architecture Guide](./architecture.md)
2. **Read the API Docs** - Review the [API Reference](./api/README.md)
3. **Set Up Monitoring** - Configure [Sentry for error tracking](./config/monitoring.md)
4. **Deploy to Production** - Follow the [Deployment Guide](./deployment.md)

## 📚 Additional Resources

- **[Architecture Overview](./architecture.md)** - Understand the system design
- **[API Documentation](./api/README.md)** - Complete API reference
- **[Contributing Guide](./development/contributing.md)** - How to contribute
- **[Docker Setup](./development/docker.md)** - Containerized development

---

**Need help?** Check our [Troubleshooting Guide](../troubleshooting/common-issues.md) or [open an issue](https://github.com/yourusername/foundrly/issues).
