# 🏆 Badge System

The Foundrly Badge System is a comprehensive gamification solution that rewards users for their engagement, creativity, and community participation. It automatically tracks user actions and awards badges based on predefined criteria, creating a fun and engaging experience that encourages continued platform usage.

## 🎯 **Overview**

### **What is the Badge System?**
The badge system is a gamification layer that recognizes user achievements and encourages engagement through:
- **Automatic tracking** of user actions and milestones
- **Visual rewards** with colorful badges and progress indicators
- **Social recognition** through leaderboards and profile displays
- **Progressive challenges** that keep users engaged over time

### **Key Benefits**
- **Increased Engagement** - Users are motivated to participate more actively
- **Community Building** - Badges create a sense of achievement and belonging
- **User Retention** - Progressive challenges keep users coming back
- **Content Quality** - Rewards encourage thoughtful contributions

## 🏅 **Badge Categories**

### **🎨 Creator Badges**
Reward users for creating and sharing startup content.

| Badge | Description | Criteria | Rarity |
|-------|-------------|----------|--------|
| **First Pitch** | Created your first startup pitch | 1 startup created | Common |
| **Serial Creator** | Created 10 startup pitches | 10 startups created | Uncommon |
| **Pitch Master** | Created 50 startup pitches | 50 startups created | Rare |
| **Innovation Leader** | Created 100 startup pitches | 100 startups created | Epic |
| **Startup Legend** | Created 500 startup pitches | 500 startups created | Legendary |

### **💬 Community Badges**
Recognize users for their engagement in discussions and comments.

| Badge | Description | Criteria | Rarity |
|-------|-------------|----------|--------|
| **First Comment** | Left your first comment | 1 comment posted | Common |
| **Active Commenter** | Posted 25 comments | 25 comments posted | Uncommon |
| **Discussion Leader** | Posted 100 comments | 100 comments posted | Rare |
| **Community Pillar** | Posted 500 comments | 500 comments posted | Epic |
| **Voice of the Community** | Posted 1000 comments | 1000 comments posted | Legendary |

### **❤️ Engagement Badges**
Celebrate users who actively engage with content through likes and interactions.

| Badge | Description | Criteria | Rarity |
|-------|-------------|----------|--------|
| **First Like** | Liked your first startup | 1 like given | Common |
| **Supportive User** | Liked 50 startups | 50 likes given | Uncommon |
| **Engagement Expert** | Liked 200 startups | 200 likes given | Rare |
| **Community Supporter** | Liked 500 startups | 500 likes given | Epic |
| **Ultimate Supporter** | Liked 1000 startups | 1000 likes given | Legendary |

### **👥 Social Badges**
Reward users for building connections and following others.

| Badge | Description | Criteria | Rarity |
|-------|-------------|----------|--------|
| **First Follow** | Followed your first user | 1 user followed | Common |
| **Network Builder** | Followed 25 users | 25 users followed | Uncommon |
| **Social Butterfly** | Followed 100 users | 100 users followed | Rare |
| **Community Connector** | Followed 250 users | 250 users followed | Epic |
| **Network Master** | Followed 500 users | 500 users followed | Legendary |

### **🏆 Achievement Badges**
Honor long-term participation and special milestones.

| Badge | Description | Criteria | Rarity |
|-------|-------------|----------|--------|
| **Week Warrior** | Used the platform for 7 consecutive days | 7 days active | Common |
| **Month Master** | Used the platform for 30 consecutive days | 30 days active | Uncommon |
| **Quarter Champion** | Used the platform for 90 consecutive days | 90 days active | Rare |
| **Year Veteran** | Used the platform for 365 consecutive days | 365 days active | Epic |
| **Foundrly Legend** | Used the platform for 1000 consecutive days | 1000 days active | Legendary |

### **⭐ Special Event Badges**
Reward unique timing and special actions.

| Badge | Description | Criteria | Rarity |
|-------|-------------|----------|--------|
| **Early Adopter** | Joined during the beta phase | Joined before launch | Rare |
| **First Day** | Joined on the official launch day | Joined on launch date | Uncommon |
| **Holiday Helper** | Active during major holidays | Active on holidays | Common |
| **Weekend Warrior** | Most active on weekends | Weekend activity | Common |

## 🎨 **Rarity System**

### **Rarity Levels**
Each badge has a rarity level that indicates how difficult it is to earn:

| Rarity | Color | Description | Drop Rate |
|--------|-------|-------------|-----------|
| **Common** | 🟢 Green | Easy to achieve, basic milestones | 90% of users |
| **Uncommon** | 🔵 Blue | Moderate difficulty, regular engagement | 60% of users |
| **Rare** | 🟣 Purple | Challenging goals, dedicated users | 30% of users |
| **Epic** | 🔴 Red | Significant achievements, power users | 10% of users |
| **Legendary** | 🟣 Purple | Exceptional accomplishments, platform legends | 1% of users |

### **Visual Design**
- **Color-coded borders** based on rarity
- **Animated effects** for rare and epic badges
- **Progress indicators** showing completion percentage
- **Hover effects** with detailed information

## 📊 **Progress Tracking**

### **Real-time Monitoring**
The badge system automatically tracks:
- **User actions** (likes, comments, follows, etc.)
- **Content creation** (startup pitches, comments)
- **Engagement metrics** (views, interactions)
- **Time-based achievements** (consecutive days, milestones)

### **Progress Visualization**
- **Progress bars** showing completion percentage
- **Milestone indicators** for upcoming achievements
- **Real-time updates** as users perform actions
- **Detailed breakdowns** of what's needed to earn badges

### **Example Progress Display**
```
🏆 Pitch Master (Rare)
┌─────────────────────────────────────┐
│ ████████████████████████░░░░░░░░░░  │ 75%
│ 37/50 startups created              │
└─────────────────────────────────────┘
```

## 🏗️ **Technical Implementation**

### **Database Schema**

#### **Badge Schema** (`sanity/schemaTypes/badge.ts`)
```typescript
interface Badge {
  _id: string;
  name: string;
  description: string;
  category: 'creator' | 'community' | 'engagement' | 'social' | 'achievement' | 'special';
  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  criteria: BadgeCriteria;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BadgeCriteria {
  type: 'count' | 'consecutive' | 'date' | 'special';
  target: number;
  action: string;
  timeframe?: string;
  conditions?: BadgeCondition[];
}
```

#### **User Badge Schema** (`sanity/schemaTypes/userBadge.ts`)
```typescript
interface UserBadge {
  _id: string;
  user: User;
  badge: Badge;
  earnedAt: string;
  progress?: BadgeProgress;
  metadata?: BadgeMetadata;
}

interface BadgeProgress {
  current: number;
  target: number;
  percentage: number;
  lastUpdated: string;
}
```

### **Core System** (`lib/badge-system.ts`)

#### **BadgeSystem Class**
```typescript
class BadgeSystem {
  // Singleton pattern for badge management
  private static instance: BadgeSystem;
  
  // Check and award badges for user actions
  async checkAndAwardBadges(
    userId: string, 
    action: string, 
    metadata?: any
  ): Promise<Badge[]>;
  
  // Calculate progress for all user badges
  async calculateProgress(userId: string): Promise<BadgeProgress[]>;
  
  // Get user's earned badges
  async getUserBadges(userId: string): Promise<UserBadge[]>;
}
```

### **Integration Points**

#### **API Routes**
```typescript
// app/api/badges/recalculate/route.ts
export async function POST(request: Request) {
  const { userId } = await request.json();
  const newBadges = await badgeSystem.recalculateBadges(userId);
  return Response.json({ newBadges });
}
```

#### **Server Actions**
```typescript
// lib/actions.ts
export async function checkBadges(userId: string, action: string) {
  const newBadges = await badgeSystem.checkAndAwardBadges(userId, action);
  if (newBadges.length > 0) {
    // Create notifications for new badges
    await createBadgeNotifications(userId, newBadges);
  }
  return newBadges;
}
```

## 🎮 **User Interface Components**

### **BadgeDisplay Component**
```typescript
// components/BadgeDisplay.tsx
interface BadgeDisplayProps {
  badges: UserBadge[];
  displayMode: 'grid' | 'list' | 'compact';
  showProgress?: boolean;
  maxDisplay?: number;
}

// Usage examples:
<BadgeDisplay badges={userBadges} displayMode="grid" showProgress={true} />
<BadgeDisplay badges={userBadges} displayMode="compact" maxDisplay={5} />
```

### **BadgeNotification Component**
```typescript
// components/BadgeNotification.tsx
interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

// Animated notification when user earns a badge
<BadgeNotification badge={earnedBadge} onClose={handleClose} />
```

### **Leaderboard Component**
```typescript
// components/Leaderboard.tsx
interface LeaderboardProps {
  category: 'badges' | 'startups' | 'engagement';
  timeframe: 'week' | 'month' | 'all-time';
  limit: number;
}

// Display top users in different categories
<Leaderboard category="badges" timeframe="month" limit={10} />
```

## 🔧 **Configuration & Customization**

### **Adding New Badges**
1. **Create Badge Schema** in Sanity Studio
2. **Define Criteria** for earning the badge
3. **Add Integration** in relevant API routes
4. **Test Badge Logic** with sample users

### **Customizing Criteria**
```typescript
// Example: Custom badge criteria
const customCriteria: BadgeCriteria = {
  type: 'count',
  target: 100,
  action: 'startups_liked',
  timeframe: '30d', // Last 30 days
  conditions: [
    { field: 'startup.category', value: 'technology' }
  ]
};
```

### **Badge Seeding**
```bash
# Run the badge seeding script
npm run badges:seed

# This creates all predefined badges in your Sanity project
```

## 📈 **Analytics & Insights**

### **Badge Analytics**
- **Earning rates** for each badge
- **User engagement** correlation with badges
- **Retention impact** of gamification
- **Popular badges** and user preferences

### **Performance Metrics**
- **Badge calculation** performance
- **Database query** optimization
- **Real-time update** latency
- **User experience** impact

## 🚀 **Future Enhancements**

### **Planned Features**
- **Seasonal badges** for special events
- **Team badges** for collaborative achievements
- **Badge trading** between users
- **Custom badge creation** for admins
- **Badge challenges** with time limits

### **Advanced Gamification**
- **Experience points** system
- **Level progression** based on badges
- **Achievement streaks** and multipliers
- **Social features** like badge sharing

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Badges Not Awarding**
- Check that the badge system is properly integrated
- Verify user actions are being tracked
- Ensure badge criteria are correctly configured
- Check for any API errors in the console

#### **Progress Not Updating**
- Verify real-time updates are enabled
- Check that progress calculations are running
- Ensure user data is being properly synced
- Look for any caching issues

#### **Performance Issues**
- Optimize badge calculation queries
- Implement caching for frequently accessed data
- Consider batch processing for large user bases
- Monitor database performance

### **Debug Tools**
```typescript
// Debug badge system
await badgeSystem.debugUser(userId);

// Force recalculate all badges
await badgeSystem.recalculateAllBadges();

// Check specific badge progress
await badgeSystem.checkBadgeProgress(userId, badgeId);
```

---

**Need help with badges?** Check our [Troubleshooting Guide](../troubleshooting/common-issues.md) or [open an issue](https://github.com/yourusername/foundrly/issues).
