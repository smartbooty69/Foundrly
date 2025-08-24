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
  'First Pitch': { metric: 'startups_created', target: 1 },
  'Serial Entrepreneur': { metric: 'startups_created', target: 5 },
  'Pitch Master': { metric: 'startups_created', target: 10 },
  'Startup Visionary': { metric: 'startups_created', target: 25 },
  'Founder Legend': { metric: 'startups_created', target: 50 },
  
  'First Comment': { metric: 'comments_posted', target: 1 },
  'Engagement Starter': { metric: 'comments_posted', target: 10 },
  'Discussion Leader': { metric: 'comments_posted', target: 50 },
  'Community Champion': { metric: 'comments_posted', target: 200 },
  'Comment Master': { metric: 'comments_posted', target: 500 },
  
  'First Follower': { metric: 'followers_gained', target: 1 },
  'Social Butterfly': { metric: 'followers_gained', target: 10 },
  'Influencer': { metric: 'followers_gained', target: 50 },
  'Social Media Star': { metric: 'followers_gained', target: 200 },
  'Platform Celebrity': { metric: 'followers_gained', target: 1000 },
  
  'First Connection': { metric: 'users_followed', target: 1 },
  'Network Builder': { metric: 'users_followed', target: 10 },
  'Connection Master': { metric: 'users_followed', target: 50 },
  'Network Architect': { metric: 'users_followed', target: 200 },
  'Network Legend': { metric: 'users_followed', target: 500 },
  
  'First Like': { metric: 'likes_received', target: 1 },
  'Helpful Hand': { metric: 'likes_received', target: 10 },
  'Quality Contributor': { metric: 'likes_received', target: 50 },
  'Elite Contributor': { metric: 'likes_received', target: 200 },
  'Content Legend': { metric: 'likes_received', target: 1000 },
  
  'Moderation Helper': { metric: 'reports_submitted', target: 5 },
  
  'Early Adopter': { metric: 'days_active', target: 30, type: 'date' },
  'Community Pillar': { metric: 'days_active', target: 90, type: 'date' },
  'Platform Veteran': { metric: 'days_active', target: 365, type: 'date' },
};

async function getUserActivity(userId) {
  try {
    // Get user's startups
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

    // Calculate metrics
    const metrics = {
      startups_created: startups.length,
      comments_posted: comments.length,
      followers_gained: user[0]?.followers?.length || 0,
      users_followed: user[0]?.following?.length || 0,
      likes_received: startups.reduce((sum, startup) => sum + (startup.likes || 0), 0),
      reports_submitted: reports.length,
      days_active: user[0]?._createdAt ? 
        Math.floor((new Date() - new Date(user[0]._createdAt)) / (1000 * 60 * 60 * 24)) : 0
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
        awardedBy: 'seeding_script'
      }
    });

    console.log(`🎖️  Awarded badge: ${badgeName} to user`);
    return true;
  } catch (error) {
    console.error(`❌ Error awarding badge ${badgeName} to user ${userId}:`, error);
    return false;
  }
}

async function seedUserBadges() {
  console.log('🌱 Starting user badge seeding...');
  
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

    // Summary
    console.log('\n🎉 Seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Users processed: ${users.length}`);
    console.log(`   - Total badges awarded: ${totalBadgesAwarded}`);
    
    console.log('\n📋 User Results:');
    userResults.forEach(result => {
      console.log(`   ${result.user} (@${result.username}): ${result.badgesAwarded}/${result.eligibleBadges} badges awarded`);
    });

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

// Run the seeding
seedUserBadges()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });



