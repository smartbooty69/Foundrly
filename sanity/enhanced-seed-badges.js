import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const enhancedBadges = [
  // 🚀 CREATOR BADGES - Advanced Criteria
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
    color: "#059669",
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
    icon: "🎯",
    color: "#2563EB",
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
    description: "Get 100+ views on a startup",
    category: "creator",
    icon: "🔥",
    color: "#7C3AED",
    rarity: "epic",
    criteria: {
      type: "count",
      target: 100,
      metric: "views_received",
      timeframe: "rolling_30d"
    },
    isActive: true
  },
  {
    name: "Viral Sensation",
    description: "Get 1000+ views on a startup",
    category: "creator",
    icon: "⚡",
    color: "#DC2626",
    rarity: "legendary",
    criteria: {
      type: "count",
      target: 1000,
      metric: "views_received",
      timeframe: "rolling_30d"
    },
    isActive: true
  },
  {
    name: "Category Pioneer",
    description: "Be the first to post in a new category",
    category: "creator",
    icon: "🌟",
    color: "#FFD700",
    rarity: "mythical",
    criteria: {
      type: "special",
      target: 1,
      metric: "first_mover_actions",
      timeframe: "all_time"
    },
    isActive: true
  },

  // 💬 COMMUNITY BADGES - Streak & Quality Based
  {
    name: "First Comment",
    description: "Leave your first comment on a startup",
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
    description: "Get 10+ likes on comments",
    category: "community",
    icon: "👍",
    color: "#059669",
    rarity: "uncommon",
    criteria: {
      type: "count",
      target: 10,
      metric: "likes_received",
      timeframe: "rolling_30d"
    },
    isActive: true
  },
  {
    name: "Comment Champion",
    description: "Post 50+ comments",
    category: "community",
    icon: "🏆",
    color: "#2563EB",
    rarity: "rare",
    criteria: {
      type: "count",
      target: 50,
      metric: "comments_posted",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Daily Commenter",
    description: "Comment for 7 consecutive days",
    category: "community",
    icon: "📅",
    color: "#7C3AED",
    rarity: "epic",
    criteria: {
      type: "streak",
      target: 7,
      metric: "comments_posted",
      timeframe: "daily"
    },
    isActive: true
  },
  {
    name: "Quality Contributor",
    description: "Achieve a content quality score of 80+",
    category: "community",
    icon: "💎",
    color: "#DC2626",
    rarity: "legendary",
    criteria: {
      type: "quality",
      target: 80,
      metric: "content_quality_score",
      timeframe: "rolling_30d"
    },
    isActive: true
  },

  // 🦋 SOCIAL BADGES - Combination & Time Based
  {
    name: "First Follower",
    description: "Follow your first user",
    category: "social",
    icon: "🦋",
    color: "#10B981",
    rarity: "common",
    criteria: {
      type: "count",
      target: 1,
      metric: "users_followed",
      timeframe: "all_time"
    },
    isActive: true
  },
  {
    name: "Social Butterfly",
    description: "Follow 25 users and gain 25 followers",
    category: "social",
    icon: "🦋",
    color: "#059669",
    rarity: "uncommon",
    criteria: {
      type: "combination",
      target: 1,
      metric: "social_network",
      timeframe: "all_time",
      requirements: [
        { metric: "users_followed", target: 25, timeframe: "all_time", operator: "AND" },
        { metric: "followers_gained", target: 25, timeframe: "all_time", operator: "AND" }
      ]
    },
    isActive: true
  },
  {
    name: "Network Builder",
    description: "Gain 100 followers",
    category: "social",
    icon: "🌐",
    color: "#2563EB",
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
    name: "Weekly Active",
    description: "Be active for 4 consecutive weeks",
    category: "social",
    icon: "📊",
    color: "#7C3AED",
    rarity: "epic",
    criteria: {
      type: "streak",
      target: 4,
      metric: "weekly_activity",
      timeframe: "weekly"
    },
    isActive: true
  },
  {
    name: "Influencer",
    description: "Gain 500+ followers",
    category: "social",
    icon: "👑",
    color: "#DC2626",
    rarity: "legendary",
    criteria: {
      type: "count",
      target: 500,
      metric: "followers_gained",
      timeframe: "all_time"
    },
    isActive: true
  },

  // 🏆 ACHIEVEMENT BADGES - Time & Quality Based
  {
    name: "Early Bird",
    description: "Join the platform in its first month",
    category: "achievement",
    icon: "🌅",
    color: "#10B981",
    rarity: "common",
    criteria: {
      type: "date",
      target: 1,
      metric: "early_join",
      timeframe: "special"
    },
    isActive: true
  },
  {
    name: "Loyal Member",
    description: "Be active for 365 consecutive days",
    category: "achievement",
    icon: "🎖️",
    color: "#059669",
    rarity: "uncommon",
    criteria: {
      type: "streak",
      target: 365,
      metric: "days_active",
      timeframe: "daily"
    },
    isActive: true
  },
  {
    name: "Innovation Leader",
    description: "Achieve an innovation index of 100+",
    category: "achievement",
    icon: "💡",
    color: "#2563EB",
    rarity: "rare",
    criteria: {
      type: "quality",
      target: 100,
      metric: "innovation_index",
      timeframe: "rolling_30d"
    },
    isActive: true
  },
  {
    name: "Peak Performer",
    description: "Be most active during peak hours for a month",
    category: "achievement",
    icon: "⏰",
    color: "#7C3AED",
    rarity: "epic",
    criteria: {
      type: "time",
      target: 1,
      metric: "peak_activity_hours",
      timeframe: "calendar_month"
    },
    isActive: true
  },
  {
    name: "Collaboration Master",
    description: "Participate in 50+ collaboration projects",
    category: "achievement",
    icon: "🤝",
    color: "#DC2626",
    rarity: "legendary",
    criteria: {
      type: "count",
      target: 50,
      metric: "collaboration_projects",
      timeframe: "all_time"
    },
    isActive: true
  },

  // ⭐ SPECIAL EVENT BADGES - Seasonal & Event Based
  {
    name: "Spring Creator",
    description: "Create content during spring season",
    category: "special",
    icon: "🌸",
    color: "#10B981",
    rarity: "uncommon",
    criteria: {
      type: "date",
      target: 1,
      metric: "seasonal_content",
      timeframe: "seasonal"
    },
    isActive: true
  },
  {
    name: "Summer Innovator",
    description: "Launch a startup during summer",
    category: "special",
    icon: "☀️",
    color: "#059669",
    rarity: "uncommon",
    criteria: {
      type: "date",
      target: 1,
      metric: "seasonal_startup",
      timeframe: "seasonal"
    },
    isActive: true
  },
  {
    name: "Fall Networker",
    description: "Gain 50 followers during fall",
    category: "special",
    icon: "🍂",
    color: "#2563EB",
    rarity: "rare",
    criteria: {
      type: "count",
      target: 50,
      metric: "followers_gained",
      timeframe: "seasonal"
    },
    isActive: true
  },
  {
    name: "Winter Warrior",
    description: "Maintain activity during winter months",
    category: "special",
    icon: "❄️",
    color: "#7C3AED",
    rarity: "epic",
    criteria: {
      type: "streak",
      target: 90,
      metric: "days_active",
      timeframe: "seasonal"
    },
    isActive: true
  },
  {
    name: "Year-End Champion",
    description: "Complete all monthly challenges in a year",
    category: "special",
    icon: "🎊",
    color: "#FFD700",
    rarity: "mythical",
    criteria: {
      type: "combination",
      target: 12,
      metric: "monthly_challenges",
      timeframe: "yearly",
      requirements: [
        { metric: "january_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "february_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "march_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "april_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "may_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "june_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "july_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "august_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "september_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "october_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "november_challenge", target: 1, timeframe: "calendar_month", operator: "AND" },
        { metric: "december_challenge", target: 1, timeframe: "calendar_month", operator: "AND" }
      ]
    },
    isActive: true
  },

  // 🎯 ADVANCED CRITERIA BADGES
  {
    name: "Multi-Talented",
    description: "Earn badges in all 5 categories",
    category: "achievement",
    icon: "🎭",
    color: "#DC2626",
    rarity: "legendary",
    criteria: {
      type: "combination",
      target: 5,
      metric: "category_coverage",
      timeframe: "all_time",
      requirements: [
        { metric: "creator_badges", target: 1, timeframe: "all_time", operator: "AND" },
        { metric: "community_badges", target: 1, timeframe: "all_time", operator: "AND" },
        { metric: "social_badges", target: 1, timeframe: "all_time", operator: "AND" },
        { metric: "achievement_badges", target: 1, timeframe: "all_time", operator: "AND" },
        { metric: "special_badges", target: 1, timeframe: "all_time", operator: "AND" }
      ]
    },
    isActive: true
  },
  {
    name: "Rarity Collector",
    description: "Earn at least one badge of each rarity level",
    category: "achievement",
    icon: "💎",
    color: "#FFD700",
    rarity: "mythical",
    criteria: {
      type: "combination",
      target: 6,
      metric: "rarity_coverage",
      timeframe: "all_time",
      requirements: [
        { metric: "common_badges", target: 1, timeframe: "all_time", operator: "AND" },
        { metric: "uncommon_badges", target: 1, timeframe: "all_time", operator: "AND" },
        { metric: "rare_badges", target: 1, timeframe: "all_time", operator: "AND" },
        { metric: "epic_badges", target: 1, timeframe: "all_time", operator: "AND" },
        { metric: "legendary_badges", target: 1, timeframe: "all_time", operator: "AND" },
        { metric: "mythical_badges", target: 1, timeframe: "all_time", operator: "AND" }
      ]
    },
    isActive: true
  },
  {
    name: "Speed Demon",
    description: "Earn 5 badges in a single day",
    category: "special",
    icon: "⚡",
    color: "#7C3AED",
    rarity: "epic",
    criteria: {
      type: "count",
      target: 5,
      metric: "badges_earned",
      timeframe: "rolling_24h"
    },
    isActive: true
  },
  {
    name: "Consistency King",
    description: "Earn at least one badge every week for 3 months",
    category: "achievement",
    icon: "👑",
    color: "#DC2626",
    rarity: "legendary",
    criteria: {
      type: "streak",
      target: 12,
      metric: "weekly_badges",
      timeframe: "weekly"
    },
    isActive: true
  },
  {
    name: "Ultimate Badge Hunter",
    description: "Earn 100 total badges",
    category: "achievement",
    icon: "🏆",
    color: "#FFD700",
    rarity: "mythical",
    criteria: {
      type: "count",
      target: 100,
      metric: "total_badges",
      timeframe: "all_time"
    },
    isActive: true
  }
];

async function seedEnhancedBadges() {
  console.log('🌱 Starting enhanced badge seeding...');
  
  try {
    // Check if badges already exist
    const existingBadges = await client.fetch('count(*[_type == "badge"])');
    
    if (existingBadges > 0) {
      console.log(`⚠️  ${existingBadges} badges already exist. Skipping seeding.`);
      return;
    }

    // Create badges
    const createdBadges = [];
    
    for (const badge of enhancedBadges) {
      try {
        const createdBadge = await client.create({
          _type: 'badge',
          ...badge
        });
        
        createdBadges.push(createdBadge);
        console.log(`✅ Created badge: ${badge.name} (${badge.rarity})`);
      } catch (error) {
        console.error(`❌ Failed to create badge ${badge.name}:`, error);
      }
    }

    console.log(`🎉 Successfully created ${createdBadges.length} enhanced badges!`);
    console.log('\n📊 Badge Distribution:');
    
    // Log distribution
    const distribution = enhancedBadges.reduce((acc, badge) => {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      acc[badge.category] = (acc[badge.category] || 0) + 1;
      return acc;
    }, {} as any);
    
    console.log('Rarity Levels:', distribution);
    console.log('Categories:', distribution);
    
  } catch (error) {
    console.error('❌ Error seeding enhanced badges:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedEnhancedBadges()
    .then(() => {
      console.log('🎯 Enhanced badge seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Enhanced badge seeding failed:', error);
      process.exit(1);
    });
}

export { seedEnhancedBadges, enhancedBadges };
