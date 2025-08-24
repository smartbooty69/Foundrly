import { createClient } from '@sanity/client';

const client = createClient({
  projectId: "qqctr0oj",
  dataset: "production",
  token: "skJlkCiE6zON4Z5lJ1dWyTHIGOgwmL8KbAZdKrbroH3AklWJ7OOT8X9qaCkHlndAi7DmRArBYmZZFhIcyEoynk",
  apiVersion: "2025-01-02",
  useCdn: false,
});

const USER_ID = 'LDlWZya6Yh8tzuXX8PpJMg';

// Dummy badges to award to the user
const badgesToAward = [
  {
    name: "First Pitch",
    description: "Submit your first startup pitch to the community",
    category: "creator",
    icon: "🚀",
    color: "#10B981",
    rarity: "common",
    earnedAt: "2024-01-15T10:00:00Z"
  },
  {
    name: "Serial Entrepreneur",
    description: "Submit 5 startup pitches to the community",
    category: "creator",
    icon: "💼",
    color: "#3B82F6",
    rarity: "uncommon",
    earnedAt: "2024-02-01T14:30:00Z"
  },
  {
    name: "Pitch Master",
    description: "Submit 10 startup pitches to the community",
    category: "creator",
    icon: "👑",
    color: "#8B5CF6",
    rarity: "rare",
    earnedAt: "2024-02-15T09:15:00Z"
  },
  {
    name: "Trendsetter",
    description: "Get 100+ views on one of your startup pitches",
    category: "creator",
    icon: "📈",
    color: "#F59E0B",
    rarity: "uncommon",
    earnedAt: "2024-03-01T16:45:00Z"
  },
  {
    name: "Viral Sensation",
    description: "Get 1000+ views on one of your startup pitches",
    category: "creator",
    icon: "🔥",
    color: "#EF4444",
    rarity: "epic",
    earnedAt: "2024-03-10T11:20:00Z"
  },
  {
    name: "First Comment",
    description: "Leave your first comment on a startup pitch",
    category: "community",
    icon: "💬",
    color: "#10B981",
    rarity: "common",
    earnedAt: "2024-01-20T13:10:00Z"
  },
  {
    name: "Helpful Hand",
    description: "Leave 10 helpful comments on startup pitches",
    category: "community",
    icon: "🤝",
    color: "#3B82F6",
    rarity: "uncommon",
    earnedAt: "2024-02-10T15:30:00Z"
  },
  {
    name: "Quality Contributor",
    description: "Achieve a content quality score of 80+",
    category: "community",
    icon: "💎",
    color: "#DC2626",
    rarity: "legendary",
    earnedAt: "2024-03-15T10:00:00Z"
  },
  {
    name: "Social Butterfly",
    description: "Follow 25 users and gain 25 followers",
    category: "social",
    icon: "🦋",
    color: "#3B82F6",
    rarity: "uncommon",
    earnedAt: "2024-02-20T12:00:00Z"
  },
  {
    name: "Influencer",
    description: "Gain 100+ followers",
    category: "social",
    icon: "⭐",
    color: "#8B5CF6",
    rarity: "rare",
    earnedAt: "2024-03-20T14:15:00Z"
  },
  {
    name: "Loyal Member",
    description: "Be active on the platform for 30+ days",
    category: "achievement",
    icon: "🎖️",
    color: "#10B981",
    rarity: "common",
    earnedAt: "2024-02-05T08:00:00Z"
  },
  {
    name: "Innovation Leader",
    description: "Create startups in 3+ different categories",
    category: "achievement",
    icon: "🚀",
    color: "#8B5CF6",
    rarity: "rare",
    earnedAt: "2024-03-01T10:30:00Z"
  },
  {
    name: "Multi-Talented",
    description: "Earn badges in all 5 categories",
    category: "achievement",
    icon: "🎯",
    color: "#F59E0B",
    rarity: "epic",
    earnedAt: "2024-03-25T16:00:00Z"
  },
  {
    name: "Rarity Collector",
    description: "Earn at least one badge of each rarity level",
    category: "achievement",
    icon: "💎",
    color: "#FFD700",
    rarity: "mythical",
    earnedAt: "2024-04-01T12:00:00Z"
  },
  {
    name: "Seasonal Badge - Spring",
    description: "Be active during Spring season",
    category: "special",
    icon: "🌸",
    color: "#10B981",
    rarity: "common",
    earnedAt: "2024-03-21T09:00:00Z"
  },
  {
    name: "Speed Demon",
    description: "Earn 5 badges in a single day",
    category: "special",
    icon: "⚡",
    color: "#8B5CF6",
    rarity: "epic",
    earnedAt: "2024-03-25T18:00:00Z"
  }
];

async function addUserBadges() {
  try {
    console.log(`🎯 Adding badges to user: ${USER_ID}`);
    
    // First, let's get all available badges from the database
    const availableBadges = await client.fetch(`
      *[_type == "badge" && isActive == true] {
        _id,
        name,
        description,
        category,
        icon,
        color,
        rarity,
        criteria,
        isActive
      }
    `);
    
    console.log(`📊 Found ${availableBadges.length} available badges`);
    
    // Check if user already has badges
    const existingUserBadges = await client.fetch(`
      *[_type == "userBadge" && user._ref == $userId] {
        _id,
        badge->{
          _id,
          name
        }
      }
    `, { userId: USER_ID });
    
    console.log(`🏆 User already has ${existingUserBadges.length} badges`);
    
    // Create userBadge records for each badge we want to award
    const createdBadges = [];
    
    for (const badgeInfo of badgesToAward) {
      // Find the corresponding badge in the database
      const matchingBadge = availableBadges.find(b => b.name === badgeInfo.name);
      
      if (!matchingBadge) {
        console.log(`⚠️  Badge "${badgeInfo.name}" not found in database, skipping...`);
        continue;
      }
      
      // Check if user already has this badge
      const alreadyHasBadge = existingUserBadges.some(ub => ub.badge._id === matchingBadge._id);
      
      if (alreadyHasBadge) {
        console.log(`✅ User already has badge: ${badgeInfo.name}`);
        continue;
      }
      
      // Create the userBadge record
      const userBadge = await client.create({
        _type: 'userBadge',
        user: { _ref: USER_ID, _type: 'reference' },
        badge: { _ref: matchingBadge._id, _type: 'reference' },
        earnedAt: badgeInfo.earnedAt,
        progress: {
          current: 1,
          target: 1,
          percentage: 100
        },
        metadata: {
          context: 'manual_award',
          awardedBy: 'script'
        }
      });
      
      createdBadges.push({
        name: badgeInfo.name,
        rarity: badgeInfo.rarity,
        category: badgeInfo.category,
        earnedAt: badgeInfo.earnedAt
      });
      
      console.log(`🎖️  Awarded badge: ${badgeInfo.name} (${badgeInfo.rarity})`);
    }
    
    console.log(`\n🎉 Successfully awarded ${createdBadges.length} new badges!`);
    
    if (createdBadges.length > 0) {
      console.log('\n📋 Awarded Badges:');
      createdBadges.forEach((badge, index) => {
        console.log(`${index + 1}. ${badge.name} - ${badge.rarity} (${badge.category})`);
      });
    }
    
    // Show final badge count
    const finalUserBadges = await client.fetch(`
      *[_type == "userBadge" && user._ref == $userId] {
        _id,
        badge->{
          _id,
          name,
          rarity,
          category
        },
        earnedAt
      }
    `, { userId: USER_ID });
    
    console.log(`\n🏆 User now has ${finalUserBadges.length} total badges`);
    
    // Show rarity distribution
    const rarityCounts = {};
    finalUserBadges.forEach(ub => {
      const rarity = ub.badge.rarity;
      rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1;
    });
    
    console.log('\n📊 Badge Rarity Distribution:');
    Object.entries(rarityCounts).forEach(([rarity, count]) => {
      console.log(`${rarity}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding user badges:', error);
  }
}

// Run the script
addUserBadges()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
