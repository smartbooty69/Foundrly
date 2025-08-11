import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('✅ Simple notifications test endpoint called');
    
    // Test 1: Basic functionality
    console.log('✅ Basic GET method is working');
    
    // Test 2: Return simple data
    const response = {
      notifications: [
        {
          id: 'test-1',
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification',
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ],
      count: 1,
      unreadCount: 1,
      hasMore: false
    };
    
    console.log('✅ Returning test response:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Simple test endpoint error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 