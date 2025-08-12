import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createNotification } from '@/sanity/lib/notifications';

export async function POST() {
  try {
    console.log('✅ Test report notification endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Creating test report notification for user:', session.user.id);

    try {
      console.log('🔔 Attempting to create report notification with data:', {
        recipientId: session.user.id,
        type: 'report',
        title: 'Report Update',
        message: 'Your report has been reviewed',
        senderId: session.user.id,
        actionUrl: '/test-notifications',
        metadata: {
          reportReason: 'Inappropriate content',
          reportStatus: 'Resolved',
          actionTaken: 'Content removed, user warned'
        }
      });

      // Create a test notification about action taken against you when reported
      const notificationId = await createNotification({
        recipientId: session.user.id,
        type: 'report',
        title: 'Action Taken Against Your Account',
        message: 'Your content has been flagged and action has been taken',
        senderId: session.user.id, // Use current user as sender for testing
        actionUrl: '/notifications',
        metadata: {
          reportReason: 'Violation of community guidelines',
          reportStatus: 'Action Taken',
          actionTaken: 'Comment removed, account warning issued'
        }
      });

      console.log('✅ Test report notification created successfully:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Test report notification created',
        notificationId,
        user: {
          id: session.user.id,
          name: session.user.name || session.user.username
        },
        notificationType: 'report',
        metadata: {
          reportReason: 'Inappropriate content',
          reportStatus: 'Resolved',
          actionTaken: 'Content removed, user warned'
        }
      });

    } catch (sanityError: any) {
      console.error('❌ Sanity error creating test report notification:', {
        error: sanityError,
        message: sanityError.message,
        stack: sanityError.stack,
        name: sanityError.name
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to create report notification in Sanity',
        details: sanityError.message || 'Unknown Sanity error'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error in test report notification:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({
      success: false,
      error: 'System error',
      details: error.message || 'Unknown system error'
    }, { status: 500 });
  }
} 