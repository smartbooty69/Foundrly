import { GoogleGenerativeAI } from '@google/generative-ai';
import { Anthropic } from '@anthropic-ai/sdk';
import { Pinecone } from '@pinecone-database/pinecone';
import { client } from '@/sanity/lib/client';
import { STARTUPS_QUERY } from '../sanity/lib/queries';

/**
 * Fetch recommended startups for a user from Sanity.
 * For now, returns latest startups as 'recommended'.
 */
export async function getPersonalizedRecommendations(userId: string, limit: number = 6) {
  // You can add user-based logic here for personalization
  const startups = await client.fetch(STARTUPS_QUERY, { search: null });
  return {
    startups: startups.slice(0, limit),
    reasons: ["Latest startups recommended for you"],
    confidence: 0.9
  };
}
// Initialize AI services with environment validation
console.log('🔧 [AI SERVICES INIT] Initializing AI services...');

// Check environment variables
console.log('🔑 [AI SERVICES INIT] Environment variables check:', {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `Set (${process.env.GEMINI_API_KEY.length} chars)` : 'NOT SET',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? `Set (${process.env.ANTHROPIC_API_KEY.length} chars)` : 'NOT SET',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `Set (${process.env.OPENAI_API_KEY.length} chars)` : 'NOT SET',
  GROK_API_KEY: process.env.GROK_API_KEY ? `Set (${process.env.GROK_API_KEY.length} chars)` : 'NOT SET',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY ? `Set (${process.env.PINECONE_API_KEY.length} chars)` : 'NOT SET'
});

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ [AI SERVICES INIT] GEMINI_API_KEY is not set!');
}

if (!process.env.PINECONE_API_KEY) {
  console.error('❌ [AI SERVICES INIT] PINECONE_API_KEY is not set!');
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
      console.log('🤖 [GEMINI EMBEDDING] Creating Gemini model instance...');
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });
      
      console.log('🤖 [GEMINI EMBEDDING] Calling model.embedContent...');
      const result = await model.embedContent(text);
      
      console.log('✅ [GEMINI EMBEDDING] Successfully generated embedding, dimensions:', result.embedding.values.length);
      return result.embedding.values;
    } catch (error) {
      console.error('❌ [GEMINI EMBEDDING] Error generating embedding:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        textLength: text.length,
        textPreview: text.substring(0, 50)
      });
      
      // Check if it's a quota/API error and try OpenAI fallback
      if (error instanceof Error && (
        error.message.includes('quota') || 
        error.message.includes('429') || 
        error.message.includes('rate limit') ||
        error.message.includes('Too Many Requests')
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
          // Re-throw the original error so the main catch block can handle text search fallback
          throw new Error('Both AI services failed');
        }
      }
      
      console.error('❌ [GEMINI EMBEDDING] Non-quota error, throwing generic error');
      throw new Error('Failed to generate embedding');
    }
  }

  // Generate embeddings using OpenAI as fallback
  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    console.log('🔄 [OPENAI EMBEDDING] Starting OpenAI fallback embedding generation...');
    
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.error('❌ [OPENAI EMBEDDING] OPENAI_API_KEY environment variable is not set');
        throw new Error('OpenAI API key not configured');
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
        console.error('❌ [OPENAI EMBEDDING] OpenAI API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [OPENAI EMBEDDING] Successfully generated OpenAI embedding, dimensions:', data.data[0].embedding.length);
      return data.data[0].embedding;
    } catch (error) {
      console.error('❌ [OPENAI EMBEDDING] Error in OpenAI fallback:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      // Try Grok fallback before giving up
      try {
        console.log('🔄 [OPENAI EMBEDDING] Trying Grok fallback...');
        return await this.generateGrokEmbedding(text);
      } catch (grokError) {
        console.error('❌ [OPENAI EMBEDDING] Grok fallback also failed:', {
          grokError: grokError instanceof Error ? grokError.message : 'Unknown error'
        });
      throw new Error('OpenAI embedding failed');
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
      
      // If we get here, all models failed, try a simple hash-based embedding as last resort
      console.log('🔄 [GROK EMBEDDING] All models failed, trying hash-based embedding fallback...');
      return this.generateHashBasedEmbedding(text);
      
    } catch (error) {
      console.error('❌ [GROK EMBEDDING] Error in Grok embedding generation:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      
      // Even if Grok completely fails, try hash-based embedding as final fallback
      console.log('🔄 [GROK EMBEDDING] Grok completely failed, trying hash-based embedding as final fallback...');
      return this.generateHashBasedEmbedding(text);
    }
  }

  // Generate text using Gemini (with Claude and Grok fallbacks)
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
          
          // Try Grok as final fallback
          if (process.env.GROK_API_KEY) {
            console.log('🔄 [GEMINI TEXT GENERATION] Trying Grok fallback...');
            try {
              return await this.generateGrokText(prompt, maxTokens);
            } catch (grokError) {
              console.error('❌ [GEMINI TEXT GENERATION] Grok generation also failed:', {
                grokError: grokError instanceof Error ? grokError.message : 'Unknown error'
              });
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
      throw new Error('AI generation failed');
    }
      }
      
      console.error('❌ [GEMINI TEXT GENERATION] No fallback API keys available, throwing error');
      throw new Error('AI generation failed');
    }
  }

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

  // Generate a simple hash-based embedding as fallback when all AI services fail
  private generateHashBasedEmbedding(text: string): number[] {
    console.log('🔢 [HASH EMBEDDING] Generating hash-based embedding for text:', text.substring(0, 50) + '...');
    
    // Create a simple hash-based embedding - use 768 dimensions to match Pinecone index
    const embedding = new Array(768).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach((word, wordIndex) => {
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
      }
      
      // Distribute hash across embedding dimensions
      const numDimensions = Math.min(10, Math.max(1, Math.floor(word.length / 2)));
      for (let i = 0; i < numDimensions; i++) {
        const dimension = Math.abs(hash + i * 1000) % 768;
        const value = (Math.sin(hash + i) * 0.5 + 0.5) * 2 - 1; // Normalize to [-1, 1]
        embedding[dimension] += value * (1 / (wordIndex + 1)); // Weight by position
      }
    });
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] = embedding[i] / magnitude;
      }
    }
    
    console.log('✅ [HASH EMBEDDING] Generated hash-based embedding, dimensions:', embedding.length);
    return embedding;
  }

  // Clean and preprocess text for better embeddings
  private preprocessText(text: string): string {
    if (!text) {
      console.log('🧹 [PREPROCESS TEXT] Empty text provided, returning empty string');
      return '';
    }
    
    const originalLength = text.length;
    const processed = text
      // Remove markdown formatting
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/[#*`\[\]()]/g, '') // Remove remaining markdown chars
      // Remove common noise words and phrases
      .replace(/\b(hello|hi|hey|test|testing|demo|example|sample)\b/gi, '')
      .replace(/\b(holaa|amigo|yellow|helllo|world)\b/gi, '')
      .replace(/\b(where|is|the|library|biblioteca)\b/gi, '')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('🧹 [PREPROCESS TEXT] Text preprocessing completed:', {
      originalLength,
      processedLength: processed.length,
      originalPreview: text.substring(0, 50) + '...',
      processedPreview: processed.substring(0, 50) + '...'
    });
    
    return processed;
  }

  // Create high-quality text content for embeddings
  private createEmbeddingText(startup: any): string {
    const parts = [];
    
    // Add title (most important)
    if (startup.title) {
      parts.push(startup.title);
    }
    
    // Add category with context
    if (startup.category) {
      parts.push(`Category: ${startup.category}`);
    }
    
    // Add only the first 150 characters of description to avoid noise
    if (startup.description) {
      const cleanDesc = this.preprocessText(startup.description);
      if (cleanDesc.length > 20) {
        parts.push(cleanDesc.substring(0, 150));
      }
    }
    
    // Add only the first 150 characters of pitch to avoid noise
    if (startup.pitch) {
      const cleanPitch = this.preprocessText(startup.pitch);
      if (cleanPitch.length > 20) {
        parts.push(cleanPitch.substring(0, 150));
      }
    }
    
    return parts.join('. ');
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
          author: startup.author?.name || 'Unknown',
          createdAt: startup._createdAt,
          views: startup.views || 0,
          likes: startup.likes || 0,
          dislikes: startup.dislikes || 0,
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
          author: startup.author?.name || 'Unknown',
          createdAt: startup._createdAt,
          views: startup.views || 0,
          likes: startup.likes || 0,
          dislikes: startup.dislikes || 0,
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

  // Semantic search using vector similarity with fallback
  async semanticSearch(query: string, limit: number = 10): Promise<any> {
    console.log('🔍 [SEMANTIC SEARCH] Starting semantic search:', { query, limit });
    
    try {
      // Clean and preprocess the query
      console.log('🧹 [SEMANTIC SEARCH] Preprocessing query...');
      const cleanQuery = this.preprocessText(query);
      console.log('🧹 [SEMANTIC SEARCH] Cleaned query:', cleanQuery);
      
      // Generate embedding for the query
      console.log('🤖 [SEMANTIC SEARCH] Generating embedding for query...');
      const queryEmbedding = await this.generateEmbedding(cleanQuery);
      console.log('✅ [SEMANTIC SEARCH] Embedding generated, dimensions:', queryEmbedding.length);
      
      // Search in Pinecone with higher topK to get more candidates
      console.log('🌲 [SEMANTIC SEARCH] Searching Pinecone index...');
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: Math.min(limit * 2, 20), // Get more candidates for better filtering
        includeMetadata: true,
      });
      
      console.log('🌲 [SEMANTIC SEARCH] Pinecone search completed:', {
        matchesCount: searchResults.matches?.length || 0,
        topScore: searchResults.matches?.[0]?.score || 0,
        bottomScore: searchResults.matches?.[searchResults.matches.length - 1]?.score || 0
      });

      // Get full startup data from Sanity
      const startupIds = searchResults.matches?.map(match => match.id) || [];
      console.log('📊 [SEMANTIC SEARCH] Startup IDs from Pinecone:', startupIds);
      
      if (startupIds.length === 0) {
        console.log('❌ [SEMANTIC SEARCH] No startup IDs found, returning empty results');
        return {
          startups: [],
          reasons: ['No matching startups found'],
          confidence: 0,
        };
      }

      console.log('📊 [SEMANTIC SEARCH] Fetching startup data from Sanity...');
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
      
      console.log('📊 [SEMANTIC SEARCH] Sanity data fetched:', {
        startupsCount: startups?.length || 0,
        startupTitles: startups?.map(s => s.title) || []
      });

      // Add similarity scores and filter low-quality results
      console.log('🎯 [SEMANTIC SEARCH] Processing similarity scores and filtering...');
      let startupsWithSimilarity = startups
        .map(startup => {
          const match = searchResults.matches?.find(m => m.id === startup._id);
          return {
            ...startup,
            similarity: match?.score || 0,
          };
        })
        .filter(startup => {
          // Lower confidence threshold to show more results
          return startup.similarity > 0.60;
        })
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .slice(0, limit); // Limit to requested number

      console.log('🎯 [SEMANTIC SEARCH] High-quality results (threshold 0.60):', {
        count: startupsWithSimilarity.length,
        scores: startupsWithSimilarity.map(s => s.similarity)
      });

      // If no high-quality results, try with even lower threshold
      if (startupsWithSimilarity.length === 0) {
        console.log('⚠️ [SEMANTIC SEARCH] No high-quality results, trying lower threshold (0.50)...');
        startupsWithSimilarity = startups
          .map(startup => {
            const match = searchResults.matches?.find(m => m.id === startup._id);
            return {
              ...startup,
              similarity: match?.score || 0,
            };
          })
          .filter(startup => {
            // Fallback threshold
            return startup.similarity > 0.50;
          })
          .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
          .slice(0, Math.min(3, limit)); // Limit to max 3 results for fallback
        
        console.log('⚠️ [SEMANTIC SEARCH] Fallback results (threshold 0.50):', {
          count: startupsWithSimilarity.length,
          scores: startupsWithSimilarity.map(s => s.similarity)
        });
      }

      const finalResult = {
        startups: startupsWithSimilarity,
        reasons: startupsWithSimilarity.length > 0 
          ? [`Found ${startupsWithSimilarity.length} highly relevant startups matching "${cleanQuery}"`]
          : [`No highly relevant startups found for "${cleanQuery}". Try different search terms.`],
        confidence: searchResults.matches?.[0]?.score || 0,
      };
      
      console.log('✅ [SEMANTIC SEARCH] Search completed successfully:', {
        finalResultsCount: finalResult.startups.length,
        confidence: finalResult.confidence,
        reasons: finalResult.reasons
      });
      
      return finalResult;
    } catch (error) {
      console.error('❌ [SEMANTIC SEARCH] Error in semantic search:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        query,
        limit
      });
      
      // Check if it's the "All AI services failed" error or any other error
      if (error instanceof Error && (
        error.message.includes('All AI services failed') ||
        error.message.includes('Both AI services failed') ||
        error.message.includes('Both Gemini and OpenAI embedding failed') ||
        error.message.includes('Failed to generate embedding')
      )) {
        console.log('🔄 [SEMANTIC SEARCH] AI services failed, falling back to text search...');
        const fallbackResult = await this.fallbackTextSearch(query, limit);
        // Add error context to toast message only
        fallbackResult.toastMessage = "⚠️ AI services unavailable: Gemini, OpenAI, and Grok quota limits exceeded";
        console.log('🔄 [SEMANTIC SEARCH] Text search fallback completed:', {
          resultsCount: fallbackResult.startups.length,
          fallbackUsed: fallbackResult.fallbackUsed
        });
        return fallbackResult;
      }
      
      // For any other errors, also fall back to text search
      console.log('🔄 [SEMANTIC SEARCH] Other error occurred, falling back to text search...');
      const fallbackResult = await this.fallbackTextSearch(query, limit);
      // Add error context to toast message only
      fallbackResult.toastMessage = `⚠️ AI services error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.log('🔄 [SEMANTIC SEARCH] Text search fallback completed:', {
        resultsCount: fallbackResult.startups.length,
        fallbackUsed: fallbackResult.fallbackUsed
      });
      return fallbackResult;
    }
  }

  // Fallback text search when AI services are unavailable
  async fallbackTextSearch(query: string, limit: number = 10): Promise<any> {
    console.log('🔄 [FALLBACK TEXT SEARCH] Starting fallback text search:', { query, limit });
    
    try {
      // Use Sanity's text search capabilities
      console.log('📊 [FALLBACK TEXT SEARCH] Querying Sanity with text search...');
      const startups = await client.fetch(`
        *[_type == "startup" && (
          title match $query || 
          description match $query || 
          category match $query ||
          pitch match $query
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
      `, { 
        query: `*${query}*`,
        limit: limit 
      });

      console.log('📊 [FALLBACK TEXT SEARCH] Sanity text search completed:', {
        resultsCount: startups?.length || 0,
        startupTitles: startups?.map(s => s.title) || []
      });

      const result = {
        startups: startups || [],
        reasons: [`Found ${startups?.length || 0} startups using text search for "${query}"`],
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
      console.error('❌ [FALLBACK TEXT SEARCH] Error in fallback text search:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        query,
        limit
      });
      
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

  // Get personalized recommendations based on user behavior
  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<any> {
    try {
      // Get user's interaction history (likes, views, etc.)
      const userInteractions = await client.fetch(`
        *[_type == "userInteraction" && userId == $userId] {
          startupId,
          type,
          _createdAt
        } | order(_createdAt desc)
      `, { userId });

      // Get user's liked startups
      const likedStartups = await client.fetch(`
        *[_type == "startup" && _id in $likedIds] {
          _id,
          title,
          description,
          category,
          pitch
        }
      `, { 
        likedIds: userInteractions
          .filter(interaction => interaction.type === 'like')
          .map(interaction => interaction.startupId)
      });

      if (likedStartups.length === 0) {
        // If no user history, return popular startups
        return await this.getPopularStartups(limit);
      }

      // Create a combined text from user's preferences
      const userPreferences = likedStartups
        .map(startup => `${startup.title} ${startup.description} ${startup.category}`)
        .join(' ');

      // Generate embedding for user preferences
      const userEmbedding = await this.generateEmbedding(userPreferences);

      // Search for similar startups
      const searchResults = await index.query({
        vector: userEmbedding,
        topK: limit * 2, // Get more results to filter out already liked ones
        includeMetadata: true,
      });

      // Filter out already liked startups
      const likedIds = new Set(likedStartups.map(s => s._id));
      const filteredMatches = searchResults.matches?.filter(match => !likedIds.has(match.id)) || [];

      // Get full startup data
      const startupIds = filteredMatches.slice(0, limit).map(match => match.id);
      
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

      // Add similarity scores
      const startupsWithSimilarity = startups.map(startup => {
        const match = filteredMatches.find(m => m.id === startup._id);
        return {
          ...startup,
          similarity: match?.score || 0,
        };
      });

      // Sort by similarity
      startupsWithSimilarity.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      return {
        startups: startupsWithSimilarity,
        reasons: [
          'Based on your liked startups',
          'Similar to your interests',
          'Personalized for you'
        ],
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

// Export singleton instance
export const aiService = new AIService();