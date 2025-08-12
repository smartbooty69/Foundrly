import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createNotification } from '@/sanity/lib/notifications';

export async function POST() {
  try {
    console.log('✅ Test comment notification endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Creating test comment notification for user:', session.user.id);

          try {
        // Create a simple test comment notification without startup references
        const notificationId = await createNotification({
          recipientId: session.user.id,
          type: 'comment',
          title: 'Test Comment Notification',
          message: 'This is a test comment notification to verify the system is working!',
          senderId: session.user.id,
          actionUrl: '/test-notifications',
          metadata: {
            userName: session.user.name || session.user.username || 'Test User',
            userImage: session.user.image,
            commentText: 'This is a test comment to verify the notification system is working!'
          }
        });

      console.log('✅ Test comment notification created successfully:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Test comment notification created',
        notificationId,
        user: {
          id: session.user.id,
          name: session.user.name || session.user.username
        },
        notificationType: 'comment',
        commentText: 'This is a test comment to verify the notification system is working!',
        metadata: {
          userName: session.user.name || session.user.username || 'Test User',
          commentText: 'This is a test comment to verify the notification system is working!'
        }
      });

    } catch (sanityError: any) {
      console.error('❌ Sanity error creating test comment notification:', sanityError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create comment notification in Sanity',
        details: sanityError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error in test comment notification:', error);
    return NextResponse.json({
      success: false,
      error: 'System error',
      details: error.message
    }, { status: 500 });
  }
} 