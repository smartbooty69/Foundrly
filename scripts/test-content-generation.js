#!/usr/bin/env node

/**
 * Test Content Generation with Markdown
 * 
 * This script tests the AI content generation to see if it produces Markdown
 * Run with: node scripts/test-content-generation.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testContentGeneration() {
  console.log('🤖 Testing AI Content Generation with Markdown...\n');

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const idea = 'A platform that helps small local farmers sell directly to consumers through an AI-powered marketplace. It uses smart demand prediction, optimized logistics, and transparent pricing to reduce food waste, increase farmer profits, and give consumers fresher produce at lower costs.';
    const category = 'AgriTech';

    const prompt = `Generate comprehensive content for a startup with the following details:

Idea: ${idea}
Category: ${category}

Please provide:
1. A compelling startup title (max 60 characters)
2. A detailed description (2-3 paragraphs, 200-300 words)
3. A pitch summary in Markdown format (1-2 sentences, max 100 words) - use **bold** for key terms and *italics* for emphasis
4. 5-7 relevant tags
5. A brief market analysis
6. Key features and benefits
7. Target audience

Format the response as JSON with these fields: title, description, pitch, tags, marketAnalysis, features, targetAudience.

Important: The pitch field should use Markdown formatting with **bold** and *italic* text for emphasis.`;

    console.log('🔍 Generating content...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    console.log('📝 Raw AI Response:');
    console.log(content);
    console.log('\n' + '='.repeat(80) + '\n');

    try {
      // Clean the content by removing markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to parse as JSON
      const parsedContent = JSON.parse(cleanedContent);
      console.log('✅ Successfully parsed JSON:');
      console.log('Title:', parsedContent.title);
      console.log('Pitch (raw):', parsedContent.pitch);
      console.log('Tags:', parsedContent.tags);
      
      // Test Markdown rendering
      const MarkdownIt = require('markdown-it');
      const md = new MarkdownIt();
      const renderedPitch = md.render(parsedContent.pitch);
      console.log('\n🎨 Rendered Pitch (HTML):');
      console.log(renderedPitch);
      
    } catch (parseError) {
      console.log('❌ Failed to parse JSON:', parseError.message);
      console.log('Cleaned content:', cleanedContent);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testContentGeneration().then(() => {
  console.log('\n✨ Content generation test completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
