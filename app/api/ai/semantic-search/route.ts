import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { aiService } from '@/lib/ai-services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Search query is required' 
      }, { status: 400 });
    }

    // Perform semantic search
    const results = await aiService.semanticSearch(query.trim(), limit);

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error in semantic search API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to perform semantic search' 
    }, { status: 500 });
  }
}

