import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const badges = [
  // Creator Badges
  {
    name: "First Pitch",
    description: "Submit your first startup pitch to the community",
    category: "creator",
    icon: "🚀",
    color: "#10B981",
    rarity: "common",
    criteria: {
      type: "count",
      target: 1,
      metric: "startups_created",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Serial Entrepreneur",
    description: "Submit 5 startup pitches to the community",
    category: "creator",
    icon: "💼",
    color: "#3B82F6",
    rarity: "uncommon",
    criteria: {
      type: "count",
      target: 5,
      metric: "startups_created",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Pitch Master",
    description: "Submit 10 startup pitches to the community",
    category: "creator",
    icon: "👑",
    color: "#8B5CF6",
    rarity: "rare",
    criteria: {
      type: "count",
      target: 10,
      metric: "startups_created",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Trendsetter",
    description: "Get 100+ views on one of your startup pitches",
    category: "creator",
    icon: "📈",
    color: "#F59E0B",
    rarity: "uncommon",
    criteria: {
      type: "count",
      target: 100,
      metric: "views_received",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Viral Sensation",
    description: "Get 1000+ views on one of your startup pitches",
    category: "creator",
    icon: "🔥",
    color: "#EF4444",
    rarity: "epic",
    criteria: {
      type: "count",
      target: 1000,
      metric: "views_received",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Community Badges
  {
    name: "First Comment",
    description: "Leave your first comment on a startup pitch",
    category: "community",
    icon: "💬",
    color: "#10B981",
    rarity: "common",
    criteria: {
      type: "count",
      target: 1,
      metric: "comments_posted",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Helpful Hand",
    description: "Get 10+ likes on your comments",
    category: "community",
    icon: "👍",
    color: "#3B82F6",
    rarity: "uncommon",
    criteria: {
      type: "count",
      target: 10,
      metric: "likes_received",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Discussion Leader",
    description: "Get 50+ likes on your comments",
    category: "community",
    icon: "🎯",
    color: "#8B5CF6",
    rarity: "rare",
    criteria: {
      type: "count",
      target: 50,
      metric: "likes_received",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Engagement Pro",
    description: "Comment on 20+ different startup pitches",
    category: "community",
    icon: "💡",
    color: "#F59E0B",
    rarity: "uncommon",
    criteria: {
      type: "count",
      target: 20,
      metric: "comments_posted",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Social Badges
  {
    name: "First Follower",
    description: "Get your first follower on the platform",
    category: "social",
    icon: "👥",
    color: "#10B981",
    rarity: "common",
    criteria: {
      type: "count",
      target: 1,
      metric: "followers_gained",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Social Butterfly",
    description: "Reach 10 followers on the platform",
    category: "social",
    icon: "🦋",
    color: "#3B82F6",
    rarity: "uncommon",
    criteria: {
      type: "count",
      target: 10,
      metric: "followers_gained",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Influencer",
    description: "Reach 100 followers on the platform",
    category: "social",
    icon: "⭐",
    color: "#8B5CF6",
    rarity: "rare",
    criteria: {
      type: "count",
      target: 100,
      metric: "followers_gained",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Network Builder",
    description: "Follow 50+ other users on the platform",
    category: "social",
    icon: "🌐",
    color: "#F59E0B",
    rarity: "uncommon",
    criteria: {
      type: "count",
      target: 50,
      metric: "users_followed",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Achievement Badges
  {
    name: "Early Adopter",
    description: "Join the platform within the first 30 days",
    category: "achievement",
    icon: "🌱",
    color: "#10B981",
    rarity: "rare",
    criteria: {
      type: "date",
      target: 30,
      metric: "days_active",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Consistent Creator",
    description: "Post weekly for 4 consecutive weeks",
    category: "achievement",
    icon: "📅",
    color: "#3B82F6",
    rarity: "uncommon",
    criteria: {
      type: "streak",
      target: 4,
      metric: "startups_created",
      timeframe: "weekly"
    },
    isActive: true
  },
  {
    name: "Quality Contributor",
    description: "Get 100+ total likes across all your content",
    category: "achievement",
    icon: "🏆",
    color: "#8B5CF6",
    rarity: "rare",
    criteria: {
      type: "count",
      target: 100,
      metric: "likes_received",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Community Pillar",
    description: "Be an active member for 90+ days",
    category: "achievement",
    icon: "🏛️",
    color: "#F59E0B",
    rarity: "rare",
    criteria: {
      type: "count",
      target: 90,
      metric: "days_active",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Moderation Helper",
    description: "Submit 5+ reports to help keep the community safe",
    category: "achievement",
    icon: "🛡️",
    color: "#EF4444",
    rarity: "uncommon",
    criteria: {
      type: "count",
      target: 5,
      metric: "reports_submitted",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Special Event Badges
  {
    name: "Weekend Warrior",
    description: "Post a startup pitch on a weekend",
    category: "special",
    icon: "🌅",
    color: "#10B981",
    rarity: "common",
    criteria: {
      type: "date",
      target: 1,
      metric: "startups_created",
      timeframe: "daily"
    },
    isActive: true
  },
  {
    name: "Night Owl",
    description: "Post a startup pitch between 10 PM - 6 AM",
    category: "special",
    icon: "🦉",
    color: "#3B82F6",
    rarity: "uncommon",
    criteria: {
      type: "date",
      target: 1,
      metric: "startups_created",
      timeframe: "daily"
    },
    isActive: true
  }
];

async function seedBadges() {
  console.log('🌱 Starting badge seeding...');
  
  try {
    for (const badge of badges) {
      // Check if badge already exists
      const existingBadge = await client.fetch(`
        *[_type == "badge" && name == $name][0]
      `, { name: badge.name });
      
      if (existingBadge) {
        console.log(`✅ Badge "${badge.name}" already exists, skipping...`);
        continue;
      }
      
      // Create new badge
      const newBadge = await client.create({
        _type: 'badge',
        ...badge
      });
      
      console.log(`🎖️ Created badge: ${badge.name} (${badge.rarity})`);
    }
    
    console.log('🎉 Badge seeding completed successfully!');
    console.log(`📊 Total badges created: ${badges.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
  }
}

// Run the seeding
seedBadges();
