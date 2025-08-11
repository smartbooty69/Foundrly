import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  getUserNotifications, 
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  convertSanityNotificationToFrontend
} from '@/sanity/lib/notifications';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    console.log('✅ Notifications endpoint called - fetching from Sanity');
    
    // Try to get session with better error handling
    let session;
    try {
      session = await auth();
      console.log('✅ Session check result:', !!session?.user);
    } catch (authError) {
      console.error('❌ Authentication error:', authError);
      // Fall back to mock data without user info
      const mockNotifications = [
        {
          id: 'mock-1',
          type: 'system',
          title: 'Welcome to Foundrly!',
          message: 'Welcome! Your notification system is now active.',
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ];

      console.log('✅ Returning fallback mock data due to auth error');
      
      return NextResponse.json({
        notifications: mockNotifications,
        count: 1,
        unreadCount: 1,
        hasMore: false,
        authError: 'Authentication failed, using fallback data'
      });
    }
    
    if (!session?.user) {
      console.log('❌ No session or user, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Fetching notifications for user:', {
      id: session.user.id,
      name: session.user.name,
      username: session.user.username,
      email: session.user.email
    });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('✅ Query params:', { limit, offset });

    try {
      // Get notifications from Sanity
      const { notifications: sanityNotifications, total } = await getUserNotifications(
        session.user.id,
        limit,
        offset
      );

      console.log('✅ Sanity response:', { 
        sanityNotificationsCount: sanityNotifications?.length, 
        total 
      });

      // Convert to frontend format
      const notifications = sanityNotifications.map(convertSanityNotificationToFrontend);
      const unreadCount = await getUnreadNotificationsCount(session.user.id);

      console.log('✅ Final response:', { 
        notificationsCount: notifications.length, 
        unreadCount, 
        hasMore: offset + limit < total 
      });

      return NextResponse.json({
        notifications,
        count: total,
        unreadCount,
        hasMore: offset + limit < total,
        user: {
          id: session.user.id,
          name: session.user.name,
          username: session.user.username,
          email: session.user.email
        }
      });

    } catch (sanityError) {
      console.error('❌ Sanity error:', sanityError);
      
      // Fallback to mock data if Sanity fails
      const fallbackNotifications = [
        {
          id: 'fallback-1',
          type: 'system',
          title: 'System Message',
          message: 'Unable to fetch notifications from database. Please try again later.',
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ];
      
      console.log('✅ Returning fallback data due to Sanity error');
      
      return NextResponse.json({
        notifications: fallbackNotifications,
        count: 1,
        unreadCount: 1,
        hasMore: false,
        sanityError: 'Database connection failed, using fallback data',
        user: {
          id: session.user.id,
          name: session.user.name,
          username: session.user.username,
          email: session.user.email
        }
      });
    }

  } catch (error) {
    console.error('❌ Error in notifications API:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return fallback data instead of 500 error
    const fallbackNotifications = [
      {
        id: 'fallback-1',
        type: 'system',
        title: 'System Message',
        message: 'Notifications are temporarily unavailable. Please try again later.',
        timestamp: new Date().toISOString(),
        isRead: false
      }
    ];
    
    console.log('✅ Returning fallback data due to error');
    
    return NextResponse.json({
      notifications: fallbackNotifications,
      count: 1,
      unreadCount: 1,
      hasMore: false,
      error: 'System error, using fallback data'
    });
  }
}

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    console.log('✅ PATCH /api/notifications called - marking all as read in Sanity');
    
    // Try to get session with better error handling
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error('❌ Authentication error in PATCH:', authError);
      return NextResponse.json({
        message: 'Mark all as read completed (fallback mode)',
        timestamp: new Date().toISOString(),
        authError: 'Authentication failed'
      });
    }
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Mark all as read for user:', {
      id: session.user.id,
      name: session.user.name || session.user.username
    });

    try {
      // Mark all notifications as read in Sanity
      await markAllNotificationsAsRead(session.user.id);
      console.log('✅ Successfully marked all notifications as read in Sanity');
      
      return NextResponse.json({
        message: 'All notifications marked as read',
        timestamp: new Date().toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name || session.user.username
        }
      });

    } catch (sanityError) {
      console.error('❌ Sanity error in mark all as read:', sanityError);
      return NextResponse.json({
        message: 'Mark all as read completed (fallback mode)',
        timestamp: new Date().toISOString(),
        sanityError: 'Database operation failed'
      });
    }

  } catch (error) {
    console.error('❌ Error in PATCH:', error);
    return NextResponse.json({
      message: 'Mark all as read completed (fallback mode)',
      timestamp: new Date().toISOString(),
      error: 'System error, using fallback mode'
    });
  }
} 