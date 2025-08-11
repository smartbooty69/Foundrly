import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Minimal notifications endpoint called');
    
    // Return simple mock data without any complex logic
    const mockData = {
      notifications: [
        {
          id: 'test-1',
          type: 'system',
          title: 'Test',
          message: 'Test notification',
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ],
      count: 1,
      unreadCount: 1,
      hasMore: false
    };
    
    console.log('Returning mock data:', mockData);
    
    return NextResponse.json(mockData);
    
  } catch (error) {
    console.error('Minimal notifications error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
} 