import { createClient } from '@sanity/client';

// Sanity configuration
const client = createClient({
  projectId: 'qqctr0oj',
  dataset: 'production',
  token: 'skJlkCiE6zON4Z5lJ1dWyTHIGOgwmL8KbAZdKrbroH3AklWJ7OOT8X9qaCkHlndAi7DmRArBYmZZFhIcyEoynkPGuvFOWqkhfMp5HLj8uZZL5AptRIsrBnEXYlpX16KMxCprMl7xouFPrhDVN7DmVpfDjjG081hNhArBBJyS1fvEuaaKN6c2',
  apiVersion: '2025-01-02',
  useCdn: false,
});

// Badge criteria mapping
const badgeCriteria = {
  // Creator Badges
  'First Pitch': { metric: 'startups_created', target: 1 },
  'Serial Entrepreneur': { metric: 'startups_created', target: 5 },
  'Pitch Master': { metric: 'startups_created', target: 10 },
  'Startup Visionary': { metric: 'startups_created', target: 25 },
  'Founder Legend': { metric: 'startups_created', target: 50 },
  
  // Community Badges
  'First Comment': { metric: 'comments_posted', target: 1 },
  'Engagement Starter': { metric: 'comments_posted', target: 10 },
  'Discussion Leader': { metric: 'comments_posted', target: 50 },
  'Community Champion': { metric: 'comments_posted', target: 200 },
  'Comment Master': { metric: 'comments_posted', target: 500 },
  
  // Social Badges
  'First Follower': { metric: 'followers_gained', target: 1 },
  'Social Butterfly': { metric: 'followers_gained', target: 10 },
  'Influencer': { metric: 'followers_gained', target: 50 },
  'Social Media Star': { metric: 'followers_gained', target: 200 },
  'Platform Celebrity': { metric: 'followers_gained', target: 1000 },
  
  // Network Badges
  'First Connection': { metric: 'users_followed', target: 1 },
  'Network Builder': { metric: 'users_followed', target: 10 },
  'Connection Master': { metric: 'users_followed', target: 50 },
  'Network Architect': { metric: 'users_followed', target: 200 },
  'Network Legend': { metric: 'users_followed', target: 500 },
  
  // Engagement Badges
  'First Like': { metric: 'likes_received', target: 1 },
  'Helpful Hand': { metric: 'likes_received', target: 10 },
  'Quality Contributor': { metric: 'likes_received', target: 50 },
  'Elite Contributor': { metric: 'likes_received', target: 200 },
  'Content Legend': { metric: 'likes_received', target: 1000 },
  
  // Achievement Badges
  'Early Adopter': { metric: 'days_active', target: 30, type: 'date' },
  'Community Pillar': { metric: 'days_active', target: 90, type: 'date' },
  'Platform Veteran': { metric: 'days_active', target: 365, type: 'date' },
  'Moderation Helper': { metric: 'reports_submitted', target: 5 },
  
  // Special Badges
  'Weekend Warrior': { metric: 'weekend_posts', target: 1, type: 'special' },
  'Night Owl': { metric: 'night_posts', target: 1, type: 'special' },
  'Early Bird': { metric: 'early_posts', target: 1, type: 'special' },
  'Consistent Creator': { metric: 'weekly_streak', target: 4, type: 'streak' },
  'Dedicated Creator': { metric: 'weekly_streak', target: 12, type: 'streak' },
};

async function getUserActivity(userId) {
  try {
    // Get user's startups with detailed info
    const startups = await client.fetch(`
      *[_type == "startup" && author._ref == $userId] {
        _id,
        _createdAt,
        title,
        views,
        likes
      }
    `, { userId });

    // Get user's comments
    const comments = await client.fetch(`
      *[_type == "comment" && author._ref == $userId] {
        _id,
        _createdAt,
        startup->{ _id, title }
      }
    `, { userId });

    // Get user's followers and following
    const user = await client.fetch(`
      *[_type == "author" && _id == $userId] {
        _id,
        name,
        username,
        _createdAt,
        followers,
        following
      }
    `, { userId });

    // Get user's reports
    const reports = await client.fetch(`
      *[_type == "report" && reporter._ref == $userId] {
        _id,
        _createdAt
      }
    `, { userId });

    // Calculate special metrics
    const weekendPosts = startups.filter(startup => {
      const date = new Date(startup._createdAt);
      const day = date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length;

    const nightPosts = startups.filter(startup => {
      const date = new Date(startup._createdAt);
      const hour = date.getHours();
      return hour >= 22 || hour <= 6; // 10 PM to 6 AM
    }).length;

    const earlyPosts = startups.filter(startup => {
      const date = new Date(startup._createdAt);
      const hour = date.getHours();
      return hour >= 5 && hour <= 9; // 5 AM to 9 AM
    }).length;

    // Calculate weekly streak (simplified - check if user posted in at least 4 different weeks)
    const weeklyStreak = calculateWeeklyStreak(startups);

    // Calculate metrics
    const metrics = {
      startups_created: startups.length,
      comments_posted: comments.length,
      followers_gained: user[0]?.followers?.length || 0,
      users_followed: user[0]?.following?.length || 0,
      likes_received: startups.reduce((sum, startup) => sum + (startup.likes || 0), 0),
      reports_submitted: reports.length,
      days_active: user[0]?._createdAt ? 
        Math.floor((new Date() - new Date(user[0]._createdAt)) / (1000 * 60 * 60 * 24)) : 0,
      weekend_posts: weekendPosts,
      night_posts: nightPosts,
      early_posts: earlyPosts,
      weekly_streak: weeklyStreak
    };

    return {
      user: user[0],
      metrics,
      startups,
      comments,
      reports
    };
  } catch (error) {
    console.error(`Error getting activity for user ${userId}:`, error);
    return null;
  }
}

function calculateWeeklyStreak(startups) {
  if (startups.length === 0) return 0;
  
  const weeks = new Set();
  startups.forEach(startup => {
    const date = new Date(startup._createdAt);
    const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`;
    weeks.add(weekKey);
  });
  
  return weeks.size;
}

async function getEligibleBadges(metrics) {
  const eligibleBadges = [];
  
  for (const [badgeName, criteria] of Object.entries(badgeCriteria)) {
    const currentValue = metrics[criteria.metric] || 0;
    
    if (currentValue >= criteria.target) {
      eligibleBadges.push({
        name: badgeName,
        criteria,
        currentValue,
        target: criteria.target
      });
    }
  }
  
  return eligibleBadges;
}

async function awardBadgeToUser(userId, badgeName, earnedAt = new Date().toISOString()) {
  try {
    // Get the badge from database
    const badge = await client.fetch(`
      *[_type == "badge" && name == $badgeName][0]
    `, { badgeName });

    if (!badge) {
      console.log(`⚠️  Badge "${badgeName}" not found in database`);
      return false;
    }

    // Check if user already has this badge
    const existingUserBadge = await client.fetch(`
      *[_type == "userBadge" && user._ref == $userId && badge._ref == $badgeId][0]
    `, { userId, badgeId: badge._id });

    if (existingUserBadge) {
      console.log(`✅ User already has badge: ${badgeName}`);
      return false;
    }

    // Create userBadge record
    const userBadge = await client.create({
      _type: 'userBadge',
      user: { _ref: userId, _type: 'reference' },
      badge: { _ref: badge._id, _type: 'reference' },
      earnedAt: earnedAt,
      progress: {
        current: badgeCriteria[badgeName].target,
        target: badgeCriteria[badgeName].target,
        percentage: 100
      },
      metadata: {
        context: 'activity_based_award',
        awardedBy: 'enhanced_seeding_script'
      }
    });

    console.log(`🎖️  Awarded badge: ${badgeName} to user`);
    return true;
  } catch (error) {
    console.error(`❌ Error awarding badge ${badgeName} to user ${userId}:`, error);
    return false;
  }
}

async function getBadgeStatistics() {
  try {
    const stats = await client.fetch(`
      {
        "totalBadges": count(*[_type == "badge"]),
        "activeBadges": count(*[_type == "badge" && isActive == true]),
        "totalUserBadges": count(*[_type == "userBadge"]),
        "usersWithBadges": count(distinct(*[_type == "userBadge"].user._ref)),
        "badgeDistribution": *[_type == "userBadge"] {
          badge->{
            name,
            rarity,
            category
          }
        }
      }
    `);

    return stats;
  } catch (error) {
    console.error('Error getting badge statistics:', error);
    return null;
  }
}

async function enhancedSeedUserBadges() {
  console.log('🌱 Starting enhanced user badge seeding...');
  
  try {
    // Get all users
    const users = await client.fetch(`
      *[_type == "author"] {
        _id,
        name,
        username,
        _createdAt
      }
    `);

    console.log(`👥 Found ${users.length} users to process`);

    let totalBadgesAwarded = 0;
    const userResults = [];
    const badgeAwarded = {};

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.name} (@${user.username})`);
      
      // Get user activity
      const activity = await getUserActivity(user._id);
      
      if (!activity) {
        console.log(`⚠️  Could not get activity for user ${user.name}`);
        continue;
      }

      // Get eligible badges
      const eligibleBadges = await getEligibleBadges(activity.metrics);
      
      console.log(`📊 User metrics:`, activity.metrics);
      console.log(`🏆 Eligible badges: ${eligibleBadges.length}`);

      // Award badges
      let badgesAwarded = 0;
      for (const badgeInfo of eligibleBadges) {
        const awarded = await awardBadgeToUser(user._id, badgeInfo.name);
        if (awarded) {
          badgesAwarded++;
          totalBadgesAwarded++;
          
          // Track badge awards
          if (!badgeAwarded[badgeInfo.name]) {
            badgeAwarded[badgeInfo.name] = 0;
          }
          badgeAwarded[badgeInfo.name]++;
        }
      }

      userResults.push({
        user: user.name,
        username: user.username,
        metrics: activity.metrics,
        eligibleBadges: eligibleBadges.length,
        badgesAwarded
      });

      console.log(`✅ Awarded ${badgesAwarded} badges to ${user.name}`);
    }

    // Get final statistics
    const stats = await getBadgeStatistics();

    // Summary
    console.log('\n🎉 Enhanced seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Users processed: ${users.length}`);
    console.log(`   - Total badges awarded in this run: ${totalBadgesAwarded}`);
    console.log(`   - Total badges in system: ${stats?.totalBadges || 'N/A'}`);
    console.log(`   - Active badges: ${stats?.activeBadges || 'N/A'}`);
    console.log(`   - Total user badges: ${stats?.totalUserBadges || 'N/A'}`);
    console.log(`   - Users with badges: ${stats?.usersWithBadges || 'N/A'}`);
    
    console.log('\n📋 User Results:');
    userResults.forEach(result => {
      console.log(`   ${result.user} (@${result.username}): ${result.badgesAwarded}/${result.eligibleBadges} badges awarded`);
    });

    console.log('\n🏆 Badges Awarded in This Run:');
    Object.entries(badgeAwarded).forEach(([badgeName, count]) => {
      console.log(`   ${badgeName}: ${count} users`);
    });

    // Show top users by badge count
    console.log('\n👑 Top Users by Badge Count:');
    const topUsers = userResults
      .sort((a, b) => b.badgesAwarded - a.badgesAwarded)
      .slice(0, 5);
    
    topUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.user} (@${user.username}): ${user.badgesAwarded} badges`);
    });

  } catch (error) {
    console.error('❌ Error during enhanced seeding:', error);
  }
}

// Run the enhanced seeding
enhancedSeedUserBadges()
  .then(() => {
    console.log('\n✅ Enhanced script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Enhanced script failed:', error);
    process.exit(1);
  });



