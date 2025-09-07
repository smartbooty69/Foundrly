import { aiService } from './ai-services';
import { client } from '@/sanity/lib/client';

// Service to sync startup data with Pinecone vector database
export class AIVectorSync {
  
  // Store a new startup in the vector database
  static async storeStartup(startupId: string): Promise<void> {
    try {
      // Fetch startup data from Sanity
      const startup = await client.fetch(`
        *[_type == "startup" && _id == $startupId][0] {
          _id,
          title,
          description,
          category,
          pitch,
          author->{name, username},
          _createdAt,
          views,
          likes,
          dislikes
        }
      `, { startupId });

      if (!startup) {
        console.error('Startup not found:', startupId);
        return;
      }

      // Store in Pinecone
      await aiService.storeStartupVector(startup);
      console.log('Startup vector stored successfully:', startupId);
    } catch (error) {
      console.error('Error storing startup vector:', error);
    }
  }

  // Update an existing startup in the vector database
  static async updateStartup(startupId: string): Promise<void> {
    try {
      // Fetch updated startup data from Sanity
      const startup = await client.fetch(`
        *[_type == "startup" && _id == $startupId][0] {
          _id,
          title,
          description,
          category,
          pitch,
          author->{name, username},
          _createdAt,
          views,
          likes,
          dislikes
        }
      `, { startupId });

      if (!startup) {
        console.error('Startup not found for update:', startupId);
        return;
      }

      // Update in Pinecone
      await aiService.updateStartupVector(startupId, startup);
      console.log('Startup vector updated successfully:', startupId);
    } catch (error) {
      console.error('Error updating startup vector:', error);
    }
  }

  // Remove a startup from the vector database
  static async deleteStartup(startupId: string): Promise<void> {
    try {
      await aiService.deleteStartupVector(startupId);
      console.log('Startup vector deleted successfully:', startupId);
    } catch (error) {
      console.error('Error deleting startup vector:', error);
    }
  }

  // Bulk sync all startups to Pinecone (useful for initial setup)
  static async syncAllStartups(): Promise<void> {
    try {
      console.log('Starting bulk sync of all startups...');
      
      // Fetch all startups
      const startups = await client.fetch(`
        *[_type == "startup"] {
          _id,
          title,
          description,
          category,
          pitch,
          author->{name, username},
          _createdAt,
          views,
          likes,
          dislikes
        }
      `);

      console.log(`Found ${startups.length} startups to sync`);

      // Store each startup
      for (const startup of startups) {
        try {
          await aiService.storeStartupVector(startup);
          console.log(`Synced startup: ${startup.title}`);
        } catch (error) {
          console.error(`Error syncing startup ${startup._id}:`, error);
        }
      }

      console.log('Bulk sync completed');
    } catch (error) {
      console.error('Error in bulk sync:', error);
    }
  }

  // Sync startups in batches (for large datasets)
  static async syncStartupsBatch(batchSize: number = 50): Promise<void> {
    try {
      console.log('Starting batch sync of startups...');
      
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        // Fetch batch of startups
        const startups = await client.fetch(`
          *[_type == "startup"] | order(_createdAt desc) [$offset...$end] {
            _id,
            title,
            description,
            category,
            pitch,
            author->{name, username},
            _createdAt,
            views,
            likes,
            dislikes
          }
        `, { 
          offset, 
          end: offset + batchSize - 1 
        });

        if (startups.length === 0) {
          hasMore = false;
          break;
        }

        console.log(`Processing batch ${Math.floor(offset / batchSize) + 1} (${startups.length} startups)`);

        // Store each startup in the batch
        for (const startup of startups) {
          try {
            await aiService.storeStartupVector(startup);
          } catch (error) {
            console.error(`Error syncing startup ${startup._id}:`, error);
          }
        }

        offset += batchSize;
        
        // Add a small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('Batch sync completed');
    } catch (error) {
      console.error('Error in batch sync:', error);
    }
  }

  // Get sync status
  static async getSyncStatus(): Promise<{
    totalStartups: number;
    syncedStartups: number;
    lastSync: Date | null;
  }> {
    try {
      // Get total startups from Sanity
      const totalStartups = await client.fetch(`count(*[_type == "startup"])`);
      
      // Note: Pinecone doesn't provide a direct way to count vectors
      // This would need to be tracked separately in your database
      // For now, we'll return the Sanity count
      
      return {
        totalStartups,
        syncedStartups: totalStartups, // This should be tracked separately
        lastSync: new Date() // This should be stored and retrieved from your database
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        totalStartups: 0,
        syncedStartups: 0,
        lastSync: null
      };
    }
  }
}

// Helper function to be called from API routes
export async function syncStartupVector(startupId: string, action: 'create' | 'update' | 'delete'): Promise<void> {
  switch (action) {
    case 'create':
      await AIVectorSync.storeStartup(startupId);
      break;
    case 'update':
      await AIVectorSync.updateStartup(startupId);
      break;
    case 'delete':
      await AIVectorSync.deleteStartup(startupId);
      break;
  }
}

