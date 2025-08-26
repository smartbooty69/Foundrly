# 🔌 API Reference

The Foundrly API provides a comprehensive set of endpoints for managing startups, users, comments, notifications, and more. All endpoints return JSON responses and use standard HTTP status codes.

## 🚀 **Quick Start**

### **Base URL**
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### **Authentication**
Most endpoints require authentication via NextAuth.js. Include the session cookie in your requests:

```bash
# Browser requests automatically include cookies
# For server-side requests, include the session cookie
curl -H "Cookie: next-auth.session-token=your-session-token" \
     https://your-domain.com/api/startups
```

### **Response Format**
All API responses follow this structure:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## 📋 **API Endpoints Overview**

### **🔐 Authentication**
- `GET /api/auth/[...nextauth]` - NextAuth.js authentication routes

### **🚀 Startups**
- `GET /api/startups` - List startups with filtering and pagination
- `POST /api/startups` - Create a new startup
- `GET /api/startups/[id]` - Get startup details
- `PUT /api/startups/[id]` - Update startup
- `DELETE /api/startups/[id]` - Delete startup

### **👥 Users**
- `GET /api/users/[id]` - Get user profile
- `GET /api/users/search` - Search users
- `GET /api/users/suggested` - Get suggested users to follow
- `GET /api/users/[id]/ban-history` - Get user ban history
- `GET /api/users/[id]/ban-status` - Get current ban status
- `PATCH /api/users/[id]/resolved` - Resolve user issues

### **💬 Comments**
- `GET /api/comments` - Get comments for a startup
- `POST /api/comments` - Create a new comment
- `PATCH /api/comments/[id]` - Update comment
- `DELETE /api/comments/[id]` - Delete comment
- `POST /api/comments/[id]/like` - Like a comment
- `POST /api/comments/[id]/dislike` - Dislike a comment

### **🔔 Notifications**
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read
- `GET /api/notifications-minimal` - Get minimal notification data

### **🏆 Badges**
- `GET /api/badges` - Get all badges
- `GET /api/badges/[id]` - Get badge details
- `POST /api/badges/recalculate` - Recalculate user badges

### **🛡️ Moderation**
- `GET /api/moderation/settings` - Get moderation settings
- `POST /api/moderation/ban-history` - Get ban history analytics
- `POST /api/moderation/ban-history/export` - Export ban history
- `POST /api/reports/submit` - Submit a report
- `POST /api/reports/apply-ban` - Apply ban to user

### **📤 File Upload**
- `POST /api/upload` - Upload files (images, documents)

### **📊 Analytics**
- `POST /api/views` - Track startup views
- `GET /api/health` - Health check endpoint

## 🔐 **Authentication Endpoints**

### **NextAuth.js Routes**
```
GET /api/auth/[...nextauth]
```

Handles all authentication flows including:
- GitHub OAuth login/logout
- Session management
- JWT token handling

**Providers**: GitHub OAuth

## 🚀 **Startup Endpoints**

### **List Startups**
```http
GET /api/startups
```

**Query Parameters:**
- `page` (number) - Page number for pagination
- `limit` (number) - Number of items per page (default: 10)
- `category` (string) - Filter by category
- `search` (string) - Search in title and description
- `sortBy` (string) - Sort by: 'createdAt', 'likes', 'views'
- `sortOrder` (string) - Sort order: 'asc', 'desc'

**Response:**
```typescript
{
  success: true,
  data: {
    startups: Startup[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      hasMore: boolean
    }
  }
}
```

### **Create Startup**
```http
POST /api/startups
```

**Request Body:**
```typescript
{
  title: string;
  description: string;
  category: string;
  image?: File;
  content?: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    startup: Startup;
    badges?: Badge[]; // New badges earned
  }
}
```

### **Get Startup Details**
```http
GET /api/startups/[id]
```

**Response:**
```typescript
{
  success: true,
  data: {
    startup: Startup;
    comments: Comment[];
    relatedStartups: Startup[];
  }
}
```

### **Update Startup**
```http
PUT /api/startups/[id]
```

**Request Body:** Same as create startup

**Response:**
```typescript
{
  success: true,
  data: {
    startup: Startup;
  }
}
```

### **Delete Startup**
```http
DELETE /api/startups/[id]
```

**Response:**
```typescript
{
  success: true,
  message: "Startup deleted successfully"
}
```

## 👥 **User Endpoints**

### **Get User Profile**
```http
GET /api/users/[id]
```

**Response:**
```typescript
{
  success: true,
  data: {
    user: User;
    startups: Startup[];
    badges: UserBadge[];
    followers: User[];
    following: User[];
  }
}
```

### **Search Users**
```http
GET /api/users/search?q=searchTerm
```

**Query Parameters:**
- `q` (string) - Search query
- `limit` (number) - Maximum results (default: 10)

**Response:**
```typescript
{
  success: true,
  data: {
    users: User[];
  }
}
```

### **Get Suggested Users**
```http
GET /api/users/suggested
```

**Query Parameters:**
- `limit` (number) - Number of suggestions (default: 10)
- `exclude` (string[]) - User IDs to exclude

**Response:**
```typescript
{
  success: true,
  data: {
    users: User[];
  }
}
```

### **Get User Ban History**
```http
GET /api/users/[id]/ban-history
```

**Response:**
```typescript
{
  success: true,
  data: {
    bans: BanRecord[];
  }
}
```

### **Get User Ban Status**
```http
GET /api/users/[id]/ban-status
```

**Response:**
```typescript
{
  success: true,
  data: {
    isBanned: boolean;
    banReason?: string;
    banExpiresAt?: string;
    strikeCount: number;
  }
}
```

## 💬 **Comment Endpoints**

### **Get Comments**
```http
GET /api/comments?startupId=123
```

**Query Parameters:**
- `startupId` (string) - Startup ID
- `page` (number) - Page number
- `limit` (number) - Comments per page
- `sortBy` (string) - Sort by: 'createdAt', 'likes'

**Response:**
```typescript
{
  success: true,
  data: {
    comments: Comment[];
    pagination: {
      page: number,
      limit: number,
      total: number,
      hasMore: boolean
    }
  }
}
```

### **Create Comment**
```http
POST /api/comments
```

**Request Body:**
```typescript
{
  startupId: string;
  content: string;
  parentCommentId?: string; // For replies
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    comment: Comment;
    notification?: Notification; // If notification was created
  }
}
```

### **Like Comment**
```http
POST /api/comments/[id]/like
```

**Response:**
```typescript
{
  success: true,
  data: {
    comment: Comment;
    notification?: Notification;
  }
}
```

### **Dislike Comment**
```http
POST /api/comments/[id]/dislike
```

**Response:** Same as like comment

## 🔔 **Notification Endpoints**

### **Get Notifications**
```http
GET /api/notifications
```

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Notifications per page
- `type` (string) - Filter by notification type
- `isRead` (boolean) - Filter by read status

**Response:**
```typescript
{
  success: true,
  data: {
    notifications: Notification[];
    pagination: {
      page: number,
      limit: number,
      total: number,
      hasMore: boolean
    }
  }
}
```

### **Mark Notification as Read**
```http
PATCH /api/notifications/[id]/read
```

**Response:**
```typescript
{
  success: true,
  data: {
    notification: Notification;
  }
}
```

### **Mark All Notifications as Read**
```http
PATCH /api/notifications/read-all
```

**Response:**
```typescript
{
  success: true,
  data: {
    updatedCount: number;
  }
}
```

## 🏆 **Badge Endpoints**

### **Get All Badges**
```http
GET /api/badges
```

**Response:**
```typescript
{
  success: true,
  data: {
    badges: Badge[];
  }
}
```

### **Recalculate User Badges**
```http
POST /api/badges/recalculate
```

**Request Body:**
```typescript
{
  userId: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    newBadges: Badge[];
    updatedProgress: BadgeProgress[];
  }
}
```

## 🛡️ **Moderation Endpoints**

### **Submit Report**
```http
POST /api/reports/submit
```

**Request Body:**
```typescript
{
  type: 'startup' | 'comment' | 'user';
  targetId: string;
  reason: string;
  description?: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    report: Report;
  }
}
```

### **Apply Ban**
```http
POST /api/reports/apply-ban
```

**Request Body:**
```typescript
{
  userId: string;
  reason: string;
  duration: number; // Days, 0 for permanent
  reportId?: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    ban: BanRecord;
  }
}
```

### **Get Moderation Settings**
```http
GET /api/moderation/settings
```

**Response:**
```typescript
{
  success: true,
  data: {
    settings: ModerationSettings;
  }
}
```

## 📤 **File Upload Endpoints**

### **Upload File**
```http
POST /api/upload
```

**Request:** Multipart form data with file

**Response:**
```typescript
{
  success: true,
  data: {
    url: string;
    filename: string;
    size: number;
    type: string;
  }
}
```

## 📊 **Analytics Endpoints**

### **Track Startup View**
```http
POST /api/views
```

**Request Body:**
```typescript
{
  startupId: string;
  userId?: string; // Optional, for authenticated users
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    viewCount: number;
  }
}
```

### **Health Check**
```http
GET /api/health
```

**Response:**
```typescript
{
  success: true,
  data: {
    status: 'healthy';
    timestamp: string;
    version: string;
  }
}
```

## 🔧 **Error Handling**

### **Error Response Format**
```typescript
{
  success: false,
  error: string;
  message?: string;
  details?: any;
}
```

### **Common HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

### **Error Examples**

#### **Validation Error (422)**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "title": "Title is required",
    "description": "Description must be at least 10 characters"
  }
}
```

#### **Unauthorized (401)**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

#### **Not Found (404)**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Startup not found"
}
```

## 📈 **Rate Limiting**

### **Rate Limits**
- **Authentication endpoints**: 10 requests per minute
- **Startup creation**: 5 requests per minute
- **Comment creation**: 10 requests per minute
- **File uploads**: 20 requests per minute
- **General API**: 100 requests per minute

### **Rate Limit Headers**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔒 **Security**

### **Authentication**
- All sensitive endpoints require authentication
- Session-based authentication via NextAuth.js
- JWT tokens for API access

### **Input Validation**
- All inputs are validated using Zod schemas
- SQL injection prevention through Sanity's query builder
- XSS protection through React's built-in escaping

### **CORS**
- CORS is configured for production domains
- Development allows localhost origins

## 📚 **Data Types**

### **Startup**
```typescript
interface Startup {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  content?: string;
  author: User;
  likes: number;
  dislikes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}
```

### **User**
```typescript
interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  image: string;
  bio?: string;
  followers: User[];
  following: User[];
  createdAt: string;
}
```

### **Comment**
```typescript
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

### **Notification**
```typescript
interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipient: User;
  sender?: User;
  startup?: Startup;
  comment?: Comment;
  isRead: boolean;
  createdAt: string;
}
```

## 🧪 **Testing**

### **Test Endpoints**
Several test endpoints are available for development:

- `POST /api/test-create-notification` - Test notification creation
- `POST /api/test-email` - Test email sending
- `POST /api/test-push-notifications` - Test push notifications
- `GET /api/debug` - Debug information

### **Example API Usage**

#### **Using fetch (Browser)**
```javascript
// Get startups
const response = await fetch('/api/startups?page=1&limit=10');
const data = await response.json();

// Create startup
const formData = new FormData();
formData.append('title', 'My Startup');
formData.append('description', 'A great startup idea');
formData.append('image', file);

const response = await fetch('/api/startups', {
  method: 'POST',
  body: formData
});
```

#### **Using curl**
```bash
# Get startups
curl -X GET "https://your-domain.com/api/startups?page=1&limit=10"

# Create startup (with authentication)
curl -X POST "https://your-domain.com/api/startups" \
  -H "Cookie: next-auth.session-token=your-token" \
  -F "title=My Startup" \
  -F "description=A great startup idea" \
  -F "image=@/path/to/image.jpg"
```

---

**Need help with the API?** Check our [Troubleshooting Guide](../troubleshooting/common-issues.md) or [open an issue](https://github.com/yourusername/foundrly/issues).
