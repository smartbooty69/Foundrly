import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET() {
  try {
    console.log('Testing notification API endpoint...');
    
    // Test 1: Basic endpoint functionality
    console.log('✅ Basic endpoint is working');
    
    // Test 2: Authentication check
    try {
      const session = await getServerSession(authOptions);
      console.log('✅ Authentication check passed:', !!session?.user);
      console.log('User ID:', session?.user?.id);
    } catch (authError) {
      console.error('❌ Authentication error:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        details: authError.message
      }, { status: 500 });
    }
    
    // Test 3: Return mock data
    const mockNotifications = [
      {
        id: 'test-1',
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification',
        timestamp: new Date().toISOString(),
        isRead: false
      }
    ];
    
    console.log('✅ Returning mock data successfully');
    
    return NextResponse.json({
      success: true,
      notifications: mockNotifications,
      count: 1,
      unreadCount: 1,
      hasMore: false,
      message: 'Test endpoint working - returning mock data'
    });
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 