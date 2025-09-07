#!/usr/bin/env node

/**
 * Test Search Accuracy Script
 * 
 * This script tests specific search queries to verify accuracy improvements
 * Run with: node scripts/test-search-accuracy.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { createClient } = require('@sanity/client');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testSearchAccuracy() {
  console.log('🎯 Testing Search Accuracy Improvements...\n');

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

    // Test specific accuracy scenarios
    const testCases = [
      {
        query: 'AI plant care assistant',
        expected: 'PlantPal',
        description: 'Should find PlantPal for AI plant care'
      },
      {
        query: 'sustainable grocery shopping app',
        expected: 'GreenCart',
        description: 'Should find GreenCart for sustainable shopping'
      },
      {
        query: 'malware detection security',
        expected: 'Jarvis',
        description: 'Should find Jarvis for malware detection'
      },
      {
        query: 'traffic management system',
        expected: 'GreenLight AI',
        description: 'Should find GreenLight AI for traffic management'
      },
      {
        query: 'learning platform education',
        expected: 'LearnLoop',
        description: 'Should find LearnLoop for learning platform'
      },
      {
        query: 'antique marketplace rare items',
        expected: 'Eterna',
        description: 'Should find Eterna for antique marketplace'
      },
      {
        query: 'pet store animal care',
        expected: 'Pet Store',
        description: 'Should find Pet Store for pet-related business'
      }
    ];

    let correctMatches = 0;
    let totalTests = testCases.length;

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: "${testCase.query}"`);
      console.log(`   Expected: ${testCase.expected}`);
      console.log(`   ${testCase.description}`);
      
      try {
        // Generate embedding
        const model = genAI.getGenerativeModel({ model: 'embedding-001' });
        const result = await model.embedContent(testCase.query);
        const embedding = result.embedding.values;

        // Search in Pinecone
        const searchResults = await index.query({
          vector: embedding,
          topK: 5,
          includeMetadata: true,
        });

        if (searchResults.matches && searchResults.matches.length > 0) {
          const topMatch = searchResults.matches[0];
          const isCorrect = topMatch.metadata?.title === testCase.expected;
          
          console.log(`   🎯 Top result: ${topMatch.metadata?.title} (${Math.round(topMatch.score * 100)}% match)`);
          
          if (isCorrect) {
            console.log(`   ✅ CORRECT - Found expected result!`);
            correctMatches++;
          } else {
            console.log(`   ❌ INCORRECT - Expected ${testCase.expected}, got ${topMatch.metadata?.title}`);
          }

          // Show all results for context
          console.log(`   📊 All results:`);
          searchResults.matches.forEach((match, index) => {
            console.log(`      ${index + 1}. ${match.metadata?.title} (${Math.round(match.score * 100)}%)`);
          });
        } else {
          console.log(`   ❌ No results found`);
        }

      } catch (error) {
        console.error(`   ❌ Error testing query: ${error.message}`);
      }
    }

    // Calculate accuracy
    const accuracy = (correctMatches / totalTests) * 100;
    console.log(`\n📊 Accuracy Results:`);
    console.log(`   Correct matches: ${correctMatches}/${totalTests}`);
    console.log(`   Accuracy: ${accuracy.toFixed(1)}%`);

    if (accuracy >= 80) {
      console.log(`   🎉 Excellent accuracy!`);
    } else if (accuracy >= 60) {
      console.log(`   👍 Good accuracy, but could be improved`);
    } else {
      console.log(`   ⚠️  Accuracy needs improvement`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSearchAccuracy().then(() => {
  console.log('\n✨ Accuracy test completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});

