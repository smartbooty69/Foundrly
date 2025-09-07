#!/usr/bin/env node

/**
 * Test Gym Membership Search
 * 
 * This script tests the specific gym membership search query
 * Run with: node scripts/test-gym-search.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { createClient } = require('@sanity/client');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testGymSearch() {
  console.log('🏋️ Testing Gym Membership Search...\n');

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
    const index = pinecone.index('foundrly-startups');
    console.log('✅ Connected to Pinecone index');

    // Test the specific query from the user
    const query = 'a startup to manage my gym membership';
    console.log(`🔍 Testing: "${query}"`);
    
    try {
      // Generate embedding
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(query);
      const embedding = result.embedding.values;

      // Search in Pinecone
      const searchResults = await index.query({
        vector: embedding,
        topK: 10,
        includeMetadata: true,
      });

      if (searchResults.matches && searchResults.matches.length > 0) {
        console.log(`   📊 All vector matches (${searchResults.matches.length}):`);
        searchResults.matches.forEach((match, index) => {
          console.log(`      ${index + 1}. ${match.metadata?.title} (${Math.round(match.score * 100)}%)`);
        });

        // Show very strict filtering (70%+ similarity)
        const veryStrictResults = searchResults.matches.filter(m => m.score > 0.7);
        console.log(`   🎯 VERY STRICT results (70%+ similarity): ${veryStrictResults.length}`);
        veryStrictResults.forEach((match, index) => {
          console.log(`      ${index + 1}. ${match.metadata?.title} (${Math.round(match.score * 100)}%)`);
        });

        // Show strict filtering (65%+ similarity) for fallback
        const strictResults = searchResults.matches.filter(m => m.score > 0.65);
        console.log(`   🔍 STRICT results (65%+ similarity): ${strictResults.length}`);
        strictResults.forEach((match, index) => {
          console.log(`      ${index + 1}. ${match.metadata?.title} (${Math.round(match.score * 100)}%)`);
        });

        // Show what the current system would return
        const currentResults = searchResults.matches.filter(m => m.score > 0.6);
        console.log(`   📈 CURRENT system (60%+ similarity): ${currentResults.length}`);
        currentResults.forEach((match, index) => {
          console.log(`      ${index + 1}. ${match.metadata?.title} (${Math.round(match.score * 100)}%)`);
        });

      } else {
        console.log(`   ❌ No results found`);
      }

    } catch (error) {
      console.error(`   ❌ Error testing query: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testGymSearch().then(() => {
  console.log('\n✨ Gym search test completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
