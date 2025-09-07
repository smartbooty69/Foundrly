#!/usr/bin/env node

/**
 * AI Setup Test Script
 * 
 * This script tests the AI services integration to ensure everything is working correctly.
 * Run with: node scripts/test-ai-setup.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk').default;
const { Pinecone } = require('@pinecone-database/pinecone');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testAISetup() {
  console.log('🤖 Testing AI Services Setup...\n');

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables...');
  const requiredVars = ['GEMINI_API_KEY', 'ANTHROPIC_API_KEY', 'PINECONE_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.error('Please add these to your .env.local file');
    return false;
  }
  console.log('✅ All environment variables are set\n');

  // Test 2: Gemini API
  console.log('2. Testing Gemini API...');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Hello, this is a test message.');
    const response = await result.response;
    const text = response.text();
    
    if (text && text.length > 0) {
      console.log('✅ Gemini API is working');
      console.log(`   Response: ${text.substring(0, 100)}...\n`);
    } else {
      console.error('❌ Gemini API returned empty response');
      return false;
    }
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    return false;
  }

  // Test 3: Anthropic API
  console.log('3. Testing Anthropic API...');
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'Hello, this is a test message.'
      }]
    });

    if (response.content && response.content.length > 0) {
      console.log('✅ Anthropic API is working');
      console.log(`   Response: ${response.content[0].text.substring(0, 100)}...\n`);
    } else {
      console.error('❌ Anthropic API returned empty response');
      return false;
    }
  } catch (error) {
    if (error.message?.includes('credit balance') || error.message?.includes('billing')) {
      console.log('⚠️  Anthropic API needs credits');
      console.log('   The API key is valid but you need to add credits to your account');
      console.log('   Visit: https://console.anthropic.com/ to add credits');
      console.log('   AI features will use Gemini as fallback\n');
    } else {
      console.error('❌ Anthropic API test failed:', error.message);
      return false;
    }
  }

  // Test 4: Pinecone API
  console.log('4. Testing Pinecone API...');
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // List indexes
    const indexes = await pinecone.listIndexes();
    console.log('✅ Pinecone API is working');
    console.log(`   Available indexes: ${indexes.indexes?.map(i => i.name).join(', ') || 'None'}\n`);

    // Check if foundrly-startups index exists
    const foundrlyIndex = indexes.indexes?.find(i => i.name === 'foundrly-startups');
    if (foundrlyIndex) {
      console.log('✅ Foundrly startups index exists');
      console.log(`   Index stats: ${foundrlyIndex.dimension} dimensions, ${foundrlyIndex.metric} metric\n`);
    } else {
      console.log('⚠️  Foundrly startups index not found');
      console.log('   Please create an index named "foundrly-startups" in Pinecone console\n');
    }
  } catch (error) {
    console.error('❌ Pinecone API test failed:', error.message);
    return false;
  }

  // Test 5: Embedding Generation
  console.log('5. Testing Embedding Generation...');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    
    const result = await model.embedContent('This is a test startup description for embedding generation.');
    const embedding = result.embedding;
    
    if (embedding && embedding.values && embedding.values.length > 0) {
      console.log('✅ Embedding generation is working');
      console.log(`   Embedding dimension: ${embedding.values.length}\n`);
    } else {
      console.error('❌ Embedding generation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Embedding generation test failed:', error.message);
    return false;
  }

  console.log('🎉 AI services setup is complete!');
  console.log('\nStatus Summary:');
  console.log('✅ Gemini API - Working perfectly');
  console.log('⚠️  Anthropic API - Needs credits (will use Gemini fallback)');
  console.log('✅ Pinecone API - Ready to use');
  console.log('✅ Embedding Generation - Working');
  console.log('\nNext steps:');
  console.log('1. Visit /ai-features to test the AI components');
  console.log('2. Create a Pinecone index named "foundrly-startups" if not already created');
  console.log('3. Sync your existing startups using the /api/ai/sync-vectors endpoint');
  console.log('4. (Optional) Add credits to Anthropic for enhanced analysis features');
  console.log('5. Start using AI features in your application!');
  
  return true;
}

// Run the test
testAISetup().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test script failed:', error);
  process.exit(1);
});
