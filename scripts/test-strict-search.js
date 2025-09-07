#!/usr/bin/env node

/**
 * Test Strict Search Results
 * 
 * This script shows the difference between strict and lenient search
 * Run with: node scripts/test-strict-search.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { createClient } = require('@sanity/client');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testStrictSearch() {
  console.log('🎯 Testing Strict vs Lenient Search Results...\n');

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

    // Test queries that should return very few results
    const testQueries = [
      'AI plant care',
      'sustainable shopping',
      'malware security',
      'random nonsense query',
      'hello world test'
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 Testing: "${query}"`);
      
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

          // Show strict filtering (60%+ similarity)
          const strictResults = searchResults.matches.filter(m => m.score > 0.6);
          console.log(`   🎯 STRICT results (60%+ similarity): ${strictResults.length}`);
          strictResults.forEach((match, index) => {
            console.log(`      ${index + 1}. ${match.metadata?.title} (${Math.round(match.score * 100)}%)`);
          });

          // Show lenient filtering (30%+ similarity) for comparison
          const lenientResults = searchResults.matches.filter(m => m.score > 0.3);
          console.log(`   📈 LENIENT results (30%+ similarity): ${lenientResults.length}`);
          lenientResults.forEach((match, index) => {
            console.log(`      ${index + 1}. ${match.metadata?.title} (${Math.round(match.score * 100)}%)`);
          });

        } else {
          console.log(`   ❌ No results found`);
        }

      } catch (error) {
        console.error(`   ❌ Error testing query: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStrictSearch().then(() => {
  console.log('\n✨ Strict search test completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
