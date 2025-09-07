#!/usr/bin/env node

/**
 * Check Startup Data Script
 * 
 * This script checks the actual startup data to understand search accuracy issues
 * Run with: node scripts/check-startup-data.js
 */

const { createClient } = require('@sanity/client');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function checkStartupData() {
  console.log('🔍 Checking startup data for search accuracy...\n');

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });

  try {
    // Get sample startups
    const startups = await client.fetch(`
      *[_type == "startup"] {
        _id,
        title,
        description,
        category,
        pitch
      } | order(_createdAt desc) [0...10]
    `);

    console.log(`📊 Found ${startups.length} startups\n`);

    startups.forEach((startup, i) => {
      console.log(`${i + 1}. ${startup.title}`);
      console.log(`   Category: ${startup.category || 'No category'}`);
      console.log(`   Description: ${startup.description ? startup.description.substring(0, 100) + '...' : 'No description'}`);
      console.log(`   Pitch: ${startup.pitch ? startup.pitch.substring(0, 100) + '...' : 'No pitch'}`);
      console.log(`   ID: ${startup._id}`);
      console.log('');
    });

    // Check for common issues
    console.log('🔍 Analyzing data quality...\n');
    
    const issues = [];
    
    // Check for missing descriptions
    const missingDescriptions = startups.filter(s => !s.description || s.description.trim() === '');
    if (missingDescriptions.length > 0) {
      issues.push(`❌ ${missingDescriptions.length} startups missing descriptions`);
    }

    // Check for missing pitches
    const missingPitches = startups.filter(s => !s.pitch || s.pitch.trim() === '');
    if (missingPitches.length > 0) {
      issues.push(`❌ ${missingPitches.length} startups missing pitches`);
    }

    // Check for missing categories
    const missingCategories = startups.filter(s => !s.category || s.category.trim() === '');
    if (missingCategories.length > 0) {
      issues.push(`❌ ${missingCategories.length} startups missing categories`);
    }

    // Check for very short content
    const shortContent = startups.filter(s => {
      const totalLength = (s.title || '').length + (s.description || '').length + (s.pitch || '').length;
      return totalLength < 50;
    });
    if (shortContent.length > 0) {
      issues.push(`❌ ${shortContent.length} startups have very short content (< 50 chars)`);
    }

    if (issues.length > 0) {
      console.log('⚠️  Data Quality Issues:');
      issues.forEach(issue => console.log(`   ${issue}`));
    } else {
      console.log('✅ Data quality looks good');
    }

    // Show what text is being used for embeddings
    console.log('\n📝 Text content used for embeddings:');
    startups.slice(0, 3).forEach((startup, i) => {
      const textContent = `${startup.title} ${startup.description || ''} ${startup.pitch || ''} ${startup.category || ''}`.trim();
      console.log(`\n${i + 1}. ${startup.title}:`);
      console.log(`   "${textContent}"`);
      console.log(`   Length: ${textContent.length} characters`);
    });

  } catch (error) {
    console.error('❌ Error checking startup data:', error.message);
  }
}

// Run the check
checkStartupData().then(() => {
  console.log('\n✨ Data check completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
