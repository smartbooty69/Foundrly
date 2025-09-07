#!/usr/bin/env node

/**
 * Test Semantic Search Script
 * 
 * This script tests the semantic search functionality
 * Run with: node scripts/test-semantic-search.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { createClient } = require('@sanity/client');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testSemanticSearch() {
  console.log('🔍 Testing Semantic Search...\n');

  // Initialize services
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });

  try {
    // Get Pinecone index
    const index = pinecone.index('foundrly-startups');
    console.log('✅ Connected to Pinecone index');

    // Check index stats
    const stats = await index.describeIndexStats();
    console.log(`📊 Index stats:`, {
      totalVectorCount: stats.totalVectorCount,
      dimension: stats.dimension,
      metric: stats.metric
    });

    if (stats.totalVectorCount === 0) {
      console.log('❌ No vectors found in Pinecone index');
      console.log('Please run: node scripts/sync-startups.js');
      return;
    }

    // Test search queries
    const testQueries = [
      'AI startups',
      'healthcare technology',
      'fintech apps',
      'sustainable shopping',
      'learning platform'
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 Testing search: "${query}"`);
      
      try {
        // Generate embedding
        const model = genAI.getGenerativeModel({ model: 'embedding-001' });
        const result = await model.embedContent(query);
        const embedding = result.embedding.values;

        // Search in Pinecone
        const searchResults = await index.query({
          vector: embedding,
          topK: 5,
          includeMetadata: true,
        });

        console.log(`  📊 Found ${searchResults.matches?.length || 0} matches`);
        
        if (searchResults.matches && searchResults.matches.length > 0) {
          console.log('  🎯 Top matches:');
          searchResults.matches.forEach((match, index) => {
            console.log(`    ${index + 1}. ${match.metadata?.title} (${Math.round(match.score * 100)}% match)`);
          });

          // Get full startup data from Sanity
          const startupIds = searchResults.matches.map(match => match.id);
          const startups = await sanity.fetch(`
            *[_type == "startup" && _id in $startupIds] {
              _id,
              title,
              description,
              category
            }
          `, { startupIds });

          console.log(`  📥 Retrieved ${startups.length} startups from Sanity`);
        } else {
          console.log('  ❌ No matches found');
        }

      } catch (error) {
        console.error(`  ❌ Error testing query "${query}":`, error.message);
      }
    }

    console.log('\n🎉 Semantic search test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testSemanticSearch().then(() => {
  console.log('\n✨ Test script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
