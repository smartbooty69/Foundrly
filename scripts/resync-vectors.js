#!/usr/bin/env node

/**
 * Re-sync Vector Database Script
 * 
 * This script re-syncs all startup vectors with improved embedding generation
 * to enhance search accuracy.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import using dynamic imports for ES modules
async function loadModules() {
  const { client } = await import('../sanity/lib/client.js');
  const { aiService } = await import('../lib/ai-services.js');
  return { client, aiService };
}

async function resyncAllVectors() {
  console.log('🔄 Starting vector re-sync with improved embeddings...\n');

  try {
    const { client, aiService } = await loadModules();
    // Fetch all startups from Sanity
    const startups = await client.fetch(`
      *[_type == "startup"] {
        _id,
        title,
        description,
        category,
        pitch,
        author->{name, username},
        _createdAt,
        views,
        likes,
        dislikes
      }
    `);

    console.log(`📊 Found ${startups.length} startups to re-sync\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process startups in batches
    const batchSize = 10;
    for (let i = 0; i < startups.length; i += batchSize) {
      const batch = startups.slice(i, i + batchSize);
      
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(startups.length / batchSize)} (${batch.length} startups)`);
      
      // Process each startup in the batch
      for (const startup of batch) {
        try {
          // Store with improved embedding
          await aiService.storeStartupVector(startup);
          successCount++;
          console.log(`  ✅ ${startup.title}`);
        } catch (error) {
          errorCount++;
          console.error(`  ❌ ${startup.title}: ${error.message}`);
        }
      }
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < startups.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n🎉 Re-sync completed!`);
    console.log(`✅ Successfully synced: ${successCount} startups`);
    console.log(`❌ Errors: ${errorCount} startups`);
    
    if (errorCount > 0) {
      console.log(`\n⚠️  Some startups failed to sync. Check the errors above.`);
    }

  } catch (error) {
    console.error('❌ Re-sync failed:', error);
    process.exit(1);
  }
}

// Run the re-sync
resyncAllVectors().then(() => {
  console.log('\n🚀 Vector re-sync completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('Re-sync script failed:', error);
  process.exit(1);
});
