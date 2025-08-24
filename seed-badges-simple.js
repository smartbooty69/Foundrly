import { createClient } from '@sanity/client';

// Hardcoded Sanity configuration (you can add the token manually later)
const client = createClient({
  projectId: 'qqctr0oj', // Replace with your actual project ID
  dataset: 'production',
  token: 'skJlkCiE6zON4Z5lJ1dWyTHIGOgwmL8KbAZdKrbroH3AklWJ7OOT8X9qaCkHlndAi7DmRArBYmZZFhIcyEoynkPGuvFOWqkhfMp5HLj8uZZL5AptRIsrBnEXYlpX16KMxCprMl7xouFPrhDVN7DmVpfDjjG081hNhArBBJyS1fvEuaaKN6c2', // Add your token here manually
  apiVersion: '2025-01-02',
  useCdn: false,
});

const badges = [
  // Creator Badges - Standardized Tier Progression
  {
    name: "First Pitch",
    description: "Submit your first startup pitch to the community",
    category: "creator",
    icon: "🚀",
    color: "#10B981",
    rarity: "common",
    tier: "bronze",
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
    tier: "silver",
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
    tier: "gold",
    criteria: {
      type: "count",
      target: 10,
      metric: "startups_created",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Startup Visionary",
    description: "Submit 25 startup pitches to the community",
    category: "creator",
    icon: "🌟",
    color: "#F59E0B",
    rarity: "epic",
    tier: "platinum",
    criteria: {
      type: "count",
      target: 25,
      metric: "startups_created",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Founder Legend",
    description: "Submit 50 startup pitches to the community",
    category: "creator",
    icon: "💎",
    color: "#EF4444",
    rarity: "legendary",
    tier: "diamond",
    criteria: {
      type: "count",
      target: 50,
      metric: "startups_created",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Community Badges - Standardized Tier Progression
  {
    name: "First Comment",
    description: "Leave your first comment on a startup pitch",
    category: "community",
    icon: "💬",
    color: "#10B981",
    rarity: "common",
    tier: "bronze",
    criteria: {
      type: "count",
      target: 1,
      metric: "comments_posted",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Engagement Starter",
    description: "Comment on 10 different startup pitches",
    category: "community",
    icon: "💡",
    color: "#3B82F6",
    rarity: "uncommon",
    tier: "silver",
    criteria: {
      type: "count",
      target: 10,
      metric: "comments_posted",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Discussion Leader",
    description: "Comment on 50 different startup pitches",
    category: "community",
    icon: "🎯",
    color: "#8B5CF6",
    rarity: "rare",
    tier: "gold",
    criteria: {
      type: "count",
      target: 50,
      metric: "comments_posted",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Community Champion",
    description: "Comment on 200 different startup pitches",
    category: "community",
    icon: "🏆",
    color: "#F59E0B",
    rarity: "epic",
    tier: "platinum",
    criteria: {
      type: "count",
      target: 200,
      metric: "comments_posted",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Comment Master",
    description: "Comment on 500 different startup pitches",
    category: "community",
    icon: "🎭",
    color: "#EF4444",
    rarity: "legendary",
    tier: "diamond",
    criteria: {
      type: "count",
      target: 500,
      metric: "comments_posted",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Social Badges - Standardized Tier Progression
  {
    name: "First Follower",
    description: "Get your first follower on the platform",
    category: "social",
    icon: "👥",
    color: "#10B981",
    rarity: "common",
    tier: "bronze",
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
    tier: "silver",
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
    description: "Reach 50 followers on the platform",
    category: "social",
    icon: "⭐",
    color: "#8B5CF6",
    rarity: "rare",
    tier: "gold",
    criteria: {
      type: "count",
      target: 50,
      metric: "followers_gained",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Social Media Star",
    description: "Reach 200 followers on the platform",
    category: "social",
    icon: "🌟",
    color: "#F59E0B",
    rarity: "epic",
    tier: "platinum",
    criteria: {
      type: "count",
      target: 200,
      metric: "followers_gained",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Platform Celebrity",
    description: "Reach 1000 followers on the platform",
    category: "social",
    icon: "👑",
    color: "#EF4444",
    rarity: "legendary",
    tier: "diamond",
    criteria: {
      type: "count",
      target: 1000,
      metric: "followers_gained",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Network Badges - Standardized Tier Progression
  {
    name: "First Connection",
    description: "Follow your first user on the platform",
    category: "social",
    icon: "🤝",
    color: "#10B981",
    rarity: "common",
    tier: "bronze",
    criteria: {
      type: "count",
      target: 1,
      metric: "users_followed",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Network Builder",
    description: "Follow 10 other users on the platform",
    category: "social",
    icon: "🌐",
    color: "#3B82F6",
    rarity: "uncommon",
    tier: "silver",
    criteria: {
      type: "count",
      target: 10,
      metric: "users_followed",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Connection Master",
    description: "Follow 50 other users on the platform",
    category: "social",
    icon: "🔗",
    color: "#8B5CF6",
    rarity: "rare",
    tier: "gold",
    criteria: {
      type: "count",
      target: 50,
      metric: "users_followed",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Network Architect",
    description: "Follow 200 other users on the platform",
    category: "social",
    icon: "🏗️",
    color: "#F59E0B",
    rarity: "epic",
    tier: "platinum",
    criteria: {
      type: "count",
      target: 200,
      metric: "users_followed",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Network Legend",
    description: "Follow 500 other users on the platform",
    category: "social",
    icon: "🌍",
    color: "#EF4444",
    rarity: "legendary",
    tier: "diamond",
    criteria: {
      type: "count",
      target: 500,
      metric: "users_followed",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Engagement Badges - Standardized Tier Progression
  {
    name: "First Like",
    description: "Receive your first like on your content",
    category: "community",
    icon: "👍",
    color: "#10B981",
    rarity: "common",
    tier: "bronze",
    criteria: {
      type: "count",
      target: 1,
      metric: "likes_received",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Helpful Hand",
    description: "Receive 10 likes on your content",
    category: "community",
    icon: "🤝",
    color: "#3B82F6",
    rarity: "uncommon",
    tier: "silver",
    criteria: {
      type: "count",
      target: 10,
      metric: "likes_received",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Quality Contributor",
    description: "Receive 50 likes on your content",
    category: "community",
    icon: "🏆",
    color: "#8B5CF6",
    rarity: "rare",
    tier: "gold",
    criteria: {
      type: "count",
      target: 50,
      metric: "likes_received",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Elite Contributor",
    description: "Receive 200 likes on your content",
    category: "community",
    icon: "💎",
    color: "#F59E0B",
    rarity: "epic",
    tier: "platinum",
    criteria: {
      type: "count",
      target: 200,
      metric: "likes_received",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Content Legend",
    description: "Receive 1000 likes on your content",
    category: "community",
    icon: "👑",
    color: "#EF4444",
    rarity: "legendary",
    tier: "diamond",
    criteria: {
      type: "count",
      target: 1000,
      metric: "likes_received",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Achievement Badges - Special Milestones
  {
    name: "Early Adopter",
    description: "Join the platform within the first 30 days",
    category: "achievement",
    icon: "🌱",
    color: "#10B981",
    rarity: "rare",
    tier: "gold",
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
    tier: "silver",
    criteria: {
      type: "streak",
      target: 4,
      metric: "startups_created",
      timeframe: "weekly"
    },
    isActive: true
  },
  {
    name: "Dedicated Creator",
    description: "Post weekly for 12 consecutive weeks",
    category: "achievement",
    icon: "📊",
    color: "#8B5CF6",
    rarity: "rare",
    tier: "gold",
    criteria: {
      type: "streak",
      target: 12,
      metric: "startups_created",
      timeframe: "weekly"
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
    tier: "gold",
    criteria: {
      type: "count",
      target: 90,
      metric: "days_active",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Platform Veteran",
    description: "Be an active member for 365+ days",
    category: "achievement",
    icon: "👑",
    color: "#EF4444",
    rarity: "legendary",
    tier: "diamond",
    criteria: {
      type: "count",
      target: 365,
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
    tier: "silver",
    criteria: {
      type: "count",
      target: 5,
      metric: "reports_submitted",
      timeframe: "all_time"
    },
    isActive: true
  },

  // Special Event Badges - Time-based
  {
    name: "Weekend Warrior",
    description: "Post a startup pitch on a weekend",
    category: "special",
    icon: "🌅",
    color: "#10B981",
    rarity: "common",
    tier: "bronze",
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
    tier: "silver",
    criteria: {
      type: "date",
      target: 1,
      metric: "startups_created",
      timeframe: "daily"
    },
    isActive: true
  },
  {
    name: "Early Bird",
    description: "Post a startup pitch between 5 AM - 9 AM",
    category: "special",
    icon: "🌅",
    color: "#8B5CF6",
    rarity: "rare",
    tier: "gold",
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
  console.log('📝 Make sure to add your SANITY_WRITE_TOKEN to the script before running!');
  
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
      
      console.log(`🎖️ Created badge: ${badge.name} (${badge.rarity} - ${badge.tier})`);
    }
    
    console.log('🎉 Badge seeding completed successfully!');
    console.log(`📊 Total badges created: ${badges.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    console.log('💡 Make sure you have added your SANITY_WRITE_TOKEN to the script!');
  }
}

// Run the seeding
seedBadges();
