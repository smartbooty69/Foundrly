import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { userId, memberIds, channelData } = await req.json();

    console.log('Creating channel with:', { userId, memberIds, channelData });

    if (!userId || !memberIds || !Array.isArray(memberIds) || memberIds.length < 2) {
      return NextResponse.json({ 
        error: 'Invalid request: userId and memberIds array with at least 2 members required' 
      }, { status: 400 });
    }

    // Initialize Stream Chat server client with increased timeout
    const serverClient = StreamChat.getInstance(apiKey, apiSecret, {
      timeout: 10000 // Increase timeout to 10 seconds
    });

    // Create a unique channel ID without colons (Stream Chat restriction)
    const channelId = `messaging-${memberIds.sort().join('-')}`;
    console.log('Generated channel ID:', channelId);

    // Create the channel with retry logic
    let channel;
    let retries = 3;
    
    while (retries > 0) {
      try {
        channel = serverClient.channel('messaging', channelId, {
          members: memberIds,
          created_by: { id: userId }, // Required for server-side auth
          ...channelData
        });

        console.log('Channel object created, attempting to create on Stream... (attempts left:', retries, ')');

        // Create the channel on Stream
        await channel.create();
        
        console.log('Channel created successfully:', channelId);
        break; // Success, exit retry loop
        
      } catch (error) {
        retries--;
        console.error(`Channel creation attempt failed (${retries} retries left):`, error.message);
        
        if (retries === 0) {
          // Try fallback approach with minimal channel data
          try {
            console.log('Trying fallback approach with minimal channel data...');
            channel = serverClient.channel('messaging', channelId, {
              members: memberIds,
              created_by: { id: userId } // Required for server-side auth
            });
            await channel.create();
            console.log('Fallback channel created successfully:', channelId);
          } catch (fallbackError) {
            console.error('Fallback approach also failed:', fallbackError.message);
            throw error; // Throw original error
          }
        }
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({ 
      channelId: channelId,
      success: true 
    });
  } catch (error) {
    console.error('Error creating chat channel:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      error: 'Failed to create chat channel',
      details: error.message 
    }, { status: 500 });
  }
} 