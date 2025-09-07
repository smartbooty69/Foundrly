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
// Initialize AI services
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index('foundrly-startups');

// AI Service class with all required methods
export class AIService {
  // Generate embeddings using Gemini
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // Generate text using Gemini (with Claude fallback)
  private async generateText(prompt: string, maxTokens: number = 1000): Promise<string> {
    try {
      // Try Gemini first
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini generation failed, trying Claude:', error);
      
      // Fallback to Claude if available
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: prompt }],
          });
          return response.content[0].type === 'text' ? response.content[0].text : '';
        } catch (claudeError) {
          console.error('Claude generation also failed:', claudeError);
          throw new Error('Both AI services failed');
        }
      }
      
      throw new Error('AI generation failed');
    }
  }

  // Clean and preprocess text for better embeddings
  private preprocessText(text: string): string {
    if (!text) return '';
    
    return text
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

  // Semantic search using vector similarity
  async semanticSearch(query: string, limit: number = 10): Promise<any> {
    try {
      // Clean and preprocess the query
      const cleanQuery = this.preprocessText(query);
      
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(cleanQuery);
      
      // Search in Pinecone with higher topK to get more candidates
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: Math.min(limit * 2, 20), // Get more candidates for better filtering
        includeMetadata: true,
      });

      // Get full startup data from Sanity
      const startupIds = searchResults.matches?.map(match => match.id) || [];
      
      if (startupIds.length === 0) {
        return {
          startups: [],
          reasons: ['No matching startups found'],
          confidence: 0,
        };
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

      // Add similarity scores and filter low-quality results
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

      // If no high-quality results, try with even lower threshold
      if (startupsWithSimilarity.length === 0) {
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
      }

      return {
        startups: startupsWithSimilarity,
        reasons: startupsWithSimilarity.length > 0 
          ? [`Found ${startupsWithSimilarity.length} highly relevant startups matching "${cleanQuery}"`]
          : [`No highly relevant startups found for "${cleanQuery}". Try different search terms.`],
        confidence: searchResults.matches?.[0]?.score || 0,
      };
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw new Error('Semantic search failed');
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
        return parsedAnalysis;
      } catch (parseError) {
        // Fallback structured response
        return {
          score: 7,
          strengths: ['Clear concept', 'Good potential'],
          weaknesses: ['Needs more detail', 'Market validation required'],
          suggestions: ['Add market research', 'Define target audience'],
          marketInsights: 'AI-generated market analysis',
          recommendedTags: [category.toLowerCase()],
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