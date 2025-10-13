import { GoogleGenerativeAI } from '@google/generative-ai';
import { Anthropic } from '@anthropic-ai/sdk';
import { Pinecone } from '@pinecone-database/pinecone';
import { client } from '@/sanity/lib/client';
import { STARTUPS_QUERY } from '../sanity/lib/queries';

// Optional: suppress noisy logs/errors from this module when desired
(() => {
  try {
    const QUIET_AI_LOGS = process.env.QUIET_AI_LOGS === 'true';
    const SUPPRESS_AI_ERRORS = process.env.SUPPRESS_AI_ERRORS === 'true';
    if (QUIET_AI_LOGS) {
      console.log = (() => {}) as unknown as typeof console.log;
      console.info = (() => {}) as unknown as typeof console.info;
      console.warn = (() => {}) as unknown as typeof console.warn;
      console.debug = (() => {}) as unknown as typeof console.debug;
    }
    if (SUPPRESS_AI_ERRORS) {
      console.error = (() => {}) as unknown as typeof console.error;
    }
  } catch {}
})();

/**
 * Fetch recommended startups for a user from Sanity.
 * For now, returns latest startups as 'recommended'.
 */
export async function getPersonalizedRecommendations(userId: string, limit: number = 6) {
  // Delegate to AIService behavior-based recommender
  try {
    return await aiService.getPersonalizedRecommendations(userId, limit);
  } catch (e) {
    // Fallback to popular startups if personalized fails
    return await aiService["getPopularStartups" as any](limit);
  }
}
// Initialize AI services with environment validation
console.log('🔧 [AI SERVICES INIT] Initializing AI services...');

// Check environment variables
console.log('🔑 [AI SERVICES INIT] Environment variables check:', {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `Set (${process.env.GEMINI_API_KEY.length} chars)` : 'NOT SET',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? `Set (${process.env.ANTHROPIC_API_KEY.length} chars)` : 'NOT SET',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `Set (${process.env.OPENAI_API_KEY.length} chars)` : 'NOT SET',
  GROK_API_KEY: process.env.GROK_API_KEY ? `Set (${process.env.GROK_API_KEY.length} chars)` : 'NOT SET',
  GROQ_API_KEY: process.env.GROQ_API_KEY ? `Set (${process.env.GROQ_API_KEY.length} chars)` : 'NOT SET',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY ? `Set (${process.env.PINECONE_API_KEY.length} chars)` : 'NOT SET'
});

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ [AI SERVICES INIT] GEMINI_API_KEY is not set!');
}

if (!process.env.PINECONE_API_KEY) {
  console.error('❌ [AI SERVICES INIT] PINECONE_API_KEY is not set!');
}

if (!process.env.GROQ_API_KEY) {
  console.log('ℹ️ [AI SERVICES INIT] GROQ_API_KEY is not set - GROQ fallback will be skipped');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index('foundrly-startups');

console.log('✅ [AI SERVICES INIT] AI services initialized successfully');

// AI Service class with all required methods
export class AIService {
  // Generate embeddings using GROQ only
  private async generateEmbedding(text: string): Promise<number[]> {
    console.log('🤖 [GROQ EMBEDDING] Starting embedding generation for text:', text.substring(0, 100) + '...');
    
    // Check if GROQ API key is available
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ [GROQ EMBEDDING] GROQ_API_KEY environment variable is not set');
      throw new Error('GROQ API key not configured');
    }
    
    console.log('🔑 [GROQ EMBEDDING] GROQ API key is configured, length:', process.env.GROQ_API_KEY.length);
    
    try {
      // Check rate limit
      if (!rateLimiter.canMakeCall('groq')) {
        console.log('⚠️ [GROQ EMBEDDING] Rate limit exceeded');
        throw new Error('GROQ rate limit exceeded');
      }
      
      console.log('🤖 [GROQ EMBEDDING] Generating GROQ embedding...');
      const result = await this.generateGroqEmbedding(text);
      
      console.log('✅ [GROQ EMBEDDING] Successfully generated embedding, dimensions:', result.length);
      return result;
    } catch (error) {
      console.error('❌ [GROQ EMBEDDING] Error generating embedding:');
      console.error('  Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('  Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('  Text length:', text.length);
      console.error('  Text preview:', text.substring(0, 50));
      if (error instanceof Error && error.stack) {
        console.error('  Stack trace:', error.stack);
      }
      
      throw error; // Re-throw the error instead of using hash-based fallback
    }
  }

  /* COMMENTED OUT - Using only GROQ now
  // Generate embeddings using Gemini with OpenAI fallback
  private async generateEmbedding(text: string): Promise<number[]> {
    console.log('🤖 [GEMINI EMBEDDING] Starting embedding generation for text:', text.substring(0, 100) + '...');
    
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ [GEMINI EMBEDDING] GEMINI_API_KEY environment variable is not set');
      throw new Error('Gemini API key not configured');
    }
    
    console.log('🔑 [GEMINI EMBEDDING] Gemini API key is configured, length:', process.env.GEMINI_API_KEY.length);
    
    try {
      // Check rate limit
      if (!rateLimiter.canMakeCall('gemini')) {
        console.log('⚠️ [GEMINI EMBEDDING] Rate limit exceeded, skipping Gemini and trying fallback...');
        throw new Error('Rate limit exceeded');
      }
      
      console.log('🤖 [GEMINI EMBEDDING] Creating Gemini model instance...');
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });
      
      console.log('🤖 [GEMINI EMBEDDING] Calling model.embedContent...');
      const result = await model.embedContent(text);
      
      console.log('✅ [GEMINI EMBEDDING] Successfully generated embedding, dimensions:', result.embedding.values.length);
      return result.embedding.values;
    } catch (error) {
      console.error('❌ [GEMINI EMBEDDING] Error generating embedding:');
      console.error('  Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('  Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('  Text length:', text.length);
      console.error('  Text preview:', text.substring(0, 50));
      if (error instanceof Error && error.stack) {
        console.error('  Stack trace:', error.stack);
      }
      
      // Check if it's a quota/API error and try OpenAI fallback
      if (error instanceof Error && (
        error.message.includes('quota') || 
        error.message.includes('429') || 
        error.message.includes('rate limit') ||
        error.message.includes('Too Many Requests') ||
        error.message.includes('insufficient_quota')
      )) {
        console.log('⚠️ [GEMINI EMBEDDING] Quota/rate limit error detected, trying OpenAI fallback...');
        try {
          const openaiResult = await this.generateOpenAIEmbedding(text);
          console.log('✅ [GEMINI EMBEDDING] OpenAI fallback successful');
          return openaiResult;
        } catch (openaiError) {
          console.error('❌ [GEMINI EMBEDDING] OpenAI fallback also failed:', {
            openaiError: openaiError instanceof Error ? openaiError.message : 'Unknown error'
          });
          // Try Grok fallback before giving up
          try {
            console.log('🔄 [OPENAI EMBEDDING] Trying Grok fallback...');
            return await this.generateGrokEmbedding(text);
          } catch (grokError) {
            console.error('❌ [OPENAI EMBEDDING] Grok fallback also failed:', {
              grokError: grokError instanceof Error ? grokError.message : 'Unknown error'
            });
            // Use hash-based embedding as final fallback
            console.log('🔄 [GROK EMBEDDING] All AI services failed, using hash-based embedding fallback...');
            throw new Error('All GROQ models failed');
          }
        }
      }
      
      console.error('❌ [GEMINI EMBEDDING] Non-quota error, trying hash-based embedding fallback...');
      throw new Error('All GROQ models failed');
    }
  }
  */

  // Generate embeddings using OpenAI as fallback
  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    console.log('🔄 [OPENAI EMBEDDING] Starting OpenAI fallback embedding generation...');
    
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.error('❌ [OPENAI EMBEDDING] OPENAI_API_KEY environment variable is not set');
        throw new Error('OpenAI API key not configured');
      }

      // Check rate limit
      if (!rateLimiter.canMakeCall('openai')) {
        console.log('⚠️ [OPENAI EMBEDDING] Rate limit exceeded, skipping OpenAI and trying fallback...');
        throw new Error('Rate limit exceeded');
      }

      console.log('🔑 [OPENAI EMBEDDING] OpenAI API key is configured, length:', process.env.OPENAI_API_KEY.length);
      console.log('🔄 [OPENAI EMBEDDING] Making request to OpenAI API...');

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      console.log('🔄 [OPENAI EMBEDDING] OpenAI API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [OPENAI EMBEDDING] OpenAI API error:');
        console.error('  Status:', response.status);
        console.error('  Status Text:', response.statusText);
        console.error('  Error Text:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [OPENAI EMBEDDING] Successfully generated OpenAI embedding, dimensions:', data.data[0].embedding.length);
      return data.data[0].embedding;
    } catch (error) {
      console.error('❌ [OPENAI EMBEDDING] Error in OpenAI fallback:');
      console.error('  Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('  Error type:', error instanceof Error ? error.constructor.name : typeof error);
      if (error instanceof Error && error.stack) {
        console.error('  Stack trace:', error.stack);
      }
      // Try Grok fallback before giving up
      try {
        console.log('🔄 [OPENAI EMBEDDING] Trying Grok fallback...');
        return await this.generateGrokEmbedding(text);
      } catch (grokError) {
            console.error('❌ [OPENAI EMBEDDING] Grok fallback also failed:');
            console.error('  Grok error message:', grokError instanceof Error ? grokError.message : 'Unknown error');
            // Try GROQ fallback
            try {
              console.log('🔄 [GROK EMBEDDING] Trying GROQ fallback...');
              return await this.generateGroqEmbedding(text);
            } catch (groqError) {
              console.error('❌ [GROQ EMBEDDING] GROQ fallback also failed:');
              console.error('  GROQ error message:', groqError instanceof Error ? groqError.message : 'Unknown error');
              // Use hash-based embedding as final fallback
              console.log('🔄 [GROQ EMBEDDING] All AI services failed, using hash-based embedding fallback...');
              throw new Error('All GROQ models failed');
            }
      }
    }
  }

  // Generate embeddings using Grok as fallback (since Grok doesn't have embedding endpoint, we'll use text generation)
  private async generateGrokEmbedding(text: string): Promise<number[]> {
    console.log('🤖 [GROK EMBEDDING] Starting Grok embedding generation...');
    
    try {
      if (!process.env.GROK_API_KEY) {
        console.error('❌ [GROK EMBEDDING] GROK_API_KEY environment variable is not set');
        throw new Error('Grok API key not configured');
      }

      // Check rate limit
      if (!rateLimiter.canMakeCall('grok')) {
        console.log('⚠️ [GROK EMBEDDING] Rate limit exceeded, skipping Grok and using hash-based fallback...');
        throw new Error('Rate limit exceeded');
      }

      console.log('🔑 [GROK EMBEDDING] Grok API key is configured, length:', process.env.GROK_API_KEY.length);
      
      // Try different Grok models in order of preference
      const models = ['grok-2-1212', 'grok-beta', 'grok-vision-beta', 'grok-2'];
      
      for (const model of models) {
        try {
          console.log(`🤖 [GROK EMBEDDING] Trying model: ${model}`);
          
          // Since Grok doesn't have embeddings, we'll use a workaround with text generation
          // to create a semantic representation that we can convert to a vector
          const prompt = `Create a numerical vector representation (as a comma-separated list of 768 numbers between -1 and 1) for the following text for semantic search purposes: "${text}". Return only the numbers, no explanation.`;

          const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.1,
              max_tokens: 2000
            }),
          });

          console.log(`🤖 [GROK EMBEDDING] Grok API response status for ${model}:`, response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`⚠️ [GROK EMBEDDING] Model ${model} failed:`, {
              status: response.status,
              statusText: response.statusText,
              errorText: errorText
            });
            
            // If it's a credits issue, try next model
            if (response.status === 403 && errorText.includes('credits')) {
              console.log(`🔄 [GROK EMBEDDING] Credits issue with ${model}, trying next model...`);
              continue;
            }
            
            // If it's a model not found error, try next model
            if (response.status === 400 && errorText.includes('model')) {
              console.log(`🔄 [GROK EMBEDDING] Model ${model} not found, trying next model...`);
              continue;
            }
            
            throw new Error(`Grok API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          const generatedText = data.choices[0]?.message?.content?.trim();
          
          if (!generatedText) {
            console.log(`⚠️ [GROK EMBEDDING] No content generated by ${model}, trying next model...`);
            continue;
          }

          // Parse the comma-separated numbers into an array
          const embedding = generatedText
            .split(',')
            .map(num => parseFloat(num.trim()))
            .filter(num => !isNaN(num) && num >= -1 && num <= 1);

          if (embedding.length === 0) {
            console.log(`⚠️ [GROK EMBEDDING] Failed to parse embedding from ${model}, trying next model...`);
            continue;
          }

          // Pad or truncate to 768 dimensions to match Pinecone index
          const targetDimensions = 768;
          if (embedding.length < targetDimensions) {
            // Pad with zeros
            while (embedding.length < targetDimensions) {
              embedding.push(0);
            }
          } else if (embedding.length > targetDimensions) {
            // Truncate
            embedding.splice(targetDimensions);
          }

          console.log(`✅ [GROK EMBEDDING] Successfully generated Grok embedding with ${model}, dimensions:`, embedding.length);
          return embedding;
          
        } catch (modelError) {
          console.log(`⚠️ [GROK EMBEDDING] Model ${model} failed:`, {
            error: modelError instanceof Error ? modelError.message : 'Unknown error'
          });
          
          // If this is the last model, throw the error
          if (model === models[models.length - 1]) {
            throw modelError;
          }
          
          // Otherwise, try the next model
          console.log(`🔄 [GROK EMBEDDING] Trying next model...`);
          continue;
        }
      }
      
      // If we get here, all models failed, try GROQ fallback
      console.log('🔄 [GROK EMBEDDING] All models failed, trying GROQ fallback...');
      try {
        return await this.generateGroqEmbedding(text);
      } catch (groqError) {
        console.error('❌ [GROQ EMBEDDING] GROQ fallback also failed:');
        console.error('  GROQ error message:', groqError instanceof Error ? groqError.message : 'Unknown error');
        // Use hash-based embedding as final fallback
        console.log('🔄 [GROQ EMBEDDING] All AI services failed, using hash-based embedding fallback...');
      throw new Error('All GROQ models failed');
      }
      
    } catch (error) {
      console.error('❌ [GROK EMBEDDING] Error in Grok embedding generation:');
      console.error('  Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('  Error type:', error instanceof Error ? error.constructor.name : typeof error);
      if (error instanceof Error && error.stack) {
        console.error('  Stack trace:', error.stack);
      }
      
      // Even if Grok completely fails, try GROQ fallback
      console.log('🔄 [GROK EMBEDDING] Grok completely failed, trying GROQ fallback...');
      try {
        return await this.generateGroqEmbedding(text);
      } catch (groqError) {
        console.error('❌ [GROQ EMBEDDING] GROQ fallback also failed:');
        console.error('  GROQ error message:', groqError instanceof Error ? groqError.message : 'Unknown error');
        // Use hash-based embedding as final fallback
        console.log('🔄 [GROQ EMBEDDING] All AI services failed, using hash-based embedding fallback...');
        throw new Error('All GROQ models failed');
      }
    }
  }

  // Generate embeddings using GROQ as fallback (since GROQ doesn't have embedding endpoint, we'll use text generation)
  private async generateGroqEmbedding(text: string): Promise<number[]> {
    console.log('🤖 [HASH EMBEDDING] Generating hash-based embedding (GROQ doesn\'t have native embeddings)...');
    
    try {
      // Create a 768-dimensional embedding using hash-based approach
      const embedding = new Array(768).fill(0);
      const words = text.toLowerCase().split(/\s+/);
      
      // Enhanced keywords for better categorization
      const bankingKeywords = ['banking', 'bank', 'finance', 'financial', 'fintech', 'payment', 'payments', 'money', 'currency', 'wallet', 'account', 'accounts', 'credit', 'debit', 'loan', 'investment', 'dailypay', 'daily', 'pay', 'plaid', 'dwolla'];
      const farmingKeywords = ['farming', 'farm', 'agriculture', 'agricultural', 'agritech', 'crop', 'crops', 'livestock', 'dairy', 'poultry', 'harvest', 'soil', 'irrigation'];
      const healthKeywords = ['health', 'healthcare', 'medical', 'medicine', 'doctor', 'patient', 'hospital', 'clinic', 'wellness', 'fitness', 'therapy', 'healthtech'];
      const educationKeywords = ['education', 'educational', 'learning', 'learn', 'teach', 'teaching', 'school', 'university', 'college', 'student', 'course', 'edtech'];
      const designKeywords = ['design', 'designer', 'creative', 'art', 'ui', 'ux', 'graphic', 'visual', 'branding', 'logo', 'illustration', 'photography'];
      const gamingKeywords = ['gaming', 'game', 'games', 'gamer', 'play', 'playing', 'entertainment', 'fun', 'arcade', 'console', 'esports', 'tournament'];
      const ecommerceKeywords = ['ecommerce', 'e-commerce', 'commerce', 'shopping', 'shop', 'store', 'retail', 'marketplace', 'sell', 'buy', 'purchase', 'product'];
      const socialKeywords = ['social', 'social media', 'community', 'chat', 'messaging', 'communication', 'connect', 'network', 'friends', 'follow', 'post', 'share'];
      
      words.forEach((word, wordIndex) => {
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
          hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
        }
        
        // Enhanced weighting based on keyword categories
        let weightMultiplier = 1.0;
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        
        if (bankingKeywords.includes(cleanWord)) {
          weightMultiplier = 5.0; // Extra high weight for banking words
        } else if (farmingKeywords.includes(cleanWord)) {
          weightMultiplier = 2.5; // High weight for farming words
        } else if (healthKeywords.includes(cleanWord)) {
          weightMultiplier = 2.5; // High weight for health words
        } else if (educationKeywords.includes(cleanWord)) {
          weightMultiplier = 2.5; // High weight for education words
        } else if (designKeywords.includes(cleanWord)) {
          weightMultiplier = 2.0; // High weight for design words
        } else if (gamingKeywords.includes(cleanWord)) {
          weightMultiplier = 2.0; // High weight for gaming words
        } else if (ecommerceKeywords.includes(cleanWord)) {
          weightMultiplier = 2.0; // High weight for ecommerce words
        } else if (socialKeywords.includes(cleanWord)) {
          weightMultiplier = 2.0; // High weight for social words
        }
        
        // Position-based weighting (earlier words are more important)
        const positionWeight = 1 / (wordIndex + 1);
        
        // Distribute hash across embedding dimensions
        const numDimensions = Math.min(15, Math.max(1, Math.floor(word.length / 2)));
        for (let i = 0; i < numDimensions; i++) {
          const dimension = Math.abs(hash + i * 1000) % 768;
          const value = (Math.sin(hash + i) * 0.5 + 0.5) * 2 - 1; // Normalize to [-1, 1]
          embedding[dimension] += value * positionWeight * weightMultiplier;
        }
      });
      
      // Add semantic context based on text structure
      this.addSemanticContext(embedding, text);
      
      // Normalize the embedding
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      if (magnitude > 0) {
        for (let i = 0; i < embedding.length; i++) {
          embedding[i] = embedding[i] / magnitude;
        }
      }
      
      console.log('✅ [HASH EMBEDDING] Generated hash-based embedding, dimensions:', embedding.length, 'text length:', text.length);
      return embedding;
    } catch (error) {
      console.error('❌ [HASH EMBEDDING] Error generating hash-based embedding:');
      console.error('  Error message:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Add semantic context to hash-based embeddings
  private addSemanticContext(embedding: number[], text: string): void {
    // Detect banking context
    const bankingContext = /banking|bank|finance|financial|fintech|payment|money|currency|wallet|account/i.test(text);
    if (bankingContext) {
      for (let i = 0; i < 50; i++) {
        embedding[i] += 0.1 * Math.sin(i);
      }
    }
    
    // Detect farming context
    const farmingContext = /farming|agriculture|agritech|crop|livestock|farm/i.test(text);
    if (farmingContext) {
      for (let i = 50; i < 100; i++) {
        embedding[i] += 0.1 * Math.cos(i);
      }
    }
    
    // Detect health context
    const healthContext = /health|healthcare|medical|medicine|doctor|patient|hospital/i.test(text);
    if (healthContext) {
      for (let i = 100; i < 150; i++) {
        embedding[i] += 0.1 * Math.sin(i * 0.5);
      }
    }
    
    // Detect technology context
    const techContext = /technology|software|app|ai|ml|data|platform/i.test(text);
    if (techContext) {
      for (let i = 150; i < 200; i++) {
        embedding[i] += 0.1 * Math.cos(i * 0.3);
      }
    }
  }

  // Generate text using Gemini (with Claude and Grok fallbacks)
  private async generateText(prompt: string, maxTokens: number = 1000): Promise<string> {
    console.log('🤖 [GROQ TEXT GENERATION] Starting text generation:', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + '...',
      maxTokens
    });
    
    // Check if GROQ API key is available
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ [GROQ TEXT GENERATION] GROQ_API_KEY environment variable is not set');
      throw new Error('GROQ API key not configured');
    }
    
    try {
      // Check rate limit
      if (!rateLimiter.canMakeCall('groq')) {
        console.log('⚠️ [GROQ TEXT GENERATION] Rate limit exceeded');
        throw new Error('Rate limit exceeded');
      }
      
      console.log('🤖 [GROQ TEXT GENERATION] Generating text with GROQ...');
      const result = await this.generateGroqText(prompt, maxTokens);
      
      console.log('✅ [GROQ TEXT GENERATION] Successfully generated text:', {
        textLength: result.length,
        textPreview: result.substring(0, 100) + '...'
      });
      
      return result;
    } catch (error) {
      console.error('❌ [GROQ TEXT GENERATION] GROQ generation failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        promptLength: prompt.length
      });
      
      throw new Error('GROQ text generation failed');
    }
  }

  /* COMMENTED OUT - Using only GROQ now
  private async generateText(prompt: string, maxTokens: number = 1000): Promise<string> {
    console.log('🤖 [GEMINI TEXT GENERATION] Starting text generation:', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + '...',
      maxTokens
    });
    
    try {
      // Try Gemini first
      console.log('🤖 [GEMINI TEXT GENERATION] Creating Gemini model instance...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      console.log('🤖 [GEMINI TEXT GENERATION] Calling model.generateContent...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();
      
      console.log('✅ [GEMINI TEXT GENERATION] Successfully generated text:', {
        textLength: generatedText.length,
        textPreview: generatedText.substring(0, 100) + '...'
      });
      
      return generatedText;
    } catch (error) {
      console.error('❌ [GEMINI TEXT GENERATION] Gemini generation failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        promptLength: prompt.length
      });
      
      // Fallback to Claude if available
      if (process.env.ANTHROPIC_API_KEY) {
        console.log('🔄 [GEMINI TEXT GENERATION] Trying Claude fallback...');
        try {
          const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: prompt }],
          });
          
          const claudeText = response.content[0].type === 'text' ? response.content[0].text : '';
          console.log('✅ [GEMINI TEXT GENERATION] Claude fallback successful:', {
            textLength: claudeText.length,
            textPreview: claudeText.substring(0, 100) + '...'
          });
          
          return claudeText;
        } catch (claudeError) {
          console.error('❌ [GEMINI TEXT GENERATION] Claude generation also failed:', {
            claudeError: claudeError instanceof Error ? claudeError.message : 'Unknown error',
            claudeErrorType: claudeError instanceof Error ? claudeError.constructor.name : typeof claudeError
          });
          
          // Try Grok as fallback
          if (process.env.GROK_API_KEY) {
            console.log('🔄 [GEMINI TEXT GENERATION] Trying Grok fallback...');
            try {
              return await this.generateGrokText(prompt, maxTokens);
            } catch (grokError) {
              console.error('❌ [GEMINI TEXT GENERATION] Grok generation also failed:', {
                grokError: grokError instanceof Error ? grokError.message : 'Unknown error'
              });
              // Try GROQ as final fallback
              if (process.env.GROQ_API_KEY) {
                console.log('🔄 [GEMINI TEXT GENERATION] Trying GROQ fallback...');
                try {
                  return await this.generateGroqText(prompt, maxTokens);
                } catch (groqError) {
                  console.error('❌ [GEMINI TEXT GENERATION] GROQ generation also failed:', {
                    groqError: groqError instanceof Error ? groqError.message : 'Unknown error'
                  });
                  throw new Error('All AI services failed');
                }
              }
              throw new Error('All AI services failed');
            }
          }
          
          throw new Error('Both Gemini and Claude failed');
        }
      }
      
      // If no Claude, try Grok directly
      if (process.env.GROK_API_KEY) {
        console.log('🔄 [GEMINI TEXT GENERATION] No Claude API key, trying Grok fallback...');
        try {
          return await this.generateGrokText(prompt, maxTokens);
        } catch (grokError) {
          console.error('❌ [GEMINI TEXT GENERATION] Grok generation failed:', {
            grokError: grokError instanceof Error ? grokError.message : 'Unknown error'
          });
          // Try GROQ as final fallback
          if (process.env.GROQ_API_KEY) {
            console.log('🔄 [GEMINI TEXT GENERATION] Trying GROQ fallback...');
            try {
              return await this.generateGroqText(prompt, maxTokens);
            } catch (groqError) {
              console.error('❌ [GEMINI TEXT GENERATION] GROQ generation also failed:', {
                groqError: groqError instanceof Error ? groqError.message : 'Unknown error'
              });
              throw new Error('AI generation failed');
            }
          }
      throw new Error('AI generation failed');
    }
      }
      
      console.error('❌ [GEMINI TEXT GENERATION] No fallback API keys available, throwing error');
      throw new Error('AI generation failed');
    }
  }
  */

  // Generate text using Grok
  private async generateGrokText(prompt: string, maxTokens: number = 1000): Promise<string> {
    console.log('🤖 [GROK TEXT GENERATION] Starting Grok text generation:', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + '...',
      maxTokens
    });
    
    try {
      if (!process.env.GROK_API_KEY) {
        console.error('❌ [GROK TEXT GENERATION] GROK_API_KEY environment variable is not set');
        throw new Error('Grok API key not configured');
      }

      console.log('🔑 [GROK TEXT GENERATION] Grok API key is configured, length:', process.env.GROK_API_KEY.length);
      
      // Try different Grok models in order of preference
      const models = ['grok-2-1212', 'grok-beta', 'grok-vision-beta', 'grok-2'];
      
      for (const model of models) {
        try {
          console.log(`🤖 [GROK TEXT GENERATION] Trying model: ${model}`);
          
          const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: maxTokens
            }),
          });

          console.log(`🤖 [GROK TEXT GENERATION] Grok API response status for ${model}:`, response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`⚠️ [GROK TEXT GENERATION] Model ${model} failed:`, {
              status: response.status,
              statusText: response.statusText,
              errorText: errorText
            });
            
            // If it's a credits issue, try next model
            if (response.status === 403 && errorText.includes('credits')) {
              console.log(`🔄 [GROK TEXT GENERATION] Credits issue with ${model}, trying next model...`);
              continue;
            }
            
            // If it's a model not found error, try next model
            if (response.status === 400 && errorText.includes('model')) {
              console.log(`🔄 [GROK TEXT GENERATION] Model ${model} not found, trying next model...`);
              continue;
            }
            
            throw new Error(`Grok API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          const generatedText = data.choices[0]?.message?.content?.trim();
          
          if (!generatedText) {
            console.log(`⚠️ [GROK TEXT GENERATION] No content generated by ${model}, trying next model...`);
            continue;
          }

          console.log(`✅ [GROK TEXT GENERATION] Successfully generated text with ${model}:`, {
            textLength: generatedText.length,
            textPreview: generatedText.substring(0, 100) + '...'
          });
          
          return generatedText;
          
        } catch (modelError) {
          console.log(`⚠️ [GROK TEXT GENERATION] Model ${model} failed:`, {
            error: modelError instanceof Error ? modelError.message : 'Unknown error'
          });
          
          // If this is the last model, throw the error
          if (model === models[models.length - 1]) {
            throw modelError;
          }
          
          // Otherwise, try the next model
          console.log(`🔄 [GROK TEXT GENERATION] Trying next model...`);
          continue;
        }
      }
      
      // If we get here, all models failed
      throw new Error('All Grok models failed');
      
    } catch (error) {
      console.error('❌ [GROK TEXT GENERATION] Error in Grok text generation:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      throw new Error('Grok text generation failed');
    }
  }

  // Generate text using GROQ
  private async generateGroqText(prompt: string, maxTokens: number = 1000): Promise<string> {
    console.log('🤖 [GROQ TEXT GENERATION] Starting GROQ text generation:', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + '...',
      maxTokens
    });
    
    try {
      if (!process.env.GROQ_API_KEY) {
        console.error('❌ [GROQ TEXT GENERATION] GROQ_API_KEY environment variable is not set');
        throw new Error('GROQ API key not configured');
      }

      // Check rate limit
      if (!rateLimiter.canMakeCall('groq')) {
        console.log('⚠️ [GROQ TEXT GENERATION] Rate limit exceeded, skipping GROQ...');
        throw new Error('Rate limit exceeded');
      }

      console.log('🔑 [GROQ TEXT GENERATION] GROQ API key is configured, length:', process.env.GROQ_API_KEY.length);
      
      // Try different GROQ models in order of preference
      const models = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
      
      for (const model of models) {
        try {
          console.log(`🤖 [GROQ TEXT GENERATION] Trying model: ${model}`);
          
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: maxTokens
            }),
          });

          console.log(`🤖 [GROQ TEXT GENERATION] GROQ API response status for ${model}:`, response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`⚠️ [GROQ TEXT GENERATION] Model ${model} failed:`, {
              status: response.status,
              statusText: response.statusText,
              errorText: errorText
            });
            
            // If it's a rate limit error, try next model
            if (response.status === 429) {
              console.log(`🔄 [GROQ TEXT GENERATION] Rate limit with ${model}, trying next model...`);
              continue;
            }
            
            // If it's a model not found error, try next model
            if (response.status === 400 && errorText.includes('model')) {
              console.log(`🔄 [GROQ TEXT GENERATION] Model ${model} not found, trying next model...`);
              continue;
            }
            
            throw new Error(`GROQ API error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          const generatedText = data.choices[0]?.message?.content?.trim();
          
          if (!generatedText) {
            console.log(`⚠️ [GROQ TEXT GENERATION] No content generated by ${model}, trying next model...`);
            continue;
          }

          console.log(`✅ [GROQ TEXT GENERATION] Successfully generated text with ${model}:`, {
            textLength: generatedText.length,
            textPreview: generatedText.substring(0, 100) + '...'
          });
          
          return generatedText;
          
        } catch (modelError) {
          console.log(`⚠️ [GROQ TEXT GENERATION] Model ${model} failed:`, {
            error: modelError instanceof Error ? modelError.message : 'Unknown error'
          });
          
          // If this is the last model, throw the error
          if (model === models[models.length - 1]) {
            throw modelError;
          }
          
          // Otherwise, try the next model
          console.log(`🔄 [GROQ TEXT GENERATION] Trying next model...`);
          continue;
        }
      }
      
      // If we get here, all models failed
      throw new Error('All GROQ models failed');
      
    } catch (error) {
      console.error('❌ [GROQ TEXT GENERATION] Error in GROQ text generation:');
      console.error('  Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('  Error type:', error instanceof Error ? error.constructor.name : typeof error);
      if (error instanceof Error && error.stack) {
        console.error('  Stack trace:', error.stack);
      }
      throw new Error('GROQ text generation failed');
    }
  }

  // Generate a simple hash-based embedding as fallback when all AI services fail
  /* COMMENTED OUT - Using only GROQ now
  private generateHashBasedEmbedding(text: string): number[] {
    console.log('🔢 [HASH EMBEDDING] Generating enhanced hash-based embedding for comprehensive text:', text.substring(0, 100) + '...');
    
    // Create a simple hash-based embedding - use 768 dimensions to match Pinecone index
    const embedding = new Array(768).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    // Enhanced farming/agriculture keywords for better categorization
    const farmingKeywords = [
      'farming', 'farm', 'agriculture', 'agricultural', 'agritech', 'agri-tech',
      'crop', 'crops', 'livestock', 'dairy', 'poultry', 'harvest',
      'soil', 'irrigation', 'fertilizer', 'seed', 'seeds', 'plant', 'plants',
      'greenhouse', 'organic', 'sustainable', 'food', 'produce',
      'farmer', 'farmers', 'rural', 'agribusiness', 'agro', 'agro-tech',
      'cattle', 'sheep', 'goat', 'chicken', 'pig', 'cow', 'horse',
      'wheat', 'corn', 'rice', 'soybean', 'potato', 'tomato', 'lettuce',
      'tractor', 'machinery', 'equipment', 'technology', 'innovation'
    ];
    
    // Business and startup context keywords
    const businessKeywords = [
      'startup', 'company', 'business', 'enterprise', 'solution', 'platform',
      'marketplace', 'app', 'application', 'software', 'technology',
      'funding', 'investment', 'venture', 'capital', 'seed', 'series',
      'team', 'founder', 'ceo', 'co-founder', 'employees', 'staff'
    ];
    
    // Category-specific keywords
    const categoryKeywords = [
      'agritech', 'fintech', 'edtech', 'healthtech', 'cleantech',
      'ecommerce', 'saas', 'b2b', 'b2c', 'mobile', 'web', 'ai', 'ml'
    ];
    
    words.forEach((word, wordIndex) => {
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
      }
      
      // Enhanced weighting based on keyword categories
      let weightMultiplier = 1.0;
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      
      if (farmingKeywords.includes(cleanWord)) {
        weightMultiplier = 3.0; // Triple weight for farming words
      } else if (businessKeywords.includes(cleanWord)) {
        weightMultiplier = 1.5; // 1.5x weight for business context
      } else if (categoryKeywords.includes(cleanWord)) {
        weightMultiplier = 2.0; // Double weight for category words
      }
      
      // Position-based weighting (earlier words are more important)
      const positionWeight = 1 / (wordIndex + 1);
      
      // Distribute hash across embedding dimensions
      const numDimensions = Math.min(15, Math.max(1, Math.floor(word.length / 2)));
      for (let i = 0; i < numDimensions; i++) {
        const dimension = Math.abs(hash + i * 1000) % 768;
        const value = (Math.sin(hash + i) * 0.5 + 0.5) * 2 - 1; // Normalize to [-1, 1]
        embedding[dimension] += value * positionWeight * weightMultiplier;
      }
    });
    
    // Add semantic context based on text structure
    this.addSemanticContext(embedding, text);
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] = embedding[i] / magnitude;
      }
    }
    
    console.log('✅ [HASH EMBEDDING] Generated enhanced hash-based embedding, dimensions:', embedding.length, 'text length:', text.length);
    return embedding;
  }
  */

  /* COMMENTED OUT - Using only GROQ now
  // Add semantic context to hash-based embeddings
  private addSemanticContext(embedding: number[], text: string): void {
    // Detect farming/agriculture context
    const farmingContext = /farming|agriculture|agritech|crop|livestock|farm/i.test(text);
    if (farmingContext) {
      // Boost farming-related dimensions
      for (let i = 0; i < 50; i++) {
        embedding[i] += 0.1 * Math.sin(i);
      }
    }
    
    // Detect business context
    const businessContext = /startup|company|business|platform|marketplace/i.test(text);
    if (businessContext) {
      // Boost business-related dimensions
      for (let i = 50; i < 100; i++) {
        embedding[i] += 0.1 * Math.cos(i);
      }
    }
    
    // Detect technology context
    const techContext = /technology|software|app|ai|ml|data/i.test(text);
    if (techContext) {
      // Boost tech-related dimensions
      for (let i = 100; i < 150; i++) {
        embedding[i] += 0.1 * Math.sin(i * 0.5);
      }
    }
  }
  */

  // Enhanced text preprocessing for better embeddings
  private preprocessText(text: string): string {
    if (!text) {
      console.log('🧹 [PREPROCESS TEXT] Empty text provided, returning empty string');
      return '';
    }
    
    const originalLength = text.length;
    let processed = text;
    
    // Step 1: Remove markdown formatting while preserving content
    processed = processed
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold, keep content
      .replace(/\*(.*?)\*/g, '$1') // Remove italic, keep content
      .replace(/`(.*?)`/g, '$1') // Remove code, keep content
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/[#*`\[\]()]/g, '') // Remove remaining markdown chars
      .replace(/_{1,2}(.*?)_{1,2}/g, '$1') // Remove underline formatting
      .replace(/~~(.*?)~~/g, '$1'); // Remove strikethrough
    
    // Step 2: Remove HTML tags and entities
    processed = processed
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Step 3: Remove URLs but preserve domain names for context
    processed = processed
      .replace(/https?:\/\/[^\s]+/g, (match) => {
        try {
          const url = new URL(match);
          return url.hostname.replace(/^www\./, '');
        } catch {
          return '';
        }
      })
      .replace(/www\.[^\s]+/g, (match) => match.replace('www.', ''));
    
    // Step 4: Normalize whitespace and special characters
    processed = processed
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\-.,!?]/g, ' ') // Remove special chars except basic punctuation
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .trim();
    
    // Step 5: Remove common noise words and phrases (enhanced list)
    const noiseWords = [
      // Basic noise
      'hello', 'hi', 'hey', 'test', 'testing', 'demo', 'example', 'sample',
      'holaa', 'amigo', 'yellow', 'helllo', 'world',
      'where', 'is', 'the', 'library', 'biblioteca',
      // Common stop words that don't add semantic value
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'under',
      // Redundant phrases
      'please', 'thank you', 'thanks', 'sorry', 'excuse me',
      'i think', 'i believe', 'i feel', 'in my opinion',
      'as you can see', 'as mentioned', 'as stated', 'as shown',
      'it is', 'there is', 'there are', 'this is', 'that is',
      'very', 'really', 'quite', 'rather', 'somewhat', 'pretty',
      'just', 'simply', 'basically', 'essentially', 'fundamentally'
    ];
    
    // Remove noise words while preserving important context
    const words = processed.split(' ');
    const filteredWords = words.filter(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      return cleanWord.length > 2 && !noiseWords.includes(cleanWord);
    });
    
    processed = filteredWords.join(' ');
    
    // Step 6: Handle contractions and abbreviations
    const contractions = {
      "don't": "do not", "won't": "will not", "can't": "cannot",
      "isn't": "is not", "aren't": "are not", "wasn't": "was not",
      "weren't": "were not", "hasn't": "has not", "haven't": "have not",
      "hadn't": "had not", "doesn't": "does not", "didn't": "did not",
      "wouldn't": "would not", "couldn't": "could not", "shouldn't": "should not",
      "i'm": "i am", "you're": "you are", "he's": "he is", "she's": "she is",
      "it's": "it is", "we're": "we are", "they're": "they are",
      "i've": "i have", "you've": "you have", "we've": "we have",
      "they've": "they have", "i'll": "i will", "you'll": "you will",
      "he'll": "he will", "she'll": "she will", "we'll": "we will",
      "they'll": "they will", "i'd": "i would", "you'd": "you would",
      "he'd": "he would", "she'd": "she would", "we'd": "we would",
      "they'd": "they would"
    };
    
    Object.entries(contractions).forEach(([contraction, expansion]) => {
      const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
      processed = processed.replace(regex, expansion);
    });
    
    // Step 7: Final cleanup
    processed = processed
      .replace(/\s+/g, ' ') // Final whitespace normalization
      .trim();
    
    console.log('🧹 [PREPROCESS TEXT] Enhanced text preprocessing completed:', {
      originalLength,
      processedLength: processed.length,
      reduction: ((originalLength - processed.length) / originalLength * 100).toFixed(1) + '%',
      originalPreview: text.substring(0, 50) + '...',
      processedPreview: processed.substring(0, 50) + '...'
    });
    
    return processed;
  }

  // Create comprehensive high-quality text content for embeddings with enhanced context
  private createEmbeddingText(startup: any): string {
    const parts: string[] = [];
    
    // Core startup information with semantic context
    if (startup.title) {
      const title = this.preprocessText(String(startup.title));
      parts.push(`Startup: ${title}`);
      
      // Add semantic context based on title keywords
      const titleKeywords = this.extractSemanticKeywords(title);
      if (titleKeywords.length > 0) {
        parts.push(`Keywords: ${titleKeywords.join(', ')}`);
      }
    }
    
    // Enhanced category with related terms
    if (startup.category) {
      const category = this.preprocessText(String(startup.category));
      parts.push(`Category: ${category}`);
      
      // Add category-related semantic terms
      const categoryTerms = this.getCategorySemanticTerms(category);
      if (categoryTerms.length > 0) {
        parts.push(`Related: ${categoryTerms.join(', ')}`);
      }
    }
    
    // Enhanced description with key concepts
    if (startup.description) {
      const cleanDesc = this.preprocessText(String(startup.description));
      if (cleanDesc.length > 10) {
        parts.push(`Description: ${cleanDesc}`);
        
        // Extract key concepts from description
        const concepts = this.extractKeyConcepts(cleanDesc);
        if (concepts.length > 0) {
          parts.push(`Concepts: ${concepts.join(', ')}`);
        }
      }
    }
    
    // Enhanced pitch with business context
    if (startup.pitch) {
      const cleanPitch = this.preprocessText(String(startup.pitch));
      if (cleanPitch.length > 10) {
        parts.push(`Pitch: ${cleanPitch}`);
        
        // Extract business model indicators
        const businessModel = this.extractBusinessModel(cleanPitch);
        if (businessModel.length > 0) {
          parts.push(`Business Model: ${businessModel.join(', ')}`);
        }
      }
    }
    
    // Enhanced tags with semantic expansion
    if (startup.tags && Array.isArray(startup.tags) && startup.tags.length > 0) {
      const cleanTags = startup.tags.map((t: any) => this.preprocessText(String(t)));
      parts.push(`Tags: ${cleanTags.join(', ')}`);
      
      // Add semantic tag expansions
      const expandedTags = this.expandTagsSemantically(cleanTags);
      if (expandedTags.length > 0) {
        parts.push(`Related Tags: ${expandedTags.join(', ')}`);
      }
    }
    
    // Author with credibility context
    if (startup.author?.name) {
      const author = this.preprocessText(String(startup.author.name));
      parts.push(`Founder: ${author}`);
    }
    
    // Enhanced status and funding with business context
    if (startup.status) {
      const status = this.preprocessText(String(startup.status));
      parts.push(`Status: ${status}`);
      
      // Add status-related context
      const statusContext = this.getStatusContext(status);
      if (statusContext) {
        parts.push(`Stage: ${statusContext}`);
      }
    }
    
    if (startup.fundingStage) {
      const fundingStage = this.preprocessText(String(startup.fundingStage));
      parts.push(`Funding: ${fundingStage}`);
      
      // Add funding context
      const fundingContext = this.getFundingContext(fundingStage);
      if (fundingContext) {
        parts.push(`Investment: ${fundingContext}`);
      }
    }
    
    // Team and location with market context
    if (startup.teamSize) {
      const teamSize = this.preprocessText(String(startup.teamSize));
      parts.push(`Team: ${teamSize}`);
      
      // Add team size context
      const teamContext = this.getTeamSizeContext(teamSize);
      if (teamContext) {
        parts.push(`Size: ${teamContext}`);
      }
    }
    
    if (startup.location) {
      const location = this.preprocessText(String(startup.location));
      parts.push(`Location: ${location}`);
      
      // Add location context
      const locationContext = this.getLocationContext(location);
      if (locationContext) {
        parts.push(`Market: ${locationContext}`);
      }
    }
    
    // Enhanced engagement metrics with performance context
    const views = typeof startup.views === 'number' ? startup.views : 0;
    const likes = typeof startup.likes === 'number' ? startup.likes : 0;
    const dislikes = typeof startup.dislikes === 'number' ? startup.dislikes : 0;
    
    if (views || likes) {
      parts.push(`Engagement: ${views} views, ${likes} likes`);
      
      // Add engagement context
      const engagementContext = this.getEngagementContext(views, likes, dislikes);
      if (engagementContext) {
        parts.push(`Performance: ${engagementContext}`);
      }
    }
    
    // Enhanced website with domain context
    if (startup.website) {
      try {
        const url = String(startup.website).trim();
        const hostname = url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        if (hostname) {
          parts.push(`Website: ${hostname}`);
          
          // Add domain context
          const domainContext = this.getDomainContext(hostname);
          if (domainContext) {
            parts.push(`Platform: ${domainContext}`);
          }
        }
      } catch {}
    }

    // Enhanced social links with platform context
    if (startup.socialLinks && Array.isArray(startup.socialLinks)) {
      const domains: string[] = [];
      const platforms: string[] = [];
      
      for (const link of startup.socialLinks) {
        if (!link) continue;
        const val = typeof link === 'string' ? link : (link.url || link.href || link.link || '');
        if (!val) continue;
        const hostname = String(val).replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        if (hostname) {
          domains.push(hostname);
          const platform = this.getSocialPlatformContext(hostname);
          if (platform) platforms.push(platform);
        }
      }
      
      if (domains.length > 0) {
        parts.push(`Social: ${Array.from(new Set(domains)).join(', ')}`);
        if (platforms.length > 0) {
          parts.push(`Platforms: ${Array.from(new Set(platforms)).join(', ')}`);
        }
      }
    }

    // Enhanced date with temporal context
    if (startup._createdAt) {
      try {
        const date = new Date(startup._createdAt);
        if (!isNaN(date.getTime())) {
          parts.push(`Created: ${date.toISOString().split('T')[0]}`);
          
          // Add temporal context
          const temporalContext = this.getTemporalContext(date);
          if (temporalContext) {
            parts.push(`Timeline: ${temporalContext}`);
          }
        }
      } catch {}
    }
    
    const comprehensiveText = parts.join('. ');
    console.log('📝 [EMBEDDING TEXT] Created enhanced comprehensive text:', {
      startupId: startup._id,
      title: startup.title,
      textLength: comprehensiveText.length,
      partsCount: parts.length,
      textPreview: comprehensiveText.substring(0, 200) + '...'
    });
    
    return comprehensiveText;
  }

  // Helper methods for enhanced semantic context extraction
  
  // Extract semantic keywords from text
  private extractSemanticKeywords(text: string): string[] {
    const keywords: string[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Business and startup related keywords
    const businessKeywords = [
      'startup', 'company', 'business', 'enterprise', 'platform', 'solution',
      'technology', 'innovation', 'disruptive', 'scalable', 'sustainable',
      'marketplace', 'saas', 'b2b', 'b2c', 'mobile', 'web', 'app', 'software'
    ];
    
    // Technology keywords
    const techKeywords = [
      'ai', 'artificial intelligence', 'ml', 'machine learning', 'data',
      'analytics', 'cloud', 'saas', 'api', 'blockchain', 'crypto',
      'iot', 'internet of things', 'ar', 'vr', 'augmented reality', 'virtual reality'
    ];
    
    // Industry keywords
    const industryKeywords = [
      'fintech', 'edtech', 'healthtech', 'agritech', 'cleantech', 'proptech',
      'ecommerce', 'retail', 'logistics', 'transportation', 'mobility',
      'education', 'healthcare', 'finance', 'banking', 'insurance'
    ];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3) {
        if (businessKeywords.includes(cleanWord) || 
            techKeywords.includes(cleanWord) || 
            industryKeywords.includes(cleanWord)) {
          keywords.push(cleanWord);
        }
      }
    });
    
    return [...new Set(keywords)]; // Remove duplicates
  }
  
  // Get category-related semantic terms
  private getCategorySemanticTerms(category: string): string[] {
    const categoryMap: { [key: string]: string[] } = {
      'fintech': ['finance', 'banking', 'payments', 'crypto', 'blockchain', 'investment'],
      'edtech': ['education', 'learning', 'training', 'courses', 'academy', 'school'],
      'healthtech': ['healthcare', 'medical', 'wellness', 'fitness', 'therapy', 'diagnosis'],
      'agritech': ['agriculture', 'farming', 'crops', 'livestock', 'sustainable', 'organic'],
      'cleantech': ['sustainability', 'renewable', 'energy', 'environment', 'green', 'carbon'],
      'proptech': ['real estate', 'property', 'construction', 'housing', 'smart buildings'],
      'ecommerce': ['retail', 'shopping', 'marketplace', 'commerce', 'sales', 'inventory'],
      'mobility': ['transportation', 'logistics', 'delivery', 'ride-sharing', 'autonomous'],
      'social': ['community', 'networking', 'communication', 'messaging', 'social media']
    };
    
    const lowerCategory = category.toLowerCase();
    for (const [key, terms] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key)) {
        return terms;
      }
    }
    
    return [];
  }
  
  // Extract key concepts from description
  private extractKeyConcepts(text: string): string[] {
    const concepts: string[] = [];
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      if (words.length > 5) { // Only process substantial sentences
        // Look for concept indicators
        const conceptIndicators = [
          'enables', 'provides', 'offers', 'delivers', 'creates', 'builds',
          'solves', 'addresses', 'improves', 'enhances', 'optimizes',
          'revolutionizes', 'transforms', 'disrupts', 'innovates'
        ];
        
        conceptIndicators.forEach(indicator => {
          if (sentence.toLowerCase().includes(indicator)) {
            // Extract the concept after the indicator
            const parts = sentence.toLowerCase().split(indicator);
            if (parts.length > 1) {
              const concept = parts[1].trim().split(/[.!?]/)[0];
              if (concept.length > 5 && concept.length < 100) {
                concepts.push(concept);
              }
            }
          }
        });
      }
    });
    
    return [...new Set(concepts)].slice(0, 5); // Limit to 5 concepts
  }
  
  // Extract business model indicators
  private extractBusinessModel(text: string): string[] {
    const models: string[] = [];
    const lowerText = text.toLowerCase();
    
    const businessModelMap = {
      'subscription': ['subscription', 'recurring', 'monthly', 'annual'],
      'marketplace': ['marketplace', 'platform', 'connecting', 'matching'],
      'saas': ['software as a service', 'cloud-based', 'web-based'],
      'freemium': ['freemium', 'free tier', 'premium features'],
      'advertising': ['advertising', 'ads', 'sponsored', 'revenue from ads'],
      'transaction': ['transaction', 'commission', 'fee', 'percentage'],
      'licensing': ['licensing', 'license', 'ip', 'intellectual property']
    };
    
    Object.entries(businessModelMap).forEach(([model, indicators]) => {
      if (indicators.some(indicator => lowerText.includes(indicator))) {
        models.push(model);
      }
    });
    
    return models;
  }
  
  // Expand tags semantically
  private expandTagsSemantically(tags: string[]): string[] {
    const expansions: string[] = [];
    
    const tagExpansions: { [key: string]: string[] } = {
      'ai': ['artificial intelligence', 'machine learning', 'automation'],
      'ml': ['machine learning', 'data science', 'predictive analytics'],
      'blockchain': ['cryptocurrency', 'defi', 'smart contracts', 'web3'],
      'mobile': ['ios', 'android', 'mobile app', 'smartphone'],
      'web': ['website', 'web application', 'frontend', 'backend'],
      'saas': ['software as a service', 'cloud', 'subscription'],
      'b2b': ['business to business', 'enterprise', 'corporate'],
      'b2c': ['business to consumer', 'retail', 'consumer'],
      'fintech': ['financial technology', 'payments', 'banking'],
      'healthtech': ['healthcare technology', 'medical', 'wellness']
    };
    
    tags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      if (tagExpansions[lowerTag]) {
        expansions.push(...tagExpansions[lowerTag]);
      }
    });
    
    return [...new Set(expansions)];
  }
  
  // Get status context
  private getStatusContext(status: string): string | null {
    const statusMap: { [key: string]: string } = {
      'active': 'operational startup',
      'launched': 'recently launched',
      'beta': 'in beta testing',
      'pre-launch': 'preparing to launch',
      'fundraising': 'seeking investment',
      'scaling': 'growth phase',
      'pivoting': 'changing direction'
    };
    
    const lowerStatus = status.toLowerCase();
    for (const [key, context] of Object.entries(statusMap)) {
      if (lowerStatus.includes(key)) {
        return context;
      }
    }
    
    return null;
  }
  
  // Get funding context
  private getFundingContext(fundingStage: string): string | null {
    const fundingMap: { [key: string]: string } = {
      'pre-seed': 'early stage startup',
      'seed': 'seed funded startup',
      'series a': 'series a funded',
      'series b': 'series b funded',
      'series c': 'series c funded',
      'ipo': 'public company',
      'acquired': 'acquired company'
    };
    
    const lowerFunding = fundingStage.toLowerCase();
    for (const [key, context] of Object.entries(fundingMap)) {
      if (lowerFunding.includes(key)) {
        return context;
      }
    }
    
    return null;
  }
  
  // Get team size context
  private getTeamSizeContext(teamSize: string): string | null {
    const size = parseInt(teamSize);
    if (isNaN(size)) return null;
    
    if (size <= 2) return 'solo founder or small team';
    if (size <= 5) return 'small startup team';
    if (size <= 10) return 'growing startup team';
    if (size <= 25) return 'medium startup team';
    if (size <= 50) return 'established startup team';
    return 'large startup team';
  }
  
  // Get location context
  private getLocationContext(location: string): string | null {
    const locationMap: { [key: string]: string } = {
      'san francisco': 'silicon valley startup',
      'new york': 'nyc startup',
      'london': 'london startup',
      'berlin': 'berlin startup',
      'singapore': 'singapore startup',
      'tel aviv': 'israeli startup',
      'bangalore': 'indian startup',
      'toronto': 'canadian startup'
    };
    
    const lowerLocation = location.toLowerCase();
    for (const [key, context] of Object.entries(locationMap)) {
      if (lowerLocation.includes(key)) {
        return context;
      }
    }
    
    return null;
  }
  
  // Get engagement context
  private getEngagementContext(views: number, likes: number, dislikes: number): string | null {
    const totalEngagement = likes + dislikes;
    const engagementRate = totalEngagement > 0 ? likes / totalEngagement : 0;
    
    if (views > 1000 && engagementRate > 0.8) return 'highly popular startup';
    if (views > 500 && engagementRate > 0.7) return 'popular startup';
    if (views > 100 && engagementRate > 0.6) return 'growing startup';
    if (views > 50) return 'emerging startup';
    return 'new startup';
  }
  
  // Get domain context
  private getDomainContext(hostname: string): string | null {
    const domainMap: { [key: string]: string } = {
      'github.com': 'open source project',
      'linkedin.com': 'professional network',
      'twitter.com': 'social media presence',
      'medium.com': 'content marketing',
      'youtube.com': 'video content',
      'instagram.com': 'visual content'
    };
    
    for (const [domain, context] of Object.entries(domainMap)) {
      if (hostname.includes(domain)) {
        return context;
      }
    }
    
    return null;
  }
  
  // Get social platform context
  private getSocialPlatformContext(hostname: string): string | null {
    const platformMap: { [key: string]: string } = {
      'twitter.com': 'twitter',
      'linkedin.com': 'linkedin',
      'facebook.com': 'facebook',
      'instagram.com': 'instagram',
      'youtube.com': 'youtube',
      'tiktok.com': 'tiktok',
      'discord.gg': 'discord',
      'slack.com': 'slack'
    };
    
    for (const [domain, platform] of Object.entries(platformMap)) {
      if (hostname.includes(domain)) {
        return platform;
      }
    }
    
    return null;
  }
  
  // Get temporal context
  private getTemporalContext(date: Date): string | null {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'very recent startup';
    if (diffDays <= 30) return 'recent startup';
    if (diffDays <= 90) return 'new startup';
    if (diffDays <= 365) return 'young startup';
    if (diffDays <= 730) return 'established startup';
    return 'mature startup';
  }
  
  // Expand query with synonyms and related terms
  private expandQuery(query: string): string {
    const words = query.toLowerCase().split(/\s+/);
    const expandedTerms: string[] = [];
    
    // Add original terms
    expandedTerms.push(...words);
    
    // Technology and business term expansions
    const termExpansions: { [key: string]: string[] } = {
      // AI/ML terms
      'ai': ['artificial intelligence', 'machine learning', 'automation', 'intelligent'],
      'ml': ['machine learning', 'data science', 'predictive analytics', 'ai'],
      'artificial intelligence': ['ai', 'machine learning', 'automation', 'intelligent systems'],
      'machine learning': ['ml', 'ai', 'data science', 'predictive analytics'],
      
      // Business terms
      'startup': ['company', 'business', 'venture', 'enterprise', 'firm'],
      'company': ['startup', 'business', 'enterprise', 'organization', 'firm'],
      'business': ['company', 'startup', 'enterprise', 'organization', 'venture'],
      'platform': ['service', 'solution', 'system', 'application', 'software'],
      'solution': ['platform', 'service', 'system', 'application', 'tool'],
      
      // Industry terms
      'fintech': ['financial technology', 'finance', 'banking', 'payments', 'fintech'],
      'edtech': ['education technology', 'education', 'learning', 'training', 'edtech'],
      'healthtech': ['healthcare technology', 'healthcare', 'medical', 'wellness', 'healthtech'],
      'agritech': ['agriculture technology', 'agriculture', 'farming', 'agritech'],
      'cleantech': ['clean technology', 'sustainability', 'renewable', 'green', 'cleantech'],
      
      // Technology terms
      'blockchain': ['cryptocurrency', 'crypto', 'defi', 'web3', 'distributed ledger'],
      'crypto': ['cryptocurrency', 'blockchain', 'defi', 'web3', 'digital currency'],
      'saas': ['software as a service', 'cloud software', 'subscription software'],
      'mobile': ['mobile app', 'smartphone', 'ios', 'android', 'mobile application'],
      'web': ['website', 'web application', 'online', 'internet', 'web-based'],
      
      // Business model terms
      'marketplace': ['platform', 'exchange', 'trading', 'commerce', 'market'],
      'subscription': ['recurring', 'monthly', 'annual', 'membership', 'subscription model'],
      'freemium': ['free tier', 'premium', 'freemium model', 'free version'],
      
      // Engagement terms
      'popular': ['trending', 'viral', 'successful', 'well-known', 'famous'],
      'new': ['recent', 'latest', 'fresh', 'emerging', 'upcoming'],
      'innovative': ['creative', 'novel', 'revolutionary', 'cutting-edge', 'advanced']
    };
    
    // Expand each word with related terms
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 2) {
        if (termExpansions[cleanWord]) {
          expandedTerms.push(...termExpansions[cleanWord]);
        }
        
        // Add partial matches for compound terms
        Object.entries(termExpansions).forEach(([key, expansions]) => {
          if (key.includes(cleanWord) || cleanWord.includes(key)) {
            expandedTerms.push(...expansions);
          }
        });
      }
    });
    
    // Add category-specific expansions based on query context
    const categoryExpansions = this.getCategoryExpansions(query);
    expandedTerms.push(...categoryExpansions);
    
    // Remove duplicates and limit to reasonable size
    const uniqueTerms = [...new Set(expandedTerms)];
    const finalTerms = uniqueTerms.slice(0, 20); // Limit to 20 terms max
    
    const expandedQuery = finalTerms.join(' ');
    
    console.log('🔍 [QUERY EXPANSION] Query expansion completed:', {
      originalQuery: query,
      expandedQuery,
      termCount: finalTerms.length,
      originalTerms: words.length
    });
    
    return expandedQuery;
  }
  
  // Get category-specific expansions based on query context
  private getCategoryExpansions(query: string): string[] {
    const expansions: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Detect category and add relevant terms
    if (lowerQuery.includes('fintech') || lowerQuery.includes('finance') || lowerQuery.includes('banking')) {
      expansions.push('payments', 'crypto', 'investment', 'trading', 'wallet', 'lending');
    }
    
    if (lowerQuery.includes('edtech') || lowerQuery.includes('education') || lowerQuery.includes('learning')) {
      expansions.push('courses', 'training', 'academy', 'school', 'university', 'tutorial');
    }
    
    if (lowerQuery.includes('healthtech') || lowerQuery.includes('health') || lowerQuery.includes('medical')) {
      expansions.push('wellness', 'fitness', 'therapy', 'diagnosis', 'healthcare', 'medical');
    }
    
    if (lowerQuery.includes('agritech') || lowerQuery.includes('agriculture') || lowerQuery.includes('farming')) {
      expansions.push('crops', 'livestock', 'sustainable', 'organic', 'food', 'farming');
    }
    
    if (lowerQuery.includes('cleantech') || lowerQuery.includes('sustainability') || lowerQuery.includes('green')) {
      expansions.push('renewable', 'energy', 'environment', 'carbon', 'sustainable', 'green');
    }
    
    if (lowerQuery.includes('mobility') || lowerQuery.includes('transport') || lowerQuery.includes('logistics')) {
      expansions.push('delivery', 'ride-sharing', 'autonomous', 'logistics', 'transportation');
    }
    
    if (lowerQuery.includes('ecommerce') || lowerQuery.includes('retail') || lowerQuery.includes('shopping')) {
      expansions.push('marketplace', 'commerce', 'sales', 'inventory', 'retail', 'shopping');
    }
    
    if (lowerQuery.includes('social') || lowerQuery.includes('community') || lowerQuery.includes('networking')) {
      expansions.push('messaging', 'communication', 'social media', 'community', 'networking');
    }
    
    return expansions;
  }

  // Store startup vector in Pinecone
  async storeStartupVector(startup: any): Promise<void> {
    try {
      // Create high-quality text content for embedding
      const textContent = this.createEmbeddingText(startup);
      
      // Skip if content is too short or low quality
      if (textContent.length < 30) {
        return;
      }
      
      // Generate embedding
      const embedding = await this.generateEmbedding(textContent);
      
      // Store in Pinecone
      await index.upsert([{
        id: startup._id,
        values: embedding,
        metadata: {
          title: startup.title,
          description: startup.description,
          category: startup.category,
          pitch: startup.pitch,
          author: startup.author?.name || 'Unknown',
          createdAt: startup._createdAt,
          views: startup.views || 0,
          likes: startup.likes || 0,
          dislikes: startup.dislikes || 0,
          tags: Array.isArray(startup.tags) ? startup.tags : undefined,
          status: startup.status,
          fundingStage: startup.fundingStage,
          teamSize: startup.teamSize,
          location: startup.location,
          website: startup.website,
          socialLinks: startup.socialLinks,
          textContent: textContent, // Store the processed text for debugging
        }
      }]);
    } catch (error) {
      console.error('Error storing startup vector:', error);
      throw error;
    }
  }

  // Update startup vector in Pinecone
  async updateStartupVector(startupId: string, startup: any): Promise<void> {
    try {
      // Create high-quality text content for embedding
      const textContent = this.createEmbeddingText(startup);
      
      // Skip if content is too short or low quality
      if (textContent.length < 30) {
        return;
      }
      
      // Generate embedding
      const embedding = await this.generateEmbedding(textContent);
      
      // Update in Pinecone
      await index.upsert([{
        id: startupId,
        values: embedding,
        metadata: {
          title: startup.title,
          description: startup.description,
          category: startup.category,
          pitch: startup.pitch,
          author: startup.author?.name || 'Unknown',
          createdAt: startup._createdAt,
          views: startup.views || 0,
          likes: startup.likes || 0,
          dislikes: startup.dislikes || 0,
          tags: Array.isArray(startup.tags) ? startup.tags : undefined,
          status: startup.status,
          fundingStage: startup.fundingStage,
          teamSize: startup.teamSize,
          location: startup.location,
          website: startup.website,
          socialLinks: startup.socialLinks,
          textContent: textContent, // Store the processed text for debugging
        }
      }]);
    } catch (error) {
      console.error('Error updating startup vector:', error);
      throw error;
    }
  }

  // Delete startup vector from Pinecone
  async deleteStartupVector(startupId: string): Promise<void> {
    try {
      await index.deleteOne(startupId);
    } catch (error) {
      console.error('Error deleting startup vector:', error);
      throw error;
    }
  }

  // Enhanced semantic search with query expansion and hybrid matching
  async semanticSearch(query: string, limit: number = 10): Promise<any> {
    console.log('🔍 [ENHANCED SEMANTIC SEARCH] Starting enhanced semantic search:', { query, limit });
    
    try {
      // Clean and preprocess the query
      console.log('🧹 [ENHANCED SEMANTIC SEARCH] Preprocessing query...');
      const cleanQuery = this.preprocessText(query);
      console.log('🧹 [ENHANCED SEMANTIC SEARCH] Cleaned query:', cleanQuery);
      
      // Expand query with synonyms and related terms
      console.log('🔍 [ENHANCED SEMANTIC SEARCH] Expanding query with related terms...');
      const expandedQuery = this.expandQuery(cleanQuery);
      console.log('🔍 [ENHANCED SEMANTIC SEARCH] Expanded query:', expandedQuery);
      
      // Generate embedding for the expanded query using GROQ
      console.log('🤖 [ENHANCED SEMANTIC SEARCH] Generating GROQ embedding for expanded query...');
      const queryEmbedding = await this.generateEmbedding(expandedQuery);
      console.log('✅ [ENHANCED SEMANTIC SEARCH] GROQ embedding generated, dimensions:', queryEmbedding.length);
      
      // Search in Pinecone
      console.log('🌲 [GROQ SEMANTIC SEARCH] Searching Pinecone index...');
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: Math.min(limit * 2, 20),
        includeMetadata: true,
      });
      
      console.log('🌲 [GROQ SEMANTIC SEARCH] Pinecone search completed:', {
        matchesCount: searchResults.matches?.length || 0,
        topScore: searchResults.matches?.[0]?.score || 0,
        bottomScore: searchResults.matches?.[searchResults.matches.length - 1]?.score || 0
      });

      // Get full startup data from Sanity with enhanced ranking
      const startupIds = searchResults.matches?.map(match => match.id) || [];
      console.log('📊 [ENHANCED SEMANTIC SEARCH] Startup IDs from Pinecone:', startupIds);
      
      if (startupIds.length === 0) {
        console.log('❌ [ENHANCED SEMANTIC SEARCH] No startup IDs found, returning empty results');
        return {
          startups: [],
          reasons: ['No matching startups found'],
          confidence: 0,
        };
      }

      console.log('📊 [ENHANCED SEMANTIC SEARCH] Fetching startup data from Sanity...');
      const startups = await client.fetch(`
        *[_type == "startup" && _id in $startupIds] {
          _id,
          title,
          description,
          category,
          pitch,
          author->{name, username},
          _createdAt,
          views,
          likes,
          dislikes,
          "imageUrl": image.asset->url
        }
      `, { startupIds });
      
      console.log('📊 [GROQ SEMANTIC SEARCH] Sanity data fetched:', {
        startupsCount: startups?.length || 0,
        startupTitles: startups?.map(s => s.title) || []
      });

      // Add similarity scores and filter results
      console.log('🎯 [GROQ SEMANTIC SEARCH] Processing similarity scores...');
      let startupsWithSimilarity = startups
        .map(startup => {
          const match = searchResults.matches?.find(m => m.id === startup._id);
          return {
            ...startup,
            similarity: match?.score || 0,
          };
        })
        .filter(startup => {
          // Use an extremely low threshold for hash-based embeddings
          return startup.similarity > -0.1; // Very low threshold to catch DailyPay
        });

      // Apply basic keyword-based filtering for better relevance
      console.log('🔍 [GROQ SEMANTIC SEARCH] Applying keyword-based filtering...');
      const queryLower = cleanQuery.toLowerCase();
      
      // Define basic category keywords
      const categoryKeywords: Record<string, string[]> = {
        banking: ['banking', 'bank', 'finance', 'financial', 'fintech', 'payment', 'payments', 'money', 'currency', 'wallet', 'account', 'accounts', 'credit', 'debit', 'loan', 'investment', 'trading', 'stock', 'portfolio', 'dailypay', 'daily', 'pay'],
        farming: ['farming', 'farm', 'agriculture', 'agricultural', 'agritech', 'agri', 'agricult', 'agiculture', 'agriculure', 'crop', 'crops', 'livestock', 'dairy', 'poultry', 'harvest', 'soil', 'irrigation'],
        health: ['health', 'healthcare', 'telehealth', 'medical', 'medicine', 'doctor', 'patient', 'hospital', 'clinic', 'wellness', 'therapy', 'healthtech'],
        fitness: ['fitness','gym','workout','trainer','membership','member','class','schedule','attendance','billing','performance','coaching','exercise','studio','yoga','pilates','crossfit','personal training','sports club','management system','management software','crm','saas'],
        education: ['education', 'educational', 'learning', 'learn', 'teach', 'teaching', 'school', 'university', 'college', 'student', 'course', 'edtech'],
        design: ['design', 'designer', 'creative', 'art', 'ui', 'ux', 'graphic', 'visual', 'branding', 'logo', 'illustration', 'photography'],
        gaming: ['gaming', 'game', 'games', 'gamer', 'play', 'playing', 'entertainment', 'fun', 'arcade', 'console', 'esports', 'tournament'],
        ecommerce: ['ecommerce', 'e-commerce', 'commerce', 'shopping', 'shop', 'store', 'retail', 'marketplace', 'sell', 'buy', 'purchase', 'product'],
        social: ['social', 'social media', 'community', 'chat', 'messaging', 'communication', 'connect', 'network', 'friends', 'follow', 'post', 'share'],
        // User-defined taxonomy groups
        'ai-ml': ['ai', 'artificial intelligence', 'ml', 'machine learning', 'data science', 'computer vision', 'nlp', 'natural language processing', 'neural network', 'deep learning', 'recommendation system'],
        'saas': ['saas', 'software as a service', 'b2b software', 'enterprise software', 'crm', 'erp'],
        'dev-tools': ['developer tools', 'api', 'sdk', 'ci/cd', 'testing framework', 'devops', 'paas', 'iaas', 'platform as a service', 'infrastructure as a service', 'cloud', 'serverless'],
        'cybersecurity': ['cybersecurity', 'infosec', 'identity protection', 'zero-trust', 'encryption', 'threat detection'],
        'data-analytics': ['big data', 'analytics', 'data lake', 'business intelligence', 'data visualization', 'data pipeline'],
        'blockchain': ['blockchain', 'web3', 'defi', 'nft', 'dao', 'crypto', 'cryptocurrency', 'smart contract', 'wallet', 'layer 2'],
        'fintech': ['fintech', 'finance', 'financial', 'banking', 'bank', 'payment', 'insurtech', 'neobank', 'lending', 'investing', 'trading', 'stock', 'portfolio', 'wealthtech', 'accounting'],
        'hr-tech': ['hrtech', 'human resources', 'hiring', 'payroll', 'recruiting', 'talent management', 'future of work', 'remote work'],
        'legal-tech': ['legaltech', 'legal', 'contract automation', 'compliance', 'regulatory'],
        'ad-mar-tech': ['adtech', 'martech', 'advertising', 'marketing', 'personalization engine', 'influencer marketing', 'seo', 'analytics'],
        'social-community': ['social media', 'community', 'creator economy', 'networking', 'messaging', 'forum', 'collaboration'],
        'gaming-metaverse': ['gaming', 'game', 'esports', 'cloud gaming', 'gamefi', 'metaverse', 'ar', 'vr', 'xr', 'augmented reality', 'virtual reality'],
        'media-entertainment': ['streaming', 'entertainment', 'ott', 'music tech', 'podcasting', 'video editing', 'content creation'],
        'health-tech': ['healthtech', 'digital health', 'medical', 'healthcare', 'telehealth', 'telemedicine', 'biotech', 'pharma', 'emr', 'ehr', 'medical device', 'diagnostics'],
        'fitness-wellness': ['fitness', 'wellness', 'gym', 'workout', 'wearables', 'health tracking', 'nutrition', 'mental health', 'meditation', 'therapy'],
        'agritech': ['agritech', 'agtech', 'farming', 'farm', 'agriculture', 'foodtech', 'crop', 'livestock', 'supply chain', 'vertical farming', 'precision farming'],
        'logistics-mobility': ['logistics', 'supply chain', 'mobility', 'last-mile delivery', 'freight', 'transportation', 'electric vehicle', 'ev', 'autonomous vehicle', 'ride-sharing', 'micromobility'],
        'prop-con-tech': ['proptech', 'real estate', 'constructiontech', 'smart home', 'property management', 'modular construction'],
        'cleantech': ['cleantech', 'greentech', 'renewable energy', 'sustainability', 'climate tech', 'carbon capture', 'circular economy', 'energy storage'],
        'edtech': ['edtech', 'education', 'learning', 'lms', 'mooc', 'tutoring', 'corporate training', 'skill development'],
        'automation-robotics': ['automation', 'robotics', 'rpa', 'robotic process automation', 'workflow', 'orchestration', 'iot', 'drone', 'industrial robot', 'bpa'],
        'design-creative': ['design', 'creative', 'ui', 'ux', 'graphic design', 'prototyping', 'collaboration tool', 'figma', 'canva'],
        'social-impact': ['social impact', 'civictech', 'nonprofit', 'govtech', 'donation', 'poverty alleviation', 'education access', 'sustainability']
      };

      // Extend categories dynamically from comprehensive taxonomy list provided
      const extraCategoryNames = [
        'SaaS','PaaS','IaaS','AI','Machine Learning','Computer Vision','Natural Language Processing','Recommendation Systems',
        'Blockchain','Web3','DeFi','NFTs','DAOs','Crypto Wallets','Layer 2 Scaling',
        'AR','VR','XR','Metaverse',
        'Cybersecurity','Identity Protection','Zero-Trust Security',
        'Developer Tools','APIs','SDKs','CI/CD','Testing Frameworks',
        'Big Data','Analytics','Data Lakes',
        'Robotics','Automation','Industrial Robots','Drones','Autonomous Vehicles',
        'E-commerce','Marketplaces','Recommerce','B2B Marketplaces',
        'Social Media','Communities','Creator Economy',
        'Gaming','Esports','Cloud Gaming',
        'Travel','Hospitality','Booking Engines','Travel Experiences','Hotel Tech',
        'Fashion','Apparel','D2C Brands','Sustainable Fashion','Virtual Try-On',
        'Food','Beverage','Food Delivery','Alternative Proteins','Craft Beverages',
        'Health','Fitness','Telehealth','Fitness Apps','Mental Wellness','Supplements',
        'Home','Living','Smart Home','Interior Design Platforms',
        'Digital Health','Biotech','Pharmaceuticals','Gene Therapy','Drug Discovery','CRISPR Startups','Medical Devices','Imaging','Surgical Robots','Remote Monitoring Devices','Healthcare IT','EMR Systems','Insurance Tech','Care Coordination Tools',
        'FinTech','Neobanks','Payments','Lending','Investing Platforms','InsurTech',
        'PropTech','Real Estate Marketplaces','Property Management SaaS',
        'LegalTech','Contract Automation','Compliance Platforms',
        'HRTech','Future of Work','Hiring Platforms','Payroll Automation','Remote Work Tools',
        'CleanTech','GreenTech','Renewable Energy','Energy Storage','Smart Grids','ClimateTech','Carbon Capture','Emissions Tracking','Circular Economy',
        'AgriTech','Precision Farming','Vertical Farming','Supply Chain Optimization',
        'Waste Management','Recycling',
        'Electric Vehicles','Charging Infrastructure','Logistics','Supply Chain','Last-Mile Delivery','Freight Platforms',
        'Autonomous Vehicles','Self-Driving Cars','Sensors','Mapping','Micromobility','E-bikes','Scooters','Ride-Sharing',
        'Industry 4.0','IoT-Enabled Factories','Predictive Maintenance',
        '3D Printing','Additive Manufacturing','Prototyping','Custom Manufacturing',
        'ConstructionTech','Project Management','Modular Construction','Safety Tech',
        'EdTech','Online Learning Platforms','Tutoring Marketplaces','LMS',
        'Knowledge Management','Enterprise Wikis','Research Tools','Expert Networks','Language Learning','AI Tutors','Gamified Apps',
        'Content Creation Tools','Video Editing SaaS','AI Content Generation',
        'Streaming','Entertainment','OTT Platforms','Music Tech','Podcasting Tools',
        'AdTech','MarTech','Personalization Engines','Influencer Marketing Platforms',
        'SpaceTech','Satellites','Launch Vehicles','Space Mining',
        'Quantum Computing','Quantum Hardware','Quantum Cryptography',
        'Advanced Materials','Nanotech','New Alloys','Biotech Materials',
        'CivicTech','Government Transparency Tools','Voting Platforms','Nonprofit Platforms','Donation Management','Volunteer Coordination',
        'Social Impact Startups','Poverty Alleviation','Education Access','Water Tech'
      ];

      const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

      for (const name of extraCategoryNames) {
        const key = slugify(name);
        if (!categoryKeywords[key]) {
          const tokens = Array.from(new Set(tokenize(name)));
          // Seed with tokens and common synonyms when obvious
          const extras: string[] = [];
          if (tokens.includes('ai')) extras.push('artificial intelligence');
          if (tokens.includes('ml')) extras.push('machine learning');
          if (tokens.includes('ar')) extras.push('augmented reality');
          if (tokens.includes('vr')) extras.push('virtual reality');
          if (tokens.includes('xr')) extras.push('extended reality');
          if (tokens.includes('nfts')) extras.push('nft');
          if (tokens.includes('apis')) extras.push('api');
          if (tokens.includes('sdks')) extras.push('sdk');
          if (tokens.includes('saas')) extras.push('software as a service');
          if (tokens.includes('paas')) extras.push('platform as a service');
          if (tokens.includes('iaas')) extras.push('infrastructure as a service');
          // Filter out single-character tokens to avoid collisions (e.g., "e" matching ecommerce)
          categoryKeywords[key] = Array.from(new Set([...tokens, ...extras].filter(t => t.length > 1)));
        }
      }

      // Detect query category
      let detectedCategory = null;
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => queryLower.includes(keyword))) {
          detectedCategory = category;
          console.log(`🎯 [GROQ SEMANTIC SEARCH] Detected ${category} query, filtering for relevance...`);
          break;
        }
      }

      // Strict category filtering for all detected categories
      if (detectedCategory) {
        const originalCount = startupsWithSimilarity.length;
        const relevantKeywords = categoryKeywords[detectedCategory] || [];

        // Allowed category labels per detected category (substring checks)
        const allowedCategoryLabels: Record<string, string[]> = {
          banking: ['fintech', 'finance', 'banking'],
          farming: ['agri', 'agritech', 'agri tech', 'agriculture', 'farming'],
          health: ['health', 'healthtech', 'medical', 'health care', 'health-care'],
          fitness: ['fitness','gym','management software','management system','crm','studio','sports club'],
          education: ['education', 'edtech', 'ed tech', 'learning'],
          design: ['design', 'ux', 'ui', 'graphic', 'branding'],
          gaming: ['gaming', 'game', 'esports'],
          ecommerce: ['ecommerce', 'e-commerce', 'shopping', 'retail', 'marketplace', 'store'],
          social: ['social', 'social media', 'community', 'chat', 'messaging', 'network'],
          'ai-ml': ['ai', 'artificial intelligence', 'ml', 'machine learning', 'nlp', 'computer vision'],
          'saas': ['saas', 'b2b software', 'enterprise software'],
          'dev-tools': ['developer tools', 'api', 'sdk', 'devops', 'ci/cd', 'platform as a service', 'infrastructure as a service', 'cloud'],
          'cybersecurity': ['cybersecurity', 'infosec', 'identity', 'zero-trust', 'encryption'],
          'data-analytics': ['analytics', 'data', 'bi', 'data pipeline'],
          'blockchain': ['blockchain', 'web3', 'crypto', 'defi', 'nft', 'dao'],
          'fintech': ['fintech', 'banking', 'payments', 'insurtech', 'neobank', 'lending', 'investing'],
          'hr-tech': ['hrtech', 'human resources', 'payroll', 'recruiting', 'talent'],
          'legal-tech': ['legaltech', 'legal', 'contract', 'compliance'],
          'ad-mar-tech': ['adtech', 'martech', 'advertising', 'marketing'],
          'social-community': ['social', 'community', 'creator', 'networking', 'messaging', 'collaboration'],
          'gaming-metaverse': ['gaming', 'esports', 'metaverse', 'ar', 'vr', 'xr'],
          'media-entertainment': ['streaming', 'entertainment', 'ott', 'music', 'podcasting', 'video'],
          'health-tech': ['healthtech', 'healthcare', 'telehealth', 'biotech', 'pharma', 'medical'],
          'fitness-wellness': ['fitness', 'wellness', 'gym', 'wearables', 'health tracking', 'nutrition', 'mental health'],
          'agritech': ['agritech', 'agtech', 'farming', 'agriculture', 'foodtech', 'precision farming'],
          'logistics-mobility': ['logistics', 'supply chain', 'mobility', 'delivery', 'freight', 'transportation', 'ev'],
          'prop-con-tech': ['proptech', 'real estate', 'constructiontech', 'smart home', 'property management'],
          'cleantech': ['cleantech', 'greentech', 'renewable', 'sustainability', 'climate tech'],
          'edtech': ['edtech', 'education', 'learning', 'lms', 'mooc', 'tutoring'],
          'automation-robotics': ['automation', 'robotics', 'rpa', 'workflow', 'orchestration', 'iot', 'drone', 'industrial robot', 'bpa'],
          'design-creative': ['design', 'ui', 'ux', 'graphic design', 'prototyping', 'figma', 'canva'],
          'social-impact': ['social impact', 'civictech', 'nonprofit', 'govtech', 'donation', 'sustainability']
        };

        // Mirror allowed labels for dynamic categories based on their tokens
        if (!allowedCategoryLabels[detectedCategory] && categoryKeywords[detectedCategory]) {
          allowedCategoryLabels[detectedCategory] = categoryKeywords[detectedCategory];
        }

        const labels = allowedCategoryLabels[detectedCategory] || [];

        // Special stricter rules for banking/finance queries
        const financeTokens = ['stock','stocks','market','trading','trade','invest','investment','investing','portfolio','finance','financial','fintech','equity','equities','forex','crypto','analysis','indicator','signals'];
        const hardExcludeLabels = detectedCategory === 'fitness'
          ? ['mobility','transport','shopping','retail','e-commerce','agri','agritech','agriculture','health','healthtech','design','portfolio','automobile','education','edtech','vet','fintech','banking']
          : ['mobility','transport','shopping','retail','e-commerce','agri','agritech','agriculture','health','healthtech','design','portfolio','management','automobile','education','edtech','vet'];

        startupsWithSimilarity = startupsWithSimilarity.filter(startup => {
          const category = startup.category?.toLowerCase() || '';
          const title = startup.title?.toLowerCase() || '';
          const description = startup.description?.toLowerCase() || '';
          const pitch = startup.pitch?.toLowerCase() || '';

          // Category match or keyword presence in any main field
          const isAllowedCategory = labels.some(label => category.includes(label));
          const hasRelevantKeywords = relevantKeywords.some(k =>
            category.includes(k) || title.includes(k) || description.includes(k) || pitch.includes(k)
          );

          let isRelevant = isAllowedCategory || hasRelevantKeywords;

          // Apply banking-specific strictness
          if (detectedCategory === 'banking') {
            const financeHit = financeTokens.some(t => title.includes(t) || description.includes(t) || pitch.includes(t));
            const isHardExcluded = hardExcludeLabels.some(ex => category.includes(ex));
            isRelevant = (financeHit || isAllowedCategory) && !isHardExcluded;
          }
          // Apply automation-specific strictness (avoid generic "automated" mentions and unrelated domains)
          if (detectedCategory === 'automation') {
            const automationTokens = ['automation','automate','rpa','workflow','workflows','orchestration','integration','bot','bots','script','scripting','macro','pipelines','airflow','dagster','prefect','selenium','playwright','zapier','ifttt','n8n','make.com'];
            const automationHit = automationTokens.some(t => title.includes(t) || description.includes(t) || pitch.includes(t));
            const automationHardExclude = ['fitness','gym','health','design','ecommerce','shopping','retail','portfolio','social'];
            const isHardExcluded = automationHardExclude.some(ex => category.includes(ex));
            isRelevant = (automationHit || isAllowedCategory) && !isHardExcluded;
          }
          // Apply fitness-specific strictness (ensure gym/fitness context, exclude shopping)
          if (detectedCategory === 'fitness') {
            const fitnessTokens = ['fitness','gym','workout','trainer','membership','class','attendance','billing','performance','coaching','exercise','studio','yoga','pilates','crossfit','crm','management'];
            const fitnessHit = fitnessTokens.some(t => title.includes(t) || description.includes(t) || pitch.includes(t));
            const isHardExcluded = hardExcludeLabels.some(ex => category.includes(ex));
            isRelevant = (fitnessHit || isAllowedCategory) && !isHardExcluded;
          }
          if (!isRelevant) {
            console.log(`🚫 [GROQ SEMANTIC SEARCH] Filtering out irrelevant ${startup.category} startup: ${startup.title}`);
          }
          return isRelevant;
        });

        console.log(`🎯 [GROQ SEMANTIC SEARCH] ${detectedCategory} filtering: ${originalCount} → ${startupsWithSimilarity.length} results`);

        // Second-pass strictness: enforce query-term presence to cut residual noise
        // Extract meaningful tokens from the query (exclude very common stopwords)
        const stopwords = new Set(['the','a','an','and','or','of','for','to','in','on','with','app','apps','application','applications','platform','website','site','webstore','related']);
        const queryTokens = cleanQuery
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(t => t && !stopwords.has(t));

        if (queryTokens.length > 0) {
          const before = startupsWithSimilarity.length;
          startupsWithSimilarity = startupsWithSimilarity.filter(startup => {
            const hay = `${startup.category || ''} ${startup.title || ''} ${startup.description || ''} ${startup.pitch || ''}`.toLowerCase();
            return queryTokens.some(t => hay.includes(t));
          });
          console.log(`🎯 [GROQ SEMANTIC SEARCH] Query-term enforcement (${queryTokens.join(', ')}): ${before} → ${startupsWithSimilarity.length}`);
        }
      }

      // Apply query-term enforcement even when no category detected
      if (!detectedCategory) {
        const stopwords = new Set(['the','a','an','and','or','of','for','to','in','on','with','app','apps','application','applications','platform','website','site','webstore','related']);
        const queryTokens = cleanQuery
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(t => t && !stopwords.has(t));
        if (queryTokens.length > 0) {
          const before = startupsWithSimilarity.length;
          startupsWithSimilarity = startupsWithSimilarity.filter(startup => {
            const hay = `${startup.category || ''} ${startup.title || ''} ${startup.description || ''} ${startup.pitch || ''}`.toLowerCase();
            return queryTokens.some(t => hay.includes(t));
          });
          console.log(`🎯 [GROQ SEMANTIC SEARCH] Query-term enforcement (no category) (${queryTokens.join(', ')}): ${before} → ${startupsWithSimilarity.length}`);
        }
      }

      // Light exact-match boosting before final sort
      const fullQuery = cleanQuery.toLowerCase();
      // Extract meaningful tokens once for pitch-focused boosting
      const stopwordsBoost = new Set(['the','a','an','and','or','of','for','to','in','on','with','app','apps','application','applications','platform','website','site','webstore','related']);
      const queryTokensBoost = fullQuery.split(/[^a-z0-9]+/).filter(t => t && !stopwordsBoost.has(t));

      startupsWithSimilarity = startupsWithSimilarity.map(s => {
        const titleText = String(s.title || '').toLowerCase();
        const descText = String(s.description || '').toLowerCase();
        const pitchText = String(s.pitch || '').toLowerCase();
        const hay = `${titleText} ${descText} ${pitchText}`;

        // Exact full-query boost
        const exactBoost = hay.includes(fullQuery) ? 0.1 : 0;

        // Pitch-focused boost: if query tokens are present in pitch, add extra weight
        const pitchTokenHits = queryTokensBoost.some(t => pitchText.includes(t));
        const pitchBoost = pitchTokenHits ? 0.15 : 0; // prioritize pitch matches

        return { ...s, similarity: (s.similarity || 0) + exactBoost + pitchBoost };
      });

      // Sort and limit results (only once)
      startupsWithSimilarity = startupsWithSimilarity
          .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .slice(0, limit);
        
      console.log('🎯 [GROQ SEMANTIC SEARCH] Results after filtering:', {
          count: startupsWithSimilarity.length,
        scores: startupsWithSimilarity.map(s => s.similarity),
        detectedCategory: detectedCategory || 'none'
        });

      // If nothing survived filtering, do a lightweight text fallback to avoid empty results
      if (startupsWithSimilarity.length === 0) {
        console.log('⚠️ [GROQ SEMANTIC SEARCH] No relevant results after filtering. Running text fallback...');
        const wordQueries = cleanQuery
          .split(/[^a-z0-9]+/i)
          .filter(Boolean)
          .map(t => `*${t}*`) 
          .join(' || ');

        // Prefer exact phrase first, then fallback to word OR query
        const fallback = await client.fetch(`
          *[_type == "startup" && (
            title match $phrase ||
            description match $phrase ||
            category match $phrase ||
            pitch match $phrase ||
            title match $words ||
            description match $words ||
            category match $words ||
            pitch match $words
          )] | order(_createdAt desc) [0...$limit] {
            _id,
            title,
            description,
            category,
            pitch,
            author->{name, username},
            _createdAt,
            views,
            likes,
            dislikes,
            "imageUrl": image.asset->url
          }
        `, { phrase: `*${cleanQuery}*`, words: wordQueries, limit });

        startupsWithSimilarity = (fallback || []).map((s: any) => ({ ...s, similarity: 0.01 }));
      }

      const finalResult = {
        startups: startupsWithSimilarity,
        reasons: startupsWithSimilarity.length > 0 
          ? [`Found ${startupsWithSimilarity.length} highly relevant startups matching "${cleanQuery}"`]
          : [`No highly relevant startups found for "${cleanQuery}". Try different search terms.`],
        confidence: searchResults.matches?.[0]?.score || 0,
        fallbackUsed: searchResults.matches?.length === 0 || startupsWithSimilarity.length === 0,
        toastMessage: (searchResults.matches?.length === 0) ? 'showing text matches' : undefined
      };
      
      console.log('✅ [GROQ SEMANTIC SEARCH] Search completed successfully:', {
        finalResultsCount: finalResult.startups.length,
        confidence: finalResult.confidence,
        reasons: finalResult.reasons
      });
      
      return finalResult;
    } catch (error) {
      const suppress = process.env.SUPPRESS_AI_ERRORS === 'true';
      if (!suppress) {
        // Keep a single concise warning to avoid noisy devtools error overlays
        console.warn('AI search failed:', error instanceof Error ? error.message : String(error));
      }

      // Return empty results on error
      return {
        startups: [],
        reasons: [`Search temporarily unavailable`],
        confidence: 0,
      };
    }
  }

  // Enhanced search result processing with better ranking and scoring
  private enhanceSearchResults(startups: any[], matches: any[], originalQuery: string): any[] {
    console.log('🔍 [ENHANCED SEARCH] Processing search results with enhanced ranking...');
    
    return startups.map(startup => {
      const match = matches.find(m => m.id === startup._id);
      const baseSimilarity = match?.score || 0;
      
      // Calculate enhanced relevance score
      const relevanceScore = this.calculateRelevanceScore(startup, originalQuery, baseSimilarity);
      
      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(startup);
      
      // Calculate recency score
      const recencyScore = this.calculateRecencyScore(startup);
      
      // Calculate quality score
      const qualityScore = this.calculateQualityScore(startup);
      
      // Combined score with weighted factors
      const finalScore = (
        relevanceScore * 0.4 +      // 40% relevance
        engagementScore * 0.25 +    // 25% engagement
        recencyScore * 0.2 +        // 20% recency
        qualityScore * 0.15         // 15% quality
      );
      
      return {
        ...startup,
        similarity: baseSimilarity,
        relevanceScore,
        engagementScore,
        recencyScore,
        qualityScore,
        finalScore,
        searchMetadata: {
          originalSimilarity: baseSimilarity,
          enhancedScore: finalScore,
          rankingFactors: {
            relevance: relevanceScore,
            engagement: engagementScore,
            recency: recencyScore,
            quality: qualityScore
          }
        }
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }
  
  // Calculate relevance score based on query matching
  private calculateRelevanceScore(startup: any, query: string, baseSimilarity: number): number {
    const queryLower = query.toLowerCase();
    const title = (startup.title || '').toLowerCase();
    const description = (startup.description || '').toLowerCase();
    const category = (startup.category || '').toLowerCase();
    const pitch = (startup.pitch || '').toLowerCase();
    
    let score = baseSimilarity;
    
    // Exact title match boost
    if (title.includes(queryLower)) {
      score += 0.3;
    }
    
    // Category match boost
    if (category.includes(queryLower)) {
      score += 0.2;
    }
    
    // Description match boost
    if (description.includes(queryLower)) {
      score += 0.15;
    }
    
    // Pitch match boost
    if (pitch.includes(queryLower)) {
      score += 0.1;
    }
    
    // Keyword density analysis
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    const allText = `${title} ${description} ${pitch}`.toLowerCase();
    
    let keywordMatches = 0;
    queryWords.forEach(word => {
      if (allText.includes(word)) {
        keywordMatches++;
      }
    });
    
    const keywordDensity = keywordMatches / queryWords.length;
    score += keywordDensity * 0.2;
    
    return Math.min(1.0, score);
  }
  
  // Calculate engagement score based on user interactions
  private calculateEngagementScore(startup: any): number {
    const views = startup.views || 0;
    const likes = startup.likes || 0;
    const dislikes = startup.dislikes || 0;
    
    // Normalize views (log scale to prevent outliers from dominating)
    const normalizedViews = Math.log(views + 1) / Math.log(1000);
    
    // Calculate engagement rate
    const totalEngagement = likes + dislikes;
    const engagementRate = totalEngagement > 0 ? likes / totalEngagement : 0;
    
    // Combine views and engagement rate
    const score = (normalizedViews * 0.6) + (engagementRate * 0.4);
    
    return Math.min(1.0, score);
  }
  
  // Calculate recency score based on creation date
  private calculateRecencyScore(startup: any): number {
    if (!startup._createdAt) return 0.5; // Default for unknown dates
    
    const createdDate = new Date(startup._createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Exponential decay: newer = higher score
    const score = Math.exp(-diffDays / 365); // Decay over 1 year
    
    return Math.min(1.0, score);
  }
  
  // Calculate quality score based on content completeness and structure
  private calculateQualityScore(startup: any): number {
    let score = 0;
    
    // Title quality (length and content)
    if (startup.title && startup.title.length > 10) {
      score += 0.2;
    }
    
    // Description quality
    if (startup.description && startup.description.length > 50) {
      score += 0.2;
    }
    
    // Pitch quality
    if (startup.pitch && startup.pitch.length > 30) {
      score += 0.2;
    }
    
    // Category presence
    if (startup.category) {
      score += 0.1;
    }
    
    // Author information
    if (startup.author?.name) {
      score += 0.1;
    }
    
    // Website presence
    if (startup.website) {
      score += 0.1;
    }
    
    // Social links
    if (startup.socialLinks && startup.socialLinks.length > 0) {
      score += 0.1;
    }
    
    return Math.min(1.0, score);
  }
  
  // Calculate quality boost for confidence scoring
  private calculateQualityBoost(startups: any[]): number {
    if (startups.length === 0) return 0;
    
    const avgQuality = startups.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / startups.length;
    const avgEngagement = startups.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / startups.length;
    
    return (avgQuality + avgEngagement) * 0.1; // Max 0.2 boost
  }
  
  // Get expansion statistics for logging
  private getExpansionStats(originalQuery: string): number {
    const words = originalQuery.split(/\s+/).length;
    return Math.max(0, 20 - words); // Approximate expansion
  }

  // Search analytics and performance monitoring
  private async logSearchAnalytics(query: string, results: any[], searchMetadata: any, startTime: number): Promise<void> {
    try {
      const endTime = Date.now();
      const searchDuration = endTime - startTime;
      
      const analytics = {
        timestamp: new Date().toISOString(),
        query: query,
        queryLength: query.length,
        resultsCount: results.length,
        searchDuration: searchDuration,
        avgConfidence: results.reduce((sum, r) => sum + (r.similarity || 0), 0) / results.length,
        searchMetadata: searchMetadata,
        performance: {
          duration: searchDuration,
          resultsPerSecond: results.length / (searchDuration / 1000),
          avgResultScore: results.reduce((sum, r) => sum + (r.finalScore || 0), 0) / results.length
        }
      };
      
      // Log analytics (in production, this would be sent to analytics service)
      console.log('📊 [SEARCH ANALYTICS] Search performance:', {
        query: query.substring(0, 50),
        duration: `${searchDuration}ms`,
        results: results.length,
        avgScore: analytics.avgConfidence.toFixed(3),
        performance: analytics.performance
      });
      
      // Store analytics for trend analysis (in production, use proper analytics service)
      await this.storeSearchAnalytics(analytics);
      
    } catch (error) {
      console.error('❌ [SEARCH ANALYTICS] Error logging search analytics:', error);
    }
  }
  
  // Store search analytics for trend analysis
  private async storeSearchAnalytics(analytics: any): Promise<void> {
    try {
      // In production, this would store to a proper analytics database
      // For now, we'll just log the analytics
      console.log('📈 [SEARCH ANALYTICS] Storing analytics:', {
        timestamp: analytics.timestamp,
        query: analytics.query,
        resultsCount: analytics.resultsCount,
        duration: analytics.searchDuration
      });
      
      // TODO: Implement proper analytics storage
      // This could be stored in a database, sent to an analytics service, etc.
      
    } catch (error) {
      console.error('❌ [SEARCH ANALYTICS] Error storing analytics:', error);
    }
  }
  
  // Get search performance metrics
  async getSearchPerformanceMetrics(timeRange: string = '24h'): Promise<any> {
    try {
      // In production, this would query the analytics database
      // For now, return mock metrics
      const metrics = {
        totalSearches: 0,
        avgSearchDuration: 0,
        avgResultsPerSearch: 0,
        topQueries: [],
        searchSuccessRate: 0,
        performanceTrends: {
          searchesOverTime: [],
          avgDurationOverTime: [],
          resultQualityOverTime: []
        }
      };
      
      console.log('📊 [SEARCH METRICS] Retrieved performance metrics:', metrics);
      return metrics;
      
    } catch (error) {
      console.error('❌ [SEARCH METRICS] Error retrieving metrics:', error);
      return null;
    }
  }
  
  // Analyze search query patterns for optimization
  private analyzeQueryPatterns(queries: string[]): any {
    const patterns = {
      avgQueryLength: queries.reduce((sum, q) => sum + q.length, 0) / queries.length,
      commonTerms: this.extractCommonTerms(queries),
      queryCategories: this.categorizeQueries(queries),
      improvementSuggestions: this.generateImprovementSuggestions(queries)
    };
    
    return patterns;
  }
  
  // Extract common terms from queries
  private extractCommonTerms(queries: string[]): string[] {
    const termCounts: { [key: string]: number } = {};
    
    queries.forEach(query => {
      const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
      terms.forEach(term => {
        termCounts[term] = (termCounts[term] || 0) + 1;
      });
    });
    
    return Object.entries(termCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term]) => term);
  }
  
  // Categorize queries by type
  private categorizeQueries(queries: string[]): any {
    const categories = {
      technology: 0,
      business: 0,
      industry: 0,
      general: 0
    };
    
    queries.forEach(query => {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('ai') || lowerQuery.includes('tech') || lowerQuery.includes('software')) {
        categories.technology++;
      } else if (lowerQuery.includes('startup') || lowerQuery.includes('business') || lowerQuery.includes('company')) {
        categories.business++;
      } else if (lowerQuery.includes('fintech') || lowerQuery.includes('health') || lowerQuery.includes('education')) {
        categories.industry++;
      } else {
        categories.general++;
      }
    });
    
    return categories;
  }
  
  // Generate improvement suggestions based on query patterns
  private generateImprovementSuggestions(queries: string[]): string[] {
    const suggestions: string[] = [];
    
    // Analyze query length patterns
    const avgLength = queries.reduce((sum, q) => sum + q.length, 0) / queries.length;
    if (avgLength < 10) {
      suggestions.push('Consider encouraging more specific queries for better results');
    }
    
    // Analyze term diversity
    const allTerms = queries.flatMap(q => q.toLowerCase().split(/\s+/));
    const uniqueTerms = new Set(allTerms);
    const diversity = uniqueTerms.size / allTerms.length;
    
    if (diversity < 0.3) {
      suggestions.push('Query diversity is low - consider expanding search suggestions');
    }
    
    return suggestions;
  }

  // Intelligent caching for embeddings and search results
  private embeddingCache = new Map<string, { embedding: number[], timestamp: number }>();
  private searchCache = new Map<string, { results: any[], timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000;

  // Get cached embedding or generate new one
  private async getCachedEmbedding(text: string): Promise<number[]> {
    const cacheKey = this.generateCacheKey(text);
    const cached = this.embeddingCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log('💾 [CACHE HIT] Using cached embedding for:', text.substring(0, 50));
      return cached.embedding;
    }
    
    console.log('💾 [CACHE MISS] Generating new embedding for:', text.substring(0, 50));
    const embedding = await this.generateEmbedding(text);
    
    // Store in cache with size limit
    if (this.embeddingCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestCacheEntries('embedding');
    }
    
    this.embeddingCache.set(cacheKey, {
      embedding,
      timestamp: Date.now()
    });
    
    return embedding;
  }
  
  // Get cached search results or perform new search
  private async getCachedSearchResults(query: string, limit: number): Promise<any> {
    const cacheKey = this.generateCacheKey(`${query}:${limit}`);
    const cached = this.searchCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log('💾 [CACHE HIT] Using cached search results for:', query);
      return cached.results;
    }
    
    console.log('💾 [CACHE MISS] Performing new search for:', query);
    const results = await this.semanticSearch(query, limit);
    
    // Store in cache with size limit
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestCacheEntries('search');
    }
    
    this.searchCache.set(cacheKey, {
      results,
      timestamp: Date.now()
    });
    
    return results;
  }
  
  // Generate cache key for text
  private generateCacheKey(text: string): string {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
  
  // Evict oldest cache entries when cache is full
  private evictOldestCacheEntries(type: 'embedding' | 'search'): void {
    if (type === 'embedding') {
      const entries = Array.from(this.embeddingCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = Math.floor(entries.length * 0.2);
      
      for (let i = 0; i < toRemove; i++) {
        this.embeddingCache.delete(entries[i][0]);
      }
      
      console.log(`🧹 [CACHE CLEANUP] Evicted ${toRemove} old embedding entries`);
    } else {
      const entries = Array.from(this.searchCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = Math.floor(entries.length * 0.2);
      
      for (let i = 0; i < toRemove; i++) {
        this.searchCache.delete(entries[i][0]);
      }
      
      console.log(`🧹 [CACHE CLEANUP] Evicted ${toRemove} old search entries`);
    }
  }
  
  // Clear cache (useful for testing or manual cache management)
  public clearCache(): void {
    this.embeddingCache.clear();
    this.searchCache.clear();
    console.log('🧹 [CACHE CLEAR] All caches cleared');
  }
  
  // Get cache statistics
  public getCacheStats(): any {
    return {
      embeddingCache: {
        size: this.embeddingCache.size,
        maxSize: this.MAX_CACHE_SIZE,
        utilization: (this.embeddingCache.size / this.MAX_CACHE_SIZE * 100).toFixed(1) + '%'
      },
      searchCache: {
        size: this.searchCache.size,
        maxSize: this.MAX_CACHE_SIZE,
        utilization: (this.searchCache.size / this.MAX_CACHE_SIZE * 100).toFixed(1) + '%'
      },
      ttl: this.CACHE_TTL / 1000 + ' seconds'
    };
  }

  /* COMMENTED OUT - Using only GROQ now
  // Fallback text search when AI services are unavailable
  async fallbackTextSearch(query: string, limit: number = 10): Promise<any> {
    console.log('🔄 [FALLBACK TEXT SEARCH] Starting fallback text search:', { query, limit });
    
    try {
      // Clean the query for better text search
      const cleanQuery = this.preprocessText(query);
      const searchTerms = cleanQuery.split(' ').filter(term => term.length > 2);
      
      console.log('📊 [FALLBACK TEXT SEARCH] Search terms:', searchTerms);
      
      // Define category-specific keywords and exclusions (same as semantic search)
      const categoryConfig = {
        farming: {
          keywords: [
            'farming', 'farm', 'agriculture', 'agricultural', 'agritech', 'agri-tech',
            'crop', 'crops', 'livestock', 'dairy', 'poultry', 'harvest',
            'soil', 'irrigation', 'fertilizer', 'seed', 'seeds', 'plant', 'plants',
            'greenhouse', 'organic', 'sustainable', 'food', 'produce',
            'farmer', 'farmers', 'rural', 'agribusiness', 'agro', 'agro-tech'
          ],
          exclude: ['fintech', 'edtech', 'healthtech', 'mobility', 'design', 'gaming', 'ecommerce']
        },
        fintech: {
          keywords: [
            'fintech', 'finance', 'financial', 'banking', 'bank', 'payment', 'payments',
            'money', 'currency', 'crypto', 'cryptocurrency', 'bitcoin', 'blockchain',
            'investment', 'investing', 'trading', 'wallet', 'digital wallet',
            'lending', 'loan', 'loans', 'credit', 'debit', 'card', 'cards'
          ],
          exclude: ['farming', 'agriculture', 'edtech', 'healthtech', 'mobility', 'design', 'gaming']
        },
        edtech: {
          keywords: [
            'edtech', 'education', 'educational', 'learning', 'learn', 'teach', 'teaching',
            'school', 'schools', 'university', 'college', 'student', 'students',
            'course', 'courses', 'training', 'tutorial', 'tutorials', 'online learning',
            'e-learning', 'elearning', 'academy', 'academies', 'skill', 'skills'
          ],
          exclude: ['farming', 'fintech', 'healthtech', 'mobility', 'design', 'gaming']
        },
        healthtech: {
          keywords: [
            'healthtech', 'health', 'healthcare', 'medical', 'medicine', 'doctor', 'doctors',
            'patient', 'patients', 'hospital', 'hospitals', 'clinic', 'clinics',
            'wellness', 'fitness', 'mental health', 'therapy', 'therapist', 'nurse', 'nurses',
            'pharmacy', 'pharmaceutical', 'drug', 'drugs', 'treatment', 'diagnosis'
          ],
          exclude: ['farming', 'fintech', 'edtech', 'mobility', 'design', 'gaming']
        },
        mobility: {
          keywords: [
            'mobility', 'transportation', 'transport', 'travel', 'traveling', 'trip', 'trips',
            'ride', 'rides', 'ride-sharing', 'rideshare', 'uber', 'lyft', 'taxi', 'taxis',
            'car', 'cars', 'vehicle', 'vehicles', 'scooter', 'scooters', 'bike', 'bikes',
            'logistics', 'delivery', 'shipping', 'freight', 'cargo'
          ],
          exclude: ['farming', 'fintech', 'edtech', 'healthtech', 'design', 'gaming']
        },
        design: {
          keywords: [
            'design', 'designer', 'designers', 'creative', 'creativity', 'art', 'arts',
            'ui', 'ux', 'user interface', 'user experience', 'graphic', 'graphics',
            'visual', 'visuals', 'branding', 'brand', 'logo', 'logos', 'illustration',
            'photography', 'photo', 'photos', 'video', 'videos', 'animation'
          ],
          exclude: ['farming', 'fintech', 'edtech', 'healthtech', 'mobility', 'gaming']
        },
        gaming: {
          keywords: [
            'gaming', 'game', 'games', 'gamer', 'gamers', 'play', 'playing', 'entertainment',
            'fun', 'funny', 'arcade', 'console', 'consoles', 'mobile game', 'mobile games',
            'video game', 'video games', 'esports', 'tournament', 'tournaments',
            'virtual', 'vr', 'ar', 'augmented reality', 'virtual reality'
          ],
          exclude: ['farming', 'fintech', 'edtech', 'healthtech', 'mobility', 'design']
        },
        ecommerce: {
          keywords: [
            'ecommerce', 'e-commerce', 'commerce', 'shopping', 'shop', 'store', 'stores',
            'retail', 'retailer', 'retailers', 'marketplace', 'marketplaces', 'sell', 'selling',
            'buy', 'buying', 'purchase', 'purchases', 'order', 'orders', 'product', 'products',
            'inventory', 'catalog', 'catalogue', 'checkout', 'cart', 'basket'
          ],
          exclude: ['farming', 'fintech', 'edtech', 'healthtech', 'mobility', 'design', 'gaming']
        },
        social: {
          keywords: [
            'social', 'social media', 'social network', 'social networking', 'community', 'communities',
            'chat', 'messaging', 'message', 'communication', 'connect', 'connecting', 'network',
            'friends', 'friend', 'follow', 'following', 'post', 'posts', 'share', 'sharing',
            'like', 'likes', 'comment', 'comments', 'feed', 'timeline', 'profile', 'profiles',
            'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'discord',
            'whatsapp', 'telegram', 'slack', 'teams', 'zoom', 'meet', 'hangouts',
            'application', 'app', 'platform', 'software'
          ],
          exclude: ['farming', 'agriculture', 'fintech', 'edtech', 'healthtech', 'mobility', 'design', 'gaming', 'ecommerce']
        }
      };
      
      // Detect which category the query belongs to
      let detectedCategory = null;
      let categoryKeywords = [];
      let excludeCategories = [];
      
      for (const [category, config] of Object.entries(categoryConfig)) {
        const isThisCategory = config.keywords.some(keyword => 
          cleanQuery.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (isThisCategory) {
          detectedCategory = category;
          categoryKeywords = config.keywords;
          excludeCategories = config.exclude;
          console.log(`🎯 [FALLBACK TEXT SEARCH] Detected ${category} query, filtering accordingly...`);
          break;
        }
      }
      
      console.log('📊 [FALLBACK TEXT SEARCH] Detected category:', detectedCategory || 'none');
      
      let startups = [];
      
      // Strategy 1: Exact phrase search with comprehensive data
      if (cleanQuery.length > 3) {
        console.log('📊 [FALLBACK TEXT SEARCH] Trying exact phrase search with comprehensive data...');
        startups = await client.fetch(`
        *[_type == "startup" && (
          title match $query || 
          description match $query || 
          category match $query ||
            pitch match $query ||
            tags match $query ||
            status match $query ||
            fundingStage match $query ||
            location match $query
        )] | order(_createdAt desc) [0...$limit] {
            _id,
            title,
            description,
            category,
            pitch,
            author->{name, username, _id},
            _createdAt,
            _updatedAt,
            views,
            likes,
            dislikes,
            tags,
            status,
            fundingStage,
            teamSize,
            location,
            website,
            socialLinks,
            "imageUrl": image.asset->url,
            "logoUrl": logo.asset->url
          }
        `, { 
          query: `*${cleanQuery}*`,
          limit: limit 
        });
      }
      
      // Strategy 2: Individual word search with comprehensive data if no results
      if (startups.length === 0 && searchTerms.length > 0) {
        console.log('📊 [FALLBACK TEXT SEARCH] Trying individual word search with comprehensive data...');
        const wordQueries = searchTerms.map(term => `*${term}*`).join(' || ');
        startups = await client.fetch(`
          *[_type == "startup" && (
            title match $wordQueries || 
            description match $wordQueries || 
            category match $wordQueries ||
            pitch match $wordQueries ||
            tags match $wordQueries ||
            status match $wordQueries ||
            fundingStage match $wordQueries ||
            location match $wordQueries
          )] | order(_createdAt desc) [0...$limit] {
            _id,
            title,
            description,
            category,
            pitch,
            author->{name, username, _id},
            _createdAt,
            _updatedAt,
            views,
            likes,
            dislikes,
            tags,
            status,
            fundingStage,
            teamSize,
            location,
            website,
            socialLinks,
            "imageUrl": image.asset->url,
            "logoUrl": logo.asset->url
          }
        `, { 
          wordQueries,
          limit: limit 
        });
      }
      
      // Strategy 3: Category-based search for farming queries
      if (startups.length === 0 && isFarmingQuery) {
        console.log('📊 [FALLBACK TEXT SEARCH] Trying category-based search for farming...');
        startups = await client.fetch(`
          *[_type == "startup" && (
            category match "*agri*" ||
            category match "*farm*" ||
            category match "*agriculture*" ||
            category match "*food*" ||
            category match "*crop*" ||
            category match "*plant*"
          )] | order(views desc, likes desc) [0...$limit] {
            _id,
            title,
            description,
            category,
            pitch,
            author->{name, username},
            _createdAt,
            views,
            likes,
            dislikes,
            "imageUrl": image.asset->url
          }
        `, { limit: limit });
      }
      
      // Strategy 4: Keyword-based search for farming queries
      if (startups.length === 0 && isFarmingQuery) {
        console.log('📊 [FALLBACK TEXT SEARCH] Trying keyword-based search for farming...');
        const farmingQueryTerms = farmingKeywords.map(keyword => `*${keyword}*`).join(' || ');
        startups = await client.fetch(`
          *[_type == "startup" && (
            title match $farmingQueryTerms || 
            description match $farmingQueryTerms || 
            pitch match $farmingQueryTerms
          )] | order(views desc, likes desc) [0...$limit] {
          _id,
          title,
          description,
          category,
          pitch,
          author->{name, username},
          _createdAt,
          views,
          likes,
          dislikes,
          "imageUrl": image.asset->url
        }
      `, { 
          farmingQueryTerms,
        limit: limit 
      });
      }
      
      // Strategy 5: Show popular startups if still no results (only as last resort)
      if (startups.length === 0) {
        if (isFarmingQuery) {
          console.log('📊 [FALLBACK TEXT SEARCH] No farming matches found, showing only farming-related popular startups...');
          // For farming queries, only show startups that are actually farming-related
          startups = await client.fetch(`
            *[_type == "startup" && (
              category match "*agri*" ||
              category match "*farm*" ||
              category match "*agriculture*" ||
              category match "*food*" ||
              category match "*crop*" ||
              category match "*plant*" ||
              title match "*farm*" ||
              title match "*agri*" ||
              title match "*crop*" ||
              title match "*plant*" ||
              description match "*farm*" ||
              description match "*agri*" ||
              description match "*crop*" ||
              description match "*plant*" ||
              pitch match "*farm*" ||
              pitch match "*agri*" ||
              pitch match "*crop*" ||
              pitch match "*plant*"
            )] | order(views desc, likes desc) [0...$limit] {
              _id,
              title,
              description,
              category,
              pitch,
              author->{name, username},
              _createdAt,
              views,
              likes,
              dislikes,
              "imageUrl": image.asset->url
            }
          `, { limit: Math.min(5, limit) });
        } else {
          console.log('📊 [FALLBACK TEXT SEARCH] No text matches found, showing popular startups...');
          startups = await client.fetch(`
            *[_type == "startup"] | order(views desc, likes desc) [0...$limit] {
              _id,
              title,
              description,
              category,
              pitch,
              author->{name, username},
              _createdAt,
              views,
              likes,
              dislikes,
              "imageUrl": image.asset->url
            }
          `, { limit: Math.min(5, limit) });
        }
      }

      console.log('📊 [FALLBACK TEXT SEARCH] Sanity text search completed:', {
        resultsCount: startups?.length || 0,
        startupTitles: startups?.map(s => s.title) || []
      });

      // Post-process results for farming queries to ensure relevance
      let finalStartups = startups || [];
      if (isFarmingQuery && finalStartups.length > 0) {
        console.log('🌾 [FALLBACK TEXT SEARCH] Post-processing results for farming query...');
        const farmingKeywords = [
          'farming', 'farm', 'agriculture', 'agricultural', 'agritech', 'agri-tech',
          'crop', 'crops', 'livestock', 'dairy', 'poultry', 'harvest',
          'soil', 'irrigation', 'fertilizer', 'seed', 'seeds', 'plant', 'plants',
          'greenhouse', 'organic', 'sustainable', 'food', 'produce',
          'farmer', 'farmers', 'rural', 'agribusiness', 'agro', 'agro-tech'
        ];
        
        // Filter based on detected category
        if (detectedCategory) {
          console.log(`🎯 [FALLBACK TEXT SEARCH] Filtering for ${detectedCategory} category...`);
          finalStartups = finalStartups.filter(startup => {
            const category = startup.category?.toLowerCase() || '';
            const title = startup.title?.toLowerCase() || '';
            const description = startup.description?.toLowerCase() || '';
            const pitch = startup.pitch?.toLowerCase() || '';
            
            // First, exclude irrelevant categories
            const isIrrelevantCategory = excludeCategories.some(excludeCategory => 
              category.includes(excludeCategory) || 
              title.includes(excludeCategory) || 
              description.includes(excludeCategory) || 
              pitch.includes(excludeCategory)
            );
            
            if (isIrrelevantCategory) {
              console.log(`🚫 [FALLBACK TEXT SEARCH] Excluding ${excludeCategories.find(ex => category.includes(ex) || title.includes(ex) || description.includes(ex) || pitch.includes(ex))} startup:`, startup.title, 'Category:', category);
              return false;
            }
            
            // Then, check for category-specific content
            return categoryKeywords.some(keyword => 
              category.includes(keyword) || 
              title.includes(keyword) || 
              description.includes(keyword) || 
              pitch.includes(keyword)
            );
          });
        }
        
        console.log('🌾 [FALLBACK TEXT SEARCH] Post-processed results:', {
          original: startups.length,
          filtered: finalStartups.length,
          titles: finalStartups.map(s => s.title)
        });
      }

      const result = {
        startups: finalStartups,
        reasons: finalStartups.length > 0 
          ? [`Found ${finalStartups.length} startups using text search for "${cleanQuery}"`]
          : [`No text matches found for "${cleanQuery}". Showing popular startups instead.`],
        confidence: 0.7, // Lower confidence for text search
        fallbackUsed: true, // Flag to indicate fallback was used
        toastMessage: "Note: AI search unavailable due to API quota limits. Using text search instead."
      };
      
      console.log('✅ [FALLBACK TEXT SEARCH] Fallback search completed successfully:', {
        resultsCount: result.startups.length,
        confidence: result.confidence,
        fallbackUsed: result.fallbackUsed
      });
      
      return result;
    } catch (error) {
      console.error('❌ [FALLBACK TEXT SEARCH] Error in fallback text search:');
      console.error('  Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('  Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('  Query:', query);
      console.error('  Limit:', limit);
      if (error instanceof Error && error.stack) {
        console.error('  Stack trace:', error.stack);
      }
      
      const errorResult = {
        startups: [],
        reasons: ['Search temporarily unavailable. Please try again later.'],
        confidence: 0,
        fallbackUsed: true,
        toastMessage: "Both AI and text search failed. Please try again later."
      };
      
      console.log('❌ [FALLBACK TEXT SEARCH] Returning error result:', errorResult);
      return errorResult;
    }
  }
  */

  // Get personalized recommendations based on user behavior
  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<any> {
    try {
      // Collect user signals from Sanity
      const [likedStartups, dislikedStartups, savedStartups, interestedStartups, commentedRefs] = await Promise.all([
        client.fetch(`*[_type == "startup" && $userId in likedBy]{ _id, title, description, category, pitch }`, { userId }),
        client.fetch(`*[_type == "startup" && $userId in dislikedBy]{ _id }`, { userId }),
        client.fetch(`*[_type == "startup" && $userId in savedBy]{ _id, title, description, category, pitch }`, { userId }),
        client.fetch(`*[_type == "startup" && $userId in interestedBy]{ _id, title, description, category, pitch }`, { userId }),
        client.fetch(`*[_type == "comment" && author._ref == $userId]{ startup->{ _id, title, description, category, pitch } }`, { userId })
      ]);

      const commentedStartups = Array.from(
        new Map(
          (commentedRefs || [])
            .map((c: any) => c?.startup)
            .filter((s: any) => s && s._id)
            .map((s: any) => [s._id, s])
        ).values()
      );

      // Build sets for quick filtering
      const negativeIds = new Set<string>((dislikedStartups || []).map((s: any) => s._id));
      const likedIds = new Set<string>((likedStartups || []).map((s: any) => s._id));

      // Determine if we have any positive signals
      const hasPositiveSignals = (savedStartups?.length || 0) > 0
        || (interestedStartups?.length || 0) > 0
        || (likedStartups?.length || 0) > 0
        || (commentedStartups?.length || 0) > 0;

      if (!hasPositiveSignals) {
        // No signals yet → popular fallback
        return await this.getPopularStartups(limit);
      }

      // Weight different signals when building the preference profile
      const weightSaved = 3;
      const weightInterested = 3;
      const weightLiked = 2;
      const weightCommented = 1;

      const positiveStartups: Array<{ _id: string; title: string; description: string; category: string; pitch?: string; weight: number; }> = [];

      (savedStartups || []).forEach((s: any) => positiveStartups.push({ ...s, weight: weightSaved }));
      (interestedStartups || []).forEach((s: any) => positiveStartups.push({ ...s, weight: weightInterested }));
      (likedStartups || []).forEach((s: any) => positiveStartups.push({ ...s, weight: weightLiked }));
      (commentedStartups || []).forEach((s: any) => positiveStartups.push({ ...s, weight: weightCommented }));

      // De-duplicate keeping max weight
      const idToStartup = new Map<string, any>();
      for (const s of positiveStartups) {
        const existing = idToStartup.get(s._id);
        if (!existing || s.weight > existing.weight) {
          idToStartup.set(s._id, s);
        }
      }
      const dedupedPositives = Array.from(idToStartup.values());

      // Build category preference map
      const categoryToCount = new Map<string, number>();
      for (const s of dedupedPositives) {
        const cat = (s.category || '').toLowerCase();
        if (!cat) continue;
        categoryToCount.set(cat, (categoryToCount.get(cat) || 0) + s.weight);
      }
      const topCategories = Array.from(categoryToCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

      // Build weighted preference text
      const preferenceParts: string[] = [];
      for (const s of dedupedPositives) {
        const piece = `${s.title} ${s.description} ${s.category} ${s.pitch || ''}`.trim();
        for (let i = 0; i < s.weight; i++) preferenceParts.push(piece);
      }
      const userPreferences = preferenceParts.join(' ');

      // Generate embedding and query vector index
      const userEmbedding = await this.generateEmbedding(userPreferences);
      const searchResults = await index.query({
        vector: userEmbedding,
        topK: Math.max(limit * 10, 50),
        includeMetadata: true,
      });

      // Filter out negatives and already-liked items
      const filteredMatches = (searchResults.matches || [])
        .filter((m: any) => !negativeIds.has(m.id))
        .filter((m: any) => !likedIds.has(m.id));

      const startupIds = filteredMatches.map((m: any) => m.id).slice(0, limit * 5);
      if (startupIds.length === 0) {
        return await this.getPopularStartups(limit);
      }

      const startups = await client.fetch(`
        *[_type == "startup" && _id in $startupIds] {
          _id,
          title,
          description,
          category,
          pitch,
          author->{name, username},
          _createdAt,
          views,
          likes,
          dislikes,
          "imageUrl": image.asset->url
        }
      `, { startupIds });

      // Attach scores and apply simple category boost
      const categoryBoost = 0.05; // small boost per match
      const scored = startups.map((s: any) => {
        const match = filteredMatches.find((m: any) => m.id === s._id);
        let score = match?.score || 0;
        const cat = (s.category || '').toLowerCase();
        if (cat && topCategories.includes(cat)) score += categoryBoost;
        return { ...s, similarity: score };
      });

      scored.sort((a: any, b: any) => (b.similarity || 0) - (a.similarity || 0));
      let finalStartups = scored.slice(0, limit);

      // Backfill with popular items if we have fewer than requested
      if (finalStartups.length < limit) {
        const need = limit - finalStartups.length;
        const popular = await this.getPopularStartups(Math.max(need * 2, need));
        const existingIds = new Set(finalStartups.map((s: any) => s._id));
        const backfill = (popular.startups || []).filter((p: any) => !existingIds.has(p._id)).slice(0, need);
        finalStartups = finalStartups.concat(backfill);
      }

      const reasons: string[] = [];
      if ((savedStartups?.length || 0) > 0) reasons.push('Based on your saved startups');
      if ((interestedStartups?.length || 0) > 0) reasons.push('Because you showed interest');
      if ((likedStartups?.length || 0) > 0) reasons.push('Similar to startups you liked');
      if ((commentedStartups?.length || 0) > 0) reasons.push('You engaged via comments');
      if (topCategories.length > 0) reasons.push(`Category preference: ${topCategories.join(', ')}`);

      return {
        startups: finalStartups,
        reasons: reasons.length ? reasons : ['Personalized for you'],
        confidence: filteredMatches[0]?.score || 0,
      };
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      // Fallback to popular startups
      return await this.getPopularStartups(limit);
    }
  }

  // Get popular startups as fallback
  private async getPopularStartups(limit: number): Promise<any> {
    try {
      const startups = await client.fetch(`
        *[_type == "startup"] | order(views desc, likes desc) [0...$limit] {
          _id,
          title,
          description,
          category,
          pitch,
          author->{name, username},
          _createdAt,
          views,
          likes,
          dislikes,
          "imageUrl": image.asset->url
        }
      `, { limit });

      return {
        startups: startups.map(startup => ({ ...startup, similarity: 0.5 })),
        reasons: ['Popular startups', 'Trending now'],
        confidence: 0.5,
      };
    } catch (error) {
      console.error('Error getting popular startups:', error);
      return {
        startups: [],
        reasons: ['No startups available'],
        confidence: 0,
      };
    }
  }

  // Generate startup content using AI
  async generateStartupContent(idea: string, category: string = 'General', existingTitle?: string, existingDescription?: string): Promise<any> {
    try {
      let prompt: string;
      
      if (existingTitle && existingDescription) {
        // Generate a full markdown pitch in the requested format
        prompt = `Generate a startup pitch in detailed markdown format, using headings, bullet points, and emojis. Follow this structure:

- Title and tagline
- Problem section
- Solution section (with tech stack if relevant)
- Differentiators
- Market opportunity
- Monetization strategy
- Call to action

Example:
# *DailyPay: Revolutionizing Personal Banking*
> "Banking shouldn't be complicated—it should be effortless."
In a world where traditional banking feels outdated and disconnected, *users struggle with fragmented financial experiences* while *banks fail to provide modern, unified solutions*. **DailyPay** is here to change that.
---
## *🚩 The Problem*
- Traditional banking apps are clunky and disconnected.  
- Users juggle multiple accounts across different platforms.  
- Real-time financial insights are buried in complex interfaces.  
- Money transfers remain slow and expensive.
---
## *✅ The Solution*
*DailyPay* is a modern, unified banking platform, built with:  
- ⚡ *Next.js 14* for lightning-fast performance  
- 🔗 *Plaid integration* for seamless bank connections  
- 💸 *Dwolla* for instant money transfers  
- 🧠 *Appwrite* for secure user management  
- 📊 *Real-time transaction tracking & analytics*
Users can connect multiple bank accounts, view unified transaction history, and transfer money instantly—all from one beautiful, intuitive interface.
---
## *🎯 What Makes Daily Pay Different*
- *Unified banking experience* — connect all your accounts in one place  
- *Real-time transaction sync* — see your money move instantly  
- *Instant transfers* — send money between accounts in seconds  
- *Modern UI/UX* — built with Tailwind CSS and Radix UI components  
- *Bank-grade security* — powered by Plaid and Appwrite authentication  
- *Mobile-first design* — works seamlessly across all devices
---
## *📈 Market Opportunity*
> "2.5B+ people worldwide lack access to modern banking. The global fintech market exceeds $300B."  
The world doesn't need more banks—it needs better ways to manage money.  
*DailyPay* is built to become the default personal banking experience.
---
## *💸 Monetization Strategy*
- *Premium subscription tiers* for advanced features  
- *Transaction fees* on instant transfers  
- *Partnership revenue* from financial institutions  
- *API licensing* for enterprise customers
---
## *🚀 Join the Movement*
Whether you're a *consumer* tired of juggling multiple banking apps or a *business* looking for modern financial solutions—  
*DailyPay* is your gateway to effortless banking.
> Let's make banking invisible. Let's build the future of finance.

Startup:
Title: ${existingTitle}
Description: ${existingDescription}
Category: ${category}

Format the response as JSON with these fields: title, description, pitch, tags, marketAnalysis, features, targetAudience. The pitch field should contain the full markdown pitch.`;
      } else {
        // Generate complete content from idea
        prompt = `Generate comprehensive content for a startup with the following details:

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
      }

      const content = await this.generateText(prompt, 1500);
      
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
        return parsedContent;
      } catch (parseError) {
        // If JSON parsing fails, return structured text
        return {
          title: idea,
          description: content,
          pitch: idea,
          tags: [category.toLowerCase()],
          marketAnalysis: 'AI-generated analysis',
          features: ['Innovative solution'],
          targetAudience: 'General audience'
        };
      }
    } catch (error) {
      console.error('Error generating startup content:', error);
      throw new Error('Content generation failed');
    }
  }

  // Analyze startup pitch using AI
  async analyzePitch(title: string, pitch: string, category: string): Promise<any> {
    try {
      const prompt = `Analyze this startup pitch and provide a comprehensive evaluation:

Title: ${title}
Category: ${category}
Pitch: ${pitch}

Please provide:
1. Overall score (1-10)
2. Strengths (3-5 points)
3. Weaknesses (3-5 points)
4. Improvement suggestions (3-5 points)
5. Market insights
6. Recommended tags
7. Confidence level (0-1)

Format as JSON with fields: score, strengths, weaknesses, suggestions, marketInsights, recommendedTags, confidence.`;

      const analysis = await this.generateText(prompt, 1000);
      
      try {
        const parsedAnalysis = JSON.parse(analysis);
        // Ensure all required fields are present and fallback if missing
        return {
          overallScore: typeof parsedAnalysis.score === 'number' ? parsedAnalysis.score : 7,
          strengths: Array.isArray(parsedAnalysis.strengths) && parsedAnalysis.strengths.length > 0 ? parsedAnalysis.strengths : ['Clear concept', 'Good potential'],
          weaknesses: Array.isArray(parsedAnalysis.weaknesses) && parsedAnalysis.weaknesses.length > 0 ? parsedAnalysis.weaknesses : ['Needs more detail', 'Market validation required'],
          suggestions: Array.isArray(parsedAnalysis.suggestions) && parsedAnalysis.suggestions.length > 0 ? parsedAnalysis.suggestions : ['Add market research', 'Define target audience'],
          missingElements: Array.isArray(parsedAnalysis.missingElements) ? parsedAnalysis.missingElements : [],
          marketInsights: typeof parsedAnalysis.marketInsights === 'object' && parsedAnalysis.marketInsights !== null ? parsedAnalysis.marketInsights : {},
          category: typeof parsedAnalysis.category === 'string' && parsedAnalysis.category ? parsedAnalysis.category : '',
          tags: Array.isArray(parsedAnalysis.recommendedTags) && parsedAnalysis.recommendedTags.length > 0 ? parsedAnalysis.recommendedTags : [category.toLowerCase()],
          confidence: typeof parsedAnalysis.confidence === 'number' ? parsedAnalysis.confidence : 0.7
        };
      } catch (parseError) {
        // Fallback structured response
        return {
          overallScore: 7,
          strengths: ['Clear concept', 'Good potential'],
          weaknesses: ['Needs more detail', 'Market validation required'],
          suggestions: ['Add market research', 'Define target audience'],
          missingElements: [],
          marketInsights: {},
          category: '',
          tags: [category.toLowerCase()],
          confidence: 0.7
        };
      }
    } catch (error) {
      console.error('Error analyzing pitch:', error);
      throw new Error('Pitch analysis failed');
    }
  }

  // Moderate content using AI
  async moderateContent(content: string): Promise<any> {
    try {
      const prompt = `Analyze this content for moderation purposes:

Content: ${content}

Please provide:
1. Severity level (low, medium, high)
2. Issues found (list of specific problems)
3. Recommendation (approve, review, reject)
4. Confidence level (0-1)
5. Explanation of the decision

Format as JSON with fields: severity, issues, recommendation, confidence, explanation.`;

      const moderation = await this.generateText(prompt, 500);
      
      try {
        const parsedModeration = JSON.parse(moderation);
        return parsedModeration;
      } catch (parseError) {
        // Fallback response
        return {
          severity: 'low',
          issues: [],
          recommendation: 'approve',
          confidence: 0.8,
          explanation: 'Content appears appropriate'
        };
      }
    } catch (error) {
      console.error('Error moderating content:', error);
      throw new Error('Content moderation failed');
    }
  }
}

// Simple rate limiter to prevent excessive API calls
class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private readonly maxCalls: number;
  private readonly windowMs: number;

  constructor(maxCalls: number = 10, windowMs: number = 60000) { // 10 calls per minute
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
  }

  canMakeCall(service: string): boolean {
    const now = Date.now();
    const calls = this.calls.get(service) || [];
    
    // Remove old calls outside the window
    const validCalls = calls.filter(time => now - time < this.windowMs);
    
    if (validCalls.length >= this.maxCalls) {
      return false;
    }
    
    // Add current call
    validCalls.push(now);
    this.calls.set(service, validCalls);
    
    return true;
  }

  getRemainingCalls(service: string): number {
    const now = Date.now();
    const calls = this.calls.get(service) || [];
    const validCalls = calls.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxCalls - validCalls.length);
  }
}

// Create rate limiter instance
const rateLimiter = new RateLimiter(5, 60000); // 5 calls per minute per service

// Export singleton instance
export const aiService = new AIService();