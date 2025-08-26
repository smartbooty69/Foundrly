# 🔔 Notification System

The Foundrly Notification System provides real-time updates for user activities and interactions, keeping users informed about relevant events and encouraging continued engagement with the platform.

## 🎯 **Overview**

### **What is the Notification System?**
The notification system is a comprehensive solution that:
- **Tracks user activities** and generates relevant notifications
- **Delivers real-time updates** through multiple channels
- **Manages notification preferences** and user settings
- **Provides rich notification content** with actionable information

### **Key Features**
- **Real-time delivery** - Instant notifications for user actions
- **Multi-channel support** - In-app, email, and push notifications
- **Smart filtering** - Personalized notification preferences
- **Rich content** - Interactive notifications with context
- **Performance optimized** - Efficient delivery and storage

## 📱 **Notification Types**

### **🔔 Core Notification Types**

#### **Social Interactions**
| Type | Description | Trigger | Example |
|------|-------------|---------|---------|
| **Follow** | Someone followed you | User follows another user | "John Doe started following you" |
| **Like** | Someone liked your startup | User likes a startup | "Jane Smith liked your startup 'TechFlow'" |
| **Comment** | Someone commented on your startup | User comments on startup | "Mike Johnson commented on your startup" |
| **Reply** | Someone replied to your comment | User replies to comment | "Sarah replied to your comment" |
| **Mention** | Someone mentioned you in a comment | User mentions @username | "Alex mentioned you in a comment" |

#### **Content Engagement**
| Type | Description | Trigger | Example |
|------|-------------|---------|---------|
| **Startup View** | Your startup received a view | Startup gets viewed | "Your startup 'EcoTech' received 5 new views" |
| **Startup Share** | Someone shared your startup | User shares startup | "Tom shared your startup with his network" |
| **Badge Earned** | You earned a new badge | User meets badge criteria | "Congratulations! You earned the 'Pitch Master' badge" |

#### **System Notifications**
| Type | Description | Trigger | Example |
|------|-------------|---------|---------|
| **Welcome** | Welcome message for new users | User joins platform | "Welcome to Foundrly! Start exploring startups" |
| **Update** | Platform updates and announcements | Admin sends update | "New features available: Enhanced search and filters" |
| **Reminder** | Engagement reminders | Inactive user | "You haven't been active lately. Check out new startups!" |

### **🎨 Notification Design**

#### **Visual Elements**
- **Color-coded icons** for different notification types
- **User avatars** for social interactions
- **Action buttons** for quick responses
- **Timestamp** showing when notification was created
- **Read/unread status** indicators

#### **Content Structure**
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
  badge?: Badge;
  isRead: boolean;
  createdAt: string;
  metadata?: NotificationMetadata;
}
```

## 🏗️ **Technical Implementation**

### **Database Schema**

#### **Notification Schema** (`sanity/schemaTypes/notification.ts`)
```typescript
interface Notification {
  _id: string;
  type: 'follow' | 'like' | 'comment' | 'reply' | 'mention' | 'view' | 'share' | 'badge' | 'system';
  title: string;
  message: string;
  recipient: User;
  sender?: User;
  startup?: Startup;
  comment?: Comment;
  badge?: Badge;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    actionUrl?: string;
    imageUrl?: string;
    priority?: 'low' | 'medium' | 'high';
    expiresAt?: string;
  };
}
```

### **API Endpoints**

#### **GET /api/notifications**
Fetch user notifications with pagination and filtering.

```typescript
// Query parameters
interface NotificationQuery {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  sortBy?: 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

// Response
interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

#### **PATCH /api/notifications/[id]/read**
Mark a specific notification as read.

```typescript
// Request
PATCH /api/notifications/123/read

// Response
{
  success: true;
  notification: Notification;
}
```

#### **PATCH /api/notifications/read-all**
Mark all user notifications as read.

```typescript
// Request
PATCH /api/notifications/read-all

// Response
{
  success: true;
  updatedCount: number;
}
```

### **Notification Creation**

#### **Server Actions** (`lib/actions.ts`)
```typescript
export async function createNotification(data: {
  type: NotificationType;
  recipientId: string;
  senderId?: string;
  startupId?: string;
  commentId?: string;
  badgeId?: string;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
}) {
  const notification = await sanityClient.create({
    _type: 'notification',
    ...data,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Trigger real-time updates
  await triggerNotificationUpdate(notification);
  
  return notification;
}
```

#### **Integration Points**
```typescript
// In API routes - after user actions
export async function POST(request: Request) {
  // ... handle user action
  
  // Create notification
  await createNotification({
    type: 'like',
    recipientId: startup.author._id,
    senderId: userId,
    startupId: startupId,
    title: 'New Like',
    message: `${user.name} liked your startup "${startup.title}"`
  });
}
```

## 🎮 **User Interface Components**

### **NotificationBell Component**
```typescript
// components/NotificationBell.tsx
interface NotificationBellProps {
  className?: string;
  showCount?: boolean;
  maxPreview?: number;
}

// Features:
// - Bell icon with unread count badge
// - Dropdown with recent notifications
// - Quick actions (mark as read, view all)
// - Real-time updates
```

### **NotificationsPage Component**
```typescript
// components/NotificationsPage.tsx
interface NotificationsPageProps {
  initialNotifications?: Notification[];
  filters?: NotificationFilters;
}

// Features:
// - Full-page notification management
// - Filtering by type and status
// - Bulk actions (mark all as read)
// - Pagination for large notification lists
// - Search functionality
```

### **NotificationItem Component**
```typescript
// components/NotificationItem.tsx
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

// Features:
// - Individual notification display
// - Action buttons (mark as read, delete)
// - Rich content with images and links
// - Timestamp and status indicators
```

## 🔧 **Configuration & Customization**

### **Notification Preferences**
```typescript
interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    types: NotificationType[];
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  push: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    types: NotificationType[];
    sound: boolean;
    desktop: boolean;
  };
}
```

### **Template System**
```typescript
// Notification templates for consistent messaging
const notificationTemplates = {
  follow: {
    title: 'New Follower',
    message: '{senderName} started following you',
    icon: 'user-plus',
    color: 'blue'
  },
  like: {
    title: 'New Like',
    message: '{senderName} liked your startup "{startupTitle}"',
    icon: 'heart',
    color: 'red'
  },
  comment: {
    title: 'New Comment',
    message: '{senderName} commented on your startup "{startupTitle}"',
    icon: 'message-circle',
    color: 'green'
  }
};
```

### **Rate Limiting**
```typescript
// Prevent notification spam
const rateLimits = {
  follow: { maxPerHour: 10, maxPerDay: 50 },
  like: { maxPerHour: 20, maxPerDay: 100 },
  comment: { maxPerHour: 5, maxPerDay: 25 }
};
```

## 📊 **Analytics & Insights**

### **Notification Metrics**
- **Delivery rates** for different notification types
- **Open rates** and user engagement
- **Opt-out rates** and user preferences
- **Performance metrics** (delivery time, error rates)

### **User Behavior Analysis**
- **Most engaging** notification types
- **Optimal timing** for notifications
- **User retention** correlation with notifications
- **A/B testing** results for notification content

## 🚀 **Advanced Features**

### **Smart Notifications**
- **Machine learning** for personalized content
- **Optimal timing** based on user activity patterns
- **Content relevance** scoring
- **User preference** learning

### **Batch Notifications**
- **Digest emails** for multiple notifications
- **Weekly summaries** of user activity
- **Trending content** notifications
- **Community highlights**

### **Interactive Notifications**
- **Quick actions** (like, follow, reply)
- **Rich media** support (images, videos)
- **Deep linking** to specific content
- **Social sharing** integration

## 🔔 **Push Notifications**

### **Web Push Setup**
```typescript
// Service Worker (public/sw.js)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/notification-badge.svg',
    badge: '/icons/notification-badge.svg',
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Foundrly', options)
  );
});
```

### **VAPID Configuration**
```typescript
// Environment variables
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

// Subscription management
export async function subscribeToPushNotifications(userId: string, subscription: PushSubscription) {
  await sanityClient.create({
    _type: 'pushSubscription',
    userId,
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    }
  });
}
```

## 📧 **Email Notifications**

### **Email Templates**
```typescript
// Email notification system
export async function sendEmailNotification(notification: Notification) {
  const template = getEmailTemplate(notification.type);
  const html = await renderEmailTemplate(template, notification);
  
  await sendEmail({
    to: notification.recipient.email,
    subject: notification.title,
    html,
    from: 'notifications@foundrly.com'
  });
}
```

### **Email Preferences**
- **Immediate delivery** for important notifications
- **Daily digest** for regular updates
- **Weekly summary** for overview
- **Custom frequency** based on user preferences

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Notifications Not Appearing**
- Check notification creation in API routes
- Verify real-time updates are working
- Ensure user preferences allow notifications
- Check for any JavaScript errors

#### **Push Notifications Not Working**
- Verify service worker is registered
- Check VAPID keys are correctly configured
- Ensure HTTPS is enabled (required for push)
- Test subscription creation and storage

#### **Email Notifications Failing**
- Check SMTP configuration
- Verify email templates are valid
- Monitor email delivery logs
- Test with different email providers

### **Debug Tools**
```typescript
// Debug notification system
export async function debugNotifications(userId: string) {
  const notifications = await getUserNotifications(userId);
  const preferences = await getUserPreferences(userId);
  const subscriptions = await getPushSubscriptions(userId);
  
  return { notifications, preferences, subscriptions };
}

// Test notification creation
export async function testNotification(userId: string, type: NotificationType) {
  return await createNotification({
    type,
    recipientId: userId,
    title: 'Test Notification',
    message: 'This is a test notification'
  });
}
```

## 📈 **Performance Optimization**

### **Database Optimization**
- **Indexing** on frequently queried fields
- **Pagination** for large notification lists
- **Cleanup** of old notifications
- **Caching** for frequently accessed data

### **Real-time Updates**
- **WebSocket connections** for live updates
- **Server-Sent Events** for notification streams
- **Optimistic updates** for better UX
- **Batch updates** to reduce API calls

---

**Need help with notifications?** Check our [Troubleshooting Guide](../troubleshooting/common-issues.md) or [open an issue](https://github.com/yourusername/foundrly/issues).
