# 🏗️ Foundrly Architecture

This document provides a comprehensive overview of Foundrly's system architecture, including the technology stack, component structure, data flow, and design patterns.

## 🎯 **System Overview**

Foundrly is a full-stack startup discovery platform built with modern web technologies. The architecture follows a **microservices-inspired** approach within a **monolithic** Next.js application, providing scalability, maintainability, and developer experience.

### **Core Principles**
- **Performance First** - Optimized for fast loading and smooth interactions
- **Scalability** - Designed to handle growth in users and content
- **Developer Experience** - Clean code, comprehensive documentation, and easy debugging
- **Security** - Authentication, authorization, and data protection
- **Real-time** - Live updates and notifications

## 🏛️ **High-Level Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Sanity CMS    │    │   File Storage  │    │   Monitoring    │
│   (Database)    │    │   (Vercel Blob) │    │   (Sentry)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ **Technology Stack**

### **Frontend Layer**
| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js 15** | Full-stack React framework | 15.x |
| **React 18** | UI library | 18.x |
| **TypeScript** | Type-safe JavaScript | 5.x |
| **Tailwind CSS** | Utility-first CSS | 3.x |
| **Radix UI** | Accessible components | Latest |
| **Lucide React** | Icon library | Latest |

### **Backend Layer**
| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js API Routes** | Server-side logic | 15.x |
| **NextAuth.js** | Authentication | 4.x |
| **Sanity CMS** | Headless CMS | Latest |
| **Vercel Blob** | File storage | Latest |

### **Infrastructure**
| Technology | Purpose | Version |
|------------|---------|---------|
| **Vercel** | Deployment platform | Latest |
| **Sentry** | Error monitoring | Latest |
| **Docker** | Containerization | Latest |

## 📁 **Project Structure**

```
foundrly/
├── app/                          # Next.js App Router
│   ├── (root)/                   # Main application pages
│   │   ├── page.tsx             # Homepage
│   │   ├── startup/             # Startup-related pages
│   │   ├── user/                # User profile pages
│   │   ├── badges/              # Badge system pages
│   │   ├── leaderboard/         # Leaderboard pages
│   │   └── notifications/       # Notification pages
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── startup/             # Startup CRUD operations
│   │   ├── user/                # User management
│   │   ├── comments/            # Comment system
│   │   ├── notifications/       # Notification system
│   │   ├── badges/              # Badge system
│   │   ├── moderation/          # Content moderation
│   │   └── upload/              # File upload handling
│   └── studio/                  # Sanity Studio
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── chat/                    # Chat system components
│   └── [feature]/               # Feature-specific components
├── lib/                         # Utility libraries
│   ├── actions.ts              # Server actions
│   ├── badge-system.ts         # Badge system logic
│   ├── email.ts                # Email utilities
│   ├── pushNotifications.ts    # Push notification logic
│   ├── storage.ts              # File storage utilities
│   └── utils.ts                # General utilities
├── hooks/                       # Custom React hooks
├── sanity/                      # Sanity CMS configuration
│   ├── schemaTypes/            # Content schemas
│   ├── lib/                    # Sanity utilities
│   └── components/             # Studio components
└── public/                     # Static assets
```

## 🔄 **Data Flow Architecture**

### **1. User Authentication Flow**
```
User Login Request
       ↓
   NextAuth.js
       ↓
   GitHub OAuth
       ↓
   User Profile Creation
       ↓
   Session Management
       ↓
   Protected Routes
```

### **2. Content Creation Flow**
```
User Creates Startup
       ↓
   Form Validation
       ↓
   File Upload (Vercel Blob)
       ↓
   Sanity CMS Storage
       ↓
   Badge System Check
       ↓
   Notification Creation
       ↓
   Real-time Updates
```

### **3. Social Interaction Flow**
```
User Action (Like/Comment/Follow)
       ↓
   API Route Processing
       ↓
   Database Update
       ↓
   Badge Progress Check
       ↓
   Notification Generation
       ↓
   Real-time UI Update
```

## 🗄️ **Database Architecture**

### **Sanity CMS Schema**

#### **Core Content Types**
```typescript
// User Profile
interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  image: string;
  bio?: string;
  followers: User[];
  following: User[];
  startups: Startup[];
  badges: UserBadge[];
}

// Startup
interface Startup {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  author: User;
  likes: number;
  dislikes: number;
  views: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

// Comment
interface Comment {
  _id: string;
  content: string;
  author: User;
  startup: Startup;
  parentComment?: Comment;
  likes: number;
  dislikes: number;
  createdAt: string;
}
```

#### **Gamification Schema**
```typescript
// Badge
interface Badge {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  rarity: string;
  criteria: BadgeCriteria;
  isActive: boolean;
}

// User Badge
interface UserBadge {
  _id: string;
  user: User;
  badge: Badge;
  earnedAt: string;
  progress?: BadgeProgress;
}
```

#### **Notification Schema**
```typescript
// Notification
interface Notification {
  _id: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'system';
  recipient: User;
  sender?: User;
  startup?: Startup;
  comment?: Comment;
  isRead: boolean;
  createdAt: string;
  metadata?: NotificationMetadata;
}
```

## 🔐 **Security Architecture**

### **Authentication & Authorization**
- **NextAuth.js** for session management
- **GitHub OAuth** for secure authentication
- **JWT tokens** for API authentication
- **Role-based access control** for admin features

### **Data Protection**
- **Input validation** on all API endpoints
- **SQL injection prevention** through Sanity's query builder
- **XSS protection** through React's built-in escaping
- **CSRF protection** through NextAuth.js

### **File Upload Security**
- **File type validation** for uploads
- **Size limits** to prevent abuse
- **Virus scanning** through Vercel Blob
- **Secure URLs** with expiration

## 📊 **Performance Architecture**

### **Caching Strategy**
- **Static Generation** for public pages
- **Incremental Static Regeneration** for dynamic content
- **CDN caching** through Vercel's edge network
- **Browser caching** for static assets

### **Optimization Techniques**
- **Image optimization** with Next.js Image component
- **Code splitting** for reduced bundle sizes
- **Lazy loading** for non-critical components
- **Database query optimization** with Sanity's GROQ

### **Monitoring & Analytics**
- **Sentry** for error tracking and performance monitoring
- **Real User Monitoring (RUM)** for user experience metrics
- **Custom analytics** for business metrics

## 🔄 **Real-time Architecture**

### **Live Updates**
- **Sanity's real-time API** for content changes
- **WebSocket connections** for chat functionality
- **Server-Sent Events** for notifications
- **Optimistic updates** for better UX

### **Notification System**
- **Push notifications** for mobile devices
- **Email notifications** for important events
- **In-app notifications** for real-time updates
- **Webhook integration** for external services

## 🚀 **Deployment Architecture**

### **Vercel Deployment**
```
GitHub Repository
       ↓
   Vercel Build
       ↓
   Environment Variables
       ↓
   Production Deployment
       ↓
   CDN Distribution
```

### **Environment Management**
- **Development** - Local environment with hot reload
- **Staging** - Pre-production testing environment
- **Production** - Live application with monitoring

## 🔧 **Development Architecture**

### **Development Workflow**
1. **Feature Development** - Create feature branches
2. **Code Review** - Pull request reviews
3. **Testing** - Automated and manual testing
4. **Staging Deployment** - Test in staging environment
5. **Production Deployment** - Deploy to production

### **Quality Assurance**
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Testing** with Jest and React Testing Library

## 📈 **Scalability Considerations**

### **Horizontal Scaling**
- **Stateless API routes** for easy scaling
- **CDN distribution** for global performance
- **Database sharding** capabilities with Sanity

### **Vertical Scaling**
- **Resource optimization** for better performance
- **Caching strategies** to reduce load
- **Database indexing** for faster queries

## 🔮 **Future Architecture Plans**

### **Microservices Migration**
- **API Gateway** for centralized routing
- **Service decomposition** for better maintainability
- **Event-driven architecture** for loose coupling

### **Advanced Features**
- **Machine learning** for content recommendations
- **Blockchain integration** for decentralized features
- **Mobile app** development with React Native

---

**Need more details?** Check out our [API Documentation](./api/README.md) or [Development Guides](./development/README.md).
