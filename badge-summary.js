import { createClient } from '@sanity/client';

// Sanity configuration
const client = createClient({
  projectId: 'qqctr0oj',
  dataset: 'production',
  token: 'skJlkCiE6zON4Z5lJ1dWyTHIGOgwmL8KbAZdKrbroH3AklWJ7OOT8X9qaCkHlndAi7DmRArBYmZZFhIcyEoynkPGuvFOWqkhfIcyEoynkPGuvFOWqkhfMp5HLj8uZZL5AptRIsrBnEXYlpX16KMxCprMl7xouFPrhDVN7DmVpfDjjG081hNhArBBJyS1fvEuaaKN6c2',
  apiVersion: '2025-01-02',
  useCdn: false,
});

async function getBadgeSummary() {
  console.log('📊 Generating Badge System Summary...\n');
  
  try {
    // Get basic statistics
    const basicStats = await client.fetch(`
      {
        "totalBadges": count(*[_type == "badge"]),
        "activeBadges": count(*[_type == "badge" && isActive == true]),
        "totalUserBadges": count(*[_type == "userBadge"]),
        "totalUsers": count(*[_type == "author"])
      }
    `);

    // Get users with badges
    const usersWithBadges = await client.fetch(`
      *[_type == "userBadge"] {
        user->{
          _id,
          name,
          username
        },
        badge->{
          _id,
          name,
          category,
          rarity,
          tier
        },
        earnedAt
      }
    `);

    // Get all badges
    const allBadges = await client.fetch(`
      *[_type == "badge"] {
        _id,
        name,
        category,
        rarity,
        tier,
        isActive
      }
    `);

    // Get all users
    const allUsers = await client.fetch(`
      *[_type == "author"] {
        _id,
        name,
        username,
        _createdAt
      }
    `);

    console.log('🎯 BADGE SYSTEM OVERVIEW');
    console.log('========================');
    console.log(`📊 Total Badges Available: ${basicStats.totalBadges}`);
    console.log(`✅ Active Badges: ${basicStats.activeBadges}`);
    console.log(`👥 Total Users: ${basicStats.totalUsers}`);
    console.log(`🏆 Total Badges Awarded: ${basicStats.totalUserBadges}`);
    console.log(`🎖️ Users with Badges: ${new Set(usersWithBadges.map(ub => ub.user._id)).size}`);
    console.log(`📈 Badge Award Rate: ${((new Set(usersWithBadges.map(ub => ub.user._id)).size / basicStats.totalUsers) * 100).toFixed(1)}%`);

    // Badge Categories
    console.log('\n📂 BADGE CATEGORIES');
    console.log('==================');
    const categoryStats = {};
    allBadges.forEach(badge => {
      if (!categoryStats[badge.category]) {
        categoryStats[badge.category] = { total: 0, active: 0 };
      }
      categoryStats[badge.category].total++;
      if (badge.isActive) categoryStats[badge.category].active++;
    });

    Object.entries(categoryStats).forEach(([category, stats]) => {
      console.log(`${category.charAt(0).toUpperCase() + category.slice(1)}: ${stats.active}/${stats.total} badges`);
    });

    // Badge Rarity Distribution
    console.log('\n💎 BADGE RARITY DISTRIBUTION');
    console.log('============================');
    const rarityStats = {};
    allBadges.forEach(badge => {
      if (!rarityStats[badge.rarity]) {
        rarityStats[badge.rarity] = { total: 0, active: 0 };
      }
      rarityStats[badge.rarity].total++;
      if (badge.isActive) rarityStats[badge.rarity].active++;
    });

    Object.entries(rarityStats).forEach(([rarity, stats]) => {
      console.log(`${rarity.charAt(0).toUpperCase() + rarity.slice(1)}: ${stats.active}/${stats.total} badges`);
    });

    // Most Awarded Badges
    console.log('\n🏆 MOST AWARDED BADGES');
    console.log('=====================');
    const badgeAwards = {};
    usersWithBadges.forEach(ub => {
      const badgeName = ub.badge.name;
      badgeAwards[badgeName] = (badgeAwards[badgeName] || 0) + 1;
    });

    const sortedBadges = Object.entries(badgeAwards)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    sortedBadges.forEach(([badgeName, count], index) => {
      console.log(`${index + 1}. ${badgeName}: ${count} users`);
    });

    // Top Users by Badge Count
    console.log('\n👑 TOP USERS BY BADGE COUNT');
    console.log('===========================');
    const userBadgeCounts = {};
    usersWithBadges.forEach(ub => {
      const userId = ub.user._id;
      const userName = ub.user.name;
      const username = ub.user.username;
      if (!userBadgeCounts[userId]) {
        userBadgeCounts[userId] = { name: userName, username: username, count: 0, badges: [] };
      }
      userBadgeCounts[userId].count++;
      userBadgeCounts[userId].badges.push(ub.badge.name);
    });

    const topUsers = Object.values(userBadgeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (@${user.username}): ${user.count} badges`);
      console.log(`   Badges: ${user.badges.join(', ')}`);
    });

    // Recent Badge Awards
    console.log('\n🕒 RECENT BADGE AWARDS (Last 10)');
    console.log('================================');
    const recentAwards = usersWithBadges
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, 10);

    recentAwards.forEach((award, index) => {
      const date = new Date(award.earnedAt).toLocaleDateString();
      console.log(`${index + 1}. ${award.user.name} earned "${award.badge.name}" on ${date}`);
    });

    // Badge Achievement Progress
    console.log('\n📈 BADGE ACHIEVEMENT PROGRESS');
    console.log('=============================');
    const usersWithoutBadges = allUsers.filter(user => 
      !usersWithBadges.some(ub => ub.user._id === user._id)
    );

    console.log(`🎯 Users without badges: ${usersWithoutBadges.length}`);
    if (usersWithoutBadges.length > 0) {
      console.log('Users needing badges:');
      usersWithoutBadges.forEach(user => {
        console.log(`   - ${user.name} (@${user.username})`);
      });
    }

    // Badge System Health
    console.log('\n💚 BADGE SYSTEM HEALTH');
    console.log('=====================');
    const inactiveBadges = allBadges.filter(badge => !badge.isActive);
    console.log(`⚠️  Inactive badges: ${inactiveBadges.length}`);
    if (inactiveBadges.length > 0) {
      console.log('Inactive badges:');
      inactiveBadges.forEach(badge => {
        console.log(`   - ${badge.name} (${badge.category})`);
      });
    }

    console.log('\n✅ Summary completed successfully!');

  } catch (error) {
    console.error('❌ Error generating summary:', error);
  }
}

// Run the summary
getBadgeSummary()
  .then(() => {
    console.log('\n🎉 Badge summary completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Summary failed:', error);
    process.exit(1);
  });



