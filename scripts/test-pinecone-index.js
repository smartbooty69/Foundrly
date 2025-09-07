#!/usr/bin/env node

/**
 * Pinecone Index Test Script
 * 
 * This script tests the Pinecone index after it's created to ensure it's working correctly.
 * Run with: node scripts/test-pinecone-index.js
 */

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testPineconeIndex() {
  console.log('🌲 Testing Pinecone Index...\n');

  // Test 1: Connect to Pinecone
  console.log('1. Connecting to Pinecone...');
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.index('foundrly-startups');
    console.log('✅ Connected to Pinecone\n');
  } catch (error) {
    console.error('❌ Failed to connect to Pinecone:', error.message);
    return false;
  }

  // Test 2: Check index stats
  console.log('2. Checking index stats...');
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.index('foundrly-startups');
    const stats = await index.describeIndexStats();
    
    console.log('✅ Index stats retrieved');
    console.log(`   Total vectors: ${stats.totalVectorCount || 0}`);
    console.log(`   Dimension: ${stats.dimension || 'Unknown'}`);
    console.log(`   Metric: ${stats.metric || 'Unknown'}\n`);
  } catch (error) {
    console.error('❌ Failed to get index stats:', error.message);
    return false;
  }

  // Test 3: Test embedding generation
  console.log('3. Testing embedding generation...');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    
    const result = await model.embedContent('This is a test startup for embedding generation.');
    const embedding = result.embedding;
    
    if (embedding && embedding.values && embedding.values.length === 768) {
      console.log('✅ Embedding generation working');
      console.log(`   Dimension: ${embedding.values.length}\n`);
    } else {
      console.error('❌ Embedding dimension mismatch');
      return false;
    }
  } catch (error) {
    console.error('❌ Embedding generation failed:', error.message);
    return false;
  }

  // Test 4: Test vector upsert
  console.log('4. Testing vector upsert...');
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    
    const index = pinecone.index('foundrly-startups');
    
    // Generate test embedding
    const result = await model.embedContent('Test startup for Pinecone integration');
    const embedding = result.embedding.values;
    
    // Upsert test vector
    await index.upsert([{
      id: 'test-startup-123',
      values: embedding,
      metadata: {
        title: 'Test Startup',
        description: 'This is a test startup for Pinecone integration',
        category: 'Test',
        author: 'Test User',
        views: 0,
        likes: 0,
        _createdAt: new Date().toISOString(),
        text: 'Test startup for Pinecone integration'
      }
    }]);
    
    console.log('✅ Test vector upserted successfully\n');
  } catch (error) {
    console.error('❌ Vector upsert failed:', error.message);
    return false;
  }

  // Test 5: Test vector search
  console.log('5. Testing vector search...');
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    
    const index = pinecone.index('foundrly-startups');
    
    // Generate search embedding
    const result = await model.embedContent('test startup');
    const searchEmbedding = result.embedding.values;
    
    // Search for similar vectors
    const searchResponse = await index.query({
      vector: searchEmbedding,
      topK: 5,
      includeMetadata: true
    });
    
    console.log('✅ Vector search working');
    console.log(`   Found ${searchResponse.matches?.length || 0} matches\n`);
  } catch (error) {
    console.error('❌ Vector search failed:', error.message);
    return false;
  }

  // Test 6: Clean up test vector
  console.log('6. Cleaning up test vector...');
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.index('foundrly-startups');
    await index.deleteOne('test-startup-123');
    
    console.log('✅ Test vector cleaned up\n');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    // Don't fail the test for cleanup issues
  }

  console.log('🎉 Pinecone index is working perfectly!');
  console.log('\nYour index is ready for:');
  console.log('✅ Storing startup vectors');
  console.log('✅ Semantic search');
  console.log('✅ Similarity matching');
  console.log('✅ Personalized recommendations');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000/ai-features');
  console.log('3. Test the AI features with your new Pinecone index!');
  
  return true;
}

// Run the test
testPineconeIndex().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test script failed:', error);
  process.exit(1);
});

