import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createNotification } from '@/sanity/lib/notifications';

export async function POST() {
  try {
    console.log('✅ Test reply notification endpoint called');
    
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Creating test reply notification for user:', session.user.id);

    try {
      console.log('🔔 Attempting to create notification with data:', {
        recipientId: session.user.id,
        type: 'reply',
        title: 'Test Reply Notification',
        message: 'replied to your comment',
        senderId: session.user.id,
        actionUrl: '/test-notifications',
        metadata: {
          startupTitle: 'Test Startup',
          commentText: 'This is a great reply to your comment!',
          userName: session.user.name || session.user.username || 'Test User',
          userImage: session.user.image,
          parentCommentText: 'This was the original comment that is being replied to.'
        }
      });

      // Create a test reply notification without external references for testing
      const notificationId = await createNotification({
        recipientId: session.user.id,
        type: 'reply',
        title: 'Test Reply Notification',
        message: 'replied to your comment',
        senderId: session.user.id,
        actionUrl: '/test-notifications',
        metadata: {
          startupTitle: 'Test Startup',
          commentText: 'This is a great reply to your comment!',
          userName: session.user.name || session.user.username || 'Test User',
          userImage: session.user.image,
          parentCommentText: 'This was the original comment that is being replied to.'
        }
      });

      console.log('✅ Test reply notification created successfully:', notificationId);

      return NextResponse.json({
        success: true,
        message: 'Test reply notification created',
        notificationId,
        user: {
          id: session.user.id,
          name: session.user.name || session.user.username
        },
        notificationType: 'reply',
        replyText: 'This is a great reply to your comment!',
        parentCommentText: 'This was the original comment that is being replied to.',
        metadata: {
          userName: session.user.name || session.user.username || 'Test User',
          commentText: 'This is a great reply to your comment!',
          parentCommentText: 'This was the original comment that is being replied to.'
        }
      });

    } catch (sanityError: any) {
      console.error('❌ Sanity error creating test reply notification:', {
        error: sanityError,
        message: sanityError.message,
        stack: sanityError.stack,
        name: sanityError.name
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to create reply notification in Sanity',
        details: sanityError.message || 'Unknown Sanity error'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error in test reply notification:', {
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